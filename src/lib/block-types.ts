// Block types for the email editor

export type BlockType =
    | "HeaderImage"
    | "Image"
    | "Gif"
    | "TextBlock"
    | "Button"
    | "Divider"
    | "Footer"
    | "Spacer"
    | "Columns"
    | "Container"
    | "SocialIcons";

// Styling options available to all blocks
// These styles are designed to be email-safe and work across all email clients
export interface BlockStyle {
    /** Background color - will be applied to <td> with both bgcolor and style for email compatibility */
    backgroundColor?: string;

    /** Border width in pixels (0-10px recommended) */
    borderWidth?: number;

    /** Border style - only 'solid' and 'none' are email-safe */
    borderStyle?: "solid" | "none";

    /** Border color */
    borderColor?: string;

    /** Border radius in pixels - works in most clients, degrades to square in Outlook */
    borderRadius?: number;

    /** Individual border radius values for granular control */
    borderRadiusTopLeft?: number;
    borderRadiusTopRight?: number;
    borderRadiusBottomRight?: number;
    borderRadiusBottomLeft?: number;

    /** Padding in pixels - applied uniformly to all sides (legacy support) */
    padding?: number;

    /** Individual padding values for granular control */
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;

    /** Vertical margins (only top/bottom work reliably in emails) */
    margin?: {
        top: number;
        bottom: number;
    };
}

// Global email settings
export interface EmailSettings {
    width: 600 | 640 | 700;
    backgroundColor: string;
    contentBackgroundColor: string;
    fontFamily: string;
    responsive: boolean;
}

export interface HeaderImageData {
    src: string;
    alt: string;
    linkUrl?: string;
}

export interface ImageData {
    src: string;
    alt: string;
    width?: number | "auto";
    alignment?: "left" | "center" | "right";
    linkUrl?: string;
    size?: "original" | "fill" | "scale";
}

export interface TextBlockData {
    content: string;
    alignment?: "left" | "center" | "right";
    textColor?: string;
    backgroundColor?: string;
    fontFamily?: string;
    fontWeight?: string;
    fontSize?: number;
}

export interface ButtonData {
    text: string;
    url: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: number;
}

export interface FooterData {
    // Legacy content (for backward compatibility)
    content: string;
    backgroundColor?: string;
    textColor?: string;

    // Optional footer image
    footerImage?: {
        src: string;
        alt: string;
        linkUrl?: string;
        position: "above" | "below";  // Relative to text
    };

    // Structured fields
    companyName?: string;
    address?: string;
    contactInfo?: string;  // Email, phone, etc.
    copyrightYear?: string;

    // Social icons integration
    showSocialIcons?: boolean;
    socialIcons?: SocialIconItem[];
    socialIconSize?: number;
    socialIconStyle?: "white" | "black" | "brand";  // Updated to match modern icon styles
}

export interface SpacerData {
    height: number;
}

export interface DividerData {
    color: string;
    thickness: number;
    style: "solid" | "dashed" | "dotted";
    width: number; // percentage 1-100
}

export interface ColumnsData {
    columnCount: 1 | 2 | 3;
    columns: EmailBlock[][];
    gap: number;
    backgroundColor?: string;
    padding?: number; // Simplified to match BlockStyle
    alignItems?: "start" | "center" | "end";
}

export interface ContainerData {
    blocks: EmailBlock[];
    maxWidth?: number;  // Default 600px
    alignment?: "left" | "center" | "right";
    // Professional Email Container Styling
    backgroundColor?: string;  // Container background color
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    // Border settings
    borderWidth?: number;
    borderColor?: string;
    borderStyle?: "solid" | "dashed" | "dotted" | "none";
    borderRadius?: number;  // Note: Limited Outlook support, degrades gracefully
}

// Social icon link item with per-icon customization
export interface SocialIconItem {
    platform: "facebook" | "twitter" | "instagram" | "linkedin" | "youtube" | "tiktok" | "whatsapp" | "website" | "email" | "phone";
    url: string;
    enabled: boolean;
    // Per-icon customization (optional - uses global settings if not set)
    iconSize?: number;        // Override global size (24, 32, 40, 48)
    iconStyle?: "white" | "black" | "brand";  // Override global style
    showBackground?: boolean;  // Override global background setting
    backgroundColor?: string;  // Custom background color for this icon
}

