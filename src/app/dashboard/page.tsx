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

    // Fetch all users for sharing dropdown (both TEAM and ADMIN, except current user)
    const teamUsers = await prisma.user.findMany({
        where: {
            id: { not: session.user.id },
        },
        select: {
            id: true,
            username: true,
            role: true,
        },
        orderBy: {
            role: "asc",  // ADMIN first, then TEAM
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
        <div className="min-h-screen bg-mesh-gradient transition-colors duration-300 relative overflow-hidden">
            {/* Ambient Background Orbs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-400/20 rounded-full blur-[100px] animate-float opacity-70" />
                <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-indigo-400/20 rounded-full blur-[100px] animate-float-delayed opacity-70" />
                <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-pink-400/20 rounded-full blur-[100px] animate-float-delayed opacity-50" />
            </div>

            <Navbar user={session.user} />
            <main className="container mx-auto px-4 py-8 relative z-10">
                <DashboardContent
                    campaigns={transformedCampaigns}
                    teamUsers={teamUsers}
                    currentUserId={session.user.id}
                />
            </main>
        </div>
    );
}
