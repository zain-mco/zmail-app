import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Fetch campaigns for the authenticated user
// Returns: owned campaigns + campaigns shared with the user
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Fetch campaigns where user is owner OR has SharedAccess
        const campaigns = await prisma.campaign.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    {
                        sharedAccess: {
                            some: {
                                sharedWithUserId: userId,
                            },
                        },
                    },
                ],
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                sharedAccess: {
                    include: {
                        sharedWith: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        // Transform to include ownership info
        const transformedCampaigns = campaigns.map((campaign) => ({
            ...campaign,
            isOwner: campaign.ownerId === userId,
            permission: campaign.ownerId === userId
                ? "OWNER"
                : campaign.sharedAccess.find((sa) => sa.sharedWithUserId === userId)
                    ?.permission ?? "VIEW",
        }));

        return NextResponse.json(transformedCampaigns);
    } catch (error) {
        console.error("Error fetching campaigns:", error);
        return NextResponse.json(
            { error: "Failed to fetch campaigns" },
            { status: 500 }
        );
    }
}

// POST: Create a new campaign
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, content_json } = body;

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        const campaign = await prisma.campaign.create({
            data: {
                title,
                content_json: content_json ?? { blocks: [] },
                ownerId: session.user.id,
            },
        });

        return NextResponse.json(campaign, { status: 201 });
    } catch (error) {
        console.error("Error creating campaign:", error);
        return NextResponse.json(
            { error: "Failed to create campaign" },
            { status: 500 }
        );
    }
}
