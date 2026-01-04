// Helper to convert BlockStyle to CSS properties
import { BlockStyle } from "./block-types";

export function getBlockStyleCSS(style?: BlockStyle): React.CSSProperties {
    if (!style) return {};

    const css: React.CSSProperties = {};

    // Background color
    if (style.backgroundColor && style.backgroundColor !== "transparent") {
        css.backgroundColor = style.backgroundColor;
    }

    // Padding - check individual values first, then uniform
    const hasIndividualPadding = style.paddingTop !== undefined ||
        style.paddingRight !== undefined ||
        style.paddingBottom !== undefined ||
        style.paddingLeft !== undefined;

    if (hasIndividualPadding) {
        // Use individual padding values
        if (style.paddingTop !== undefined) css.paddingTop = `${style.paddingTop}px`;
        if (style.paddingRight !== undefined) css.paddingRight = `${style.paddingRight}px`;
        if (style.paddingBottom !== undefined) css.paddingBottom = `${style.paddingBottom}px`;
        if (style.paddingLeft !== undefined) css.paddingLeft = `${style.paddingLeft}px`;
    } else if (style.padding !== undefined) {
        // Use uniform padding
        css.padding = `${style.padding}px`;
    }

    // Border (only if width > 0 and style is not none)
    if (style.borderWidth && style.borderWidth > 0 && style.borderStyle && style.borderStyle !== "none") {
        css.border = `${style.borderWidth}px ${style.borderStyle} ${style.borderColor || "#e5e7eb"}`;
    }

    // Border radius - INDEPENDENT of border (can be used for background rounding)
    const hasIndividualRadius = style.borderRadiusTopLeft !== undefined ||
        style.borderRadiusTopRight !== undefined ||
        style.borderRadiusBottomRight !== undefined ||
        style.borderRadiusBottomLeft !== undefined;

    if (hasIndividualRadius) {
        // Use individual corner values
        const tl = style.borderRadiusTopLeft ?? 0;
        const tr = style.borderRadiusTopRight ?? 0;
        const br = style.borderRadiusBottomRight ?? 0;
        const bl = style.borderRadiusBottomLeft ?? 0;
        css.borderRadius = `${tl}px ${tr}px ${br}px ${bl}px`;
    } else if (style.borderRadius && style.borderRadius > 0) {
        // Use uniform radius
        css.borderRadius = `${style.borderRadius}px`;
    }

    // Margin (vertical only for email safety)
    if (style.margin) {
        if (style.margin.top) css.marginTop = `${style.margin.top}px`;
        if (style.margin.bottom) css.marginBottom = `${style.margin.bottom}px`;
    }

    return css;
}

// Helper to get padding values as a string for inline styles (email export)
export function getPaddingInlineStyle(style?: BlockStyle): string {
    if (!style) return '';

    const hasIndividualPadding = style.paddingTop !== undefined ||
        style.paddingRight !== undefined ||
        style.paddingBottom !== undefined ||
        style.paddingLeft !== undefined;

    if (hasIndividualPadding) {
        const top = style.paddingTop ?? 0;
        const right = style.paddingRight ?? 0;
        const bottom = style.paddingBottom ?? 0;
        const left = style.paddingLeft ?? 0;
        return `padding: ${top}px ${right}px ${bottom}px ${left}px;`;
    } else if (style.padding !== undefined && style.padding > 0) {
        return `padding: ${style.padding}px;`;
    }

    return '';
}
