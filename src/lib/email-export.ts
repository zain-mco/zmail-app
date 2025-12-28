/**
 * Email Export Engine
 * Converts block-based content to spam-free HTML for EventsAir
 * 
 * Constraints:
 * - Table-based layout (600px width)
 * - Inline CSS only
 * - No <script> tags
 * - No external CSS references
 */

interface HeaderImageBlock {
    type: "HeaderImage";
    data: {
        src: string;
        alt?: string;
    };
}

interface TextBlockData {
    type: "TextBlock";
    data: {
        content: string;
        fontSize?: number;
        color?: string;
        align?: "left" | "center" | "right";
    };
}

interface ButtonBlock {
    type: "Button";
    data: {
        text: string;
        url: string;
        backgroundColor?: string;
        textColor?: string;
    };
}

interface FooterBlock {
    type: "Footer";
    data: {
        content: string;
    };
}

interface SpacerBlock {
    type: "Spacer";
    data: {
        height?: number;
    };
}

type EmailBlock = HeaderImageBlock | TextBlockData | ButtonBlock | FooterBlock | SpacerBlock;

interface EmailContent {
    blocks: (EmailBlock & { id: string })[];
}

/**
 * Convert blocks JSON to spam-free HTML
 */
export function blocksToHtml(content: EmailContent): string {
    const blocks = content.blocks || [];

    let bodyContent = blocks.map((block) => renderBlock(block)).join("\n");

    // Wrap in email-safe HTML structure
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Email</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; max-width: 600px;">
${bodyContent}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderBlock(block: EmailBlock & { id: string }): string {
    switch (block.type) {
        case "HeaderImage":
            return renderHeaderImage(block);
        case "TextBlock":
            return renderTextBlock(block);
        case "Button":
            return renderButton(block);
        case "Footer":
            return renderFooter(block);
        case "Spacer":
            return renderSpacer(block);
        default:
            return "";
    }
}

function renderHeaderImage(block: HeaderImageBlock & { id: string }): string {
    if (!block.data.src) {
        return "";
    }

    return `          <tr>
            <td align="center" style="padding: 0;">
              <img src="${escapeHtml(block.data.src)}" alt="${escapeHtml(block.data.alt || "")}" width="600" style="display: block; max-width: 100%; height: auto; border: 0;">
            </td>
          </tr>`;
}

function renderTextBlock(block: TextBlockData & { id: string }): string {
    const fontSize = block.data.fontSize || 16;
    const color = block.data.color || "#333333";
    const align = block.data.align || "left";

    return `          <tr>
            <td style="padding: 20px 30px; font-size: ${fontSize}px; line-height: 1.6; color: ${escapeHtml(color)}; text-align: ${align};">
              ${escapeHtml(block.data.content).replace(/\n/g, "<br>")}
            </td>
          </tr>`;
}

function renderButton(block: ButtonBlock & { id: string }): string {
    const bgColor = block.data.backgroundColor || "#1e40af";
    const textColor = block.data.textColor || "#ffffff";

    return `          <tr>
            <td align="center" style="padding: 20px 30px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: ${escapeHtml(bgColor)}; border-radius: 6px;">
                    <a href="${escapeHtml(block.data.url)}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: bold; color: ${escapeHtml(textColor)}; text-decoration: none; border-radius: 6px;">${escapeHtml(block.data.text)}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
}

function renderFooter(block: FooterBlock & { id: string }): string {
    return `          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="font-size: 12px; line-height: 1.5; color: #6c757d; text-align: center;">
                    ${escapeHtml(block.data.content).replace(/\n/g, "<br>")}
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
}

function renderSpacer(block: SpacerBlock & { id: string }): string {
    const height = block.data.height || 20;

    return `          <tr>
            <td style="padding: 0; height: ${height}px; line-height: ${height}px; font-size: 0;">&nbsp;</td>
          </tr>`;
}

function escapeHtml(text: string): string {
    const htmlEntities: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    };

    return text.replace(/[&<>"']/g, (char) => htmlEntities[char]);
}

/**
 * Validate that HTML is spam-safe
 */
export function validateSpamFreeHtml(html: string): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check for script tags
    if (/<script/i.test(html)) {
        issues.push("Contains <script> tags");
    }

    // Check for external CSS
    if (/<link[^>]*rel=["']stylesheet["']/i.test(html)) {
        issues.push("Contains external CSS links");
    }

    // Check for style tags
    if (/<style/i.test(html)) {
        issues.push("Contains <style> tags - use inline styles instead");
    }

    // Check for JavaScript events
    if (/\son\w+\s*=/i.test(html)) {
        issues.push("Contains JavaScript event handlers");
    }

    return {
        valid: issues.length === 0,
        issues,
    };
}
