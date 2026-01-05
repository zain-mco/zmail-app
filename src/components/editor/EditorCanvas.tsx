"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableBlock } from "./SortableBlock";
import { EmailBlock } from "@/lib/block-types";
import { EMAIL_STYLES } from "@/lib/email-styles";

interface EditorCanvasProps {
    blocks: EmailBlock[];
    selectedBlockId: string | null;
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
}

export function EditorCanvas({
    blocks,
    selectedBlockId,
    onSelectBlock,
    onDeleteBlock,
    onUpdateBlock,
    canEdit,
    onUpdateColumnBlock,
    onDeleteColumnBlock,
    onUpdateContainerBlock,
    onDeleteContainerBlock,
    contentBackground = "#ffffff",
}: EditorCanvasProps) {
    const { setNodeRef } = useDroppable({
        id: "canvas",
    });

    // Empty state
    if (blocks.length === 0) {
        return (
            <div
                ref={setNodeRef}
                className="flex items-center justify-center"
                style={{
                    background: contentBackground,
                    minHeight: 400
                }}
            >
                <div
                    className="flex items-center justify-center border-2 border-dashed border-gray-300/50 rounded m-4"
                    style={{
                        width: EMAIL_STYLES.containerWidth - 32,
                        minHeight: 350,
                    }}
                >
                    <div className="text-center text-gray-400">
                        <div className="text-4xl mb-2">📧</div>
                        <p className="text-sm">Drag blocks here to start building</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={{
                background: contentBackground,
                minHeight: 400
            }}
        >
            {/* Email content area */}
            <div style={{ width: '100%' }}>
                {blocks.map((block, index) => (
                    <SortableBlock
                        key={block.id || `temp-block-${index}`}
                        block={block}
                        isSelected={selectedBlockId === block.id}
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
                    />
                ))}
            </div>
        </div>
    );
}
