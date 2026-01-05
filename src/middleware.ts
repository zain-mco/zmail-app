import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Edge-compatible middleware for session validation
 * OWASP compliant: validates session on every protected request
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get secret - try AUTH_SECRET first, then NEXTAUTH_SECRET as fallback
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

    // If no secret is configured, skip token validation and allow request
    // This prevents crashes during development when env vars might not be loaded
    if (!secret) {
        console.warn("Missing AUTH_SECRET or NEXTAUTH_SECRET - authentication will not work properly");
        // For protected routes, redirect to login if no secret is configured
        if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard") || pathname.startsWith("/editor")) {
            return NextResponse.redirect(new URL("/login?reason=required", request.url));
        }
        if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
            return NextResponse.json({ error: "Unauthorized - server misconfigured" }, { status: 401 });
        }
        return NextResponse.next();
    }

    // Get the token from the request (works in Edge)
    // IMPORTANT: Explicitly specify cookie name to match auth.ts configuration
    const cookieName = process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token";

    const token = await getToken({
        req: request,
        secret,
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
