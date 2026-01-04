"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BlocksPalette } from "./BlocksPalette";
import { EditorCanvas } from "./EditorCanvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { ExportModal } from "./ExportModal";
import { ToolbarButton, ToolbarDivider, ToolbarGroup, ToolbarIcons } from "./ToolbarComponents";
import { generateEmailHTML } from "@/lib/email-export";
import { EmailContent, BlockType, defaultBlockData, EmailBlock, ColumnsData } from "@/lib/block-types";

interface EditorWorkspaceProps {
    campaignId: string;
    campaignTitle: string;
    initialContent: EmailContent;
    canEdit: boolean;
    permission: string;
}

export function EditorWorkspace({
    campaignId,
    campaignTitle,
    initialContent,
    canEdit,
    permission,
}: EditorWorkspaceProps) {
    // Validate and fix block IDs BEFORE initial state setup
    const validateBlocks = useCallback((inputBlocks: EmailBlock[]): EmailBlock[] => {
        const generateId = () => `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const usedIds = new Set<string>();
        let fixedCount = 0;

        const validated = inputBlocks.map(block => {
            if (!block.id || block.id === "" || usedIds.has(block.id)) {
                fixedCount++;
                const newId = generateId();
                console.warn(`Block with ${block.id ? `duplicate ID "${block.id}"` : 'empty ID'} found, assigning new ID: ${newId}`);
                usedIds.add(newId);
                return { ...block, id: newId };
            }
            usedIds.add(block.id);
            return block;
        });

        if (fixedCount > 0) {
            console.log(`✅ Fixed ${fixedCount} blocks with duplicate/empty IDs`);
        }

        return validated;
    }, []);

    // Use validated blocks from database - ensure all have unique IDs
    const [blocks, setBlocks] = useState<EmailBlock[]>(() => validateBlocks(initialContent.blocks || []));
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
    const [isMounted, setIsMounted] = useState(false);

    // Re-validate if initialContent changes
    useEffect(() => {
        const validated = validateBlocks(initialContent.blocks || []);
        setBlocks(validated);
    }, [initialContent.blocks, validateBlocks]);

    // Fix for dnd-kit hydration mismatch - only render after mount
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Find selected block (including nested blocks in columns and containers)
    const selectedBlock = useMemo(() => {
        if (!selectedBlockId) return null;

        // Check top-level blocks
        const topLevel = blocks.find((b) => b.id === selectedBlockId);
        if (topLevel) return topLevel;

        // Search in columns and containers
        for (const block of blocks) {
            if (block.type === "Columns") {
                const columnsData = block.data as ColumnsData;
                for (const column of columnsData.columns) {
                    const nested = column.find((b) => b.id === selectedBlockId);
                    if (nested) return nested;
                }
            }
            // Search in containers
            if (block.type === "Container") {
                const containerData = block.data as any;
                if (containerData.blocks) {
                    const nested = containerData.blocks.find((b: EmailBlock) => b.id === selectedBlockId);
                    if (nested) return nested;
                }
            }
        }
        return null;
    }, [blocks, selectedBlockId]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Generate unique ID for new blocks
    const generateId = useCallback(() => `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, []);



    // Add new block
    const handleAddBlock = useCallback((type: BlockType) => {
        const newBlock: EmailBlock = {
            id: generateId(),
            type,
            data: { ...defaultBlockData[type] },
        };
        setBlocks((prev) => [...prev, newBlock]);
        setSelectedBlockId(newBlock.id);
    }, []);

    // Update block data and style (handles both top-level and nested blocks)
    const handleUpdateBlock = useCallback((id: string, data: EmailBlock["data"], style?: EmailBlock["style"]) => {
        setBlocks((prev) => {
            // First check if it's a top-level block
            const topLevelBlock = prev.find((block) => block.id === id);
            if (topLevelBlock) {
                return prev.map((block) =>
                    block.id === id
                        ? { ...block, data, ...(style !== undefined && { style }) }
                        : block
                );
            }

            // If not found at top level, search in columns and containers
            return prev.map((block) => {
                // Search in Columns
                if (block.type === "Columns") {
                    const columnsData = block.data as ColumnsData;
                    let found = false;

                    const updatedColumns = columnsData.columns.map((column) =>
                        column.map((nestedBlock) => {
                            if (nestedBlock.id === id) {
                                found = true;
                                return { ...nestedBlock, data, ...(style !== undefined && { style }) };
                            }
                            return nestedBlock;
                        })
                    );

                    if (found) {
                        return {
                            ...block,
                            data: { ...columnsData, columns: updatedColumns },
                        };
                    }
                }

                // Search in Containers
                if (block.type === "Container") {
                    const containerData = block.data as any;
                    if (containerData.blocks) {
                        let found = false;
                        const updatedBlocks = containerData.blocks.map((nestedBlock: EmailBlock) => {
                            if (nestedBlock.id === id) {
                                found = true;
                                return { ...nestedBlock, data, ...(style !== undefined && { style }) };
                            }
                            return nestedBlock;
                        });

                        if (found) {
                            return {
                                ...block,
                                data: { ...containerData, blocks: updatedBlocks },
                            };
                        }
                    }
                }

                return block;
            });
        });
    }, []);

    // Delete block
    const handleDeleteBlock = useCallback((id: string) => {
        setBlocks((prev) => prev.filter((block) => block.id !== id));
        if (selectedBlockId === id) {
            setSelectedBlockId(null);
        }
    }, [selectedBlockId]);

    // Update block in column
    const handleUpdateColumnBlock = useCallback((parentId: string, columnIdx: number, blockId: string, newData: any) => {
        setBlocks((prev) =>
            prev.map((block) => {
                if (block.id === parentId && block.type === "Columns") {
                    const columnsData = block.data as any;
                    const newColumns = columnsData.columns.map((col: EmailBlock[], idx: number) => {
                        if (idx === columnIdx) {
                            return col.map((b) => (b.id === blockId ? { ...b, data: newData } : b));
                        }
                        return col;
                    });
                    return { ...block, data: { ...columnsData, columns: newColumns } };
                }
                return block;
            })
        );
    }, []);

    // Delete block from column
    const handleDeleteColumnBlock = useCallback((parentId: string, columnIdx: number, blockId: string) => {
        setBlocks((prev) =>
            prev.map((block) => {
                if (block.id === parentId && block.type === "Columns") {
                    const columnsData = block.data as any;
                    const newColumns = columnsData.columns.map((col: EmailBlock[], idx: number) => {
                        if (idx === columnIdx) {
                            return col.filter((b) => b.id !== blockId);
                        }
                        return col;
                    });
                    return { ...block, data: { ...columnsData, columns: newColumns } };
                }
                return block;
            })
        );
        if (selectedBlockId === blockId) {
            setSelectedBlockId(null);
        }
    }, [selectedBlockId]);

    // Update block in container
    const handleUpdateContainerBlock = useCallback((containerId: string, blockId: string, newData: any) => {
        setBlocks((prev) =>
            prev.map((block) => {
                if (block.id === containerId && block.type === "Container") {
                    const containerData = block.data as any;
                    const updatedBlocks = (containerData.blocks || []).map((b: EmailBlock) =>
                        b.id === blockId ? { ...b, data: newData } : b
                    );
                    return { ...block, data: { ...containerData, blocks: updatedBlocks } };
                }
                return block;
            })
        );
    }, []);

    // Delete block from container
    const handleDeleteContainerBlock = useCallback((containerId: string, blockId: string) => {
        setBlocks((prev) =>
            prev.map((block) => {
                if (block.id === containerId && block.type === "Container") {
                    const containerData = block.data as any;
                    const filteredBlocks = (containerData.blocks || []).filter((b: EmailBlock) => b.id !== blockId);
                    return { ...block, data: { ...containerData, blocks: filteredBlocks } };
                }
                return block;
            })
        );
        if (selectedBlockId === blockId) {
            setSelectedBlockId(null);
        }
    }, [selectedBlockId]);

    // Drag handlers
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        // Check if dropping into a column or container
        const overData = over.data?.current;
        const isDroppingIntoColumn = overData?.type === 'column';
        const isDroppingIntoContainer = overData?.type === 'container';

        // If dragging from palette (new block)
        if (active.id.toString().startsWith("palette-")) {
            const blockType = active.id.toString().replace("palette-", "") as BlockType;
            const newBlock: EmailBlock = {
                id: generateId(),
                type: blockType,
                data: { ...defaultBlockData[blockType] },
            };

            if (isDroppingIntoColumn) {
                // Add to specific column
                const { parentBlockId, columnIdx } = overData;
                setBlocks((prev) =>
                    prev.map((block) => {
                        if (block.id === parentBlockId && block.type === "Columns") {
                            const columnsData = block.data as any;
                            const newColumns = [...columnsData.columns];
                            newColumns[columnIdx] = [...newColumns[columnIdx], newBlock];
                            return {
                                ...block,
                                data: { ...columnsData, columns: newColumns },
                            };
                        }
                        return block;
                    })
                );
                setSelectedBlockId(newBlock.id);
            } else if (isDroppingIntoContainer) {
                // Add to container
                const { containerId } = overData;
                setBlocks((prev) =>
                    prev.map((block) => {
                        if (block.id === containerId && block.type === "Container") {
                            const containerData = block.data as any;
                            const updatedBlocks = [...(containerData.blocks || []), newBlock];
                            return {
                                ...block,
                                data: { ...containerData, blocks: updatedBlocks },
                            };
                        }
                        return block;
                    })
                );
                setSelectedBlockId(newBlock.id);
            } else {
                // Add to top level
                setBlocks((prev) => [...prev, newBlock]);
                setSelectedBlockId(newBlock.id);
            }
            return;
        }

        // Reordering existing blocks (top-level only for now)
        if (!isDroppingIntoColumn && !isDroppingIntoContainer && active.id !== over.id) {
            setBlocks((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // Save campaign
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/campaigns/${campaignId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content_json: { blocks },
                    generateHtml: true,
                }),
            });

            if (response.ok) {
                setLastSaved(new Date());
            }
        } catch (error) {
            console.error("Failed to save:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col"
            suppressHydrationWarning
        >
            {/* Enhanced Toolbar */}
            <TooltipProvider delayDuration={300}>
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="border-b border-gray-200 px-4 py-3 flex items-center justify-between z-20"
                    style={{
                        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                    }}
                >
                    {/* Left Section: Back + Title */}
                    <div className="flex items-center gap-3">
                        <ToolbarButton
                            icon={ToolbarIcons.back}
                            label="Back to Dashboard"
                            onClick={() => window.history.back()}
                        />
                        <ToolbarDivider />
                        <div className="flex items-center gap-3">
                            <h1 className="text-base font-bold text-gray-900 tracking-tight max-w-[200px] truncate">
                                {campaignTitle}
                            </h1>
                            <span className="text-[10px] px-2 py-0.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-full font-semibold border border-indigo-100">
                                {permission === "OWNER" ? "Owner" : permission}
                            </span>
                        </div>
                    </div>

                    {/* Center Section: Preview Toggle */}
                    <div className="flex items-center gap-3">
                        <ToolbarGroup>
                            <ToolbarButton
                                icon={ToolbarIcons.desktop}
                                label="Desktop Preview"
                                shortcut="D"
                                onClick={() => setPreviewMode("desktop")}
                                active={previewMode === "desktop"}
                            />
                            <ToolbarButton
                                icon={ToolbarIcons.mobile}
                                label="Mobile Preview"
                                shortcut="M"
                                onClick={() => setPreviewMode("mobile")}
                                active={previewMode === "mobile"}
                            />
                        </ToolbarGroup>
                    </div>

                    {/* Right Section: Actions */}
                    <div className="flex items-center gap-3">
                        {lastSaved && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={lastSaved.getTime()}
                                className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100"
                            >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">Saved</span>
                            </motion.div>
                        )}

                        {canEdit && (
                            <div className="flex items-center gap-2">
                                <ToolbarGroup>
                                    <ToolbarButton
                                        icon={ToolbarIcons.export}
                                        label="Export HTML"
                                        shortcut="Ctrl+E"
                                        onClick={() => setShowExport(true)}
                                        disabled={blocks.length === 0}
                                    />
                                </ToolbarGroup>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            {ToolbarIcons.save}
                                            <span>Save</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </TooltipProvider>

            {/* Editor Layout */}
            <div className="flex-1 flex overflow-hidden lg:flex-row flex-col" suppressHydrationWarning>
                {!isMounted ? (
                    // Loading skeleton during SSR to prevent hydration mismatch with dnd-kit
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-pulse text-gray-400">Loading editor...</div>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        {/* Left: Blocks Palette */}
                        {canEdit && (
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 30 }}
                                className="w-full lg:w-72 border-r border-gray-100 overflow-y-auto z-10"
                                style={{
                                    background: "linear-gradient(180deg, #fafbfc 0%, #ffffff 100%)",
                                }}
                            >
                                {/* Sidebar Header */}
                                <div className="sticky top-0 z-10 px-5 py-4 bg-white/90 backdrop-blur-sm border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500"></div>
                                        <h2 className="font-bold text-xs uppercase tracking-wider text-gray-600">Components</h2>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1 ml-4">Drag or click to add</p>
                                </div>
                                {/* Block Palette */}
                                <div className="p-4">
                                    <BlocksPalette onAddBlock={handleAddBlock} />
                                </div>
                            </motion.div>
                        )}

                        {/* Center: Editor Canvas */}
                        <div className="flex-1 overflow-y-auto p-4 lg:p-8 relative"
                            style={{
                                backgroundColor: "#f8fafc",
                                backgroundSize: "24px 24px",
                                backgroundImage: "radial-gradient(circle, #e2e8f0 1px, transparent 1px)"
                            }}
                        >
                            <motion.div
                                layout
                                className="mx-auto transition-all duration-300 shadow-2xl rounded-lg overflow-hidden bg-white ring-1 ring-black/5"
                                style={{ maxWidth: previewMode === "desktop" ? "640px" : "375px", minHeight: "800px" }}
                            >
                                <SortableContext
                                    items={blocks.map((b) => b.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <EditorCanvas
                                        blocks={blocks}
                                        selectedBlockId={selectedBlockId}
                                        onSelectBlock={setSelectedBlockId}
                                        onDeleteBlock={canEdit ? handleDeleteBlock : undefined}
                                        onUpdateBlock={canEdit ? handleUpdateBlock : undefined}
                                        canEdit={canEdit}
                                        onUpdateColumnBlock={handleUpdateColumnBlock}
                                        onDeleteColumnBlock={handleDeleteColumnBlock}
                                        onUpdateContainerBlock={handleUpdateContainerBlock}
                                        onDeleteContainerBlock={handleDeleteContainerBlock}
                                    />
                                </SortableContext>
                            </motion.div>
                        </div>

                        {/* Right: Properties Panel */}
                        <AnimatePresence mode="wait">
                            {selectedBlock ? (
                                <motion.div
                                    key="properties-panel"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: 20, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="w-full lg:w-80 bg-white border-l border-gray-200 overflow-y-auto shadow-xl z-20"
                                >
                                    <div className="p-6">
                                        <PropertiesPanel
                                            block={selectedBlock}
                                            onUpdate={(data, style) => selectedBlock && handleUpdateBlock(selectedBlock.id, data, style)}
                                            onDelete={() => selectedBlock && handleDeleteBlock(selectedBlock.id)}
                                        />
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty-state"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="hidden lg:flex w-80 bg-gray-50 border-l border-gray-200 items-center justify-center p-8 text-center"
                                >
                                    <div className="text-gray-400">
                                        <div className="text-4xl mb-2">👈</div>
                                        <p className="text-sm font-medium">Select a block to edit its properties</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <DragOverlay>
                            {activeId && activeId.startsWith("palette-") && (
                                <div className="bg-indigo-600 text-white rounded-lg p-3 shadow-2xl font-bold flex items-center gap-3 scale-105 rotate-3 cursor-grabbing z-50">
                                    <span>+</span>
                                    <span>{activeId.replace("palette-", "")}</span>
                                </div>
                            )}
                        </DragOverlay>
                    </DndContext>
                )}
            </div>

            {/* Export Modal */}
            <AnimatePresence>
                {showExport && (
                    <ExportModal
                        campaignId={campaignId}
                        blocks={blocks}
                        onClose={() => setShowExport(false)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
