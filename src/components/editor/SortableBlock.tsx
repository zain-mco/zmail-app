"use client";
// Social icon URL formatting: mailto: for email, tel: for phone

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { EmailBlock, BlockStyle, HeaderImageData, ImageData, GifData, TextBlockData, ButtonData, DividerData, FooterData, SpacerData, ColumnsData, SocialIconsData, SocialIconItem, ContainerData } from "@/lib/block-types";
import { EMAIL_STYLES, getPaddingCSS } from "@/lib/email-styles";
import { getBlockStyleCSS } from "@/lib/block-style-helpers";
import { ColumnEditor } from "./ColumnEditor";
import { ContainerEditor } from "./ContainerEditor";

interface SortableBlockProps {
    block: EmailBlock;
    isSelected: boolean;
    isDragging?: boolean; // External drag state from parent
    onSelect: () => void;
    onDelete?: () => void;
    onUpdate?: (newData: any) => void;  // Added for updating block data
    canEdit: boolean;
    onUpdateColumnBlock?: (parentId: string, columnIdx: number, blockId: string, newData: any) => void;
    onDeleteColumnBlock?: (parentId: string, columnIdx: number, blockId: string) => void;
    onSelectColumnBlock?: (blockId: string) => void;
    // Container handlers
    onUpdateContainerBlock?: (containerId: string, blockId: string, newData: any) => void;
    onDeleteContainerBlock?: (containerId: string, blockId: string) => void;
    onSelectContainerBlock?: (blockId: string) => void;
    // Preview mode for responsive layouts
    previewMode?: "desktop" | "mobile";
}

import { motion, AnimatePresence } from "framer-motion";

// Helper function to get effective padding that respects user-configured values
// When user sets padding (including 0), use those values. Otherwise, use EMAIL_STYLES defaults.
function getEffectivePadding(
    defaultPadding: { x: number; y: number } | number,
    style?: BlockStyle
): { top: number; right: number; bottom: number; left: number } {
    // Check if user has explicitly configured padding in block.style
    const hasUserPadding = style && (
        style.padding !== undefined ||
        style.paddingTop !== undefined ||
        style.paddingRight !== undefined ||
        style.paddingBottom !== undefined ||
        style.paddingLeft !== undefined
    );

    if (hasUserPadding) {
        // Use user-configured values (allows 0)
        const uniform = style!.padding ?? 0;
        return {
            top: style!.paddingTop ?? uniform,
            right: style!.paddingRight ?? uniform,
            bottom: style!.paddingBottom ?? uniform,
            left: style!.paddingLeft ?? uniform,
        };
    }

    // Fall back to EMAIL_STYLES defaults
    if (typeof defaultPadding === 'number') {
        return { top: defaultPadding, right: defaultPadding, bottom: defaultPadding, left: defaultPadding };
    }
    return { top: defaultPadding.y, right: defaultPadding.x, bottom: defaultPadding.y, left: defaultPadding.x };
}

// ... imports remain same ...

