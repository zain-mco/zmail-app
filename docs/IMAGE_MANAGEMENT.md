# Image Management & CDN Strategy

## Image Resizing Standards

All images uploaded through ZMAIL are automatically processed:

| Type | Width | Optimization | Use Case |
|------|-------|--------------|----------|
| **Header** | 600px | JPEG 85% quality | Full-width banners |
| **Content** | 560px | JPEG 85% quality | In-content images |
| **Max Size** | - | < 200KB | Fast email loading |

### How It Works

1. **Upload** → Image sent to `/api/upload`
2. **Resize** → Sharp library resizes to 600px width
3. **Optimize** → Converted to progressive JPEG, 85% quality
4. **Compress** → If still > 200KB, quality reduced to 70%
5. **Upload CDN** → Final image uploaded to Bunny.net
6. **Return URL** → Custom CNAME URL returned to app

---

## CDN Cleanup Strategy

### Current Implementation

Images uploaded to Bunny.net remain there permanently until manually deleted. Here's how to implement automatic cleanup:

### Option 1: Track Images in Database (Recommended)

Add an `Image` model to track what's uploaded:

```prisma
model Image {
  id          String   @id @default(cuid())
  url         String
  filename    String
  campaignId  String?
  campaign    Campaign? @relation(fields: [campaignId], references: [id], onDelete: SetNull)
  uploadedBy  String
  createdAt   DateTime @default(now())
  
  @@index([campaignId])
}
```

**Benefits:**
- Know exactly what images exist
- Can delete when campaign is deleted
- Track unused images for cleanup

### Option 2: Parse Campaign Content

When deleting a campaign:
1. Parse `content_json` 
2. Extract all image URLs
3. Call Bunny.net delete API for each

### Option 3: Manual Cleanup (Current)

- Images stay on CDN indefinitely
- Admin manually removes from Bunny dashboard
- Simple but wastes storage

---

## Recommended Implementation

### Phase 1: Image Tracking (Next Step)

```typescript
// In upload API after successful upload:
await prisma.image.create({
  data: {
    url: result.url,
    filename: filename,
    uploadedBy: session.user.id,
  },
});
```

### Phase 2: Campaign-Image Linking

When saving campaign:
```typescript
// Extract image URLs from blocks
const imageUrls = extractImageUrls(content_json);

// Link to campaign
await prisma.image.updateMany({
  where: { url: { in: imageUrls }, campaign Id: null },
  data: { campaignId: campaign.id },
});
```

### Phase 3: Automatic Cleanup

When deleting campaign:
```typescript
// Get campaign images
const images = await prisma.image.findMany({
  where: { campaignId: id },
});

// Delete from Bunny CDN
for (const img of images) {
  await deleteFromBunny(img.url);
}

// Delete from database
await prisma.image.deleteMany({
  where: { campaignId: id },
});
```

---

## What You Should Do

### For Bunny.net CDN Setup

1. **Get your Bunny.net credentials:**
   - Storage Zone Name
   - Storage API Key
   - Pull Zone Domain (your custom CNAME)

2. **Add to `.env`:**
   ```
   BUNNY_STORAGE_API_KEY=your-api-key
   BUNNY_STORAGE_ZONE=your-zone-name
   BUNNY_PULL_ZONE_DOMAIN=cdn.yourdomain.com
   ```

3. **Test upload** in the editor to verify it works

### For Automated Image Cleanup

**Short term:** Images accumulate on CDN (not a problem initially)

**Long term:** Implement Option 1 (Database tracking) when you have time:
- Add `Image` model to schema
- Track uploads
- Clean up on campaign delete

---

## Testing Image Upload Now

1. Make sure your `.env` has Bunny credentials
2. Restart dev server: `npm run dev`
3. Go to editor and try uploading an image
4. Check browser console for any errors
5. Verify image appears at your CDN domain

If upload fails, check:
- ✓ Bunny credentials are correct
- ✓ Storage Zone allows uploads
- ✓ CORS is configured if needed
