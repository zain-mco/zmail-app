import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToBunny } from "@/lib/bunny";
import { prisma } from "@/lib/prisma";

// Only allow PDF files
const ALLOWED_TYPES = ["application/pdf"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        // Upload to mco folder (same as images)
        const fullFolderPath = "mco";

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type - only PDF
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: "Only PDF files are allowed." },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 10MB" },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        // Sanitize filename - keep .pdf extension
        const originalName = file.name.replace(/\.pdf$/i, "");
        const sanitizedName = originalName
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/-+/g, "-");
        const filename = `${sanitizedName}.pdf`;

        // Upload to Bunny.net
        const result = await uploadToBunny(bytes, filename, fullFolderPath);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        // Save to database for PDF library
        await prisma.pdf.create({
            data: {
                url: result.url!,
                filename: file.name, // Original filename for display
                size: file.size,
                uploadedBy: session.user.id,
            },
        });

        return NextResponse.json({
            success: true,
            url: result.url,
            filename: file.name, // Original filename for display
            size: file.size,
        });
    } catch (error) {
        console.error("Error uploading PDF:", error);
        return NextResponse.json(
            { error: "Failed to upload PDF" },
            { status: 500 }
        );
    }
}
