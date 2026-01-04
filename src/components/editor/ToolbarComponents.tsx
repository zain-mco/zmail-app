"use client";

import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Toolbar Button with tooltip
interface ToolbarButtonProps {
    icon: React.ReactNode;
    label: string;
    shortcut?: string;
    onClick?: () => void;
    active?: boolean;
    disabled?: boolean;
    variant?: "default" | "primary" | "success" | "danger";
}

export function ToolbarButton({
    icon,
    label,
    shortcut,
    onClick,
    active = false,
    disabled = false,
    variant = "default",
}: ToolbarButtonProps) {
    const variantClasses = {
        default: active
            ? "bg-white text-indigo-700 shadow-sm ring-1 ring-black/5"
            : "text-gray-600 hover:text-gray-900 hover:bg-white/80",
        primary: "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-sm",
        success: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-sm",
        danger: "text-gray-600 hover:text-red-600 hover:bg-red-50",
    };

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    onClick={onClick}
                    disabled={disabled}
                    className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${variantClasses[variant]}`}
                >
                    {icon}
                </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="flex items-center gap-2">
                <span>{label}</span>
                {shortcut && (
                    <span className="text-[10px] font-mono opacity-70 bg-white/20 px-1.5 py-0.5 rounded">
                        {shortcut}
                    </span>
                )}
            </TooltipContent>
        </Tooltip>
    );
}

// Toolbar divider
export function ToolbarDivider() {
    return <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-2" />;
}

// Toolbar group
export function ToolbarGroup({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`flex items-center gap-0.5 bg-gray-100/80 p-1 rounded-xl border border-gray-200/50 ${className}`}>
            {children}
        </div>
    );
}

// Toolbar label for groups
export function ToolbarLabel({ children }: { children: React.ReactNode }) {
    return (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-2">
            {children}
        </span>
    );
}

// Icons for toolbar
export const ToolbarIcons = {
    undo: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
    ),
    redo: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
        </svg>
    ),
    desktop: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth={2} />
            <path d="M8 21h8" strokeWidth={2} strokeLinecap="round" />
            <path d="M12 17v4" strokeWidth={2} strokeLinecap="round" />
        </svg>
    ),
    mobile: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth={2} />
            <path d="M12 18h.01" strokeWidth={2} strokeLinecap="round" />
        </svg>
    ),
    save: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
    ),
    export: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
    ),
    back: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
    ),
    zoomIn: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
        </svg>
    ),
    zoomOut: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
        </svg>
    ),
    duplicate: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    ),
    moveUp: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
    ),
    moveDown: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    ),
    trash: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    ),
};
