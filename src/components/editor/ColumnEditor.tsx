"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import type { EmailBlock, ColumnsData } from "@/lib/block-types";
import { EMAIL_STYLES } from "@/lib/email-styles";
import { SortableBlock } from "./SortableBlock";

interface ColumnEditorProps {
    block: EmailBlock;  // The entire Columns block
    isSelected: boolean;
    onUpdate: (newData: ColumnsData) => void;
    onUpdateColumnBlock: (parentId: string, columnIdx: number, blockId: string, newData: any) => void;
    onDeleteColumnBlock: (parentId: string, columnIdx: number, blockId: string) => void;
    onSelectBlock: (blockId: string) => void;
    // Container handlers for nested containers
    onUpdateContainerBlock?: (containerId: string, blockId: string, newData: any) => void;
    onDeleteContainerBlock?: (containerId: string, blockId: string) => void;
    onSelectContainerBlock?: (blockId: string) => void;
}

export function ColumnEditor({
    block,
    isSelected,
    onUpdate,
    onUpdateColumnBlock,
    onDeleteColumnBlock,
    onSelectBlock,
    onUpdateContainerBlock,
    onDeleteContainerBlock,
    onSelectContainerBlock,
}: ColumnEditorProps) {
    const data = block.data as ColumnsData;
    const columnCount = data.columnCount || 2;
    const gap = data.gap || EMAIL_STYLES.columns.gap;
    const padding = data.padding ?? 0; // Default 0 - users control spacing

    const widths = columnCount === 1 ? ["100%"] : (columnCount === 2 ? ["50%", "50%"] : ["33.33%", "33.33%", "33.33%"]);

    // Determine background color - use transparent if flag is set
    const bgColor = data.transparentBackground ? 'transparent' : (data.backgroundColor || 'transparent');

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
            className="relative"
            style={{
                backgroundColor: bgColor,
                padding: `${padding}px`,
                ...backgroundStyles,
            }}
        >

            <div
                style={{
                    display: 'flex',
                    gap: `${gap}px`,
                    alignItems: data.alignItems || EMAIL_STYLES.columns.alignItems,
                }}
            >
                {data.columns.map((column, columnIdx) => (
                    <Column
                        key={columnIdx}
                        parentBlockId={block.id}
                        columnIdx={columnIdx}
                        blocks={column}
                        width={widths[columnIdx]}
                        onSelectBlock={onSelectBlock}
                        onUpdateBlock={(blockId, newData) => {
                            onUpdateColumnBlock(block.id, columnIdx, blockId, newData);
                        }}
                        onDeleteBlock={(blockId) => {
                            onDeleteColumnBlock(block.id, columnIdx, blockId);
                        }}
                        onUpdateContainerBlock={onUpdateContainerBlock}
                        onDeleteContainerBlock={onDeleteContainerBlock}
                        onSelectContainerBlock={onSelectContainerBlock}
                    />
                ))}
            </div>
        </div>
    );
}

interface ColumnProps {
    parentBlockId: string;
    columnIdx: number;
    blocks: EmailBlock[];
    width: string;
    onSelectBlock: (blockId: string) => void;
    onUpdateBlock: (blockId: string, newData: any) => void;
    onDeleteBlock: (blockId: string) => void;
    // Container handlers for nested containers
    onUpdateContainerBlock?: (containerId: string, blockId: string, newData: any) => void;
    onDeleteContainerBlock?: (containerId: string, blockId: string) => void;
    onSelectContainerBlock?: (blockId: string) => void;
}

function Column({
    parentBlockId,
    columnIdx,
    blocks,
    width,
    onSelectBlock,
    onUpdateBlock,
    onDeleteBlock,
    onUpdateContainerBlock,
    onDeleteContainerBlock,
    onSelectContainerBlock,
}: ColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: `column-${parentBlockId}-${columnIdx}`,
        data: {
            type: 'column',
            parentBlockId,
            columnIdx
        },
    });

    // Show editor UI (borders) only when column is empty or being dragged over
    const showEditorUI = blocks.length === 0 || isOver;

    return (
        <motion.div
            ref={setNodeRef}
            style={{ width }}
            className={showEditorUI ? `border-2 border-dashed min-h-[80px]` : ``}
            animate={{
                borderColor: isOver ? "#3b82f6" : "#d1d5db",
                backgroundColor: isOver ? "rgba(59, 130, 246, 0.05)" : "transparent",
            }}
            transition={{ duration: 0.2 }}
        >
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                {blocks.length === 0 ? (
                    <motion.div
                        className="flex items-center justify-center h-full text-gray-400 text-sm p-4"
                        animate={{
                            scale: isOver ? 1.02 : 1,
                        }}
                        transition={{ duration: 0.2 }}
                    >
                        Drop blocks here
                    </motion.div>
                ) : (
                    <motion.div
                        layout
                        transition={{
                            layout: { type: "spring", stiffness: 500, damping: 35 }
                        }}
                    >
                        {blocks.map((nestedBlock) => (
                            <motion.div
                                key={nestedBlock.id}
                                layout
                                transition={{
                                    layout: { type: "spring", stiffness: 500, damping: 35 }
                                }}
                            >
                                <SortableBlock
                                    block={nestedBlock}
                                    isSelected={false}
                                    onSelect={() => onSelectBlock(nestedBlock.id)}
                                    onUpdate={(newData) => {
                                        // Update nested block data
                                        onUpdateBlock(nestedBlock.id, newData);
                                    }}
                                    onDelete={() => onDeleteBlock(nestedBlock.id)}
                                    canEdit={true}
                                    // Pass container handlers for nested containers
                                    onUpdateContainerBlock={onUpdateContainerBlock}
                                    onDeleteContainerBlock={onDeleteContainerBlock}
                                    onSelectContainerBlock={onSelectContainerBlock}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </SortableContext>
        </motion.div>
    );
}
