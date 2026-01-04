"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

// Toast types
export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (toast: Omit<Toast, "id">) => void;
    dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

// Toast icons
const icons: Record<ToastType, string> = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
};

// Toast colors
const colors: Record<ToastType, { bg: string; border: string; text: string; icon: string }> = {
    success: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-800",
        icon: "text-green-500",
    },
    error: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-800",
        icon: "text-red-500",
    },
    warning: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-800",
        icon: "text-yellow-500",
    },
    info: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-800",
        icon: "text-blue-500",
    },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
    const color = colors[toast.type];

    React.useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, toast.duration || 4000);
        return () => clearTimeout(timer);
    }, [toast.duration, onDismiss]);

    return (
        <div
            className={`${color.bg} ${color.border} border rounded-lg shadow-lg p-4 min-w-[300px] max-w-[400px] animate-slide-in`}
            role="alert"
        >
            <div className="flex items-start gap-3">
                <span className={`${color.icon} text-lg font-bold`}>{icons[toast.type]}</span>
                <div className="flex-1">
                    <h4 className={`${color.text} font-medium`}>{toast.title}</h4>
                    {toast.message && (
                        <p className={`${color.text} opacity-80 text-sm mt-1`}>{toast.message}</p>
                    )}
                </div>
                <button
                    onClick={onDismiss}
                    className={`${color.text} opacity-60 hover:opacity-100 text-lg leading-none`}
                >
                    ×
                </button>
            </div>
        </div>
    );
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((toast: Omit<Toast, "id">) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setToasts((prev) => [...prev, { ...toast, id }]);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
            {children}
            {/* Toast container - fixed position at top right */}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onDismiss={() => dismissToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

