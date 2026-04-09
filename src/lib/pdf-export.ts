/**
 * PDF Export Utility
 * Converts the email builder's exported HTML to a downloadable PDF.
 *
 * Flow:
 * 1. Takes the complete email HTML (from blocksToHtml)
 * 2. Renders it in a hidden iframe sized to content
 * 3. Converts all images to base64 via server proxy (bypasses CORS)
 * 4. Captures with html2canvas
 * 5. Extracts all links and overlays them as clickable PDF annotations
 * 6. Generates a properly-sized PDF (no blank pages)
 */

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const UNSUPPORTED_COLOR_REGEX = /\b(lab|oklch|oklab|lch|color)\s*\(/i;

const COLOR_PROPERTIES = [
  "backgroundColor", "color", "borderColor", "borderTopColor",
  "borderRightColor", "borderBottomColor", "borderLeftColor",
  "outlineColor", "textDecorationColor", "caretColor",
] as const;

function convertModernColorsToRgb(doc: Document): void {
  const allElements = doc.querySelectorAll("*");
  allElements.forEach((el) => {
    const element = el as HTMLElement;
    const computedStyle = doc.defaultView?.getComputedStyle(element);
    if (!computedStyle) return;
    for (const prop of COLOR_PROPERTIES) {
      try {
        const value = computedStyle[prop as keyof CSSStyleDeclaration] as string;
        if (value && typeof value === "string" && UNSUPPORTED_COLOR_REGEX.test(value)) {
          element.style[prop as any] = value;
          const resolved = doc.defaultView?.getComputedStyle(element)[prop as keyof CSSStyleDeclaration] as string;
          if (resolved && !UNSUPPORTED_COLOR_REGEX.test(resolved)) {
            element.style[prop as any] = resolved;
          } else {
            element.style[prop as any] = prop === "color" ? "#000000" : "transparent";
          }
        }
      } catch { /* skip */ }
    }
  });
}

async function imageUrlToDataUrl(url: string): Promise<string> {
  try {
    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) return url;
    const data = await response.json();
    return data.dataUrl || url;
  } catch {
    return url;
  }
}

async function convertAllImagesToDataUrls(
  doc: Document,
  onProgress?: (status: string) => void
): Promise<void> {
  const images = doc.querySelectorAll("img");
  const total = images.length;
  if (total === 0) return;

  let completed = 0;
  const promises = Array.from(images).map(async (img) => {
    const src = img.getAttribute("src");
    if (src && !src.startsWith("data:")) {
      try {
        const dataUrl = await imageUrlToDataUrl(src);
        img.setAttribute("src", dataUrl);
      } catch { /* keep original */ }
    }
    completed++;
    onProgress?.(`Processing images (${completed}/${total})...`);
  });

  await Promise.all(promises);
}

async function waitForImages(doc: Document): Promise<void> {
  const images = doc.querySelectorAll("img");
  if (images.length === 0) return;
  const promises = Array.from(images).map((img) => {
    if (img.complete && img.naturalHeight > 0) return Promise.resolve();
    return new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
      setTimeout(resolve, 15000);
    });
  });
  await Promise.all(promises);
}

/**
 * Extract all links (<a> tags) and their bounding rectangles from the document.
 * These will be overlaid as clickable annotations in the final PDF.
 */
interface LinkInfo {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

function extractLinks(doc: Document, containerElement: HTMLElement): LinkInfo[] {
  const links: LinkInfo[] = [];
  const anchors = containerElement.querySelectorAll("a[href]");
  const containerRect = containerElement.getBoundingClientRect();

  anchors.forEach((anchor) => {
    const href = anchor.getAttribute("href");
    if (!href || href === "#" || href.startsWith("javascript:")) return;

    const rect = anchor.getBoundingClientRect();
    // Get position relative to the container
    links.push({
      url: href,
      x: rect.left - containerRect.left,
      y: rect.top - containerRect.top,
      width: rect.width,
      height: rect.height,
    });
  });

  return links;
}

/**
 * Export email HTML as a downloadable PDF with clickable links.
 */
export async function exportEmailAsPdf(
  html: string,
  filename: string = "email-export",
  onProgress?: (status: string) => void
): Promise<void> {
  onProgress?.("Preparing email preview...");

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.top = "-10000px";
  iframe.style.left = "-10000px";
  iframe.style.width = "660px";
  iframe.style.border = "none";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  // Don't set a fixed height — let it size to content
  iframe.style.height = "auto";
  document.body.appendChild(iframe);

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) throw new Error("Could not access iframe document");

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    onProgress?.("Loading images...");
    await waitForImages(iframeDoc);
    await new Promise((resolve) => setTimeout(resolve, 300));