export function SortableBlock({
    block,
    isSelected,
    isDragging: isDraggingProp,
    onSelect,
    onDelete,
    onUpdate,
    canEdit,
    onUpdateColumnBlock,
    onDeleteColumnBlock,
    onSelectColumnBlock,
    onUpdateContainerBlock,
    onDeleteContainerBlock,
    onSelectContainerBlock,
    previewMode = "desktop",
}: SortableBlockProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isDraggingInternal,
    } = useSortable({ id: block.id });

    // Use external prop if provided, otherwise use internal state
    const isDragging = isDraggingProp ?? isDraggingInternal;

    // Enhanced transform styles for smooth animations
    const dndStyle = {
        transform: CSS.Transform.toString(transform),
        transition: transition || 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)',
    };

    const renderBlockContent = () => {
        const style = block.style;
        switch (block.type) {
            case "HeaderImage":
                return <HeaderImageRenderer data={block.data as HeaderImageData} style={style} />;
            case "Image":
                return <ImageRenderer data={block.data as ImageData} style={style} />;
            case "Gif":
                return <GifRenderer data={block.data as GifData} style={style} />;
            case "TextBlock":
                return <TextBlockRenderer data={block.data as TextBlockData} style={style} />;
            case "Button":
                return <ButtonRenderer data={block.data as ButtonData} style={style} />;
            case "Footer":
                return <FooterRenderer data={block.data as FooterData} style={style} />;
            case "Divider":
                return <DividerRenderer data={block.data as DividerData} style={style} />;
            case "Spacer":
                return <SpacerRenderer data={block.data as SpacerData} style={style} />;
            case "Columns":
                if (canEdit && onUpdateColumnBlock && onDeleteColumnBlock && onSelectColumnBlock) {
                    return (
                        <ColumnEditor
                            block={block}
                            isSelected={isSelected}
                            onUpdate={(newData) => {
                                // Update the entire columns block data
                                onUpdate?.(newData);
                            }}
                            onUpdateColumnBlock={onUpdateColumnBlock}
                            onDeleteColumnBlock={onDeleteColumnBlock}
                            onSelectBlock={onSelectColumnBlock}
                            // Pass container handlers for nested containers
                            onUpdateContainerBlock={onUpdateContainerBlock}
                            onDeleteContainerBlock={onDeleteContainerBlock}
                            onSelectContainerBlock={onSelectContainerBlock}
                        />
                    );
                }
                return <ColumnsRenderer data={block.data as ColumnsData} style={style} />;
            case "SocialIcons":
                return <SocialIconsRenderer data={block.data as SocialIconsData} style={style} />;
            case "Container":
                if (canEdit && onUpdateContainerBlock && onDeleteContainerBlock && onSelectContainerBlock) {
                    return (
                        <ContainerEditor
                            block={block}
                            isSelected={isSelected}
                            onUpdate={(newData) => {
                                onUpdate?.(newData);
                            }}
                            onUpdateContainerBlock={onUpdateContainerBlock}
                            onDeleteContainerBlock={onDeleteContainerBlock}
                            onSelectBlock={onSelectContainerBlock}
                            previewMode={previewMode}
                        />
                    );
                }
                return <ContainerRenderer data={block.data as ContainerData} style={style} />;
            default:
                return <div className="p-4 text-red-500">Unknown block type</div>;
        }
    };

    return (
        <motion.div
            layout
            ref={setNodeRef}
            style={{
                ...dndStyle,
                // "Lift" state: reduced opacity when being dragged
                opacity: isDragging ? 0.5 : 1,
            }}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{
                opacity: isDragging ? 0.5 : 1,
                scale: isDragging ? 1.02 : 1,
                y: 0,
                zIndex: isDragging ? 999 : (isSelected ? 10 : 0),
                // Shadow only during drag lift state or when selected - NO default shadow
                boxShadow: isDragging
                    ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 2px rgba(99, 102, 241, 0.5)'
                    : isSelected
                        ? '0 0 0 2px rgba(99, 102, 241, 0.5)'
                        : 'none',
            }}
            whileHover={canEdit && !isDragging ? {
                scale: 1.002,
                // Minimal hover effect - no shadow
            } : undefined}
            transition={{
                type: "spring",
                stiffness: 500,
                damping: 35,
                // Faster layout transitions for smooth displacement
                layout: {
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                }
            }}
            className={`editor-block group relative ${isSelected ? "editor-block-selected" : "editor-block-default"} ${isDragging ? "cursor-grabbing" : ""}`}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
        >
            {canEdit && (
                <>
                    {/* Selection/Drag indicator border */}
                    {(isSelected || isDragging) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 pointer-events-none border-2 border-indigo-500 rounded-lg z-20"
                        />
                    )}

                    {/* Enhanced Drag Handle with grab cursor */}
                    <motion.div
                        {...attributes}
                        {...listeners}
                        className="absolute left-3 top-3 w-8 h-8 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all duration-200 
                                 bg-gray-800 text-white rounded-md flex items-center justify-center shadow-lg z-50"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {/* 6-dot drag handle icon */}
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                            <circle cx="4" cy="3" r="1.5" />
                            <circle cx="10" cy="3" r="1.5" />
                            <circle cx="4" cy="7" r="1.5" />
                            <circle cx="10" cy="7" r="1.5" />
                            <circle cx="4" cy="11" r="1.5" />
                            <circle cx="10" cy="11" r="1.5" />
                        </svg>
                    </motion.div>

                    {/* Delete Button */}
                    {onDelete && (
                        <motion.div
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="absolute right-3 top-3 w-8 h-8 bg-white border border-red-100 text-red-500 rounded-md opacity-0 
                                     group-hover:opacity-100 flex items-center justify-center hover:bg-red-50 hover:border-red-200 
                                     hover:text-red-600 transition-all duration-200 shadow-sm cursor-pointer z-50"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="text-lg font-bold leading-none">×</span>
                        </motion.div>
                    )}
                </>
            )}

            <div className={canEdit ? "ml-0 transition-all duration-300" : ""}>
                {renderBlockContent()}
            </div>

            {/* Visual Feedback Overlay for Hover */}
            {canEdit && !isDragging && (
                <div className="absolute inset-0 border-2 border-dashed border-transparent group-hover:border-indigo-200 rounded-lg transition-colors pointer-events-none" />
            )}
        </motion.div>
    );
}

