import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * POST /api/auth/logout
 * 
 * Clears all authentication cookies to ensure clean logout.
 * This prevents issues with cached sessions when switching accounts.
 */
export async function POST() {
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === "production";

    // List of all possible NextAuth/Auth.js session cookies
    // NextAuth v5 (Auth.js) uses "authjs.*" prefix
    const sessionCookies = [
        // NextAuth v5 / Auth.js cookie names
        "authjs.session-token",
        "__Secure-authjs.session-token",
        "__Host-authjs.session-token",
        "authjs.csrf-token",
        "__Secure-authjs.csrf-token",
        "__Host-authjs.csrf-token",
        "authjs.callback-url",
        // NextAuth v4 cookie names (what we're using in auth.ts)
        "next-auth.session-token",
        "__Secure-next-auth.session-token",
        "next-auth.csrf-token",
        "__Secure-next-auth.csrf-token",
        "next-auth.callback-url",
        "__Secure-next-auth.callback-url",
        "__Host-next-auth.csrf-token",
    ];

    // Delete all session cookies server-side
    for (const cookieName of sessionCookies) {
        try {
            cookieStore.delete(cookieName);
        } catch {
            // Cookie may not exist, ignore
        }
    }

    // Create response with explicit Set-Cookie headers to expire cookies
    const response = NextResponse.json(
        { success: true, message: "Logged out successfully" },
        {
            status: 200,
            headers: {
                // Clear cache to prevent stale session data
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
            },
        }
    );

    // Explicitly expire all cookies via Set-Cookie headers
    // This ensures the browser actually removes them
    for (const cookieName of sessionCookies) {
        // Set with correct secure flag based on environment
        const isSecureCookie = cookieName.startsWith("__Secure-") || cookieName.startsWith("__Host-");

        response.cookies.set(cookieName, "", {
            expires: new Date(0),
            maxAge: 0,
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            secure: isProduction || isSecureCookie,
        });
    }

    return response;
}

