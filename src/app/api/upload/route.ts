import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToBunny } from "@/lib/bunny";
import { prisma } from "@/lib/prisma";
import sharp from "sharp";

// Only allow PNG and JPG for email use
const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB before processing

// Email image size standards
const EMAIL_IMAGE_SIZES = {
    header: 600, // Full width header
    content: 560, // Content images with padding
    maxFileSize: 500 * 1024, // 500KB max after processing (increased for PNG)
};

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Debug: Check environment variables
        console.log("=== UPLOAD DEBUG ===");
        console.log("BUNNY_STORAGE_ZONE:", process.env.BUNNY_STORAGE_ZONE);
        console.log("BUNNY_STORAGE_HOSTNAME:", process.env.BUNNY_STORAGE_HOSTNAME);
        console.log("BUNNY_STORAGE_API_KEY:", process.env.BUNNY_STORAGE_API_KEY ? "SET" : "NOT SET");
        console.log("BUNNY_PULL_ZONE_DOMAIN:", process.env.BUNNY_PULL_ZONE_DOMAIN);

        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const imageType = (formData.get("imageType") as string) || "header";

        // Upload to mco folder
        const fullFolderPath = "mco";

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type - only PNG and JPG
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                {
                    error: `Only PNG and JPG images are allowed.`,
                },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 5MB" },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Determine target width based on image type
        const targetWidth = imageType === "header"
            ? EMAIL_IMAGE_SIZES.header
            : EMAIL_IMAGE_SIZES.content;

        // Preserve original format - PNG stays PNG, JPG stays JPG
        const isPng = file.type === "image/png";
        const outputExtension = isPng ? ".png" : ".jpg";

        // Process image with sharp - preserve original format
        let processedBuffer: Buffer;

        try {
            const image = sharp(buffer);
            const metadata = await image.metadata();

            // Resize if image is wider than target, but keep original format
            if (metadata.width && metadata.width > targetWidth) {
                if (isPng) {
                    processedBuffer = await image
                        .resize(targetWidth, null, {
                            withoutEnlargement: true,
                            fit: "inside",
                        })
                        .png({
                            compressionLevel: 8,
                        })
                        .toBuffer();
                } else {
                    processedBuffer = await image
                        .resize(targetWidth, null, {
                            withoutEnlargement: true,
                            fit: "inside",
                        })
                        .jpeg({
                            quality: 85,
                            progressive: true,
                        })
                        .toBuffer();
                }
            } else {
                // Just optimize without resizing, keep original format
                if (isPng) {
                    processedBuffer = await image
                        .png({
                            compressionLevel: 8,
                        })
                        .toBuffer();
                } else {
                    processedBuffer = await image
                        .jpeg({
                            quality: 85,
                            progressive: true,
                        })
                        .toBuffer();
                }
            }

            // Check if processed file is still too large - reduce quality
            if (processedBuffer.length > EMAIL_IMAGE_SIZES.maxFileSize) {
                if (isPng) {
                    processedBuffer = await sharp(buffer)
                        .resize(targetWidth, null, {
                            withoutEnlargement: true,
                            fit: "inside",
                        })
                        .png({
                            compressionLevel: 9,
                        })
                        .toBuffer();
                } else {
                    processedBuffer = await sharp(buffer)
                        .resize(targetWidth, null, {
                            withoutEnlargement: true,
                            fit: "inside",
                        })
                        .jpeg({
                            quality: 70,
                            progressive: true,
                        })
                        .toBuffer();
                }
            }
        } catch (error) {
            console.error("Image processing error:", error);
            return NextResponse.json(
                { error: "Failed to process image" },
                { status: 500 }
            );
        }

        // Generate filename with appropriate extension
        const originalName = file.name.replace(/\.[^/.]+$/, "");
        const sanitizedName = originalName
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/-+/g, "-");
        const filename = `${sanitizedName}${outputExtension}`;

        // Upload to Bunny.net
        const bytes = new Uint8Array(processedBuffer);
        const result = await uploadToBunny(bytes, filename, fullFolderPath);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        // Save to database for image library
        await prisma.image.create({
            data: {
                url: result.url!,
                filename: filename,
                uploadedBy: session.user.id,
            },
        });

        return NextResponse.json({
            success: true,
            url: result.url,
            filename: filename,
            originalSize: file.size,
            processedSize: processedBuffer.length,
            width: targetWidth,
            format: isPng ? "png" : "jpg",
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        );
    }
}
