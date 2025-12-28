import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { AdminContent } from "./admin-content";

export default async function AdminPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    if (session.user.role !== "ADMIN") {
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
