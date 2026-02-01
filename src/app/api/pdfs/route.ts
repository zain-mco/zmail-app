import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - List all PDFs for the current user
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const pdfs = await prisma.pdf.findMany({
            where: {
                uploadedBy: session.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                url: true,
                filename: true,
                size: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ pdfs });
    } catch (error) {
        console.error("Error fetching PDFs:", error);
        return NextResponse.json(
            { error: "Failed to fetch PDFs" },
            { status: 500 }
        );
    }
}