function HeaderImageRenderer({ data, style }: { data: HeaderImageData; style?: BlockStyle }) {
    const blockStyle = getBlockStyleCSS(style);
    if (!data.src) {
        return (
            <div
                className="flex items-center justify-center text-gray-400"
                style={{
                    height: 120,
                    backgroundColor: EMAIL_STYLES.colors.footerBg,
                }}
            >
                <div className="text-center">
                    <div className="text-3xl mb-1">🖼️</div>
                    <div className="text-sm">Click to add header image</div>
                </div>
            </div>
        );
    }

    // Build image style with border properties
    const imageStyle: React.CSSProperties = {
        width: '100%',
        height: 'auto',
        display: 'block',
    };

    // Apply image-specific border (to the image itself)
    if (data.borderWidth && data.borderWidth > 0) {
        imageStyle.border = `${data.borderWidth}px solid ${data.borderColor || "#e5e7eb"}`;
    } else if (data.linkUrl) {
        imageStyle.border = '0';
    }

    // Apply border radius to the image
    if (data.borderRadius && data.borderRadius > 0) {
        imageStyle.borderRadius = `${data.borderRadius}px`;
    }

    const imageElement = (
        <img
            src={data.src}
            alt={data.alt || "Header"}
            style={imageStyle}
        />
    );

    return (
        <div style={{ padding: 0, ...blockStyle }}>
            {data.linkUrl ? (
                <a
                    href={data.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.preventDefault()}
                    style={{
                        display: 'block',
                        textDecoration: 'none',
                        border: '0',
                        cursor: 'pointer',
                    }}
                    title={`Link: ${data.linkUrl}`}
                >
                    {imageElement}
                </a>
            ) : (
                imageElement
            )}
        </div>
    );
}

function ImageRenderer({ data, style }: { data: ImageData; style?: BlockStyle }) {
    const alignmentMap = {
        left: "flex-start",
        center: "center",
        right: "flex-end",
    } as const;

    const padding = getEffectivePadding(EMAIL_STYLES.padding.image, style);
    const blockStyle = getBlockStyleCSS(style);

    if (!data.src) {
        return (
            <div
                className="flex justify-center"
                style={{
                    paddingTop: padding.top,
                    paddingBottom: padding.bottom,
                    paddingLeft: padding.left,
                    paddingRight: padding.right,
                }}
            >
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 border-2 border-dashed rounded">
                    <div className="text-center">
                        <div className="text-3xl mb-1">📷</div>
                        <div className="text-sm">Click to add image</div>
                    </div>
                </div>
            </div>
        );
    }

    // Determine image styling based on size option
    // Note: For "original" size with percentage width, the percentage is applied to the wrapper, not the image
    let imageStyle: React.CSSProperties = { display: 'block', maxWidth: '100%', height: 'auto' };

    if (data.size === "fill" || data.size === "scale" || !data.size) {
        imageStyle.width = '100%';
    } else if (data.size === "original" && data.width && data.width !== "auto") {
        // For "original" with percentage, image fills its wrapper (wrapper has the percentage width)
        imageStyle.width = '100%';
    }

    // Apply image-specific border (to the image itself)
    if (data.borderWidth && data.borderWidth > 0) {
        imageStyle.border = `${data.borderWidth}px solid ${data.borderColor || "#e5e7eb"}`;
    } else if (data.linkUrl) {
        // Add border:0 for email safety when image is linked
        imageStyle.border = '0';
    }

    // Apply border radius to the image
    if (data.borderRadius && data.borderRadius > 0) {
        imageStyle.borderRadius = `${data.borderRadius}px`;
    }

    const imageElement = (
        <img
            src={data.src}
            alt={data.alt || "Image"}
            style={imageStyle}
        />
    );

    // Calculate wrapper width for proper flex alignment
    let wrapperWidth: string | undefined;
    if (data.size === "original" && data.width && data.width !== "auto") {
        wrapperWidth = `${data.width}%`;
    }

    // Common wrapper styles for both linked and non-linked images
    const wrapperStyle: React.CSSProperties = wrapperWidth ? { width: wrapperWidth } : {};

    return (
        <div
            style={{
                display: "flex",
                justifyContent: alignmentMap[data.alignment || "center"],
                paddingTop: padding.top,
                paddingBottom: padding.bottom,
                paddingLeft: padding.left,
                paddingRight: padding.right,
                backgroundColor: blockStyle.backgroundColor,
                borderRadius: blockStyle.borderRadius,
            }}
        >
            {data.linkUrl ? (
                <a
                    href={data.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.preventDefault()}
                    style={{
                        display: 'inline-block',
                        textDecoration: 'none',
                        border: '0',
                        cursor: 'pointer',
                        ...wrapperStyle,
                    }}
                    title={`Link: ${data.linkUrl}`}
                >
                    {imageElement}
                </a>
            ) : (
                wrapperWidth ? (
                    <div style={wrapperStyle}>
                        {imageElement}
                    </div>
                ) : imageElement
            )}
        </div>
    );
}


