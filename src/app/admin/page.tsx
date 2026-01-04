import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { AdminContent } from "./admin-content";

export default async function AdminPage() {
    const session = await auth();

    console.log("[Admin Page] Session data:", JSON.stringify(session, null, 2));
    console.log("[Admin Page] User role:", session?.user?.role);
    console.log("[Admin Page] Role check result:", session?.user?.role !== "ADMIN");

    if (!session?.user) {
        console.log("[Admin Page] No session user, redirecting to login");
        redirect("/login");
    }

    if (session.user.role !== "ADMIN") {
        console.log("[Admin Page] Not admin role, redirecting to dashboard. Role:", session.user.role);
        redirect("/dashboard");
    }

    // Fetch all users
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            role: true,
            createdAt: true,
            _count: {
                select: {
                    campaigns: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={session.user} />
            <main className="container mx-auto px-4 py-8">
                <AdminContent users={users} currentUserId={session.user.id} />
            </main>
        </div>
    );
}
