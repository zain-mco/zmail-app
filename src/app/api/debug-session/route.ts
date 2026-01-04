import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { auth } from "@/lib/auth";

/**
 * Debug endpoint to check session and token role
 * DELETE THIS IN PRODUCTION
 */
export async function GET(request: NextRequest) {
    try {
        // Get JWT token (same as middleware uses)
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
        });

        // Get session (same as admin page uses)
        const session = await auth();

        return NextResponse.json({
            token: {
                exists: !!token,
                role: token?.role,
                roleType: typeof token?.role,
                fullToken: token,
            },
            session: {
                exists: !!session,
                role: session?.user?.role,
                roleType: typeof session?.user?.role,
                fullSession: session,
            },
            comparison: {
                tokenRoleEqualsADMIN: token?.role === "ADMIN",
                sessionRoleEqualsADMIN: session?.user?.role === "ADMIN",
            }
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
