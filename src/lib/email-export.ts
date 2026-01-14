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

import {
  EmailBlock,
  BlockStyle,
  EmailContent,
  HeaderImageData,
  ImageData,
  GifData,
  TextBlockData,
  ButtonData,
  DividerData,
  FooterData,
  SpacerData,
  ColumnsData,
  ContainerData,
  SocialIconsData,
  SocialIconItem,
} from "./block-types";
import { EMAIL_STYLES } from "./email-styles";

/**
 * CDN base URL for social icons
 * Icons are hosted as PNG files in white, black, and brand color variants
 */
const SOCIAL_ICONS_CDN_BASE = "https://mco-cdn.b-cdn.net/mco/icons";

/**
 * Social platform brand colors for background circles
 */
const socialPlatformColors: Record<string, string> = {
  facebook: "#1877F2",
  twitter: "#000000",
  instagram: "#E4405F",
  linkedin: "#0A66C2",
  youtube: "#FF0000",
  tiktok: "#000000",
  whatsapp: "#25D366",
  website: "#4B5563",
  email: "#6366F1",
  phone: "#10B981",
};

/**
 * Get the CDN URL for a social icon
 * @param platform - The social platform name
 * @param style - "white" | "black" | "brand"
 */
function getSocialIconUrl(platform: string, style: string): string {
  // Map platform names to CDN filenames (some differ)
  const platformFilenames: Record<string, string> = {
    email: "mail",  // 'email' platform uses 'mail-xxx.png' filenames
  };
  const filename = platformFilenames[platform] || platform;

  const styleMap: Record<string, string> = {
    white: "white",
    black: "black",
    brand: "brand",
  };
  const styleSuffix = styleMap[style] || "white";
  return `${SOCIAL_ICONS_CDN_BASE}/${filename}-${styleSuffix}.png`;
}

/**
 * Get the brand color for a social platform (used for background circles)
 */
function getSocialPlatformColor(platform: string): string {
  return socialPlatformColors[platform] || "#333333";
}

/**
 * Convert BlockStyle to email-safe HTML attributes and inline styles
 * Returns both bgcolor attribute and inline CSS for maximum compatibility
 */
function getEmailSafeStyles(style?: BlockStyle): { bgcolor?: string; styleAttr: string } {
  if (!style) return { styleAttr: "" };

  const styles: string[] = [];
  let bgcolor: string | undefined;

  // Background color - use both bgcolor attribute AND style for compatibility
  if (style.backgroundColor && style.backgroundColor !== "transparent") {
    bgcolor = style.backgroundColor;
    styles.push(`background-color: ${style.backgroundColor}`);
  }

  // Padding - check individual values first, then uniform
  const hasIndividualPadding = style.paddingTop !== undefined ||
    style.paddingRight !== undefined ||
    style.paddingBottom !== undefined ||
    style.paddingLeft !== undefined;

  if (hasIndividualPadding) {
    const top = style.paddingTop ?? 0;
    const right = style.paddingRight ?? 0;
    const bottom = style.paddingBottom ?? 0;
    const left = style.paddingLeft ?? 0;
    styles.push(`padding: ${top}px ${right}px ${bottom}px ${left}px`);
  } else if (style.padding !== undefined && style.padding > 0) {
    styles.push(`padding: ${style.padding}px`);
  }

  // Borders (email-safe solid borders only)
  if (style.borderWidth && style.borderWidth > 0 && style.borderStyle && style.borderStyle !== "none") {
    const borderColor = style.borderColor || "#e5e7eb";
    styles.push(`border: ${style.borderWidth}px ${style.borderStyle} ${borderColor}`);
  }

  // Border radius - INDEPENDENT of border (can be used for background rounding)
  const hasIndividualRadius = style.borderRadiusTopLeft !== undefined ||
    style.borderRadiusTopRight !== undefined ||
    style.borderRadiusBottomRight !== undefined ||
    style.borderRadiusBottomLeft !== undefined;

  if (hasIndividualRadius) {
    const tl = style.borderRadiusTopLeft ?? 0;
    const tr = style.borderRadiusTopRight ?? 0;
    const br = style.borderRadiusBottomRight ?? 0;
    const bl = style.borderRadiusBottomLeft ?? 0;
    styles.push(`border-radius: ${tl}px ${tr}px ${br}px ${bl}px`);
  } else if (style.borderRadius && style.borderRadius > 0) {
    styles.push(`border-radius: ${style.borderRadius}px`);
  }

  // Vertical margin only (email-safe)
  if (style.margin) {
    if (style.margin.top) styles.push(`margin-top: ${style.margin.top}px`);
    if (style.margin.bottom) styles.push(`margin-bottom: ${style.margin.bottom}px`);
  }

  return {
    bgcolor,
    styleAttr: styles.length > 0 ? styles.join("; ") : ""
  };
}

/**
 * Merge email-safe styles with existing inline styles
 */
function mergeStyles(existingStyle: string, blockStyle?: BlockStyle): string {
  const { styleAttr } = getEmailSafeStyles(blockStyle);
  if (!styleAttr) return existingStyle;
  if (!existingStyle) return styleAttr;
  return `${existingStyle}; ${styleAttr}`;
}

/**
 * Convert blocks JSON to spam-free HTML
 */
