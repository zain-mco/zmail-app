import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Edge-compatible middleware that checks JWT without Prisma
 * Prisma with pg adapter doesn't work in Edge runtime
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get the token from the request (works in Edge)
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const isLoggedIn = !!token;

    // Protect admin routes - require ADMIN role
    if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        if (token.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        return NextResponse.next();
    }

    // Protect dashboard routes - require any authenticated user
    if (pathname.startsWith("/dashboard")) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        return NextResponse.next();
    }

    // Protect API routes (except auth endpoints)
    if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
        if (!isLoggedIn) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Protected routes
        "/admin/:path*",
        "/dashboard/:path*",
        "/api/((?!auth).*)",
    ],
};