function GifRenderer({ data, style }: { data: GifData; style?: BlockStyle }) {
    const alignmentMap = {
        left: "flex-start",
        center: "center",
        right: "flex-end",
    } as const;

    const padding = getEffectivePadding(EMAIL_STYLES.padding.image, style);
    const blockStyle = getBlockStyleCSS(style);

    if (!data.src) {
        return (
            <div
                className="flex justify-center"
                style={{
                    paddingTop: padding.top,
                    paddingBottom: padding.bottom,
                    paddingLeft: padding.left,
                    paddingRight: padding.right,
                }}
            >
                <div className="w-full h-48 bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center text-gray-400 border-2 border-dashed border-pink-200 rounded">
                    <div className="text-center">
                        <div className="text-3xl mb-1">🎞️</div>
                        <div className="text-sm font-medium">Click to add GIF</div>
                        <div className="text-xs text-orange-500 mt-1">⚠️ Outlook shows 1st frame only</div>
                    </div>
                </div>
            </div>
        );
    }

    // GIF width handling - percentage applied to wrapper for proper alignment
    let imageStyle: React.CSSProperties = { display: 'block', maxWidth: '100%', height: 'auto', width: '100%' };

    // Apply GIF-specific border (to the image itself)
    if (data.borderWidth && data.borderWidth > 0) {
        imageStyle.border = `${data.borderWidth}px solid ${data.borderColor || "#e5e7eb"}`;
    } else if (data.linkUrl) {
        imageStyle.border = '0';
    }

    // Apply border radius to the GIF
    if (data.borderRadius && data.borderRadius > 0) {
        imageStyle.borderRadius = `${data.borderRadius}px`;
    }

    const imageElement = (
        <img
            src={data.src}
            alt={data.alt || "Animated GIF"}
            style={imageStyle}
        />
    );

    // Calculate wrapper width for proper flex alignment
    let wrapperWidth: string | undefined;
    if (data.width && data.width !== "auto") {
        wrapperWidth = `${data.width}%`;
    }

    // Common wrapper styles for both linked and non-linked gifs
    const wrapperStyle: React.CSSProperties = wrapperWidth ? { width: wrapperWidth } : {};

    return (
        <div
            style={{
                display: "flex",
                justifyContent: alignmentMap[data.alignment || "center"],
                paddingTop: padding.top,
                paddingBottom: padding.bottom,
                paddingLeft: padding.left,
                paddingRight: padding.right,
                backgroundColor: blockStyle.backgroundColor,
                borderRadius: blockStyle.borderRadius,
            }}
        >
            {data.linkUrl ? (
                <a
                    href={data.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.preventDefault()}
                    style={{
                        display: 'inline-block',
                        textDecoration: 'none',
                        border: '0',
                        cursor: 'pointer',
                        ...wrapperStyle,
                    }}
                    title={`Link: ${data.linkUrl}`}
                >
                    {imageElement}
                </a>
            ) : (
                wrapperWidth ? (
                    <div style={wrapperStyle}>
                        {imageElement}
                    </div>
                ) : imageElement
            )}
        </div>
    );
}


// This file contains the fixed TextBlockRenderer function
// Copy this function to replace lines 262-286 in SortableBlock.tsx

function TextBlockRenderer({ data, style }: { data: TextBlockData; style?: BlockStyle }) {
    const padding = getEffectivePadding(EMAIL_STYLES.padding.text, style);
    const blockStyle = getBlockStyleCSS(style);
    // textColor sets the default color - TipTap inline styles will override this where applied
    const textColor = data.textColor || EMAIL_STYLES.colors.text;

    // Generate unique ID for scoped styling
    const blockId = `text-block-${Math.random().toString(36).substr(2, 9)}`;

    // Background image styles with vertical alignment
    const hasBackgroundImage = !!data.backgroundImage;
    const verticalAlign = data.backgroundVerticalAlign || "center";
    const alignItemsMap = { top: "flex-start", center: "center", bottom: "flex-end" };

    const backgroundStyles: React.CSSProperties = hasBackgroundImage ? {
        backgroundImage: `url(${data.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: data.backgroundMinHeight || 200,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: alignItemsMap[verticalAlign],
    } : {};

    return (
        <>
            {/* Add scoped CSS for paragraph spacing and empty line visibility */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    #${blockId} p { margin: 0; min-height: 1em; }
                    #${blockId} p + p { margin-top: 0.75em; }
                    #${blockId} p:empty { min-height: 1em; }
                    #${blockId} p:empty::before { content: "\\00a0"; visibility: hidden; }
                    #${blockId} br { display: block; content: ""; margin-top: 0.5em; }
                `
            }} />
            <div
                id={blockId}
                style={{
                    paddingTop: padding.top,
                    paddingBottom: padding.bottom,
                    paddingLeft: padding.left,
                    paddingRight: padding.right,
                    textAlign: data.alignment || "left",
                    color: textColor, // Default color - inline styles take precedence
                    backgroundColor: blockStyle.backgroundColor || data.backgroundColor || "transparent",
                    fontFamily: data.fontFamily || EMAIL_STYLES.fonts.default,
                    fontWeight: data.fontWeight || "normal",
                    fontSize: data.fontSize || EMAIL_STYLES.fonts.sizes.default,
                    lineHeight: EMAIL_STYLES.fonts.lineHeight,
                    borderRadius: blockStyle.borderRadius,
                    ...backgroundStyles,
                }}
            >
                {/* Wrap content in a div for proper flex alignment */}
                <div dangerouslySetInnerHTML={{ __html: data.content || "<p>Enter text content...</p>" }} />
            </div>
        </>
    );
}


