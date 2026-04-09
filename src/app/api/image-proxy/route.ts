import { NextRequest, NextResponse } from "next/server";

/**
 * Image Proxy API Route
 * Fetches an image from a remote URL server-side and returns it as base64.
 * This bypasses CORS restrictions that prevent client-side tools (html2canvas)
 * from reading cross-origin image pixel data.
 *
 * Usage: GET /api/image-proxy?url=https://example.com/image.png
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json({ error: "Missing 'url' parameter" }, { status: 400 });
  }

  try {
    // Fetch the image server-side (no CORS restrictions)
    const response = await fetch(imageUrl, {
      headers: {
        // Some CDNs require a user-agent
        "User-Agent": "Mozilla/5.0 (compatible; EmailBuilder/1.0)",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: response.status }
      );
    }

    // Get the image as a buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    // Determine content type
    const contentType = response.headers.get("content-type") || "image/png";

    // Return as base64 data URL
    return NextResponse.json({
      dataUrl: `data:${contentType};base64,${base64}`,
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}
