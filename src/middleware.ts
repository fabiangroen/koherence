import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export default async function middleware(req: NextRequest) {
    const token = await getToken({ req })
    const isAuthenticated = !!token

    // Get the pathname of the request
    const path = req.nextUrl.pathname

    // Public paths that don't require authentication
    const isPublicPath = path === "/login"

    if (!isAuthenticated && !isPublicPath) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    if (isAuthenticated && isPublicPath) {
        return NextResponse.redirect(new URL("/", req.url))
    }

    return NextResponse.next()
}

// See "Matching Paths" below to learn more
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
