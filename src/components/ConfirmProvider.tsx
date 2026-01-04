"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: "default" | "destructive";
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error("useConfirm must be used within a ConfirmProvider");
    }
    return context;
}

interface ConfirmState {
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: ((value: boolean) => void) | null;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<ConfirmState>({
        isOpen: false,
        options: { title: "", message: "" },
        resolve: null,
    });

    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setState({ isOpen: true, options, resolve });
        });
    }, []);

    const handleConfirm = () => {
        state.resolve?.(true);
        setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
    };

    const handleCancel = () => {
        state.resolve?.(false);
        setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
    };

    const { options } = state;
    const isDestructive = options.confirmVariant === "destructive";

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {/* Confirmation Dialog Modal */}
            {state.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={handleCancel}
                    />
                    {/* Dialog */}
                    <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-scale-in">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {options.title}
                            </h2>
                            <p className="mt-2 text-gray-600">
                                {options.message}
                            </p>
                        </div>
                        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {options.cancelText || "Cancel"}
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 ${isDestructive
                                    ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                                    : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                                    }`}
                            >
                                {options.confirmText || "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}

