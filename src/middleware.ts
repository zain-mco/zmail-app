import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Edge-compatible middleware for session validation
 * OWASP compliant: validates session on every protected request
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get the token from the request (works in Edge)
    // IMPORTANT: Explicitly specify cookie name to match auth.ts configuration
    const cookieName = process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token";

    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName, // Must match the cookie name in auth.ts
    });

    const isLoggedIn = !!token;

    // Protect admin routes - require ADMIN role
    if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login?reason=required", request.url));
        }
        // Cast to any to access role property that TypeScript may not recognize
        const role = (token as { role?: string })?.role;

        if (role !== "ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        return NextResponse.next();
    }

    // Protect dashboard routes - require any authenticated user
    if (pathname.startsWith("/dashboard")) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login?reason=required", request.url));
        }
        return NextResponse.next();
    }

    // Protect editor routes - require any authenticated user
    if (pathname.startsWith("/editor")) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login?reason=required", request.url));
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
        "/editor/:path*",
        "/api/((?!auth).*)",
    ],
};
