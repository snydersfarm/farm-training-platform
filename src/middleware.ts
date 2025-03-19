import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Define public paths that don't require authentication
  const publicPaths = ['/', '/login', '/api/auth']
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || 
    path.startsWith(`${publicPath}/`)
  )

  // Check if the path is a dashboard path that requires protection
  const isDashboardPath = path === '/dashboard' || path.startsWith('/dashboard/')
  
  // Get the session token
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET
  })

  // If the user is not authenticated and trying to access dashboard, redirect to login
  if (isDashboardPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If the user is authenticated and trying to access login, redirect to dashboard
  if (isPublicPath && token && path === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*'],
}