function ButtonRenderer({ data, style }: { data: ButtonData; style?: BlockStyle }) {
    const padding = getEffectivePadding(EMAIL_STYLES.padding.button, style);
    const blockStyle = getBlockStyleCSS(style);

    // Button-specific border styling
    const buttonBorder = data.borderWidth && data.borderWidth > 0
        ? `${data.borderWidth}px solid ${data.borderColor || "#1e40af"}`
        : undefined;

    return (
        <div
            style={{
                paddingTop: padding.top,
                paddingBottom: padding.bottom,
                paddingLeft: padding.left,
                paddingRight: padding.right,
                textAlign: 'center',
                backgroundColor: blockStyle.backgroundColor,
                borderRadius: blockStyle.borderRadius,
            }}
        >
            <span
                style={{
                    display: 'inline-block',
                    padding: '14px 32px',
                    borderRadius: data.borderRadius || 6,
                    fontWeight: 'bold',
                    fontSize: EMAIL_STYLES.fonts.sizes.button,
                    backgroundColor: data.backgroundColor || EMAIL_STYLES.colors.buttonDefault,
                    color: data.textColor || EMAIL_STYLES.colors.buttonText,
                    border: buttonBorder,
                }}
            >
                {data.text || "Button"}
            </span>
        </div>
    );
}

function FooterRenderer({ data, style }: { data: FooterData; style?: BlockStyle }) {
    const padding = EMAIL_STYLES.padding.footer;
    const blockStyle = getBlockStyleCSS(style);

    // Text styling with defaults
    const fontFamily = data.fontFamily || "Arial, Helvetica, sans-serif";
    const fontWeight = data.fontWeight || "normal";
    const fontSize = data.fontSize || 12;

    // Background image styles with vertical alignment
    const hasBackgroundImage = !!data.backgroundImage;
    const verticalAlign = data.contentVerticalAlign || "center";
    const justifyContentMap = { top: "flex-start", center: "center", bottom: "flex-end" };
    const backgroundStyles: React.CSSProperties = hasBackgroundImage ? {
        backgroundImage: `url(${data.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: data.backgroundMinHeight || 200,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: justifyContentMap[verticalAlign],
    } : {};

    // Social Icons Component - Using CDN images with enhanced options
    const SocialIconsSection = data.showSocialIcons && data.socialIcons && data.socialIcons.length > 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', gap: data.socialIconSpacing || 8, marginBottom: 12 }}>
            {data.socialIcons
                .filter(icon => icon.enabled && icon.url)
                .map((icon, idx) => {
                    // Icon settings
                    const iconStyle = data.socialIconStyle || "brand";
                    const iconSize = data.socialIconSize || 32;
                    const showBackground = data.socialIconShowBackground !== false;
                    const bgRadius = data.socialIconBackgroundRadius ?? 50;

                    // Get CDN icon URL (with cache-busting version)
                    const platformFilenames: Record<string, string> = { email: "mail" };
                    const filename = platformFilenames[icon.platform] || icon.platform;
                    const iconUrl = `https://mco-cdn.b-cdn.net/mco/icons/${filename}-${iconStyle}.png?v=20260118`;

                    // Get brand background color
                    const bgColors: Record<string, string> = {
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
                        location: "#EA4335",
                    };
                    const bgColor = bgColors[icon.platform] || "#333333";
                    const platformLabel = icon.platform.charAt(0).toUpperCase() + icon.platform.slice(1);

                    // Format URL for email/phone platforms
                    const formatSocialIconUrl = (platform: string, url: string): string => {
                        if (!url) return "";
                        const trimmedUrl = url.trim();
                        if (platform === "email") {
                            return trimmedUrl.toLowerCase().startsWith("mailto:") ? trimmedUrl : `mailto:${trimmedUrl}`;
                        }
                        if (platform === "phone") {
                            const cleanUrl = trimmedUrl.toLowerCase().startsWith("tel:")
                                ? trimmedUrl.replace(/\s+/g, "")
                                : `tel:${trimmedUrl.replace(/\s+/g, "")}`;
                            return cleanUrl;
                        }
                        return trimmedUrl;
                    };
                    const formattedUrl = formatSocialIconUrl(icon.platform, icon.url);

                    if (showBackground) {
                        return (
                            <a
                                key={`${icon.platform}-${idx}`}
                                href={formattedUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: iconSize + 8,
                                    height: iconSize + 8,
                                    backgroundColor: bgColor,
                                    borderRadius: `${bgRadius}%`,
                                    padding: '4px',
                                    border: 0,
                                }}
                                title={platformLabel}
                            >
                                <img
                                    src={iconUrl}
                                    alt={platformLabel}
                                    style={{
                                        display: 'block',
                                        width: iconSize,
                                        height: iconSize,
                                        border: 0,
                                    }}
                                />
                            </a>
                        );
                    } else {
                        // No background - just the icon
                        return (
                            <a
                                key={`${icon.platform}-${idx}`}
                                href={formattedUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'block',
                                    border: 0,
                                }}
                                title={platformLabel}
                            >
                                <img
                                    src={iconUrl}
                                    alt={platformLabel}
                                    style={{
                                        display: 'block',
                                        width: iconSize,
                                        height: iconSize,
                                        border: 0,
                                    }}
                                />
                            </a>
                        );
                    }
                })}
        </div>
    ) : null;

    // Structured content
    const hasStructuredContent = data.companyName || data.address || data.contactInfo;

    return (
        <div
            style={{
                padding: `${padding}px`,
                backgroundColor: data.backgroundColor || EMAIL_STYLES.colors.footerBg,
                borderTop: '1px solid #e9ecef',
                textAlign: 'center',
                fontFamily: fontFamily,
                fontWeight: fontWeight as any,
                fontSize: fontSize,
                lineHeight: 1.6,
                color: data.textColor || EMAIL_STYLES.colors.footerText,
                ...blockStyle,
                ...backgroundStyles,
            }}
        >
            {/* Social Icons */}
            {SocialIconsSection}

            {/* Structured content */}
            {hasStructuredContent && (
                <div style={{ marginBottom: 8 }}>
                    {data.companyName && (
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{data.companyName}</div>
                    )}
                    {data.address && (
                        <div style={{ opacity: 0.8, marginBottom: 4 }}>{data.address}</div>
                    )}
                    {data.contactInfo && (
                        <div style={{ opacity: 0.8 }}>{data.contactInfo}</div>
                    )}
                </div>
            )}

            {/* Legacy content / custom text */}
            {data.content && <div style={{ marginBottom: hasStructuredContent ? 0 : 8 }}>{data.content}</div>}

            {/* Copyright */}
            {data.copyrightYear && (
                <div style={{ fontSize: Math.max(fontSize - 1, 10), opacity: 0.7, marginTop: 8 }}>
                    © {data.copyrightYear} {data.companyName || "Your Company"}. All rights reserved.
                </div>
            )}
        </div>
    );
}

