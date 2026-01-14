"use client";

import { motion } from "framer-motion";
import { BlockIcon, blockGradients } from "./BlockIcons";

interface DragOverlayContentProps {
    blockType: string;
    isPalette?: boolean;
}

// Human-readable block type labels
const blockLabels: Record<string, string> = {
    HeaderImage: "Header Image",
    Image: "Image",
    Gif: "GIF",
    TextBlock: "Text Block",
    Button: "Button",
    Divider: "Divider",
    Spacer: "Spacer",
    SocialIcons: "Social Icons",
    Columns: "Columns",
    Container: "Container",
    Footer: "Footer",
};

export function DragOverlayContent({ blockType, isPalette = false }: DragOverlayContentProps) {
    const gradient = blockGradients[blockType] || { from: "#6366f1", to: "#8b5cf6", bg: "rgba(99, 102, 241, 0.1)" };
    const label = blockLabels[blockType] || blockType;

    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1.05, opacity: 1 }}
            className="flex items-center gap-3 px-4 py-3 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-100 cursor-grabbing"
            style={{
                boxShadow: `
                    0 25px 50px -12px rgba(0, 0, 0, 0.25),
                    0 0 0 1px rgba(0, 0, 0, 0.05),
                    inset 0 1px 0 rgba(255, 255, 255, 0.8)
                `,
                minWidth: 140,
            }}
        >
            {/* Icon with gradient background */}
            <div
                className="flex items-center justify-center rounded-lg"
                style={{
                    width: 36,
                    height: 36,
                    background: `linear-gradient(135deg, ${gradient.bg}, ${gradient.bg.replace('0.1', '0.25')})`,
                }}
            >
                <BlockIcon type={blockType} size={20} />
            </div>

            {/* Label */}
            <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800">{label}</span>
                {isPalette && (
                    <span className="text-[10px] text-gray-400 font-medium">Drop to add</span>
                )}
            </div>

            {/* Accent line */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                style={{
                    background: `linear-gradient(180deg, ${gradient.from}, ${gradient.to})`,
                }}
            />
        </motion.div>
    );
}

// Simplified overlay for reordering existing blocks
export function DragOverlayBlock({ blockType }: { blockType: string }) {
    const gradient = blockGradients[blockType] || { from: "#6366f1", to: "#8b5cf6", bg: "rgba(99, 102, 241, 0.1)" };
    const label = blockLabels[blockType] || blockType;

    return (
        <motion.div
            initial={{ scale: 0.98, opacity: 0.9 }}
            animate={{ scale: 1.02, opacity: 0.95 }}
            className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl border border-indigo-200 cursor-grabbing"
            style={{
                boxShadow: `
                    0 20px 40px -12px rgba(99, 102, 241, 0.3),
                    0 0 0 2px rgba(99, 102, 241, 0.2)
                `,
            }}
        >
            <BlockIcon type={blockType} size={18} />
            <span className="text-xs font-semibold text-gray-700">{label}</span>
        </motion.div>
    );
}
