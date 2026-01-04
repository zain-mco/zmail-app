"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useConfirm, useToast } from "@/components/AlertProvider";

interface NavbarProps {
    user?: {
        username: string;
        role: "ADMIN" | "TEAM";
    };
}

export function Navbar({ user }: NavbarProps) {
    const pathname = usePathname();
    const { confirm } = useConfirm();
    const { showToast } = useToast();

    const isActive = (path: string) => pathname.startsWith(path);

    const handleLogout = async () => {
        const confirmed = await confirm({
            title: "Sign Out",
            message: "Are you sure you want to sign out?",
            confirmText: "Sign Out",
            cancelText: "Cancel",
            confirmVariant: "default",
        });

        if (!confirmed) return;

        try {
            // Broadcast logout to other tabs
            if (typeof BroadcastChannel !== "undefined") {
                const bc = new BroadcastChannel("zmail-auth");
                bc.postMessage({ type: "logout" });
                bc.close();
            }

            // Clear session on server
            await fetch("/api/auth/logout", { method: "POST" });

            // Clear client-side storage
            localStorage.clear();
            sessionStorage.clear();

            // Show success toast
            showToast({
                type: "success",
                title: "Signed out",
                message: "You have been logged out successfully.",
                duration: 2000,
            });

            // Redirect with reason parameter
            window.location.href = "/login?reason=logout";
        } catch (error) {
            showToast({
                type: "error",
                title: "Logout failed",
                message: "There was an error signing out. Please try again.",
            });
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-soft transition-all duration-300">
            <nav className="container flex h-16 items-center justify-between px-6 mx-auto">
                {/* ZMAIL Text Logo - Bold, Modern, Professional */}
                <Link href="/" className="flex items-center space-x-2 group">
                    <motion.span
                        className="text-2xl font-black tracking-tight"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        style={{
                            fontFamily: "'Inter', system-ui, sans-serif",
                            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        ZMAIL
                    </motion.span>
                </Link>

                {/* Navigation Links & User Menu */}
                <div className="flex items-center gap-6">
                    {user ? (
                        <>
                            {/* Navigation Links */}
                            <div className="hidden md:flex items-center gap-1">
                                {["Dashboard", "Admin Panel"].map((item) => {
                                    const path = item === "Dashboard" ? "/dashboard" : "/admin";
                                    if (item === "Admin Panel" && user.role !== "ADMIN") return null;

                                    const active = isActive(path);

                                    return (
                                        <Link key={path} href={path} className="relative px-4 py-2 rounded-full group">
                                            {active && (
                                                <motion.div
                                                    layoutId="nav-pill"
                                                    className="absolute inset-0 bg-indigo-50 rounded-full"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                            <span className={`relative text-sm font-semibold transition-colors duration-200 ${active ? "text-indigo-600" : "text-gray-600 group-hover:text-indigo-600"
                                                }`}>
                                                {item}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* User Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-indigo-100 transition-all cursor-pointer outline-none"
                                        suppressHydrationWarning
                                    >
                                        <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs">
                                                {user.username.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </motion.button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 mt-2 p-2" align="end" sideOffset={5}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center justify-start gap-3 p-3 bg-gray-50/50 rounded-lg mb-1"
                                    >
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-bold text-gray-900">{user.username}</p>
                                            <p className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full w-fit border border-indigo-100">
                                                {user.role === "ADMIN" ? "Administrator" : "Team Member"}
                                            </p>
                                        </div>
                                    </motion.div>
                                    <DropdownMenuSeparator className="bg-gray-100" />
                                    <DropdownMenuItem asChild className="cursor-pointer rounded-md focus:bg-gray-50 my-1">
                                        <Link href="/dashboard" className="font-medium text-gray-600 md:hidden">Dashboard</Link>
                                    </DropdownMenuItem>
                                    {user.role === "ADMIN" && (
                                        <DropdownMenuItem asChild className="cursor-pointer rounded-md focus:bg-gray-50 my-1">
                                            <Link href="/admin" className="font-medium text-gray-600 md:hidden">Admin Panel</Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator className="md:hidden bg-gray-100" />
                                    <DropdownMenuItem
                                        className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700 font-medium rounded-md mt-1"
                                        onClick={handleLogout}
                                    >
                                        Sign out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all font-semibold rounded-full px-6">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link href="/login">Sign In</Link>
                            </motion.div>
                        </Button>
                    )}
                </div>
            </nav>
        </header>
    );
}

