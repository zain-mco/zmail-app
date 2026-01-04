import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { EditorWorkspace } from "@/components/editor/EditorWorkspace";
import { EmailContent } from "@/lib/block-types";

interface EditorPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const { id } = await params;

    // Fetch the campaign
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
        redirect("/dashboard");
    }

    // Check access
    const isOwner = campaign.ownerId === session.user.id;
    const hasSharedAccess = campaign.sharedAccess.length > 0;

    if (!isOwner && !hasSharedAccess) {
        redirect("/dashboard");
    }

    const permission = isOwner
        ? "OWNER"
        : campaign.sharedAccess[0]?.permission ?? "VIEW";

    const canEdit = permission === "OWNER" || permission === "EDIT";

    // Parse content_json - handle Prisma JsonValue type
    const contentJson = campaign.content_json as { blocks?: unknown[] } | null;
    const initialContent: EmailContent = {
        blocks: Array.isArray(contentJson?.blocks)
            ? (contentJson.blocks as EmailContent["blocks"])
            : [],
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Navbar user={session.user} />
            <EditorWorkspace
                campaignId={campaign.id}
                campaignTitle={campaign.title}
                initialContent={initialContent}
                canEdit={canEdit}
                permission={permission}
            />
        </div>
    );
}
