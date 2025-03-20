import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This simplified middleware will allow public access
export function middleware(request: NextRequest) {
  // Allow all requests to proceed
  return NextResponse.next()
}

// Only apply middleware to routes that should be protected
export const config = {
  matcher: ['/dashboard/:path*']
}