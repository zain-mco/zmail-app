"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Campaign {
    id: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    owner: {
        id: string;
        username: string;
    };
    isOwner: boolean;
    permission: "OWNER" | "VIEW" | "EDIT";
    sharedAccess: Array<{
        sharedWith: {
            id: string;
            username: string;
        };
        permission: string;
    }>;
}

interface TeamUser {
    id: string;
    username: string;
}

interface DashboardContentProps {
    campaigns: Campaign[];
    teamUsers: TeamUser[];
    currentUserId: string;
}

export function DashboardContent({ campaigns, teamUsers, currentUserId }: DashboardContentProps) {
    const router = useRouter();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [newTitle, setNewTitle] = useState("");
    const [selectedUserId, setSelectedUserId] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const myCampaigns = campaigns.filter((c) => c.isOwner);
    const sharedCampaigns = campaigns.filter((c) => !c.isOwner);

    async function handleCreateCampaign() {
        if (!newTitle.trim()) return;
        setIsLoading(true);

        try {
            const res = await fetch("/api/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newTitle }),
            });

            if (res.ok) {
                setIsCreateOpen(false);
                setNewTitle("");
                router.refresh();
            }
        } finally {
            setIsLoading(false);
        }
    }

    async function handleShareCampaign() {
        if (!selectedCampaign || !selectedUserId) return;
        setIsLoading(true);

        try {
            const res = await fetch(`/api/campaigns/${selectedCampaign.id}/share`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: selectedUserId,
                    permission: "EDIT",
                }),
            });

            if (res.ok) {
                setIsShareOpen(false);
                setSelectedCampaign(null);
                setSelectedUserId("");
                router.refresh();
            }
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
                    <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
                    <p className="text-gray-500 mt-1">Manage your email campaigns</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Campaign
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Campaign</DialogTitle>
                            <DialogDescription>
                                Enter a title for your new email campaign
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Campaign Title</Label>
                                <Input
                                    id="title"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="e.g., Q1 Conference Invite"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateCampaign}
                                    disabled={isLoading || !newTitle.trim()}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {isLoading ? "Creating..." : "Create"}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="my-campaigns" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="my-campaigns">
                        My Campaigns ({myCampaigns.length})
                    </TabsTrigger>
                    <TabsTrigger value="shared">
                        Shared with Me ({sharedCampaigns.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="my-campaigns" className="space-y-4">
                    {myCampaigns.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <p className="text-gray-500 mb-4">No campaigns yet</p>
                                <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                                    Create your first campaign
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {myCampaigns.map((campaign) => (
                                <Card key={campaign.id} className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg font-semibold truncate">
                                            {campaign.title}
                                        </CardTitle>
                                        <CardDescription>
                                            Updated {formatDate(campaign.updatedAt)}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">
                                                {campaign.sharedAccess.length > 0
                                                    ? `Shared with ${campaign.sharedAccess.length} user(s)`
                                                    : "Not shared"}
                                            </span>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedCampaign(campaign);
                                                        setIsShareOpen(true);
                                                    }}
                                                >
                                                    Share
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                    onClick={() => router.push(`/editor/${campaign.id}`)}
                                                >
                                                    Edit
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="shared" className="space-y-4">
                    {sharedCampaigns.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                <p className="text-gray-500">No campaigns shared with you</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {sharedCampaigns.map((campaign) => (
                                <Card key={campaign.id} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg font-semibold truncate">
                                            {campaign.title}
                                        </CardTitle>
                                        <CardDescription>
                                            By {campaign.owner.username} • {campaign.permission === "EDIT" ? "Can edit" : "View only"}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">
                                                Updated {formatDate(campaign.updatedAt)}
                                            </span>
                                            <Button
                                                size="sm"
                                                className="bg-blue-600 hover:bg-blue-700"
                                                onClick={() => router.push(`/editor/${campaign.id}`)}
                                            >
                                                {campaign.permission === "EDIT" ? "Edit" : "View"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Share Dialog */}
            <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Share Campaign</DialogTitle>
                        <DialogDescription>
                            Share &quot;{selectedCampaign?.title}&quot; with a team member
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="user">Select Team Member</Label>
                            <select
                                id="user"
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="w-full h-10 px-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Choose a user...</option>
                                {teamUsers.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsShareOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleShareCampaign}
                                disabled={isLoading || !selectedUserId}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isLoading ? "Sharing..." : "Share"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
