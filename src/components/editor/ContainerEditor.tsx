"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
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

    // Determine effective layout direction based on preview mode
    const desktopLayout = data.layoutDirection || "column";
    const mobileLayout = data.mobileLayoutDirection || desktopLayout;
    const layoutDirection = previewMode === "mobile" ? mobileLayout : desktopLayout;

    // Use ContainerData styling properties for WYSIWYG
    const isTransparent = data.transparentBackground || false;
    const backgroundColor = isTransparent ? "transparent" : (data.backgroundColor || "#ffffff");
    const paddingTop = data.paddingTop ?? 20;
    const paddingRight = data.paddingRight ?? 20;
    const paddingBottom = data.paddingBottom ?? 20;
    const paddingLeft = data.paddingLeft ?? 20;
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
        : isOver ? "2px dashed #3b82f6" : "none";

    return (
        <div
            style={{
                display: "flex",
                justifyContent: alignment === "center" ? "center" : alignment === "right" ? "flex-end" : "flex-start",
                padding: "8px",
            }}
        >
            <div
                ref={setNodeRef}
                style={{
                    maxWidth: `${maxWidth}px`,
                    width: "100%",
                    backgroundColor: isOver ? "#eff6ff" : backgroundColor,
                    borderRadius: `${borderRadius}px`,
                    border: borderCss,
                    padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
                    minHeight: "80px",
                    transition: "border-color 0.2s, background-color 0.2s",
                }}
            >
                {/* Nested Blocks Area */}
                <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                    {blocks.length === 0 ? (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "24px",
                                color: "#9ca3af",
                                fontSize: "12px",
                                textAlign: "center",
                                border: "1px dashed #d1d5db",
                                borderRadius: "4px",
                                backgroundColor: "#f9fafb",
                            }}
                        >
                            📦 Drop blocks here
                        </div>
                    ) : (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: layoutDirection === "row" ? "row" : "column",
                                gap: "8px",
                                flexWrap: layoutDirection === "row" ? "wrap" : "nowrap",
                                alignItems: data.verticalAlignment === "center" ? "center" : data.verticalAlignment === "end" ? "flex-end" : "flex-start",
                                justifyContent: layoutDirection === "column" && data.verticalAlignment === "center" ? "center" : layoutDirection === "column" && data.verticalAlignment === "end" ? "flex-end" : "flex-start",
                                minHeight: layoutDirection === "column" ? "100%" : "auto",
                            }}
                        >
                            {blocks.map((nestedBlock) => (
                                <div
                                    key={nestedBlock.id}
                                    style={{
                                        flex: layoutDirection === "row" ? "0 1 auto" : "0 0 auto",
                                        minWidth: layoutDirection === "row" ? "100px" : "auto",
                                        maxWidth: layoutDirection === "row" ? `calc(${100 / Math.max(blocks.length, 1)}% - 8px)` : "100%",
                                        overflow: "hidden",
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
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
}

