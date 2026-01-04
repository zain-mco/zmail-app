import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToBunny, deleteFromBunny } from "@/lib/bunny";

// GET /api/images - Get user's image library
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const images = await prisma.image.findMany({
            where: {
                uploadedBy: session.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({ images });
    } catch (error) {
        console.error("Error fetching images:", error);
        return NextResponse.json(
            { error: "Failed to fetch images" },
            { status: 500 }
        );
    }
}

// POST /api/images - Upload a new image
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse multipart form data
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP" },
                { status: 400 }
            );
        }

        // Max file size: 10MB
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 10MB" },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();

        // Upload to Bunny CDN
        const result = await uploadToBunny(bytes, file.name, "zmail");

        if (!result.success || !result.url) {
            console.error("Bunny upload failed:", result.error);
            return NextResponse.json(
                { error: result.error || "Upload failed" },
                { status: 500 }
            );
        }

        // Save to database
        const image = await prisma.image.create({
            data: {
                url: result.url,
                filename: file.name,
                uploadedBy: session.user.id,
            },
        });

        return NextResponse.json({ image }, { status: 201 });
    } catch (error) {
        console.error("Error uploading image:", error);
        return NextResponse.json(
            { error: "Failed to upload image" },
            { status: 500 }
        );
    }
}
