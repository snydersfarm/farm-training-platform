import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Add performance monitoring and logging
export async function middleware(request: NextRequest) {
  // Start time for performance tracking
  const startTime = Date.now()
  
  try {
    // Get authentication token
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    // Log the request (in production, you might want to send this to a monitoring service)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${new Date().toISOString()}] ${request.method} ${request.nextUrl.pathname} (Auth: ${!!token})`)
    }

    // If the user is not authenticated and trying to access a protected route
    if (!token) {
      // Redirect to the login page
      const url = new URL('/login', request.url)
      url.searchParams.set('callbackUrl', request.nextUrl.pathname)
      
      // Record performance metrics for redirects
      const duration = Date.now() - startTime
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Middleware] Auth redirect in ${duration}ms`)
      }
      
      return NextResponse.redirect(url)
    }

    // Allow the request to proceed
    const response = NextResponse.next()
    
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

// Only apply middleware to routes that should be protected
export const config = {
  matcher: ['/dashboard/:path*', '/modules/:path*']
}