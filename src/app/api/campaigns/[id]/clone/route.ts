import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/campaigns/[id]/clone
 * 
 * Creates a copy of a campaign for the specified user.
 * The recipient becomes the owner of the cloned campaign.
 * Changes to the clone do not affect the original.
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: campaignId } = await params;
        const body = await request.json();
        const { userId, newTitle } = body;

        // Get the original campaign
        const originalCampaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
        });

        if (!originalCampaign) {
            return NextResponse.json(
                { error: "Campaign not found" },
                { status: 404 }
            );
        }

        // Check if user has access to clone (owner or admin, or was shared with)
        const isOwner = originalCampaign.ownerId === session.user.id;
        const isAdmin = session.user.role === "ADMIN";

        // Check if shared with this user
        const hasSharedAccess = await prisma.sharedAccess.findFirst({
            where: {
                campaignId,
                sharedWithUserId: session.user.id,
            },
        });

        if (!isOwner && !isAdmin && !hasSharedAccess) {
            return NextResponse.json(
                { error: "You don't have permission to clone this campaign" },
                { status: 403 }
            );
        }

        // Determine the target user for the clone
        // If userId is provided and caller is admin/owner, clone for that user
        // Otherwise, clone for the current user
        let targetUserId = session.user.id;

        if (userId && (isOwner || isAdmin)) {
            // Verify target user exists
            const targetUser = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!targetUser) {
                return NextResponse.json(
                    { error: "Target user not found" },
                    { status: 404 }
                );
            }
            targetUserId = userId;
        }

        // Create the cloned campaign
        const clonedTitle = newTitle || `${originalCampaign.title} (Copy)`;

        const clonedCampaign = await prisma.campaign.create({
            data: {
                title: clonedTitle,
                content_json: originalCampaign.content_json as any,
                ownerId: targetUserId,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            campaign: clonedCampaign,
            message: `Campaign cloned successfully as "${clonedTitle}"`,
        }, { status: 201 });

    } catch (error) {
        console.error("Error cloning campaign:", error);
        return NextResponse.json(
            { error: "Failed to clone campaign" },
            { status: 500 }
        );
    }
}
