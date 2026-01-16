"use client";

import { useState } from "react";
import { useDroppable, DragOverEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import type { EmailBlock, ContainerData } from "@/lib/block-types";
import { SortableBlock } from "./SortableBlock";

interface ContainerEditorProps {
    block: EmailBlock;
    isSelected: boolean;
    onUpdate: (newData: ContainerData) => void;
    onUpdateContainerBlock: (containerId: string, blockId: string, newData: any) => void;
    onDeleteContainerBlock: (containerId: string, blockId: string) => void;
    onSelectBlock: (blockId: string) => void;
    previewMode?: "desktop" | "mobile";
}

// Drop indicator component for nested containers
function NestedDropIndicator({ show }: { show: boolean }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, scaleX: 0.8 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0.8 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="relative h-1 mx-2 my-1"
                >
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 rounded-full shadow-lg" />
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 bg-purple-400/30 blur-sm rounded-full" />
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-purple-500 rounded-full shadow-md" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-purple-500 rounded-full shadow-md" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export function ContainerEditor({
    block,
    isSelected,
    onUpdate,
    onUpdateContainerBlock,
    onDeleteContainerBlock,
    onSelectBlock,
    previewMode = "desktop",
}: ContainerEditorProps) {
    const data = block.data as ContainerData;
    const alignment = data.alignment || "center";
    const maxWidth = data.maxWidth || 600;
    const blocks = data.blocks || [];

    // Track which block is being hovered for drop indicator
    const [overBlockId, setOverBlockId] = useState<string | null>(null);

    // Determine effective layout direction based on preview mode
    const desktopLayout = data.layoutDirection || "column";
    const mobileLayout = data.mobileLayoutDirection || desktopLayout;
    const layoutDirection = previewMode === "mobile" ? mobileLayout : desktopLayout;

    // Use ContainerData styling properties for WYSIWYG
    const isTransparent = data.transparentBackground || false;
    const backgroundColor = isTransparent ? "transparent" : (data.backgroundColor || "#ffffff");
    const paddingTop = data.paddingTop ?? 0;
    const paddingRight = data.paddingRight ?? 0;
    const paddingBottom = data.paddingBottom ?? 0;
    const paddingLeft = data.paddingLeft ?? 0;
    const borderWidth = data.borderWidth || 0;
    const borderColor = data.borderColor || "#e5e7eb";
    const borderStyle = data.borderStyle || "solid";
    const borderRadius = data.borderRadius || 0;

    const { setNodeRef, isOver } = useDroppable({
        id: `container-${block.id}`,
        data: {
            type: 'container',
            containerId: block.id,
        },
    });

    // Build border style string - no default border, only show on hover or if user sets one
    const borderCss = borderWidth > 0 && borderStyle !== "none"
        ? `${borderWidth}px ${borderStyle} ${borderColor}`
        : isOver ? "2px dashed #8b5cf6" : "none";

    // Background image styles
    const hasBackgroundImage = !!data.backgroundImage;
    const backgroundStyles: React.CSSProperties = hasBackgroundImage ? {
        backgroundImage: `url(${data.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: Math.max(data.backgroundMinHeight || 200, 80),
    } : {};

    return (
        <div
            style={{
                display: "flex",
                justifyContent: alignment === "center" ? "center" : alignment === "right" ? "flex-end" : "flex-start",
                padding: "8px",
            }}
        >
            <motion.div
                ref={setNodeRef}
                layout
                style={{
                    maxWidth: `${maxWidth}px`,
                    width: "100%",
                    backgroundColor: isOver ? "rgba(139, 92, 246, 0.05)" : backgroundColor,
                    borderRadius: `${borderRadius}px`,
                    border: borderCss,
                    padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
                    minHeight: hasBackgroundImage ? data.backgroundMinHeight || 200 : 80,
                    ...backgroundStyles,
                }}
                animate={{
                    backgroundColor: isOver ? "rgba(139, 92, 246, 0.05)" : backgroundColor,
                }}
                transition={{
                    duration: 0.2,
                    layout: { type: "spring", stiffness: 500, damping: 35 }
                }}
            >
                {/* Nested Blocks Area */}
                <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                    {blocks.length === 0 ? (
                        <motion.div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "24px",
                                color: "#9ca3af",
                                fontSize: "12px",
                                textAlign: "center",
                                border: "1px dashed #d1d5db",
                                backgroundColor: "#f9fafb",
                            }}
                            animate={{
                                borderColor: isOver ? "#8b5cf6" : "#d1d5db",
                                scale: isOver ? 1.02 : 1,
                            }}
                            transition={{ duration: 0.2 }}
                        >
                            📦 Drop blocks here
                        </motion.div>
                    ) : (
                        <motion.div
                            layout
                            style={{
                                display: "flex",
                                flexDirection: layoutDirection === "row" ? "row" : "column",
                                gap: "8px",
                                flexWrap: layoutDirection === "row" ? "wrap" : "nowrap",
                                alignItems: data.verticalAlignment === "center" ? "center" : data.verticalAlignment === "end" ? "flex-end" : "flex-start",
                                justifyContent: layoutDirection === "column" && data.verticalAlignment === "center" ? "center" : layoutDirection === "column" && data.verticalAlignment === "end" ? "flex-end" : "flex-start",
                                minHeight: layoutDirection === "column" ? "100%" : "auto",
                            }}
                            transition={{
                                layout: { type: "spring", stiffness: 500, damping: 35 }
                            }}
                        >
                            {blocks.map((nestedBlock, index) => (
                                <motion.div
                                    key={nestedBlock.id}
                                    layout
                                    style={{
                                        flex: layoutDirection === "row" ? "0 1 auto" : "0 0 auto",
                                        minWidth: layoutDirection === "row" ? "100px" : "auto",
                                        maxWidth: layoutDirection === "row" ? `calc(${100 / Math.max(blocks.length, 1)}% - 8px)` : "100%",
                                        overflow: "hidden",
                                    }}
                                    transition={{
                                        layout: { type: "spring", stiffness: 500, damping: 35 }
                                    }}
                                >
                                    <SortableBlock
                                        block={nestedBlock}
                                        isSelected={false}
                                        onSelect={() => onSelectBlock(nestedBlock.id)}
                                        onUpdate={(newData) => {
                                            onUpdateContainerBlock(block.id, nestedBlock.id, newData);
                                        }}
                                        onDelete={() => onDeleteContainerBlock(block.id, nestedBlock.id)}
                                        canEdit={true}
                                        // Pass container handlers for nested containers
                                        onUpdateContainerBlock={onUpdateContainerBlock}
                                        onDeleteContainerBlock={onDeleteContainerBlock}
                                        onSelectContainerBlock={onSelectBlock}
                                        previewMode={previewMode}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </SortableContext>
            </motion.div>
        </div>
    );
}