export interface SocialIconsData {
    icons: SocialIconItem[];
    // Global defaults (used when per-icon settings not specified)
    iconSize: number;  // 24, 32, 40, 48
    iconSpacing: number;  // gap between icons
    alignment: "left" | "center" | "right";
    iconStyle: "white" | "black" | "brand";  // default: "brand"
    // Background circle settings (industry standard approach)
    showBackground: boolean;  // default: true
    backgroundColor?: string;  // default background color (uses brand colors if not set)
    backgroundRadius?: number;  // 0 = square, 50 = circle, or custom percentage
}

export interface GifData {
    src: string;
    alt: string;
    width?: number | "auto";
    alignment?: "left" | "center" | "right";
    linkUrl?: string;
}

export type BlockData =
    | HeaderImageData
    | ImageData
    | GifData
    | TextBlockData
    | ButtonData
    | DividerData
    | FooterData
    | SpacerData
    | ColumnsData
    | ContainerData
    | SocialIconsData;

export interface EmailBlock {
    id: string;
    type: BlockType;
    data: BlockData;
    style?: BlockStyle;
}

export interface EmailContent {
    blocks: EmailBlock[];
    settings?: EmailSettings;
}

// Default data for new blocks
export const defaultBlockData: Record<BlockType, BlockData> = {
    HeaderImage: {
        src: "",
        alt: "Header Image",
    } as HeaderImageData,
    Image: {
        src: "",
        alt: "Image",
        width: "auto",
        alignment: "center",
        linkUrl: "",
        size: "original",
    } as ImageData,
    Gif: {
        src: "",
        alt: "Animated GIF",
        width: "auto",
        alignment: "center",
        linkUrl: "",
    } as GifData,
    TextBlock: {
        content: "Enter your text here...",
        fontSize: 16,
        fontFamily: "Arial, Helvetica, sans-serif",
        fontWeight: "normal",
        color: "#333333",
        align: "left",
    } as TextBlockData,
    Button: {
        text: "Click Here",
        url: "https://",
        backgroundColor: "#1e40af",
        textColor: "#ffffff",
    } as ButtonData,
    Footer: {
        content: "© 2024 Your Company. All rights reserved.",
    } as FooterData,
    Spacer: {
        height: 30,
    } as SpacerData,
    Divider: {
        color: "#e5e7eb",
        thickness: 1,
        style: "solid",
        width: 100,
    } as DividerData,
    Columns: {
        columnCount: 2,
        columns: [[], []],
        gap: 20,
        backgroundColor: "#ffffff",
        padding: 20, // Simplified
        alignItems: "start",
    } as ColumnsData,
    Container: {
        blocks: [],
        maxWidth: 600,
        alignment: "center",
    } as ContainerData,
    SocialIcons: {
        icons: [
            { platform: "facebook", url: "", enabled: true },
            { platform: "twitter", url: "", enabled: true },
            { platform: "instagram", url: "", enabled: true },
            { platform: "linkedin", url: "", enabled: true },
        ],
        iconSize: 32,
        iconSpacing: 12,
        alignment: "center",
        iconStyle: "brand",  // Default to brand colors
        showBackground: true,
        backgroundRadius: 50,
    } as SocialIconsData,
};

// Block metadata for the palette
export const blockRegistry: Record<BlockType, { label: string; icon: string; description: string }> = {
    HeaderImage: {
        label: "Header Image",
        icon: "🖼️",
        description: "Full-width header image",
    },
    Image: {
        label: "Image",
        icon: "📷",
        description: "Inline image with link",
    },
    Gif: {
        label: "GIF",
        icon: "🎞️",
        description: "Animated image (limited Outlook support)",
    },
    TextBlock: {
        label: "Text Block",
        icon: "📝",
        description: "Paragraph of text",
    },
    Button: {
        label: "Button",
        icon: "🔘",
        description: "Call-to-action button",
    },
    Footer: {
        label: "Footer",
        icon: "📋",
        description: "Email footer with copyright",
    },
    Spacer: {
        label: "Spacer",
        icon: "⬍",
        description: "Vertical spacing",
    },
    Divider: {
        label: "Divider",
        icon: "➖",
        description: "Horizontal line separator",
    },
    Columns: {
        label: "Columns / Section",
        icon: "▢▢",
        description: "Flexible row or column container",
    },
    Container: {
        label: "Container",
        icon: "📦",
        description: "Styled wrapper block",
    },
    SocialIcons: {
        label: "Social Icons",
        icon: "🔗",
        description: "Social media icon links",
    },
};
