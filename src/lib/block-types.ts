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

    // Spam Prevention / Deliverability Settings
    /** Email title - appears in browser tab and helps with deliverability */
    emailTitle?: string;
    /** Preheader text - preview text shown in inbox, critical for Gmail deliverability */
    preheaderText?: string;
    /** Physical mailing address - required by CAN-SPAM law */
    physicalAddress?: string;
}

export interface HeaderImageData {
    src: string;
    alt: string;
    linkUrl?: string;
    // Header image-specific border (applied to the image itself)
    borderWidth?: number;
    borderColor?: string;
    borderRadius?: number;
}

export interface ImageData {
    src: string;
    alt: string;
    width?: number | "auto";
    alignment?: "left" | "center" | "right";
    linkUrl?: string;
    size?: "original" | "fill" | "scale";
    // Image-specific border (applied to the image itself)
    borderWidth?: number;
    borderColor?: string;
    borderRadius?: number;
}

export interface TextBlockData {
    content: string;
    alignment?: "left" | "center" | "right";
    textColor?: string;
    backgroundColor?: string;
    fontFamily?: string;
    fontWeight?: string;
    fontSize?: number;
    /** Background image URL - full width, centered, no repeat */
    backgroundImage?: string;
    /** Minimum height when background image is set (to ensure image is visible) */
    backgroundMinHeight?: number;
    /** Vertical alignment of text on background image */
    backgroundVerticalAlign?: "top" | "center" | "bottom";
}

export interface ButtonData {
    text: string;
    url: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: number;
    // Button-specific border (applied to the button, not the block)
    borderWidth?: number;
    borderColor?: string;
}

export interface FooterData {
    // Legacy content (for backward compatibility)
    content: string;
    backgroundColor?: string;
    textColor?: string;

    // Text styling options
    fontFamily?: string;
    fontWeight?: string;
    fontSize?: number;

    // Background image (optional) - sits behind all footer content
    /** Background image URL - full width, centered, no repeat */
    backgroundImage?: string;
    /** Minimum height when background image is set */
    backgroundMinHeight?: number;
    /** Vertical alignment of content within footer (when background image is set) */
    contentVerticalAlign?: "top" | "center" | "bottom";

    // Structured fields
    companyName?: string;
    address?: string;
    contactInfo?: string;  // Email, phone, etc.
    copyrightYear?: string;

    // Social icons integration (enhanced to match main SocialIcons block)
    showSocialIcons?: boolean;
    socialIcons?: SocialIconItem[];
    socialIconSize?: number;
    socialIconStyle?: "white" | "black" | "brand";
    socialIconSpacing?: number;
    socialIconShowBackground?: boolean;
    socialIconBackgroundRadius?: number;  // 0 = square, 50 = circle
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
    mobileColumnCount?: 1 | 2 | 3;  // Column count on mobile, defaults to 1 for stack
    columns: EmailBlock[][];
    gap: number;
    backgroundColor?: string;
    transparentBackground?: boolean;  // If true, no background color applied
    padding?: number; // Simplified to match BlockStyle
    alignItems?: "start" | "center" | "end";
    /** Background image URL - full width, centered, no repeat */
    backgroundImage?: string;
    /** Minimum height when background image is set */
    backgroundMinHeight?: number;
}

export interface ContainerData {
    blocks: EmailBlock[];
    maxWidth?: number;  // Default 600px
    alignment?: "left" | "center" | "right";
    // Layout direction
    layoutDirection?: "column" | "row";  // Default "column" (vertical), "row" for horizontal inline
    mobileLayoutDirection?: "column" | "row";  // Layout direction on mobile, default follows desktop
    // Vertical alignment of items within container
    verticalAlignment?: "start" | "center" | "end";  // Align items to top, middle, or bottom
    // Professional Email Container Styling
    backgroundColor?: string;  // Container background color
    transparentBackground?: boolean;  // If true, no background color applied
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    // Border settings
    borderWidth?: number;
    borderColor?: string;
    borderStyle?: "solid" | "dashed" | "dotted" | "none";
    borderRadius?: number;  // Note: Limited Outlook support, degrades gracefully
    /** Background image URL - full width, centered, no repeat */
    backgroundImage?: string;
    /** Minimum height when background image is set */
    backgroundMinHeight?: number;
}

// Social icon link item with per-icon customization
export interface SocialIconItem {
    platform: "facebook" | "twitter" | "instagram" | "linkedin" | "youtube" | "tiktok" | "whatsapp" | "website" | "email" | "phone" | "location";
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
    // GIF-specific border (applied to the image itself)
    borderWidth?: number;
    borderColor?: string;
    borderRadius?: number;
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
        alt: "",  // Empty - user must provide description
    } as HeaderImageData,
    Image: {
        src: "",
        alt: "",  // Empty - user must provide description
        width: "auto",
        alignment: "center",
        linkUrl: "",
        size: "original",
    } as ImageData,
    Gif: {
        src: "",
        alt: "",  // Empty - user must provide description
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
        showBackground: false,
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
