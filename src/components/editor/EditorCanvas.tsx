"use client";

import { useDroppable } from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import { SortableBlock } from "./SortableBlock";
import { EmailBlock } from "@/lib/block-types";
import { EMAIL_STYLES } from "@/lib/email-styles";

interface EditorCanvasProps {
    blocks: EmailBlock[];
    selectedBlockId: string | null;
    activeId: string | null; // Currently dragging block ID
    overBlockId: string | null; // Block being hovered over
    onSelectBlock: (id: string | null) => void;
    onDeleteBlock?: (id: string) => void;
    onUpdateBlock?: (id: string, newData: any) => void;
    canEdit: boolean;
    onUpdateColumnBlock?: (parentId: string, columnIdx: number, blockId: string, newData: any) => void;
    onDeleteColumnBlock?: (parentId: string, columnIdx: number, blockId: string) => void;
    // Container handlers
    onUpdateContainerBlock?: (containerId: string, blockId: string, newData: any) => void;
    onDeleteContainerBlock?: (containerId: string, blockId: string) => void;
    // Background styling
    contentBackground?: string;
    // Preview mode for responsive layout
    previewMode?: "desktop" | "mobile";
}

// Drop indicator component - shows where the block will land
function DropIndicator({ show }: { show: boolean }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, scaleX: 0.8 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0.8 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="relative h-1 mx-4 my-1"
                >
                    {/* Main indicator line */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full shadow-lg" />
                    {/* Glow effect */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 bg-indigo-400/30 blur-sm rounded-full" />
                    {/* End dots */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-500 rounded-full shadow-md" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-500 rounded-full shadow-md" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export function EditorCanvas({
    blocks,
    selectedBlockId,
    activeId,
    overBlockId,
    onSelectBlock,
    onDeleteBlock,
    onUpdateBlock,
    canEdit,
    onUpdateColumnBlock,
    onDeleteColumnBlock,
    onUpdateContainerBlock,
    onDeleteContainerBlock,
    contentBackground = "#ffffff",
    previewMode = "desktop",
}: EditorCanvasProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: "canvas",
    });

    // Empty state
    if (blocks.length === 0) {
        return (
            <motion.div
                ref={setNodeRef}
                className="flex items-center justify-center"
                style={{
                    background: contentBackground,
                    minHeight: 400
                }}
                animate={{
                    backgroundColor: isOver && activeId ? "rgba(99, 102, 241, 0.05)" : "transparent"
                }}
                transition={{ duration: 0.2 }}
            >
                <motion.div
                    className="flex items-center justify-center border-2 border-dashed rounded m-4"
                    style={{
                        width: EMAIL_STYLES.containerWidth - 32,
                        minHeight: 350,
                    }}
                    animate={{
                        borderColor: isOver && activeId ? "rgba(99, 102, 241, 0.5)" : "rgba(209, 213, 219, 0.5)",
                        scale: isOver && activeId ? 1.01 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="text-center text-gray-400">
                        <motion.div
                            className="text-4xl mb-2"
                            animate={{ scale: isOver && activeId ? 1.1 : 1 }}
                            transition={{ type: "spring", stiffness: 400 }}
                        >
                            📧
                        </motion.div>
                        <p className="text-sm">
                            {isOver && activeId ? "Drop here to add" : "Drag blocks here to start building"}
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        );
    }

    // Check if we're dragging (not from palette) and determine drop position
    const isDraggingExisting = activeId && !activeId.startsWith("palette-");

    return (
        <div
            ref={setNodeRef}
            style={{
                background: contentBackground,
                minHeight: 400
            }}
        >
            {/* Email content area with layout animations */}
            <motion.div
                layout
                style={{ width: '100%' }}
                transition={{
                    layout: {
                        type: "spring",
                        stiffness: 500,
                        damping: 35
                    }
                }}
            >
                {blocks.map((block, index) => {
                    // Show drop indicator before this block if it's the one being hovered
                    const showIndicatorBefore = !!(isDraggingExisting &&
                        overBlockId === block.id &&
                        activeId !== block.id);

                    return (
                        <motion.div
                            key={block.id || `temp-block-${index}`}
                            layout
                            transition={{
                                layout: {
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 35,
                                }
                            }}
                        >
                            {/* Drop indicator line */}
                            <DropIndicator show={showIndicatorBefore} />

                            <SortableBlock
                                block={block}
                                isSelected={selectedBlockId === block.id}
                                isDragging={activeId === block.id}
                                onSelect={() => onSelectBlock(block.id)}
                                onUpdate={(newData) => {
                                    if (onUpdateBlock) {
                                        onUpdateBlock(block.id, newData);
                                    }
                                }}
                                onDelete={onDeleteBlock ? () => onDeleteBlock(block.id) : undefined}
                                canEdit={canEdit}
                                onUpdateColumnBlock={onUpdateColumnBlock}
                                onDeleteColumnBlock={onDeleteColumnBlock}
                                onSelectColumnBlock={onSelectBlock}
                                onUpdateContainerBlock={onUpdateContainerBlock}
                                onDeleteContainerBlock={onDeleteContainerBlock}
                                onSelectContainerBlock={onSelectBlock}
                                previewMode={previewMode}
                            />
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}
