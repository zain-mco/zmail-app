import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST: Share a campaign with another user
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { userId, permission = "VIEW" } = body;

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Check if campaign exists and user is the owner
        const campaign = await prisma.campaign.findUnique({
            where: { id },
        });

        if (!campaign) {
            return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }

        if (campaign.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: "Only the campaign owner can share it" },
                { status: 403 }
            );
        }

        // Can't share with yourself
        if (userId === session.user.id) {
            return NextResponse.json(
                { error: "Cannot share campaign with yourself" },
                { status: 400 }
            );
        }

        // Check if user exists
        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!targetUser) {
            return NextResponse.json({ error: "Target user not found" }, { status: 404 });
        }

        // Create or update shared access
        const sharedAccess = await prisma.sharedAccess.upsert({
            where: {
                campaignId_sharedWithUserId: {
                    campaignId: id,
                    sharedWithUserId: userId,
                },
            },
            update: {
                permission: permission as "VIEW" | "EDIT",
            },
            create: {
                campaignId: id,
                sharedWithUserId: userId,
                permission: permission as "VIEW" | "EDIT",
            },
            include: {
                sharedWith: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        return NextResponse.json(sharedAccess, { status: 201 });
    } catch (error) {
        console.error("Error sharing campaign:", error);
        return NextResponse.json(
            { error: "Failed to share campaign" },
            { status: 500 }
        );
    }
}

// DELETE: Remove shared access
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Check if campaign exists and user is the owner
        const campaign = await prisma.campaign.findUnique({
            where: { id },
        });

        if (!campaign) {
            return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }

        if (campaign.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: "Only the campaign owner can modify sharing" },
                { status: 403 }
            );
        }

        // Delete shared access
        await prisma.sharedAccess.delete({
            where: {
                campaignId_sharedWithUserId: {
                    campaignId: id,
                    sharedWithUserId: userId,
                },
            },
        });

        return NextResponse.json({ message: "Access removed successfully" });
    } catch (error) {
        console.error("Error removing shared access:", error);
        return NextResponse.json(
            { error: "Failed to remove access" },
            { status: 500 }
        );
    }
}
