import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { DashboardContent } from "./dashboard-content";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Fetch user's campaigns (owned + shared)
    const campaigns = await prisma.campaign.findMany({
        where: {
            OR: [
                { ownerId: session.user.id },
                {
                    sharedAccess: {
                        some: {
                            sharedWithUserId: session.user.id,
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

    // Fetch all team users for sharing dropdown
    const teamUsers = await prisma.user.findMany({
        where: {
            role: "TEAM",
            id: { not: session.user.id },
        },
        select: {
            id: true,
            username: true,
        },
    });

    // Transform campaigns with ownership info
    const transformedCampaigns = campaigns.map((campaign) => ({
        ...campaign,
        isOwner: campaign.ownerId === session.user.id,
        permission: campaign.ownerId === session.user.id
            ? ("OWNER" as const)
            : campaign.sharedAccess.find((sa) => sa.sharedWithUserId === session.user.id)
                ?.permission ?? ("VIEW" as const),
    }));

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={session.user} />
            <main className="container mx-auto px-4 py-8">
                <DashboardContent
                    campaigns={transformedCampaigns}
                    teamUsers={teamUsers}
                    currentUserId={session.user.id}
                />
            </main>
        </div>
    );
}
