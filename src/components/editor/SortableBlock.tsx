"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { EmailBlock, BlockStyle, HeaderImageData, ImageData, TextBlockData, ButtonData, DividerData, FooterData, SpacerData, ColumnsData, SocialIconsData, SocialIconItem, ContainerData } from "@/lib/block-types";
import { EMAIL_STYLES, getPaddingCSS } from "@/lib/email-styles";
import { getBlockStyleCSS } from "@/lib/block-style-helpers";
import { ColumnEditor } from "./ColumnEditor";
import { ContainerEditor } from "./ContainerEditor";

interface SortableBlockProps {
    block: EmailBlock;
    isSelected: boolean;
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
}

import { motion, AnimatePresence } from "framer-motion";

// ... imports remain same ...

export function SortableBlock({
    block,
    isSelected,
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
}: SortableBlockProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id });

    // Dnd-kit handles transform for sorting
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const renderBlockContent = () => {
        const style = block.style;
        switch (block.type) {
            case "HeaderImage":
                return <HeaderImageRenderer data={block.data as HeaderImageData} style={style} />;
            case "Image":
                return <ImageRenderer data={block.data as ImageData} style={style} />;
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
            style={style}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{
                opacity: 1,
                scale: isDragging ? 1.02 : 1,
                zIndex: isDragging ? 999 : (isSelected ? 10 : 0)
            }}
            whileHover={canEdit ? { scale: 1.002 } : undefined}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`editor-block group relative ${isSelected ? "editor-block-selected" : "editor-block-default"}`}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
        >
            {canEdit && (
                <>
                    {(isSelected || isDragging) && (
                        <div className="absolute inset-0 pointer-events-none border-2 border-indigo-500 rounded-lg z-20" />
                    )}

                    {/* Drag Handle */}
                    <div
                        {...attributes}
                        {...listeners}
                        className="absolute left-3 top-3 w-8 h-8 cursor-move opacity-0 group-hover:opacity-100 transition-all duration-200 
                                 bg-gray-800 text-white rounded-md flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 z-50"
                    >
                        <span className="text-white font-bold leading-none rotate-90 tracking-widest text-xs">•••</span>
                    </div>

                    {/* Delete Button */}
                    {onDelete && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="absolute right-3 top-3 w-8 h-8 bg-white border border-red-100 text-red-500 rounded-md opacity-0 
                                     group-hover:opacity-100 flex items-center justify-center hover:bg-red-50 hover:border-red-200 
                                     hover:text-red-600 transition-all duration-200 shadow-sm cursor-pointer hover:scale-110 active:scale-95 z-50"
                        >
                            <span className="text-lg font-bold leading-none">×</span>
                        </div>
                    )}
                </>
            )}

            <div className={canEdit ? "ml-0 transition-all duration-300" : ""}>
                {/* Re-using renderBlockContent logic here conceptually, assuming it calls the function defined outside or above in real code, 
                     but since I am replacing the component, I need to keep the renderBlockContent function available or inline it. 
                     Wait, the previous code had renderBlockContent inside the component. I should keep it there. 
                 */}
                {renderBlockContent()}
            </div>

            {/* Visual Feedback Overlay for Hover */}
            {canEdit && (
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

    const imageElement = (
        <img
            src={data.src}
            alt={data.alt || "Header"}
            style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                border: data.linkUrl ? '0' : undefined,
            }}
        />
    );

    return (
        <div style={{ padding: 0, ...blockStyle }}>
            {data.linkUrl ? (
                <a
                    href={data.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'block',
                        textDecoration: 'none',
                        border: '0',
                    }}
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

    const padding = EMAIL_STYLES.padding.image;

    if (!data.src) {
        return (
            <div
                className="flex justify-center"
                style={{
                    paddingTop: padding.y,
                    paddingBottom: padding.y,
                    paddingLeft: padding.x,
                    paddingRight: padding.x,
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
    let imageStyle: React.CSSProperties = { display: 'block', maxWidth: '100%', height: 'auto' };

    if (data.size === "fill" || data.size === "scale" || !data.size) {
        imageStyle.width = '100%';
    } else if (data.width && data.width !== "auto") {
        imageStyle.width = `${data.width}%`;
    }

    // Add border:0 for email safety when image is linked
    if (data.linkUrl) {
        imageStyle.border = '0';
    }

    const imageElement = (
        <img
            src={data.src}
            alt={data.alt || "Image"}
            style={imageStyle}
        />
    );

    return (
        <div
            style={{
                display: "flex",
                justifyContent: alignmentMap[data.alignment || "center"],
                paddingTop: padding.y,
                paddingBottom: padding.y,
                paddingLeft: padding.x,
                paddingRight: padding.x,
            }}
        >
            {data.linkUrl ? (
                <a
                    href={data.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'block',
                        textDecoration: 'none',
                        border: '0',
                    }}
                >
                    {imageElement}
                </a>
            ) : (
                imageElement
            )}
        </div>
    );
}


// This file contains the fixed TextBlockRenderer function
// Copy this function to replace lines 262-286 in SortableBlock.tsx

function TextBlockRenderer({ data, style }: { data: TextBlockData; style?: BlockStyle }) {
    const padding = EMAIL_STYLES.padding.text;
    const blockStyle = getBlockStyleCSS(style);

    return (
        <div
            style={{
                paddingTop: padding.y,
                paddingBottom: padding.y,
                paddingLeft: padding.x,
                paddingRight: padding.x,
                textAlign: data.alignment || "left",
                color: data.textColor || EMAIL_STYLES.colors.text,
                backgroundColor: data.backgroundColor || "transparent",
                fontFamily: data.fontFamily || EMAIL_STYLES.fonts.default,
                fontWeight: data.fontWeight || "normal",
                fontSize: data.fontSize || EMAIL_STYLES.fonts.sizes.default,
                lineHeight: EMAIL_STYLES.fonts.lineHeight,
                ...blockStyle,
            }}
            dangerouslySetInnerHTML={{ __html: data.content || "<p>Enter text content...</p>" }}
        />
    );
}


function ButtonRenderer({ data, style }: { data: ButtonData; style?: BlockStyle }) {
    const padding = EMAIL_STYLES.padding.button;
    const blockStyle = getBlockStyleCSS(style);

    return (
        <div
            style={{
                paddingTop: padding.y,
                paddingBottom: padding.y,
                paddingLeft: padding.x,
                paddingRight: padding.x,
                textAlign: 'center',
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

    // Footer Image Component
    const FooterImage = data.footerImage?.src ? (
        <div style={{ marginBottom: data.footerImage.position === "above" ? 16 : 0, marginTop: data.footerImage.position === "below" ? 16 : 0 }}>
            {data.footerImage.linkUrl ? (
                <a href={data.footerImage.linkUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', border: 0 }}>
                    <img
                        src={data.footerImage.src}
                        alt={data.footerImage.alt || "Footer image"}
                        style={{ display: 'block', maxWidth: '100%', height: 'auto', margin: '0 auto', border: 0 }}
                    />
                </a>
            ) : (
                <img
                    src={data.footerImage.src}
                    alt={data.footerImage.alt || "Footer image"}
                    style={{ display: 'block', maxWidth: '100%', height: 'auto', margin: '0 auto' }}
                />
            )}
        </div>
    ) : null;

    // Social Icons Component (embedded)
    const SocialIconsSection = data.showSocialIcons && data.socialIcons && data.socialIcons.length > 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
            {data.socialIcons
                .filter(icon => icon.enabled && icon.url)
                .map((icon, idx) => {
                    const iconData = socialIcons[icon.platform];
                    if (!iconData) return null;

                    let fill = iconData.color;
                    if (data.socialIconStyle === "dark") fill = iconData.dark;
                    else if (data.socialIconStyle === "light") fill = "#FFFFFF";
                    else if (data.socialIconStyle === "custom") fill = data.socialIconColor || "#333333";

                    return (
                        <a
                            key={`${icon.platform}-${idx}`}
                            href={icon.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'block', width: data.socialIconSize || 24, height: data.socialIconSize || 24, border: 0 }}
                            title={icon.platform}
                        >
                            <div dangerouslySetInnerHTML={{ __html: iconData.svg(fill) }} style={{ width: '100%', height: '100%' }} />
                        </a>
                    );
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
                fontSize: EMAIL_STYLES.fonts.sizes.footer,
                lineHeight: 1.6,
                color: data.textColor || EMAIL_STYLES.colors.footerText,
                ...blockStyle,
            }}
        >
            {/* Footer image above */}
            {data.footerImage?.position === "above" && FooterImage}

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
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 8 }}>
                    © {data.copyrightYear} {data.companyName || "Your Company"}. All rights reserved.
                </div>
            )}

            {/* Footer image below */}
            {data.footerImage?.position === "below" && FooterImage}
        </div>
    );
}

function SpacerRenderer({ data, style }: { data: SpacerData; style?: BlockStyle }) {
    const height = data.height || EMAIL_STYLES.spacer.default;
    const blockStyle = getBlockStyleCSS(style);

    return (
        <div
            style={{
                height: height,
                lineHeight: `${height}px`,
                fontSize: 0,
                backgroundColor: '#f9fafb',
                ...blockStyle,
            }}
            className="flex items-center justify-center"
        >
            <span className="text-xs text-gray-400">{height}px</span>
        </div>
    );
}

function DividerRenderer({ data, style }: { data: DividerData; style?: BlockStyle }) {
    const color = data.color || "#e5e7eb";
    const thickness = data.thickness || 1;
    const dividerStyle = data.style || "solid";  // Renamed from 'style' to avoid conflict
    const width = data.width || 100;

    return (
        <div
            style={{
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 20,
                paddingRight: 20,
                display: 'flex',
                justifyContent: 'center',
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

    // Handle both number and object padding for backward compatibility
    const padding = typeof data.padding === 'number'
        ? data.padding
        : EMAIL_STYLES.padding.columns;

    const paddingValue = typeof padding === 'number' ? padding : 20;
    const blockStyle = getBlockStyleCSS(style);

    // Calculate widths based on column count
    const widths = columnCount === 1 ? ["100%"] : (columnCount === 2 ? ["50%", "50%"] : ["33.33%", "33.33%", "33.33%"]);

    return (
        <div
            style={{
                display: 'flex',
                gap: `${gap}px`,
                backgroundColor: data.backgroundColor || 'transparent',
                padding: `${paddingValue}px`,
                alignItems: data.alignItems || EMAIL_STYLES.columns.alignItems,
                ...blockStyle,
            }}
        >
            {Array.from({ length: columnCount }).map((_, idx) => (
                <div
                    key={idx}
                    style={{
                        width: widths[idx],
                        minHeight: 100,
                    }}
                    className="border border-dashed border-gray-200 rounded p-2 flex flex-col justify-center hover:bg-gray-50 hover:border-indigo-200 transition-colors"
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
};

function SocialIconsRenderer({ data, style }: { data: SocialIconsData; style?: BlockStyle }) {
    const blockStyle = getBlockStyleCSS(style);
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
                style={blockStyle}
            >
                <div className="text-center text-gray-400">
                    <div className="text-2xl mb-1">🔗</div>
                    <div className="text-sm">Add social links in properties</div>
                </div>
            </div>
        );
    }

    const getIconColor = (platform: string) => {
        const iconData = socialIcons[platform];
        if (!iconData) return "#666666";

        switch (data.iconStyle) {
            case "dark": return iconData.dark;
            case "light": return "#FFFFFF";
            case "custom": return data.customColor || "#333333";
            default: return iconData.color;
        }
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: alignmentMap[data.alignment || "center"],
                gap: `${data.iconSpacing || 12}px`,
                padding: "16px 20px",
                ...blockStyle,
            }}
        >
            {enabledIcons.map((icon, index) => {
                const iconData = socialIcons[icon.platform];
                if (!iconData) return null;

                const fill = getIconColor(icon.platform);

                return (
                    <a
                        key={`${icon.platform}-${index}`}
                        href={icon.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: "block",
                            width: data.iconSize || 32,
                            height: data.iconSize || 32,
                            textDecoration: "none",
                            border: "0",
                        }}
                        title={icon.platform.charAt(0).toUpperCase() + icon.platform.slice(1)}
                    >
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                            }}
                            dangerouslySetInnerHTML={{ __html: iconData.svg(fill) }}
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
    const backgroundColor = data.backgroundColor || "#ffffff";
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
                <div style={{ color: "#9ca3af", fontSize: "12px" }}>
                    📦 Container ({maxWidth}px)
                </div>
                <div style={{ color: "#6b7280", fontSize: "11px", marginTop: "4px" }}>
                    {data.blocks?.length || 0} nested block(s)
                </div>
            </div>
        </div>
    );
}

