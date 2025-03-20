import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// This simplified middleware will allow public access
export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })

  // If the user is not authenticated and trying to access a protected route
  if (!token) {
    // Redirect to the login page
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Only apply middleware to routes that should be protected
export const config = {
  matcher: ['/dashboard/:path*', '/modules/:path*']
}