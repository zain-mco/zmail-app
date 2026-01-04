"use client";

import { ReactNode, useEffect, useRef, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";
import { useToast } from "@/components/AlertProvider";

interface SessionProviderProps {
    children: ReactNode;
    idleTimeoutMinutes?: number;
}

/**
 * SessionProvider - Monitors session for idle timeout and cross-tab logout
 * 
 * OWASP Session Management:
 * - Idle timeout (default 30 min of inactivity)
 * - Cross-tab logout synchronization via BroadcastChannel
 * - Graceful session expiry handling
 */
export function SessionMonitor({
    children,
    idleTimeoutMinutes = 30
}: SessionProviderProps) {
    const { data: session, status } = useSession();
    const { showToast } = useToast();
    const lastActivityRef = useRef(Date.now());
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

    // Reset activity timer
    const resetActivity = useCallback(() => {
        lastActivityRef.current = Date.now();
    }, []);

    // Handle logout (clears session and broadcasts to other tabs)
    const handleLogout = useCallback(async (reason: "idle" | "manual" | "broadcast") => {
        // Clear timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Broadcast logout to other tabs
        if (reason !== "broadcast" && broadcastChannelRef.current) {
            broadcastChannelRef.current.postMessage({ type: "logout" });
        }

        // Clear session
        await fetch("/api/auth/logout", { method: "POST" });
        localStorage.clear();
        sessionStorage.clear();

        // Redirect with reason
        const redirectUrl = reason === "idle"
            ? "/login?reason=expired"
            : "/login?reason=logout";

        window.location.href = redirectUrl;
    }, []);

    // Check for idle timeout
    const checkIdleTimeout = useCallback(() => {
        const idleTimeMs = idleTimeoutMinutes * 60 * 1000;
        const elapsed = Date.now() - lastActivityRef.current;

        if (elapsed >= idleTimeMs) {
            showToast({
                type: "warning",
                title: "Session Expired",
                message: "You have been logged out due to inactivity.",
                duration: 5000,
            });
            handleLogout("idle");
        }
    }, [idleTimeoutMinutes, handleLogout, showToast]);

    useEffect(() => {
        if (status !== "authenticated") return;

        // Set up activity listeners
        const events = ["mousedown", "keydown", "scroll", "touchstart"];
        events.forEach((event) => {
            document.addEventListener(event, resetActivity, { passive: true });
        });

        // Set up idle check interval (every minute)
        const intervalId = setInterval(checkIdleTimeout, 60 * 1000);

        // Set up cross-tab logout sync
        if (typeof BroadcastChannel !== "undefined") {
            broadcastChannelRef.current = new BroadcastChannel("zmail-auth");
            broadcastChannelRef.current.onmessage = (event) => {
                if (event.data.type === "logout") {
                    handleLogout("broadcast");
                }
            };
        }

        return () => {
            events.forEach((event) => {
                document.removeEventListener(event, resetActivity);
            });
            clearInterval(intervalId);
            if (broadcastChannelRef.current) {
                broadcastChannelRef.current.close();
            }
        };
    }, [status, resetActivity, checkIdleTimeout, handleLogout]);

    return <>{children}</>;
}