function SpacerRenderer({ data, style }: { data: SpacerData; style?: BlockStyle }) {
    const height = data.height || EMAIL_STYLES.spacer.default;

    // Spacer is transparent by default - only apply background if explicitly set
    // No border-radius for spacers
    const backgroundColor = style?.backgroundColor || "transparent";

    return (
        <div
            style={{
                height: height,
                lineHeight: `${height}px`,
                fontSize: 0,
                backgroundColor: backgroundColor,
                // No border-radius for spacer - it's just empty space
            }}
        />
    );
}

function DividerRenderer({ data, style }: { data: DividerData; style?: BlockStyle }) {
    const color = data.color || "#e5e7eb";
    const thickness = data.thickness || 1;
    const dividerStyle = data.style || "solid";  // Renamed from 'style' to avoid conflict
    const width = data.width || 100;
    const padding = getEffectivePadding(20, style);  // Default 20px padding for divider
    const blockStyle = getBlockStyleCSS(style);

    return (
        <div
            style={{
                paddingTop: padding.top,
                paddingBottom: padding.bottom,
                paddingLeft: padding.left,
                paddingRight: padding.right,
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: blockStyle.backgroundColor,
                borderRadius: blockStyle.borderRadius,
            }}
        >
            <div
                style={{
                    width: `${width}%`,
                    borderTop: `${thickness}px ${dividerStyle} ${color}`,
                }}
            />
        </div>
    );
}

