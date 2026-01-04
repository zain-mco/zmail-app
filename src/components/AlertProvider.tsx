"use client";

import { ReactNode } from "react";
import { ToastProvider } from "./ToastProvider";
import { ConfirmProvider } from "./ConfirmProvider";

/**
 * AlertProvider combines Toast and Confirm providers
 * Wrap your app with this component to enable global alerts
 */
export function AlertProvider({ children }: { children: ReactNode }) {
    return (
        <ToastProvider>
            <ConfirmProvider>
                {children}
            </ConfirmProvider>
        </ToastProvider>
    );
}

// Re-export hooks for convenience
export { useToast } from "./ToastProvider";
export { useConfirm } from "./ConfirmProvider";
