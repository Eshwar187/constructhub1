import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const publicPaths = ["/", "/login", "/signup", "/admin/login"]
  const isPublicPath = publicPaths.includes(path)

  // Check if path is for admin routes
  const isAdminPath = path.startsWith("/admin") && path !== "/admin/login"

  // Get the token for user authentication
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Check for admin session cookie
  const adminSession = request.cookies.get("admin-session")
  const isAdminAuthenticated = adminSession?.value === "true"

  // Redirect logic for user routes
  if (!isPublicPath && !isAdminPath) {
    // If user is not authenticated and trying to access protected route
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Redirect logic for admin routes
  if (isAdminPath) {
    // If admin is not authenticated and trying to access admin route
    if (!isAdminAuthenticated) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  // If user is authenticated and trying to access login/signup page
  if (isPublicPath && token && (path === "/login" || path === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // If admin is authenticated and trying to access admin login page
  if (path === "/admin/login" && isAdminAuthenticated) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url))
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