function ColumnsRenderer({ data, style }: { data: ColumnsData; style?: BlockStyle }) {
    const columnCount = data.columnCount || 2;
    const gap = data.gap || EMAIL_STYLES.columns.gap;

    // Handle both number and object padding - default to 0
    let paddingValue = 0;
    if (typeof data.padding === 'number') {
        paddingValue = data.padding;
    } else if (data.padding && typeof data.padding === 'object') {
        // If it's an object, use average or just use the values directly
        paddingValue = 0; // Object padding handled separately if needed
    }
    // Otherwise default to 0 for true WYSIWYG

    const blockStyle = getBlockStyleCSS(style);

    // Calculate widths based on column count
    const widths = columnCount === 1 ? ["100%"] : (columnCount === 2 ? ["50%", "50%"] : ["33.33%", "33.33%", "33.33%"]);

    // Background image styles
    const hasBackgroundImage = !!data.backgroundImage;
    const backgroundStyles: React.CSSProperties = hasBackgroundImage ? {
        backgroundImage: `url(${data.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: data.backgroundMinHeight || 200,
    } : {};

    return (
        <div
            style={{
                display: 'flex',
                gap: `${gap}px`,
                backgroundColor: data.transparentBackground ? 'transparent' : (data.backgroundColor || 'transparent'),
                padding: `${paddingValue}px`,
                alignItems: data.alignItems || EMAIL_STYLES.columns.alignItems,
                ...blockStyle,
                ...backgroundStyles,
            }}
        >
            {Array.from({ length: columnCount }).map((_, idx) => (
                <div
                    key={idx}
                    style={{
                        width: widths[idx],
                        minHeight: hasBackgroundImage ? undefined : 100,
                    }}
                    className="border border-dashed border-gray-200 rounded p-2 flex flex-col justify-center hover:bg-gray-50/50 hover:border-indigo-200 transition-colors"
                >
                    <div className="text-xs text-gray-300 font-medium text-center uppercase tracking-wider mb-2 select-none">Column {idx + 1}</div>
                    <div className="text-center text-xs text-indigo-300 font-mono">
                        {data.columns[idx]?.length || 0} blocks
                    </div>
                </div>
            ))}
        </div>
    );
}

// Social platform icon SVGs (email-safe inline SVGs)
const socialIcons: Record<string, { color: string; dark: string; svg: (color: string) => string }> = {
    facebook: {
        color: "#1877F2",
        dark: "#333333",
        svg: (fill) => `<svg viewBox="0 0 24 24" fill="${fill}" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    },
    twitter: {
        color: "#000000",
        dark: "#333333",
        svg: (fill) => `<svg viewBox="0 0 24 24" fill="${fill}" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    },
    instagram: {
        color: "#E4405F",
        dark: "#333333",
        svg: (fill) => `<svg viewBox="0 0 24 24" fill="${fill}" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.897 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.897-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.757-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>`,
    },
    linkedin: {
        color: "#0A66C2",
        dark: "#333333",
        svg: (fill) => `<svg viewBox="0 0 24 24" fill="${fill}" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    },
    youtube: {
        color: "#FF0000",
        dark: "#333333",
        svg: (fill) => `<svg viewBox="0 0 24 24" fill="${fill}" xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    },
    tiktok: {
        color: "#000000",
        dark: "#333333",
        svg: (fill) => `<svg viewBox="0 0 24 24" fill="${fill}" xmlns="http://www.w3.org/2000/svg"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
    },
    whatsapp: {
        color: "#25D366",
        dark: "#333333",
        svg: (fill) => `<svg viewBox="0 0 24 24" fill="${fill}" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
    },
    website: {
        color: "#4B5563",
        dark: "#333333",
        svg: (fill) => `<svg viewBox="0 0 24 24" fill="${fill}" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`,
    },
    email: {
        color: "#6366F1",
        dark: "#333333",
        svg: (fill) => `<svg viewBox="0 0 24 24" fill="${fill}" xmlns="http://www.w3.org/2000/svg"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
    },
    phone: {
        color: "#10B981",
        dark: "#333333",
        svg: (fill) => `<svg viewBox="0 0 24 24" fill="${fill}" xmlns="http://www.w3.org/2000/svg"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>`,
    },
    location: {
        color: "#EA4335",
        dark: "#333333",
        svg: (fill) => `<svg viewBox="0 0 24 24" fill="${fill}" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
    },
};

// CDN base URL for social icons (same as email export)
const SOCIAL_ICONS_CDN_BASE = "https://mco-cdn.b-cdn.net/mco/icons";

// Social platform brand colors for background
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
    location: "#EA4335",
};

// Get CDN URL for a social icon (same logic as email-export.ts)
// VERSION: Increment this when updating icons on CDN to bust cache
const SOCIAL_ICONS_VERSION = "20260118";

function getSocialIconUrl(platform: string, iconStyle: string): string {
    const platformFilenames: Record<string, string> = {
        email: "mail",
    };
    const filename = platformFilenames[platform] || platform;
    const styleMap: Record<string, string> = {
        white: "white",
        black: "black",
        brand: "brand",
    };
    const styleSuffix = styleMap[iconStyle] || "white";
    return `${SOCIAL_ICONS_CDN_BASE}/${filename}-${styleSuffix}.png?v=${SOCIAL_ICONS_VERSION}`;
}

function SocialIconsRenderer({ data, style }: { data: SocialIconsData; style?: BlockStyle }) {
    const blockStyle = getBlockStyleCSS(style);
    const padding = getEffectivePadding({ x: 20, y: 16 }, style);  // Default: 16px top/bottom, 20px left/right
    const alignmentMap = {
        left: "flex-start",
        center: "center",
        right: "flex-end",
    } as const;

    const enabledIcons = data.icons.filter(icon => icon.enabled && icon.url);

    if (enabledIcons.length === 0) {
        return (
            <div
                className="flex items-center justify-center py-6"
                style={{
                    paddingTop: padding.top,
                    paddingBottom: padding.bottom,
                    paddingLeft: padding.left,
                    paddingRight: padding.right,
                    backgroundColor: blockStyle.backgroundColor,
                    borderRadius: blockStyle.borderRadius,
                }}
            >
                <div className="text-center text-gray-400">
                    <div className="text-2xl mb-1">🔗</div>
                    <div className="text-sm">Add social links in properties</div>
                </div>
            </div>
        );
    }

    // Global defaults
    const globalShowBg = data.showBackground !== false;
    const globalBgRadius = data.backgroundRadius ?? 50;
    const globalIconStyle = data.iconStyle ?? "white"; // Default to white for CDN icons

    return (
        <div
            style={{
                display: "flex",
                justifyContent: alignmentMap[data.alignment || "center"],
                gap: `${data.iconSpacing || 12}px`,
                paddingTop: padding.top,
                paddingBottom: padding.bottom,
                paddingLeft: padding.left,
                paddingRight: padding.right,
                backgroundColor: blockStyle.backgroundColor,
                borderRadius: blockStyle.borderRadius,
            }}
        >
            {enabledIcons.map((icon, index) => {
                // Per-icon settings with fallback to global
                const iconSize = icon.iconSize ?? data.iconSize ?? 32;
                const iconStyle = icon.iconStyle ?? globalIconStyle;
                const showBg = icon.showBackground ?? globalShowBg;
                const bgColor = icon.backgroundColor ?? data.backgroundColor ?? socialPlatformColors[icon.platform] ?? "#333333";

                // Get CDN icon URL
                const iconUrl = getSocialIconUrl(icon.platform, iconStyle);
                const platformLabel = icon.platform.charAt(0).toUpperCase() + icon.platform.slice(1);

                // Background circle style
                const bgStyle = showBg ? {
                    backgroundColor: bgColor,
                    borderRadius: globalBgRadius === 50 ? "50%" : `${globalBgRadius}%`,
                    padding: "4px",
                } : {};

                // Format URL for email/phone platforms
                const formatUrl = (platform: string, url: string): string => {
                    if (!url) return "";
                    const trimmedUrl = url.trim();
                    if (platform === "email") {
                        return trimmedUrl.toLowerCase().startsWith("mailto:") ? trimmedUrl : `mailto:${trimmedUrl}`;
                    }
                    if (platform === "phone") {
                        return trimmedUrl.toLowerCase().startsWith("tel:")
                            ? trimmedUrl.replace(/\s+/g, "")
                            : `tel:${trimmedUrl.replace(/\s+/g, "")}`;
                    }
                    return trimmedUrl;
                };
                const formattedUrl = formatUrl(icon.platform, icon.url);

                return (
                    <a
                        key={`${icon.platform}-${index}`}
                        href={formattedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: showBg ? iconSize + 8 : iconSize,
                            height: showBg ? iconSize + 8 : iconSize,
                            textDecoration: "none",
                            border: "0",
                            ...bgStyle,
                        }}
                        title={platformLabel}
                    >
                        <img
                            src={iconUrl}
                            alt={platformLabel}
                            style={{
                                display: "block",
                                width: iconSize,
                                height: iconSize,
                                border: 0,
                            }}
                        />
                    </a>
                );
            })}
        </div>
    );
}

// Container Renderer - displays a styled container wrapper (read-only preview)
function ContainerRenderer({ data, style }: { data: ContainerData; style?: BlockStyle }) {
    const alignment = data.alignment || "center";
    const maxWidth = data.maxWidth || 600;
    const layoutDirection = data.layoutDirection || "column";
    const backgroundColor = data.transparentBackground ? "transparent" : (data.backgroundColor || "#ffffff");
    const paddingTop = data.paddingTop ?? 20;
    const paddingRight = data.paddingRight ?? 20;
    const paddingBottom = data.paddingBottom ?? 20;
    const paddingLeft = data.paddingLeft ?? 20;
    const borderWidth = data.borderWidth || 0;
    const borderColor = data.borderColor || "#e5e7eb";
    const borderStyle = data.borderStyle || "solid";
    const borderRadius = data.borderRadius || 0;

    const borderCss = borderWidth > 0 && borderStyle !== "none"
        ? `${borderWidth}px ${borderStyle} ${borderColor}`
        : "1px solid #e5e7eb";

    return (
        <div
            style={{
                display: "flex",
                justifyContent: alignment === "center" ? "center" : alignment === "right" ? "flex-end" : "flex-start",
                padding: "8px",
            }}
        >
            <div
                style={{
                    maxWidth: `${maxWidth}px`,
                    width: "100%",
                    backgroundColor,
                    borderRadius: `${borderRadius}px`,
                    border: borderCss,
                    padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
                    textAlign: "center",
                }}
            >
                <div style={{ color: "#9ca3af", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    📦 Container
                    <span style={{ fontSize: "10px", padding: "2px 6px", background: "#e5e7eb", borderRadius: "4px" }}>
                        {layoutDirection === "row" ? "→ Row" : "↓ Column"}
                    </span>
                    {data.transparentBackground && (
                        <span style={{ fontSize: "10px", padding: "2px 6px", background: "#dbeafe", color: "#2563eb", borderRadius: "4px" }}>
                            Transparent
                        </span>
                    )}
                </div>
                <div style={{ color: "#6b7280", fontSize: "11px", marginTop: "4px" }}>
                    {data.blocks?.length || 0} nested block(s)
                </div>
            </div>
        </div>
    );
}

