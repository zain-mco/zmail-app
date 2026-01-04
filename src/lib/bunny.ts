/**
 * Bunny.net Storage Helper
 * Uploads files to Bunny Storage Zone and returns the URL using custom CNAME
 */

interface BunnyUploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

/**
 * Upload a file to Bunny.net Storage
 * @param file - The file buffer to upload
 * @param filename - The filename (will be sanitized)
 * @param folder - Optional folder path within the storage zone
 * @returns Object with success status and either the public URL or error message
 */
export async function uploadToBunny(
    file: ArrayBuffer | Uint8Array,
    filename: string,
    folder: string = ""
): Promise<BunnyUploadResult> {
    const apiKey = process.env.BUNNY_STORAGE_API_KEY;
    const storageZone = process.env.BUNNY_STORAGE_ZONE;
    const pullZoneDomain = process.env.BUNNY_PULL_ZONE_DOMAIN;

    if (!apiKey || !storageZone || !pullZoneDomain) {
        return {
            success: false,
            error: "Bunny.net configuration is missing. Check environment variables.",
        };
    }

    // Sanitize filename: remove special characters, replace spaces with dashes
    const sanitizedFilename = filename
        .toLowerCase()
        .replace(/[^a-z0-9.-]/g, "-")
        .replace(/-+/g, "-");

    // Generate unique filename with timestamp to prevent overwrites
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${sanitizedFilename}`;

    // Build the storage path
    const storagePath = folder
        ? `${folder.replace(/^\/|\/$/g, "")}/${uniqueFilename}`
        : uniqueFilename;

    // Bunny.net Storage API endpoint (use region-specific hostname)
    const storageHostname = process.env.BUNNY_STORAGE_HOSTNAME || "storage.bunnycdn.com";
    const storageUrl = `https://${storageHostname}/${storageZone}/${storagePath}`;

    console.log("Upload URL:", storageUrl);
    console.log("API Key (first 10 chars):", apiKey.substring(0, 10) + "...");

    try {
        // Convert to Blob for fetch compatibility
        const blob = new Blob([file as BlobPart]);

        console.log("Making request to Bunny.net...");

        const response = await fetch(storageUrl, {
            method: "PUT",
            headers: {
                AccessKey: apiKey,
                "Content-Type": "application/octet-stream",
            },
            body: blob,
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
            const error = await response.text();
            console.log("Error response:", error);
            return {
                success: false,
                error: `Bunny upload failed: ${response.status} - ${error}`,
            };
        }

        // Return the public URL using the custom CNAME (not bunnycdn.com)
        const publicUrl = `https://${pullZoneDomain}/${storagePath}`;

        return {
            success: true,
            url: publicUrl,
        };
    } catch (error) {
        return {
            success: false,
            error: `Upload error: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
    }
}

/**
 * Delete a file from Bunny.net Storage
 * @param filepath - The path to the file within the storage zone
 */
export async function deleteFromBunny(filepath: string): Promise<BunnyUploadResult> {
    const apiKey = process.env.BUNNY_STORAGE_API_KEY;
    const storageZone = process.env.BUNNY_STORAGE_ZONE;

    if (!apiKey || !storageZone) {
        return {
            success: false,
            error: "Bunny.net configuration is missing. Check environment variables.",
        };
    }

    const storageHostname = process.env.BUNNY_STORAGE_HOSTNAME || "storage.bunnycdn.com";
    const storageUrl = `https://${storageHostname}/${storageZone}/${filepath}`;

    try {
        const response = await fetch(storageUrl, {
            method: "DELETE",
            headers: {
                AccessKey: apiKey,
            },
        });

        if (!response.ok) {
            const error = await response.text();
            return {
                success: false,
                error: `Bunny delete failed: ${response.status} - ${error}`,
            };
        }

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: `Delete error: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
    }
}
