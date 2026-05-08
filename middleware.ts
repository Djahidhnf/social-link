import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const isLoggedIn = !!session
  const isAdmin = session?.user?.role === "ADMIN"

  if (isLoggedIn && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }
  if (!isLoggedIn && pathname === "/") {
    return NextResponse.redirect(new URL("/login", req.url))
  }
  if (pathname.startsWith("/dashboard") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
  if (pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
  if (pathname.startsWith("/u") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/", "/dashboard/:path*", "/admin/:path*", "/u/:path*", "/login"],
}