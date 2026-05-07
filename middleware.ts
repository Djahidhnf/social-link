import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('next-auth.session-token') ?? 
                req.cookies.get('__Secure-next-auth.session-token')

  const isLoggedIn = !!token

  if (isLoggedIn && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (!isLoggedIn && pathname === '/') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (pathname.startsWith('/dashboard') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (pathname.startsWith('/admin') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (pathname.startsWith('/u') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/admin/:path*', '/u/:path*', '/login'],
}