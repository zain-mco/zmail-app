"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface User {
    id: string;
    username: string;
    role: "ADMIN" | "TEAM";
    createdAt: Date;
    _count: {
        campaigns: number;
    };
}

interface AdminContentProps {
    users: User[];
    currentUserId: string;
}

export function AdminContent({ users, currentUserId }: AdminContentProps) {
    const router = useRouter();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isResetOpen, setIsResetOpen] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    async function handleAddUser() {
        if (!username.trim() || !password.trim()) return;
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to create user");
                return;
            }

            setIsAddOpen(false);
            setUsername("");
            setPassword("");
            router.refresh();
        } finally {
            setIsLoading(false);
        }
    }

    async function handleResetPassword() {
        if (!selectedUser || !newPassword.trim()) return;
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to reset password");
                return;
            }

            setIsResetOpen(false);
            setSelectedUser(null);
            setNewPassword("");
            router.refresh();
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDeleteUser(userId: string) {
        if (!confirm("Are you sure you want to delete this user? This will also delete all their campaigns.")) {
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                router.refresh();
            }
        } finally {
            setIsLoading(false);
        }
    }

    async function handleChangePassword() {
        if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            setError("All fields are required");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const res = await fetch("/api/account/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to change password");
                return;
            }

            setSuccessMessage("Password changed successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            // Close dialog after a short delay
            setTimeout(() => {
                setIsChangePasswordOpen(false);
                setSuccessMessage(null);
            }, 1500);
        } finally {
            setIsLoading(false);
        }
    }

    function formatDate(date: Date) {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500 mt-1">Manage team members and their access</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Team User
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Team User</DialogTitle>
                            <DialogDescription>
                                Create a new team member account
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="e.g., john.doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter a strong password"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => {
                                    setIsAddOpen(false);
                                    setError(null);
                                }}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAddUser}
                                    disabled={isLoading || !username.trim() || !password.trim()}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {isLoading ? "Creating..." : "Create User"}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Users</CardDescription>
                        <CardTitle className="text-3xl">{users.length}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Team Members</CardDescription>
                        <CardTitle className="text-3xl">
                            {users.filter((u) => u.role === "TEAM").length}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Administrators</CardDescription>
                        <CardTitle className="text-3xl">
                            {users.filter((u) => u.role === "ADMIN").length}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Change My Password Card */}
            <Card className="border-blue-100 bg-blue-50/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Account Security
                    </CardTitle>
                    <CardDescription>
                        Manage your account password
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Dialog open={isChangePasswordOpen} onOpenChange={(open) => {
                        setIsChangePasswordOpen(open);
                        if (!open) {
                            setError(null);
                            setSuccessMessage(null);
                            setCurrentPassword("");
                            setNewPassword("");
                            setConfirmPassword("");
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="border-blue-200 hover:bg-blue-100">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Change My Password
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Change Your Password</DialogTitle>
                                <DialogDescription>
                                    Enter your current password and choose a new one
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                                {error && (
                                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                                        {error}
                                    </div>
                                )}
                                {successMessage && (
                                    <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                                        {successMessage}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter your current password"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPasswordChange">New Password</Label>
                                    <Input
                                        id="newPasswordChange"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password (min 6 characters)"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => {
                                        setIsChangePasswordOpen(false);
                                        setError(null);
                                        setSuccessMessage(null);
                                    }}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleChangePassword}
                                        disabled={isLoading || !currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {isLoading ? "Changing..." : "Change Password"}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>
                        A list of all registered users in the system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Username</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Campaigns</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.username}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === "ADMIN"
                                                ? "bg-purple-100 text-purple-800"
                                                : "bg-blue-100 text-blue-800"
                                                }`}
                                        >
                                            {user.role}
                                        </span>
                                    </TableCell>
                                    <TableCell>{user._count.campaigns}</TableCell>
                                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setIsResetOpen(true);
                                                }}
                                            >
                                                Reset Password
                                            </Button>
                                            {user.id !== currentUserId && user.role !== "ADMIN" && (
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    disabled={isLoading}
                                                >
                                                    Delete
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Reset Password Dialog */}
            <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                            Set a new password for {selectedUser?.username}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => {
                                setIsResetOpen(false);
                                setError(null);
                            }}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleResetPassword}
                                disabled={isLoading || !newPassword.trim()}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isLoading ? "Resetting..." : "Reset Password"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
