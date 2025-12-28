"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavbarProps {
    user?: {
        username: string;
        role: "ADMIN" | "TEAM";
    };
}

export function Navbar({ user }: NavbarProps) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname.startsWith(path);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <nav className="container flex h-16 items-center justify-between px-4 mx-auto">
                {/* ZMAIL Text Logo - Bold, Modern, Professional */}
                <Link href="/" className="flex items-center space-x-2">
                    <span
                        className="text-2xl font-extrabold tracking-tight"
                        style={{
                            fontFamily: "'Inter', 'Geist', system-ui, sans-serif",
                            background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        ZMAIL
                    </span>
                </Link>

                {/* Navigation Links & User Menu */}
                <div className="flex items-center gap-6">
                    {user ? (
                        <>
                            {/* Navigation Links */}
                            <div className="hidden md:flex items-center gap-4">
                                <Link
                                    href="/dashboard"
                                    className={`text-sm font-medium transition-colors hover:text-blue-600 ${isActive("/dashboard")
                                            ? "text-blue-600"
                                            : "text-gray-600"
                                        }`}
                                >
                                    Dashboard
                                </Link>
                                {user.role === "ADMIN" && (
                                    <Link
                                        href="/admin"
                                        className={`text-sm font-medium transition-colors hover:text-blue-600 ${isActive("/admin")
                                                ? "text-blue-600"
                                                : "text-gray-600"
                                            }`}
                                    >
                                        Admin Panel
                                    </Link>
                                )}
                            </div>

                            {/* User Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="relative h-9 w-9 rounded-full"
                                    >
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="bg-blue-600 text-white font-semibold">
                                                {user.username.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end">
                                    <div className="flex items-center justify-start gap-2 p-2">
                                        <div className="flex flex-col space-y-0.5">
                                            <p className="text-sm font-medium">{user.username}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {user.role === "ADMIN" ? "Administrator" : "Team Member"}
                                            </p>
                                        </div>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild className="md:hidden">
                                        <Link href="/dashboard">Dashboard</Link>
                                    </DropdownMenuItem>
                                    {user.role === "ADMIN" && (
                                        <DropdownMenuItem asChild className="md:hidden">
                                            <Link href="/admin">Admin Panel</Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator className="md:hidden" />
                                    <DropdownMenuItem
                                        className="text-red-600 cursor-pointer"
                                        onClick={() => signOut({ callbackUrl: "/login" })}
                                    >
                                        Sign out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <Button asChild variant="default" className="bg-blue-600 hover:bg-blue-700">
                            <Link href="/login">Sign In</Link>
                        </Button>
                    )}
                </div>
            </nav>
        </header>
    );
}
