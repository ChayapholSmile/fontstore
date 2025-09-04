import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth-utils"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  const { pathname } = request.nextUrl

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/seller", "/profile", "/chat"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // API routes that require authentication
  const protectedApiRoutes = ["/api/fonts", "/api/chat", "/api/orders"]
  const isProtectedApiRoute = protectedApiRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute || isProtectedApiRoute) {
    if (!token) {
      if (isProtectedApiRoute) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      if (isProtectedApiRoute) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
