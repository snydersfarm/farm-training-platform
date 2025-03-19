import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Simplified middleware that doesn't block access to dashboard
  // This is temporary for debugging purposes
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*'],
}