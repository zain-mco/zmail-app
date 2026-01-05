"use client";

import React from "react";

// Define gradient colors for each block type
export const blockGradients: Record<string, { from: string; to: string; bg: string }> = {
    HeaderImage: { from: "#a855f7", to: "#ec4899", bg: "rgba(168, 85, 247, 0.1)" },
    Image: { from: "#3b82f6", to: "#06b6d4", bg: "rgba(59, 130, 246, 0.1)" },
    Gif: { from: "#f472b6", to: "#c084fc", bg: "rgba(244, 114, 182, 0.1)" },
    TextBlock: { from: "#10b981", to: "#14b8a6", bg: "rgba(16, 185, 129, 0.1)" },
    Button: { from: "#f97316", to: "#ef4444", bg: "rgba(249, 115, 22, 0.1)" },
    Divider: { from: "#64748b", to: "#475569", bg: "rgba(100, 116, 139, 0.1)" },
    Spacer: { from: "#6366f1", to: "#8b5cf6", bg: "rgba(99, 102, 241, 0.1)" },
    SocialIcons: { from: "#ec4899", to: "#f43f5e", bg: "rgba(236, 72, 153, 0.1)" },
    Columns: { from: "#06b6d4", to: "#3b82f6", bg: "rgba(6, 182, 212, 0.1)" },
    Container: { from: "#8b5cf6", to: "#a855f7", bg: "rgba(139, 92, 246, 0.1)" },
    Footer: { from: "#f59e0b", to: "#eab308", bg: "rgba(245, 158, 11, 0.1)" },
};

interface BlockIconProps {
    type: string;
    size?: number;
    className?: string;
}

export function BlockIcon({ type, size = 24, className = "" }: BlockIconProps) {
    const gradient = blockGradients[type] || { from: "#6366f1", to: "#8b5cf6" };
    const gradientId = `gradient-${type}`;

    const iconPaths: Record<string, React.ReactNode> = {
        HeaderImage: (
            <>
                <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" stroke={`url(#${gradientId})`} fill="none" />
                <path d="M3 15l5-5 4 4 5-7 4 5" strokeWidth="2" stroke={`url(#${gradientId})`} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="8.5" cy="8.5" r="1.5" fill={`url(#${gradientId})`} />
            </>
        ),
        Image: (
            <>
                <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="2" stroke={`url(#${gradientId})`} fill="none" />
                <circle cx="8" cy="10" r="2" fill={`url(#${gradientId})`} />
                <path d="M21 15l-5-5L5 19" strokeWidth="2" stroke={`url(#${gradientId})`} fill="none" strokeLinecap="round" />
            </>
        ),
        Gif: (
            <>
                <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="2" stroke={`url(#${gradientId})`} fill="none" />
                <circle cx="9" cy="12" r="3" strokeWidth="1.5" stroke={`url(#${gradientId})`} fill="none" />
                <path d="M9 10.5v3l2.5-1.5-2.5-1.5z" fill={`url(#${gradientId})`} />
                <path d="M15 10h2M15 12h3M15 14h2" strokeWidth="1.5" stroke={`url(#${gradientId})`} strokeLinecap="round" />
            </>
        ),
        TextBlock: (
            <>
                <path d="M4 6h16M4 10h16M4 14h12M4 18h8" strokeWidth="2" stroke={`url(#${gradientId})`} strokeLinecap="round" />
            </>
        ),
        Button: (
            <>
                <rect x="3" y="7" width="18" height="10" rx="5" strokeWidth="2" stroke={`url(#${gradientId})`} fill="none" />
                <path d="M8 12h5M15 10l2 2-2 2" strokeWidth="2" stroke={`url(#${gradientId})`} strokeLinecap="round" strokeLinejoin="round" />
            </>
        ),
        Divider: (
            <>
                <path d="M3 12h18" strokeWidth="2" stroke={`url(#${gradientId})`} strokeLinecap="round" />
                <circle cx="7" cy="12" r="1" fill={`url(#${gradientId})`} />
                <circle cx="12" cy="12" r="1" fill={`url(#${gradientId})`} />
                <circle cx="17" cy="12" r="1" fill={`url(#${gradientId})`} />
            </>
        ),
        Spacer: (
            <>
                <path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4" strokeWidth="2" stroke={`url(#${gradientId})`} strokeLinecap="round" strokeLinejoin="round" />
            </>
        ),
        SocialIcons: (
            <>
                <circle cx="6" cy="12" r="3" strokeWidth="2" stroke={`url(#${gradientId})`} fill="none" />
                <circle cx="18" cy="12" r="3" strokeWidth="2" stroke={`url(#${gradientId})`} fill="none" />
                <circle cx="12" cy="12" r="3" fill={`url(#${gradientId})`} />
                <path d="M9 12h-0M15 12h0" strokeWidth="2" stroke={`url(#${gradientId})`} />
            </>
        ),
        Columns: (
            <>
                <rect x="3" y="4" width="7" height="16" rx="1" strokeWidth="2" stroke={`url(#${gradientId})`} fill="none" />
                <rect x="14" y="4" width="7" height="16" rx="1" strokeWidth="2" stroke={`url(#${gradientId})`} fill="none" />
            </>
        ),
        Container: (
            <>
                <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" stroke={`url(#${gradientId})`} fill="none" />
                <rect x="6" y="6" width="12" height="12" rx="1" strokeWidth="1.5" stroke={`url(#${gradientId})`} fill="none" strokeDasharray="3 2" />
            </>
        ),
        Footer: (
            <>
                <rect x="3" y="14" width="18" height="7" rx="1" strokeWidth="2" stroke={`url(#${gradientId})`} fill="none" />
                <path d="M6 17h6M6 19h4" strokeWidth="1.5" stroke={`url(#${gradientId})`} strokeLinecap="round" />
                <path d="M3 12h18M3 8h18M3 4h12" strokeWidth="1.5" stroke={`url(#${gradientId})`} strokeLinecap="round" opacity="0.3" />
            </>
        ),
    };

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            className={className}
        >
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={gradient.from} />
                    <stop offset="100%" stopColor={gradient.to} />
                </linearGradient>
            </defs>
            {iconPaths[type] || iconPaths.Container}
        </svg>
    );
}

// Icon wrapper with gradient background
export function BlockIconWithBackground({ type, size = 40 }: { type: string; size?: number }) {
    const gradient = blockGradients[type] || { from: "#6366f1", to: "#8b5cf6", bg: "rgba(99, 102, 241, 0.1)" };

    return (
        <div
            className="flex items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
            style={{
                width: size,
                height: size,
                background: `linear-gradient(135deg, ${gradient.bg}, ${gradient.bg.replace('0.1', '0.2')})`,
                boxShadow: `0 2px 8px ${gradient.bg}`,
            }}
        >
            <BlockIcon type={type} size={size * 0.55} />
        </div>
    );
}