export function blocksToHtml(content: EmailContent): string {
  const blocks = content.blocks || [];
  const settings = content.settings;
  const contentBgColor = settings?.contentBackgroundColor || "#ffffff";

  // Simple solid background (gradients not supported in most email clients)
  const bgStyle = `background-color: ${contentBgColor};`;
  const bgcolorAttr = contentBgColor;

  let bodyContent = blocks.map((block) => renderBlock(block)).join("\n");

  // Wrap in email-safe HTML structure
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
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
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" bgcolor="${bgcolorAttr}" style="${bgStyle} max-width: 600px;">
${bodyContent}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderBlock(block: EmailBlock): string {
  const style = block.style;
  switch (block.type) {
    case "HeaderImage":
      return renderHeaderImage(block.data as HeaderImageData, style);
    case "Image":
      return renderImage(block.data as ImageData, style);
    case "Gif":
      return renderGif(block.data as GifData, style);
    case "TextBlock":
      return renderTextBlock(block.data as TextBlockData, style);
    case "Button":
      return renderButton(block.data as ButtonData, style);
    case "Divider":
      return renderDivider(block.data as DividerData, style);
    case "Footer":
      return renderFooter(block.data as FooterData, style);
    case "Spacer":
      return renderSpacer(block.data as SpacerData, style);
    case "Columns":
      return renderColumns(block.data as ColumnsData, style);
    case "Container":
      return renderContainer(block.data as ContainerData, style);
    case "SocialIcons":
      return renderSocialIcons(block.data as SocialIconsData, style);
    default:
      return "";
  }
}

function renderHeaderImage(data: HeaderImageData, style?: BlockStyle): string {
  if (!data.src) {
    return "";
  }

  const { bgcolor, styleAttr } = getEmailSafeStyles(style);
  const tdStyle = mergeStyles("padding: 0", style);
  const bgcolorAttr = bgcolor ? ` bgcolor="${escapeHtml(bgcolor)}"` : "";

  // Build image-specific border styles
  let imgBorderStyle = "border: 0;";
  if (data.borderWidth && data.borderWidth > 0) {
    imgBorderStyle = `border: ${data.borderWidth}px solid ${escapeHtml(data.borderColor || "#e5e7eb")};`;
  }
  const imgRadiusStyle = data.borderRadius && data.borderRadius > 0 ? ` border-radius: ${data.borderRadius}px;` : "";

  // Build link-wrapped or standalone image
  const imgHtml = `<img src="${escapeHtml(data.src)}" alt="${escapeHtml(data.alt || "")}" width="600" style="display: block; max-width: 100%; height: auto; ${imgBorderStyle}${imgRadiusStyle}">`;

  const content = data.linkUrl
    ? `<a href="${escapeHtml(data.linkUrl)}" target="_blank" style="display: block; text-decoration: none;">${imgHtml}</a>`
    : imgHtml;

  return `          <tr>
            <td align="center"${bgcolorAttr} style="${tdStyle}">
              ${content}
            </td>
          </tr>`;
}

function renderTextBlock(data: TextBlockData, style?: BlockStyle): string {
  const padding = EMAIL_STYLES.padding.text;
  const fontSize = data.fontSize || EMAIL_STYLES.fonts.sizes.default;
  const fontFamily = data.fontFamily || EMAIL_STYLES.fonts.default;
  const fontWeight = data.fontWeight || "normal";
  const color = data.textColor || EMAIL_STYLES.colors.text;
  const align = data.alignment || "left";

  const baseStyle = `padding: ${padding.y}px ${padding.x}px; font-family: ${fontFamily}; font-size: ${fontSize}px; font-weight: ${fontWeight}; line-height: ${EMAIL_STYLES.fonts.lineHeight}; color: ${escapeHtml(color)}; text-align: ${align}`;
  const { bgcolor, styleAttr } = getEmailSafeStyles(style);
  const tdStyle = styleAttr ? `${baseStyle}; ${styleAttr}` : baseStyle;
  const bgcolorAttr = bgcolor ? ` bgcolor="${escapeHtml(bgcolor)}"` : "";

  // Content from TipTap is already HTML - preserve it but add email-safe list styles
  let htmlContent = data.content || "";

  // Add inline styles to lists for email compatibility
  htmlContent = htmlContent
    .replace(/<ul>/g, '<ul style="margin: 8px 0; padding-left: 24px; list-style-type: disc;">')
    .replace(/<ol>/g, '<ol style="margin: 8px 0; padding-left: 24px; list-style-type: decimal;">')
    .replace(/<li>/g, '<li style="margin: 4px 0; display: list-item;">');

  return `          <tr>
            <td${bgcolorAttr} style="${tdStyle}">
              ${htmlContent}
            </td>
          </tr>`;
}

function renderButton(data: ButtonData, style?: BlockStyle): string {
  const padding = EMAIL_STYLES.padding.button;
  const bgColor = data.backgroundColor || EMAIL_STYLES.colors.buttonDefault;
  const textColor = data.textColor || EMAIL_STYLES.colors.buttonText;
  const borderRadius = data.borderRadius || 6;

  // Button-specific border (applied to the button itself, not the block)
  const buttonBorder = data.borderWidth && data.borderWidth > 0
    ? `border: ${data.borderWidth}px solid ${escapeHtml(data.borderColor || bgColor)};`
    : "";

  const containerStyle = mergeStyles(`padding: ${padding.y}px ${padding.x}px`, style);
  const { bgcolor } = getEmailSafeStyles(style);
  const bgcolorAttr = bgcolor ? ` bgcolor="${escapeHtml(bgcolor)}"` : "";

  return `          <tr>
            <td align="center"${bgcolorAttr} style="${containerStyle}">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: ${escapeHtml(bgColor)}; border-radius: ${borderRadius}px; ${buttonBorder}">
                    <a href="${escapeHtml(data.url)}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: ${EMAIL_STYLES.fonts.sizes.button}px; font-weight: bold; color: ${escapeHtml(textColor)}; text-decoration: none; border-radius: ${borderRadius}px;">${escapeHtml(data.text)}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
}

function renderFooter(data: FooterData, style?: BlockStyle): string {
  const padding = EMAIL_STYLES.padding.footer;
  const bgColor = data.backgroundColor || EMAIL_STYLES.colors.footerBg;
  const textColor = data.textColor || EMAIL_STYLES.colors.footerText;

  // Text styling with defaults
  const fontFamily = data.fontFamily || "Arial, Helvetica, sans-serif";
  const fontWeight = data.fontWeight || "normal";
  const fontSize = data.fontSize || 12;

  const baseStyle = `padding: ${padding}px; background-color: ${escapeHtml(bgColor)}; border-top: 1px solid #e9ecef; font-family: ${fontFamily}; font-weight: ${fontWeight}; font-size: ${fontSize}px`;
  const tdStyle = mergeStyles(baseStyle, style);
  const { bgcolor } = getEmailSafeStyles(style);
  const bgcolorAttr = bgcolor ? ` bgcolor="${escapeHtml(bgcolor)}"` : ` bgcolor="${escapeHtml(bgColor)}"`;

  // Build footer content sections
  const sections: string[] = [];

  // Footer image above
  if (data.footerImage?.src && data.footerImage?.position === "above") {
    const imgHtml = data.footerImage.linkUrl
      ? `<a href="${escapeHtml(data.footerImage.linkUrl)}" target="_blank" style="display: block; border: 0;"><img src="${escapeHtml(data.footerImage.src)}" alt="${escapeHtml(data.footerImage.alt || "")}" style="display: block; max-width: 100%; height: auto; margin: 0 auto; border: 0;"></a>`
      : `<img src="${escapeHtml(data.footerImage.src)}" alt="${escapeHtml(data.footerImage.alt || "")}" style="display: block; max-width: 100%; height: auto; margin: 0 auto;">`;
    sections.push(`<tr><td style="padding-bottom: 16px; text-align: center;">${imgHtml}</td></tr>`);
  }

  // Social icons - using CDN PNG icons with optional background circles (enhanced)
  if (data.showSocialIcons && data.socialIcons && data.socialIcons.length > 0) {
    const iconSize = data.socialIconSize || 32;
    const iconSpacing = data.socialIconSpacing || 8;
    const showBackground = data.socialIconShowBackground !== false;
    const bgRadius = data.socialIconBackgroundRadius ?? 50;
    const enabledIcons = data.socialIcons.filter(icon => icon.enabled && icon.url);

    if (enabledIcons.length > 0) {
      // Determine icon style
      const iconStyle = data.socialIconStyle || "brand";
      const iconHtml = enabledIcons.map(icon => {
        const iconUrl = getSocialIconUrl(icon.platform, iconStyle);
        const platformLabel = icon.platform.charAt(0).toUpperCase() + icon.platform.slice(1);
        const iconBgColor = getSocialPlatformColor(icon.platform);

        if (showBackground) {
          // Use table-based layout for maximum email compatibility with background circles
          const radiusStyle = bgRadius > 0 ? `border-radius: ${bgRadius}%;` : "";
          return `<td width="${iconSize + 8}" height="${iconSize + 8}" align="center" bgcolor="${iconBgColor}" style="${radiusStyle} padding: 4px;">
          <a href="${escapeHtml(icon.url)}" target="_blank" rel="noopener noreferrer" style="display: block; text-decoration: none; border: 0;">
            <img src="${iconUrl}" alt="${platformLabel}" width="${iconSize}" height="${iconSize}" style="display: block; border: 0; width: ${iconSize}px; height: ${iconSize}px;">
          </a>
        </td>`;
        } else {
          // No background - just the icon
          return `<td width="${iconSize}" align="center" style="padding: 0 ${iconSpacing / 2}px;">
          <a href="${escapeHtml(icon.url)}" target="_blank" rel="noopener noreferrer" style="display: block; text-decoration: none; border: 0;">
            <img src="${iconUrl}" alt="${platformLabel}" width="${iconSize}" height="${iconSize}" style="display: block; border: 0; width: ${iconSize}px; height: ${iconSize}px;">
          </a>
        </td>`;
        }
      }).join(`<td width="${iconSpacing}"></td>`);
      sections.push(`<tr><td style="padding-bottom: 12px; text-align: center;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>${iconHtml}</tr></table>
      </td></tr>`);
    }
  }

  // Structured content
  const hasStructuredContent = data.companyName || data.address || data.contactInfo;
  if (hasStructuredContent) {
    let structuredHtml = "";
    if (data.companyName) {
      structuredHtml += `<div style="font-weight: 600; margin-bottom: 4px;">${escapeHtml(data.companyName)}</div>`;
    }
    if (data.address) {
      structuredHtml += `<div style="opacity: 0.8; margin-bottom: 4px;">${escapeHtml(data.address)}</div>`;
    }
    if (data.contactInfo) {
      structuredHtml += `<div style="opacity: 0.8;">${escapeHtml(data.contactInfo)}</div>`;
    }
    sections.push(`<tr><td style="font-size: ${fontSize}px; line-height: 1.6; color: ${escapeHtml(textColor)}; text-align: center; padding-bottom: 8px;">${structuredHtml}</td></tr>`);
  }

  // Custom content / legacy text
  if (data.content) {
    sections.push(`<tr><td style="font-size: ${fontSize}px; line-height: 1.6; color: ${escapeHtml(textColor)}; text-align: center;">${escapeHtml(data.content).replace(/\n/g, "<br>")}</td></tr>`);
  }

  // Copyright
  if (data.copyrightYear) {
    const copyrightFontSize = Math.max(fontSize - 1, 10);
    sections.push(`<tr><td style="font-size: ${copyrightFontSize}px; opacity: 0.7; color: ${escapeHtml(textColor)}; text-align: center; padding-top: 8px;">© ${escapeHtml(data.copyrightYear)} ${escapeHtml(data.companyName || "Your Company")}. All rights reserved.</td></tr>`);
  }

  // Footer image below
  if (data.footerImage?.src && data.footerImage?.position === "below") {
    const imgHtml = data.footerImage.linkUrl
      ? `<a href="${escapeHtml(data.footerImage.linkUrl)}" target="_blank" style="display: block; border: 0;"><img src="${escapeHtml(data.footerImage.src)}" alt="${escapeHtml(data.footerImage.alt || "")}" style="display: block; max-width: 100%; height: auto; margin: 0 auto; border: 0;"></a>`
      : `<img src="${escapeHtml(data.footerImage.src)}" alt="${escapeHtml(data.footerImage.alt || "")}" style="display: block; max-width: 100%; height: auto; margin: 0 auto;">`;
    sections.push(`<tr><td style="padding-top: 16px; text-align: center;">${imgHtml}</td></tr>`);
  }

  // If no content at all, show placeholder
  if (sections.length === 0) {
    sections.push(`<tr><td style="font-size: ${fontSize}px; line-height: 1.6; color: ${escapeHtml(textColor)}; text-align: center;">Footer text</td></tr>`);
  }

  return `          <tr>
            <td${bgcolorAttr} style="${tdStyle}">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
${sections.join("\n")}
              </table>
            </td>
          </tr>`;
}

function renderSpacer(data: SpacerData, style?: BlockStyle): string {
  const height = data.height || EMAIL_STYLES.spacer.default;

  const baseStyle = `padding: 0; height: ${height}px; line-height: ${height}px; font-size: 0`;
  const tdStyle = mergeStyles(baseStyle, style);
  const { bgcolor } = getEmailSafeStyles(style);
  const bgcolorAttr = bgcolor ? ` bgcolor="${escapeHtml(bgcolor)}"` : "";

  return `          <tr>
            <td${bgcolorAttr} style="${tdStyle}">&nbsp;</td>
          </tr>`;
}

function renderSocialIcons(data: SocialIconsData, style?: BlockStyle): string {
  const icons = data.icons || [];
  const enabledIcons = icons.filter(icon => icon.enabled && icon.url);

  if (enabledIcons.length === 0) {
    return "";
  }

  // Global defaults
  const globalIconSize = data.iconSize || 32;
  const alignment = data.alignment || "center";
  const iconSpacing = data.iconSpacing || 8;
  const globalIconStyle = data.iconStyle || "brand";  // Default to brand colors
  const globalShowBackground = data.showBackground !== false;
  const globalBgColor = data.backgroundColor;
  const bgRadius = data.backgroundRadius ?? 50;

  // Build icon HTML - using per-icon settings with fallback to global
  const iconHtml = enabledIcons.map(icon => {
    // Per-icon settings with fallback to global
    const iconSize = icon.iconSize ?? globalIconSize;
    const iconStyle = icon.iconStyle ?? globalIconStyle;
    const showBg = icon.showBackground ?? globalShowBackground;
    const bgColor = icon.backgroundColor ?? globalBgColor ?? getSocialPlatformColor(icon.platform);

    const iconUrl = getSocialIconUrl(icon.platform, iconStyle);
    const platformLabel = icon.platform.charAt(0).toUpperCase() + icon.platform.slice(1);

    if (showBg) {
      // Industry-standard approach: PNG icon on colored background
      const radiusStyle = bgRadius === 50 ? "border-radius: 50%;" : (bgRadius > 0 ? `border-radius: ${bgRadius}%;` : "");
      return `<td width="${iconSize + 8}" height="${iconSize + 8}" align="center" bgcolor="${bgColor}" style="${radiusStyle} padding: 4px;">
        <a href="${escapeHtml(icon.url)}" target="_blank" rel="noopener noreferrer" style="display: block; text-decoration: none; border: 0;" title="${platformLabel}">
          <img src="${iconUrl}" alt="${platformLabel}" width="${iconSize}" height="${iconSize}" style="display: block; border: 0; width: ${iconSize}px; height: ${iconSize}px;">
        </a>
      </td>`;
    } else {
      // No background - just the icon
      return `<td width="${iconSize}" align="center" style="padding: 0 ${iconSpacing / 2}px;">
        <a href="${escapeHtml(icon.url)}" target="_blank" rel="noopener noreferrer" style="display: block; text-decoration: none; border: 0;" title="${platformLabel}">
          <img src="${iconUrl}" alt="${platformLabel}" width="${iconSize}" height="${iconSize}" style="display: block; border: 0; width: ${iconSize}px; height: ${iconSize}px;">
        </a>
      </td>`;
    }
  }).join(`<td width="${iconSpacing}"></td>`);

  const baseStyle = "padding: 16px";
  const tdStyle = mergeStyles(baseStyle, style);
  const { bgcolor } = getEmailSafeStyles(style);
  const bgcolorAttr = bgcolor ? ` bgcolor="${escapeHtml(bgcolor)}"` : "";

  return `          <tr>
            <td align="${alignment}"${bgcolorAttr} style="${tdStyle}">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${alignment}"><tr>${iconHtml}</tr></table>
            </td>
          </tr>`;
}

function renderDivider(data: DividerData, style?: BlockStyle): string {
  const color = data.color || "#e5e7eb";
  const thickness = data.thickness || 1;
  const dividerStyle = data.style || "solid";
  const width = data.width || 100;

  const baseStyle = "padding: 20px";
  const tdStyle = mergeStyles(baseStyle, style);
  const { bgcolor } = getEmailSafeStyles(style);
  const bgcolorAttr = bgcolor ? ` bgcolor="${escapeHtml(bgcolor)}"` : "";

  return `          <tr>
            <td${bgcolorAttr} style="${tdStyle}">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${width}%" align="center">
                <tr>
                  <td style="border-top: ${thickness}px ${dividerStyle} ${color}; font-size: 0; line-height: 0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>`;
}

function renderImage(data: ImageData, style?: BlockStyle): string {
  if (!data.src) {
    return "";
  }

  const padding = EMAIL_STYLES.padding.image;
  const alignment = data.alignment || "center";
  const size = data.size || "fill";

  // Calculate image width - full width minus padding on both sides
  const containerWidth = EMAIL_STYLES.containerWidth - (padding.x * 2);

  let width: string;
  if (size === "original" && data.width && data.width !== "auto") {
    // Use percentage of container width for original size
    width = `${Math.floor(containerWidth * (Number(data.width) / 100))}`;
  } else {
    // For "fill" and "scale", use full container width
    width = `${containerWidth}`;
  }

  const widthAttr = `width="${width}"`;

  // Build image-specific border styles
  let imgBorderStyle = "border: 0;";
  if (data.borderWidth && data.borderWidth > 0) {
    imgBorderStyle = `border: ${data.borderWidth}px solid ${escapeHtml(data.borderColor || "#e5e7eb")};`;
  }
  const imgRadiusStyle = data.borderRadius && data.borderRadius > 0 ? ` border-radius: ${data.borderRadius}px;` : "";

  let imgHtml = `<img src="${escapeHtml(data.src)}" alt="${escapeHtml(data.alt || "")}" ${widthAttr} style="display: block; max-width: 100%; height: auto; ${imgBorderStyle}${imgRadiusStyle}">`;

  // Wrap with link if provided
  if (data.linkUrl) {
    imgHtml = `<a href="${escapeHtml(data.linkUrl)}" target="_blank" style="text-decoration: none;">${imgHtml}</a>`;
  }

  const baseStyle = `padding: ${padding.y}px ${padding.x}px`;
  const tdStyle = mergeStyles(baseStyle, style);
  const { bgcolor } = getEmailSafeStyles(style);
  const bgcolorAttr = bgcolor ? ` bgcolor="${escapeHtml(bgcolor)}"` : "";

  return `          <tr>
            <td align="${alignment}"${bgcolorAttr} style="${tdStyle}">
              ${imgHtml}
            </td>
          </tr>`;
}

function renderGif(data: GifData, style?: BlockStyle): string {
  if (!data.src) {
    return "";
  }

  const padding = EMAIL_STYLES.padding.image;
  const alignment = data.alignment || "center";

  // Calculate GIF width
  const containerWidth = EMAIL_STYLES.containerWidth - (padding.x * 2);
  let width: string;
  if (data.width && data.width !== "auto") {
    width = `${Math.floor(containerWidth * (Number(data.width) / 100))}`;
  } else {
    width = `${containerWidth}`;
  }

  const widthAttr = `width="${width}"`;

  // Build GIF-specific border styles
  let imgBorderStyle = "border: 0;";
  if (data.borderWidth && data.borderWidth > 0) {
    imgBorderStyle = `border: ${data.borderWidth}px solid ${escapeHtml(data.borderColor || "#e5e7eb")};`;
  }
  const imgRadiusStyle = data.borderRadius && data.borderRadius > 0 ? ` border-radius: ${data.borderRadius}px;` : "";

  // GIFs are rendered as standard img tags - they animate in supporting clients
  let imgHtml = `<img src="${escapeHtml(data.src)}" alt="${escapeHtml(data.alt || "")}" ${widthAttr} style="display: block; max-width: 100%; height: auto; ${imgBorderStyle}${imgRadiusStyle}">`;

  // Wrap with link if provided
  if (data.linkUrl) {
    imgHtml = `<a href="${escapeHtml(data.linkUrl)}" target="_blank" style="text-decoration: none;">${imgHtml}</a>`;
  }

  const baseStyle = `padding: ${padding.y}px ${padding.x}px`;
  const tdStyle = mergeStyles(baseStyle, style);
  const { bgcolor } = getEmailSafeStyles(style);
  const bgcolorAttr = bgcolor ? ` bgcolor="${escapeHtml(bgcolor)}"` : "";

  return `          <tr>
            <td align="${alignment}"${bgcolorAttr} style="${tdStyle}">
              ${imgHtml}
            </td>
          </tr>`;
}

function renderColumns(data: ColumnsData, style?: BlockStyle): string {
  const columnCount = data.columnCount || 2;
  const columns = data.columns || [];
  const gap = data.gap || 20;
  const bgColor = data.backgroundColor || "#ffffff";

  // Handle both number and object padding for backward compatibility
  // Default to 0 - users control spacing for true WYSIWYG
  const padding = typeof data.padding === 'number'
    ? { top: data.padding, right: data.padding, bottom: data.padding, left: data.padding }
    : (data.padding || { top: 0, right: 0, bottom: 0, left: 0 });

  const alignItems = data.alignItems || "start";

  // Calculate column width based on 600px container
  const totalGap = gap * (columnCount - 1);
  const availableWidth = 600 - padding.left - padding.right - totalGap;
  const columnWidth = Math.floor(availableWidth / columnCount);

  // Build column cells
  const columnCells = columns.map((columnBlocks, index) => {
    const isLast = index === columnCount - 1;
    const rightPadding = isLast ? 0 : gap;
    const verticalAlign = alignItems === "center" ? "middle" : (alignItems === "end" ? "bottom" : "top");

    // Render nested blocks within the column
    const nestedContent = columnBlocks.map(block => renderNestedBlock(block)).join("\n");

    return `                <td width="${columnWidth}" valign="${verticalAlign}" style="padding-right: ${rightPadding}px; vertical-align: ${verticalAlign};">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
${nestedContent || `                    <tr><td>&nbsp;</td></tr>`}
                  </table>
                </td>`;
  }).join("\n");

  const baseStyle = `padding: ${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px; background-color: ${escapeHtml(bgColor)}`;
  const tdStyle = mergeStyles(baseStyle, style);
  const { bgcolor } = getEmailSafeStyles(style);
  const bgcolorAttr = bgcolor ? ` bgcolor="${escapeHtml(bgcolor)}"` : ` bgcolor="${escapeHtml(bgColor)}"`;

  return `          <tr>
            <td${bgcolorAttr} style="${tdStyle}">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
${columnCells}
                </tr>
              </table>
            </td>
          </tr>`;
}

function renderContainer(data: ContainerData, style?: BlockStyle): string {
  const blocks = data.blocks || [];
  const alignment = data.alignment || "center";
  const maxWidth = data.maxWidth || 600;
  const layoutDirection = data.layoutDirection || "column";

  // === Container-specific styling (from ContainerData) ===
  const bgColor = data.transparentBackground ? "" : (data.backgroundColor || "");
  const paddingTop = data.paddingTop ?? 20;
  const paddingRight = data.paddingRight ?? 20;
  const paddingBottom = data.paddingBottom ?? 20;
  const paddingLeft = data.paddingLeft ?? 20;

  // Border settings
  const borderWidth = data.borderWidth || 0;
  const borderColor = data.borderColor || "#e5e7eb";
  const borderStyle = data.borderStyle || "solid";
  const borderRadius = data.borderRadius || 0;

  // === Build inline styles for td (email-safe) ===
  const tdStyles: string[] = [];
  tdStyles.push(`padding: ${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`);

  // Border (inline on td for email compatibility)
  if (borderWidth > 0 && borderStyle !== "none") {
    tdStyles.push(`border: ${borderWidth}px ${borderStyle} ${borderColor}`);
  }

  // Border radius (works in Gmail/Apple Mail, ignored by Outlook)
  if (borderRadius > 0) {
    tdStyles.push(`border-radius: ${borderRadius}px`);
  }

  const tdStyle = tdStyles.join("; ");

  // === bgcolor attribute for Outlook + inline CSS for all ===
  const bgcolorAttr = bgColor ? ` bgcolor="${escapeHtml(bgColor)}"` : "";
  const bgStyleAttr = bgColor ? `background-color: ${bgColor};` : "";

  // === Render content based on layout direction ===
  // Map vertical alignment from Container data to valign attribute
  const verticalAlignment = data.verticalAlignment || "start";
  const valignMap: Record<string, string> = { start: "top", center: "middle", end: "bottom" };
  const valign = valignMap[verticalAlignment] || "top";

  let nestedContent: string;

  if (layoutDirection === "row" && blocks.length > 0) {
    // ROW LAYOUT: Render blocks side-by-side using table cells
    const gap = 20; // Gap between columns
    const totalGap = gap * (blocks.length - 1);
    const availableWidth = maxWidth - paddingLeft - paddingRight - totalGap;
    const columnWidth = Math.floor(availableWidth / blocks.length);

    const columnCells = blocks.map((block, index) => {
      const isLast = index === blocks.length - 1;
      const rightPadding = isLast ? 0 : gap;

      // Render the nested block content
      const blockContent = renderNestedBlock(block);

      return `                <td width="${columnWidth}" valign="${valign}" style="padding-right: ${rightPadding}px; vertical-align: ${valign};">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
${blockContent || `                    <tr><td>&nbsp;</td></tr>`}
                  </table>
                </td>`;
    }).join("\n");

    nestedContent = `                    <tr>
${columnCells}
                    </tr>`;
  } else {
    // COLUMN LAYOUT (default): Render blocks vertically (each becomes a row)
    nestedContent = blocks.length > 0
      ? blocks.map(block => renderBlock(block)).join("\n")
      : `                    <tr><td style="padding: 20px; text-align: center; color: #9ca3af; font-size: 14px;">Container content goes here</td></tr>`;
  }

  // === Professional Email Container Structure ===
  // Pattern: Outer wrapper (centering) > MSO conditional table > Inner table (width constrained) > Content td
  return `          <tr>
            <td align="${alignment}" style="padding: 0;">
              <!--[if mso]>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${maxWidth}" align="${alignment}">
              <tr>
              <td${bgcolorAttr} style="${bgStyleAttr}">
              <![endif]-->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${maxWidth}" style="max-width: ${maxWidth}px; margin: 0 auto; ${bgStyleAttr}"${bgcolorAttr}>
                <tr>
                  <td style="${tdStyle}">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
${nestedContent}
                    </table>
                  </td>
                </tr>
              </table>
              <!--[if mso]>
              </td>
              </tr>
              </table>
              <![endif]-->
            </td>
          </tr>`;
}

/**
 * Render blocks nested within columns (without outer tr wrapper)
 */
function renderNestedBlock(block: EmailBlock): string {
  switch (block.type) {
    case "HeaderImage":
    case "Image": {
      const data = block.data as ImageData;
      if (!data.src) return "";
      const alignment = data.alignment || "center";
      // Build image-specific border styles (including border-radius)
      let imgBorderStyle = "border: 0;";
      if (data.borderWidth && data.borderWidth > 0) {
        imgBorderStyle = `border: ${data.borderWidth}px solid ${escapeHtml(data.borderColor || "#e5e7eb")};`;
      }
      const imgRadiusStyle = data.borderRadius && data.borderRadius > 0 ? ` border-radius: ${data.borderRadius}px;` : "";
      let imgHtml = `<img src="${escapeHtml(data.src)}" alt="${escapeHtml(data.alt || "")}" style="display: block; max-width: 100%; height: auto; ${imgBorderStyle}${imgRadiusStyle}">`;
      if (data.linkUrl) {
        imgHtml = `<a href="${escapeHtml(data.linkUrl)}" target="_blank" style="text-decoration: none;">${imgHtml}</a>`;
      }
      return `                    <tr>
                      <td align="${alignment}" style="padding: 5px 0;">
                        ${imgHtml}
                      </td>
                    </tr>`;
    }
    case "Gif": {
      const data = block.data as GifData;
      if (!data.src) return "";
      const alignment = data.alignment || "center";
      // Build GIF-specific border styles (including border-radius)
      let gifBorderStyle = "border: 0;";
      if (data.borderWidth && data.borderWidth > 0) {
        gifBorderStyle = `border: ${data.borderWidth}px solid ${escapeHtml(data.borderColor || "#e5e7eb")};`;
      }
      const gifRadiusStyle = data.borderRadius && data.borderRadius > 0 ? ` border-radius: ${data.borderRadius}px;` : "";
      let imgHtml = `<img src="${escapeHtml(data.src)}" alt="${escapeHtml(data.alt || "")}" style="display: block; max-width: 100%; height: auto; ${gifBorderStyle}${gifRadiusStyle}">`;
      if (data.linkUrl) {
        imgHtml = `<a href="${escapeHtml(data.linkUrl)}" target="_blank" style="text-decoration: none;">${imgHtml}</a>`;
      }
      return `                    <tr>
                      <td align="${alignment}" style="padding: 5px 0;">
                        ${imgHtml}
                      </td>
                    </tr>`;
    }
    case "TextBlock": {
      const data = block.data as TextBlockData;
      const fontSize = data.fontSize || 16;
      const fontFamily = data.fontFamily || "Arial, Helvetica, sans-serif";
      const fontWeight = data.fontWeight || "normal";
      const color = data.textColor || "#333333";
      const align = data.alignment || "left";

      // Preserve HTML content and add list styles
      let htmlContent = data.content || "";
      htmlContent = htmlContent
        .replace(/<ul>/g, '<ul style="margin: 8px 0; padding-left: 24px; list-style-type: disc;">')
        .replace(/<ol>/g, '<ol style="margin: 8px 0; padding-left: 24px; list-style-type: decimal;">')
        .replace(/<li>/g, '<li style="margin: 4px 0; display: list-item;">');

      return `                    <tr>
                      <td style="padding: 5px 0; font-family: ${fontFamily}; font-size: ${fontSize}px; font-weight: ${fontWeight}; line-height: 1.6; color: ${escapeHtml(color)}; text-align: ${align};">
                        ${htmlContent}
                      </td>
                    </tr>`;
    }
    case "Button": {
      const data = block.data as ButtonData;
      const bgColor = data.backgroundColor || "#1e40af";
      const textColor = data.textColor || "#ffffff";
      return `                    <tr>
                      <td align="center" style="padding: 10px 0;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="background-color: ${escapeHtml(bgColor)}; border-radius: 6px;">
                              <a href="${escapeHtml(data.url)}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: bold; color: ${escapeHtml(textColor)}; text-decoration: none; border-radius: 6px;">${escapeHtml(data.text)}</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>`;
    }
    case "Spacer": {
      const data = block.data as SpacerData;
      const height = data.height || 20;
      return `                    <tr>
                      <td style="padding: 0; height: ${height}px; line-height: ${height}px; font-size: 0;">&nbsp;</td>
                    </tr>`;
    }
    case "Divider": {
      const data = block.data as DividerData;
      const color = data.color || "#e5e7eb";
      const thickness = data.thickness || 1;
      const dividerStyle = data.style || "solid";
      const width = data.width || 100;
      return `                    <tr>
                      <td style="padding: 10px 0;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${width}%" align="center">
                          <tr>
                            <td style="border-top: ${thickness}px ${dividerStyle} ${color}; font-size: 0; line-height: 0;">&nbsp;</td>
                          </tr>
                        </table>
                      </td>
                    </tr>`;
    }
    case "SocialIcons": {
      const data = block.data as SocialIconsData;
      const icons = data.icons || [];
      const enabledIcons = icons.filter(icon => icon.enabled && icon.url);
      if (enabledIcons.length === 0) return "";

      // Global defaults
      const globalIconSize = data.iconSize || 32;
      const iconSpacing = data.iconSpacing || 8;
      const globalIconStyle = data.iconStyle || "brand";
      const globalShowBackground = data.showBackground !== false;
      const globalBgColor = data.backgroundColor;
      const bgRadius = data.backgroundRadius ?? 50;

      const iconHtml = enabledIcons.map(icon => {
        // Per-icon settings with fallback to global
        const iconSize = icon.iconSize ?? globalIconSize;
        const iconStyle = icon.iconStyle ?? globalIconStyle;
        const showBg = icon.showBackground ?? globalShowBackground;
        const bgColor = icon.backgroundColor ?? globalBgColor ?? getSocialPlatformColor(icon.platform);

        const iconUrl = getSocialIconUrl(icon.platform, iconStyle);
        const platformLabel = icon.platform.charAt(0).toUpperCase() + icon.platform.slice(1);

        if (showBg) {
          const radiusStyle = bgRadius === 50 ? "border-radius: 50%;" : (bgRadius > 0 ? `border-radius: ${bgRadius}%;` : "");
          return `<td width="${iconSize + 8}" height="${iconSize + 8}" align="center" bgcolor="${bgColor}" style="${radiusStyle} padding: 4px;">
            <a href="${escapeHtml(icon.url)}" target="_blank" rel="noopener noreferrer" style="display: block; text-decoration: none; border: 0;" title="${platformLabel}">
              <img src="${iconUrl}" alt="${platformLabel}" width="${iconSize}" height="${iconSize}" style="display: block; border: 0;">
            </a>
          </td>`;
        } else {
          return `<td width="${iconSize}" align="center" style="padding: 0 ${iconSpacing / 2}px;">
            <a href="${escapeHtml(icon.url)}" target="_blank" rel="noopener noreferrer" style="display: block; text-decoration: none; border: 0;" title="${platformLabel}">
              <img src="${iconUrl}" alt="${platformLabel}" width="${iconSize}" height="${iconSize}" style="display: block; border: 0;">
            </a>
          </td>`;
        }
      }).join(`<td width="${iconSpacing}"></td>`);

      return `                    <tr>
                      <td align="${data.alignment || "center"}" style="padding: 8px 0;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${iconHtml}</tr></table>
                      </td>
                    </tr>`;
    }
    case "Container": {
      // Nested Container inside columns - render with full styling
      const data = block.data as ContainerData;
      const nestedBlocks = data.blocks || [];
      const bgColor = data.transparentBackground ? "" : (data.backgroundColor || "");
      const paddingTop = data.paddingTop ?? 10;
      const paddingRight = data.paddingRight ?? 10;
      const paddingBottom = data.paddingBottom ?? 10;
      const paddingLeft = data.paddingLeft ?? 10;
      const borderWidth = data.borderWidth || 0;
      const borderColor = data.borderColor || "#e5e7eb";
      const borderStyle = data.borderStyle || "solid";
      const borderRadius = data.borderRadius || 0;

      // Vertical alignment (for content within the container)
      const verticalAlignment = data.verticalAlignment || "start";
      const valignMap: Record<string, string> = { start: "top", center: "middle", end: "bottom" };
      const valign = valignMap[verticalAlignment] || "top";

      // Build styles
      const styles: string[] = [];
      styles.push(`padding: ${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`);
      if (bgColor) styles.push(`background-color: ${bgColor}`);
      if (borderWidth > 0 && borderStyle !== "none") {
        styles.push(`border: ${borderWidth}px ${borderStyle} ${borderColor}`);
      }
      if (borderRadius > 0) styles.push(`border-radius: ${borderRadius}px`);
      // Add vertical-align for content centering and height:100% to fill parent
      styles.push(`vertical-align: ${valign}`);
      styles.push("height: 100%");

      const bgcolorAttr = bgColor ? ` bgcolor="${escapeHtml(bgColor)}"` : "";

      // Render nested blocks within the container
      const nestedContent = nestedBlocks.map(b => renderNestedBlock(b)).join("\n");

      // Use valign attribute and height:100% for email client compatibility
      // The outer tr/td fills the parent cell, and the inner table uses height:100% to allow valign to work
      return `                    <tr style="height: 100%;">
                      <td${bgcolorAttr} valign="${valign}" style="${styles.join("; ")}">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="height: 100%;">
                          <tr>
                            <td valign="${valign}" style="vertical-align: ${valign};">
                              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
${nestedContent || `                                <tr><td>&nbsp;</td></tr>`}
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>`;
    }
    default:
      return "";
  }
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

export const generateEmailHTML = blocksToHtml;
