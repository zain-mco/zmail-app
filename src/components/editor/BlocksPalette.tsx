"use client";

import { useDraggable } from "@dnd-kit/core";
import { BlockType, blockRegistry } from "@/lib/block-types";
import { BlockIconWithBackground, blockGradients } from "./BlockIcons";
import { motion } from "framer-motion";

interface BlocksPaletteProps {
    onAddBlock: (type: BlockType) => void;
}

export function BlocksPalette({ onAddBlock }: BlocksPaletteProps) {
    const blocks: BlockType[] = [
        "HeaderImage",
        "Image",
        "TextBlock",
        "Button",
        "Divider",
        "Spacer",
        "SocialIcons",
        "Columns",
        "Container",
        "Footer",
    ];

    return (
        <div className="space-y-2">
            {blocks.map((type, index) => (
                <DraggableBlockItem
                    key={type}
                    type={type}
                    onAdd={() => onAddBlock(type)}
                    index={index}
                />
            ))}
        </div>
    );
}

interface DraggableBlockItemProps {
    type: BlockType;
    onAdd: () => void;
    index: number;
}

function DraggableBlockItem({ type, onAdd, index }: DraggableBlockItemProps) {
    const { label, description } = blockRegistry[type];
    const gradient = blockGradients[type] || { from: "#6366f1", to: "#8b5cf6", bg: "rgba(99, 102, 241, 0.1)" };

    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `palette-${type}`,
        data: { type }
    });

    return (
        <motion.div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            onClick={onAdd}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 30 }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            className={`group relative bg-white rounded-xl p-3 cursor-grab transition-all duration-300 border border-transparent hover:border-gray-200 hover:shadow-lg ${isDragging ? "opacity-80 scale-105 shadow-2xl border-indigo-400 ring-2 ring-indigo-200 rotate-2 z-50" : ""}`}
            style={{
                touchAction: "none",
                boxShadow: isDragging ? `0 8px 30px ${gradient.bg.replace('0.1', '0.4')}` : undefined,
            }}
        >
            {/* Hover glow effect */}
            <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                    background: `linear-gradient(135deg, ${gradient.bg}, transparent)`,
                }}
            />

            <div className="flex items-center gap-3 relative z-10">
                <BlockIconWithBackground type={type} size={42} />
                <div className="flex-1 min-w-0">
                    <div
                        className="text-sm font-semibold text-gray-800 group-hover:text-gray-900 transition-colors truncate"
                        style={{
                            // Subtle gradient text on hover
                        }}
                    >
                        {label}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 group-hover:text-gray-600 transition-colors truncate">
                        {description}
                    </div>
                </div>

                {/* Drag indicator */}
                <div className="opacity-0 group-hover:opacity-50 transition-opacity">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 6a2 2 0 100-4 2 2 0 000 4zM16 6a2 2 0 100-4 2 2 0 000 4zM8 14a2 2 0 100-4 2 2 0 000 4zM16 14a2 2 0 100-4 2 2 0 000 4zM8 22a2 2 0 100-4 2 2 0 000 4zM16 22a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                </div>
            </div>
        </motion.div>
    );
}

