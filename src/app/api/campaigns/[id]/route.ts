import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { blocksToHtml } from "@/lib/email-export";

// GET: Fetch a single campaign by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const campaign = await prisma.campaign.findUnique({
            where: { id },
            include: {
                owner: {
                    select: { id: true, username: true },
                },
                sharedAccess: {
                    where: { sharedWithUserId: session.user.id },
                },
            },
        });

        if (!campaign) {
            return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }

        // Check access: owner or shared with user
        const isOwner = campaign.ownerId === session.user.id;
        const hasSharedAccess = campaign.sharedAccess.length > 0;

        if (!isOwner && !hasSharedAccess) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const permission = isOwner
            ? "OWNER"
            : campaign.sharedAccess[0]?.permission ?? "VIEW";

        return NextResponse.json({
            ...campaign,
            isOwner,
            permission,
        });
    } catch (error) {
        console.error("Error fetching campaign:", error);
        return NextResponse.json(
            { error: "Failed to fetch campaign" },
            { status: 500 }
        );
    }
}

// PUT: Update a campaign
export async function PUT(
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
        const { title, content_json, generateHtml } = body;

        // Check ownership or edit permission
        const campaign = await prisma.campaign.findUnique({
            where: { id },
            include: {
                sharedAccess: {
                    where: { sharedWithUserId: session.user.id },
                },
            },
        });

        if (!campaign) {
            return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }

        const isOwner = campaign.ownerId === session.user.id;
        const canEdit =
            isOwner ||
            campaign.sharedAccess.some((sa) => sa.permission === "EDIT");

        if (!canEdit) {
            return NextResponse.json({ error: "Edit access denied" }, { status: 403 });
        }

        // Build update data
        const updateData: {
            title?: string;
            content_json?: object;
            html_output?: string;
        } = {};

        if (title !== undefined) updateData.title = title;
        if (content_json !== undefined) {
            updateData.content_json = content_json;

            // Generate HTML if requested
            if (generateHtml) {
                updateData.html_output = blocksToHtml(content_json);
            }
        }

        const updatedCampaign = await prisma.campaign.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(updatedCampaign);
    } catch (error) {
        console.error("Error updating campaign:", error);
        return NextResponse.json(
            { error: "Failed to update campaign" },
            { status: 500 }
        );
    }
}

// DELETE: Delete a campaign
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

        // Only owner can delete
        const campaign = await prisma.campaign.findUnique({
            where: { id },
        });

        if (!campaign) {
            return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }

        if (campaign.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: "Only the owner can delete this campaign" },
                { status: 403 }
            );
        }

        await prisma.campaign.delete({ where: { id } });

        return NextResponse.json({ message: "Campaign deleted successfully" });
    } catch (error) {
        console.error("Error deleting campaign:", error);
        return NextResponse.json(
            { error: "Failed to delete campaign" },
            { status: 500 }
        );
    }
}

// PATCH: Alias for PUT - used for partial updates like renaming
export { PUT as PATCH };
