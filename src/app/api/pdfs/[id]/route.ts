import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFromBunny } from "@/lib/bunny";

// DELETE - Remove a PDF from library and CDN
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

        // Find the PDF
        const pdf = await prisma.pdf.findUnique({
            where: { id },
        });

        if (!pdf) {
            return NextResponse.json({ error: "PDF not found" }, { status: 404 });
        }

        // Check ownership
        if (pdf.uploadedBy !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Delete from Bunny CDN
        // Extract the filepath from the URL (remove the domain part)
        const url = new URL(pdf.url);
        const filepath = url.pathname.substring(1); // Remove leading slash
        await deleteFromBunny(filepath);

        // Delete from database
        await prisma.pdf.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting PDF:", error);
        return NextResponse.json(
            { error: "Failed to delete PDF" },
            { status: 500 }
        );
    }
}
