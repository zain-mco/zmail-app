/**
 * Email Style Constants
 * 
 * Single source of truth for all email styling used by BOTH:
 * - Editor renderers (SortableBlock.tsx)
 * - Export engine (email-export.ts)
 * 
 * This ensures true WYSIWYG - What You See Is What You Get
 */

export const EMAIL_STYLES = {
    // Container dimensions
    containerWidth: 600,

    // Padding for different block types (in pixels)
    padding: {
        // HeaderImage: full-width, no padding
        headerImage: { x: 0, y: 0 },
        // Image: slight padding for visual separation
        image: { x: 20, y: 10 },
        // TextBlock: standard content padding
        text: { x: 30, y: 20 },
        // Button: matches text padding
        button: { x: 30, y: 20 },
        // Footer: all-around padding
        footer: 30,
        // Columns: default inner padding
        columns: { top: 20, right: 20, bottom: 20, left: 20 },
    },

    // Typography
    fonts: {
        default: "Arial, Helvetica, sans-serif",
        sizes: {
            default: 16,
            footer: 12,
            button: 16,
        },
        lineHeight: 1.6,
    },

    // Colors
    colors: {
        background: "#f4f4f4",
        container: "#ffffff",
        text: "#333333",
        footerText: "#6c757d",
        footerBg: "#f8f9fa",
        buttonDefault: "#1e40af",
        buttonText: "#ffffff",
    },

    // Spacing
    spacer: {
        default: 30,
    },

    // Column defaults
    columns: {
        gap: 20,
        alignItems: "start" as const,
    },
} as const;

// Helper to generate inline style string from padding object
export function getPaddingStyle(padding: { x: number; y: number } | number): string {
    if (typeof padding === "number") {
        return `${padding}px`;
    }
    return `${padding.y}px ${padding.x}px`;
}

// Helper to generate CSS object for React components
export function getPaddingCSS(padding: { x: number; y: number } | number): React.CSSProperties {
    if (typeof padding === "number") {
        return { padding: `${padding}px` };
    }
    return {
        paddingTop: `${padding.y}px`,
        paddingBottom: `${padding.y}px`,
        paddingLeft: `${padding.x}px`,
        paddingRight: `${padding.x}px`,
    };
}

// Calculate column width based on container width and settings
export function calculateColumnWidth(
    columnCount: number,
    gap: number,
    containerPadding: { left: number; right: number }
): number {
    const totalGap = gap * (columnCount - 1);
    const availableWidth = EMAIL_STYLES.containerWidth - containerPadding.left - containerPadding.right - totalGap;
    return Math.floor(availableWidth / columnCount);
}

export type EmailStylesType = typeof EMAIL_STYLES;
