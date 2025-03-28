import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Simple in-memory rate limiting
const rateLimit = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = 5; // requests
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimit.get(ip);

  if (!userLimit) {
    rateLimit.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (now - userLimit.timestamp > RATE_LIMIT_WINDOW) {
    rateLimit.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return true;
  }

  userLimit.count++;
  return false;
}

// Add performance monitoring and logging with proper auth checks
export async function middleware(request: NextRequest) {
  // Start time for performance tracking
  const startTime = Date.now()
  
  try {
    // Log the request (in production, you might want to send this to a monitoring service)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${new Date().toISOString()}] ${request.method} ${request.nextUrl.pathname}`)
    }

    // Rate limiting for auth endpoints
    if (request.nextUrl.pathname.startsWith('/api/auth')) {
      const ip = request.ip ?? 'anonymous';
      if (isRateLimited(ip)) {
        return new NextResponse(
          JSON.stringify({ error: 'Too many requests. Please try again later.' }),
          { 
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '60',
            }
          }
        );
      }
    }

    // Get the token from the session
    const token = await getToken({ req: request })
    
    // Handle authentication for protected routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!token) {
        // Redirect to login if not authenticated
        return NextResponse.redirect(new URL('/login', request.url))
      }
      
      // Check for admin role
      if (token.role !== 'admin') {
        // Redirect to dashboard if not admin
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Handle authentication for protected routes
    if (request.nextUrl.pathname.startsWith('/dashboard') || 
        request.nextUrl.pathname.startsWith('/modules')) {
      if (!token) {
        // Redirect to login if not authenticated
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    // Allow the request to proceed
    const response = NextResponse.next()
    
    // Add security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Record performance metrics for successful requests
    const duration = Date.now() - startTime
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] Completed in ${duration}ms`)
    }
    
    // Add performance header for monitoring
    response.headers.set('X-Response-Time', `${duration}ms`)
    
    return response
  } catch (error) {
    // Handle errors gracefully
    console.error('[Middleware Error]', error)
    
    // Record performance metrics for errors
    const duration = Date.now() - startTime
    
    // Create error response
    const errorResponse = NextResponse.next()
    errorResponse.headers.set('X-Response-Time', `${duration}ms`)
    errorResponse.headers.set('X-Error', 'Middleware error occurred')
    
    return errorResponse
  }
}

// Apply middleware to protected routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/modules/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/auth/:path*'
  ]
}