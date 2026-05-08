// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'
// export const runtime = 'nodejs'

// export function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl
  
//   // Log all cookies
//   console.log('COOKIES:', JSON.stringify([...req.cookies.getAll()].map(c => c.name)))
  
//   const token = req.cookies.get('next-auth.session-token') ?? 
//                 req.cookies.get('__Secure-next-auth.session-token')

//   console.log('TOKEN:', token)

//   const isLoggedIn = !!token

//   if (isLoggedIn && pathname === '/') {
//     return NextResponse.redirect(new URL('/dashboard', req.url))
//   }

//   if (!isLoggedIn && pathname === '/') {
//     return NextResponse.redirect(new URL('/login', req.url))
//   }

//   if (pathname.startsWith('/dashboard') && !isLoggedIn) {
//     return NextResponse.redirect(new URL('/login', req.url))
//   }

//   if (pathname.startsWith('/admin') && !isLoggedIn) {
//     return NextResponse.redirect(new URL('/login', req.url))
//   }

//   if (pathname.startsWith('/u') && !isLoggedIn) {
//     return NextResponse.redirect(new URL('/login', req.url))
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: ['/', '/dashboard/:path*', '/admin/:path*', '/u/:path*', '/login'],
// }

// middleware.ts (project root)
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const isLoggedIn = !!session
  const isAdmin = session?.user?.role === "ADMIN"

  // Redirect logged-in users away from login page
  if (isLoggedIn && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn && pathname === "/") {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Protect /dashboard — must be logged in
  if (pathname.startsWith("/dashboard") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Protect /admin — must be ADMIN
  if (pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Protect /profile — must be logged in
  if (pathname.startsWith("/u") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/", "/dashboard/:path*", "/admin/:path*", "/u/:username", "/login"],
}