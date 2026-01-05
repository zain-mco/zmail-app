"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
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
}

export function ColumnEditor({
    block,
    isSelected,
    onUpdate,
    onUpdateColumnBlock,
    onDeleteColumnBlock,
    onSelectBlock,
}: ColumnEditorProps) {
    const data = block.data as ColumnsData;
    const columnCount = data.columnCount || 2;
    const gap = data.gap || EMAIL_STYLES.columns.gap;
    const padding = data.padding ?? 20; // Default to 20px

    const widths = columnCount === 1 ? ["100%"] : (columnCount === 2 ? ["50%", "50%"] : ["33.33%", "33.33%", "33.33%"]);

    return (
        <div
            className="relative"
            style={{
                backgroundColor: data.backgroundColor || 'transparent',
                padding: `${padding}px`,
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
}

function Column({
    parentBlockId,
    columnIdx,
    blocks,
    width,
    onSelectBlock,
    onUpdateBlock,
    onDeleteBlock,
}: ColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: `column-${parentBlockId}-${columnIdx}`,
        data: {
            type: 'column',
            parentBlockId,
            columnIdx
        },
    });

    return (
        <div
            ref={setNodeRef}
            style={{ width }}
            className={`border-2 border-dashed rounded min-h-[200px] p-2 
        ${isOver ? "border-blue-400 bg-blue-50" : "border-gray-300"}`}
        >
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                {blocks.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        Drop blocks here
                    </div>
                ) : (
                    blocks.map((nestedBlock) => (
                        <SortableBlock
                            key={nestedBlock.id}
                            block={nestedBlock}
                            isSelected={false}
                            onSelect={() => onSelectBlock(nestedBlock.id)}
                            onUpdate={(newData) => {
                                // Update nested block data
                                onUpdateBlock(nestedBlock.id, newData);
                            }}
                            onDelete={() => onDeleteBlock(nestedBlock.id)}
                            canEdit={true}
                        />
                    ))
                )}
            </SortableContext>
        </div>
    );
}