    await convertAllImagesToDataUrls(iframeDoc, onProgress);
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Measure the actual content height
    const emailBody = iframeDoc.body;
    if (!emailBody) throw new Error("Could not find email body");

    // Get the real content height (not the viewport/iframe height)
    const contentHeight = emailBody.scrollHeight;

    // Set the iframe height to exactly match the content — no extra space
    iframe.style.height = `${contentHeight}px`;

    // Wait for reflow
    await new Promise((resolve) => setTimeout(resolve, 200));

    onProgress?.("Extracting links...");

    // Extract all clickable links and their positions
    const links = extractLinks(iframeDoc, emailBody);

    onProgress?.("Capturing email content...");

    // Capture only the actual content area
    const canvas = await html2canvas(emailBody, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: "#f4f4f4",
      width: 660,
      height: contentHeight, // Only capture actual content height
      windowWidth: 660,
      windowHeight: contentHeight,
      onclone: (clonedDoc) => {
        convertModernColorsToRgb(clonedDoc);
        const body = clonedDoc.body;
        if (body) {
          body.style.margin = "0";
          body.style.padding = "0";
          body.style.width = "660px";
          body.style.height = `${contentHeight}px`;
          body.style.overflow = "hidden";
        }
      },
    });

    onProgress?.("Generating PDF...");

    // Calculate PDF dimensions — single continuous page (no page breaks)
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const pxToMm = 0.264583;
    const contentWidthMm = (imgWidth / 2) * pxToMm;
    const contentHeightMm = (imgHeight / 2) * pxToMm;

    const marginX = 10;
    const marginY = 10;
    const pageWidthMm = contentWidthMm + marginX * 2;
    const pageHeightMm = contentHeightMm + marginY * 2;

    // Scale factor: content pixels (at 1x) to mm
    const pxScaleToMm = contentWidthMm / 660; // 660px content width

    // Single page with exact content height — no splitting
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [pageWidthMm, Math.max(pageHeightMm, 50)],
    });

    pdf.addImage(
      canvas.toDataURL("image/png"), "PNG",
      marginX, marginY, contentWidthMm, contentHeightMm
    );

    // Add all clickable links
    addLinksToPage(pdf, links, marginX, marginY, pxScaleToMm, 0, contentHeight);

    pdf.save(`${filename}.pdf`);

    onProgress?.("Done!");
  } finally {
    document.body.removeChild(iframe);
  }
}

/**
 * Add clickable link annotations to a PDF page.
 * Only adds links that fall within the given Y range (for multi-page support).
 */
function addLinksToPage(
  pdf: jsPDF,
  links: LinkInfo[],
  marginX: number,
  marginY: number,
  pxScaleToMm: number,
  pageTopPx: number,
  pageBottomPx: number
): void {
  for (const link of links) {
    // Check if this link is visible on this page
    const linkTopPx = link.y;
    const linkBottomPx = link.y + link.height;

    if (linkBottomPx < pageTopPx || linkTopPx > pageBottomPx) {
      continue; // Link is not on this page
    }

    // Calculate link position relative to this page
    const relativeY = link.y - pageTopPx;
    const xMm = marginX + link.x * pxScaleToMm;
    const yMm = marginY + relativeY * pxScaleToMm;
    const wMm = link.width * pxScaleToMm;
    const hMm = link.height * pxScaleToMm;

    // Only add if dimensions are reasonable
    if (wMm > 0.5 && hMm > 0.5) {
      pdf.link(xMm, yMm, wMm, hMm, { url: link.url });
    }
  }
}
