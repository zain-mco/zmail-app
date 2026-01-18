import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/campaigns/[id]/shared-access
 * 
 * Removes the current user's shared access to a campaign.
 * This removes the campaign from their "Shared with me" list.
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: campaignId } = await params;

        // Find and delete the SharedAccess record for this user and campaign
        const sharedAccess = await prisma.sharedAccess.findFirst({
            where: {
                campaignId,
                sharedWithUserId: session.user.id,
            },
        });

        if (!sharedAccess) {
            return NextResponse.json(
                { error: "Shared access not found" },
                { status: 404 }
            );
        }

        await prisma.sharedAccess.delete({
            where: { id: sharedAccess.id },
        });

        return NextResponse.json({
            success: true,
            message: "Shared access removed successfully",
        });
    } catch (error) {
        console.error("Error removing shared access:", error);
        return NextResponse.json(
            { error: "Failed to remove shared access" },
            { status: 500 }
        );
    }
}
