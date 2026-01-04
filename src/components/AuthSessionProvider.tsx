"use client";

import { SessionProvider } from "next-auth/react";
import { SessionMonitor } from "./SessionMonitor";
import { ReactNode } from "react";

/**
 * AuthSessionProvider - Combines next-auth SessionProvider with our SessionMonitor
 * 
 * Features:
 * - Provides session context to all components
 * - Monitors for idle timeout
 * - Synchronizes logout across browser tabs
 */
export function AuthSessionProvider({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <SessionMonitor idleTimeoutMinutes={30}>
                {children}
            </SessionMonitor>
        </SessionProvider>
    );
}
