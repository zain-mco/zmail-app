"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast, useConfirm } from "@/components/AlertProvider";
import { defaultTemplates, cloneTemplateBlocks, type EmailTemplate } from "@/lib/default-templates";

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
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [newTitle, setNewTitle] = useState("");
    const [renameTitle, setRenameTitle] = useState("");
    const [selectedUserId, setSelectedUserId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [templateLoading, setTemplateLoading] = useState<string | null>(null);

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
                showToast({
                    type: "success",
                    title: "Campaign created",
                    message: `"${newTitle}" has been created successfully.`,
                });
                router.refresh();
            } else {
                showToast({
                    type: "error",
                    title: "Failed to create campaign",
                    message: "Please try again.",
                });
            }
        } catch {
            showToast({
                type: "error",
                title: "Error",
                message: "Something went wrong. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    async function handleShareCampaign() {
        if (!selectedCampaign || !selectedUserId) return;

        const targetUser = teamUsers.find(u => u.id === selectedUserId);

        setIsLoading(true);

        try {
            // Use share endpoint - creates SharedAccess so campaign appears in "Shared with me" tab
            const res = await fetch(`/api/campaigns/${selectedCampaign.id}/share`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: selectedUserId,
                    permission: "EDIT",  // Default to EDIT so they can work with it
                }),
            });

            if (res.ok) {
                setIsShareOpen(false);
                setSelectedCampaign(null);
                setSelectedUserId("");
                showToast({
                    type: "success",
                    title: "Campaign shared",
                    message: `Shared with ${targetUser?.username || "the user"}. They can transfer it to their campaigns.`,
                });
                router.refresh();
            } else {
                const error = await res.json();
                showToast({
                    type: "error",
                    title: "Failed to share",
                    message: error.error || "Please try again.",
                });
            }
        } catch {
            showToast({
                type: "error",
                title: "Error",
                message: "Something went wrong. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDeleteCampaign(campaign: Campaign) {
        const confirmed = await confirm({
            title: "Delete Campaign",
            message: `Are you sure you want to delete "${campaign.title}"? This action cannot be undone.`,
            confirmText: "Delete",
            cancelText: "Cancel",
            confirmVariant: "destructive",
        });

        if (!confirmed) return;

        try {
            const res = await fetch(`/api/campaigns/${campaign.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                showToast({
                    type: "success",
                    title: "Campaign deleted",
                    message: `"${campaign.title}" has been deleted.`,
                });
                router.refresh();
            } else {
                showToast({
                    type: "error",
                    title: "Failed to delete",
                    message: "Please try again.",
                });
            }
        } catch {
            showToast({
                type: "error",
                title: "Error",
                message: "Something went wrong. Please try again.",
            });
        }
    }

    // Rename campaign handler
    async function handleRenameCampaign() {
        if (!selectedCampaign || !renameTitle.trim()) return;
        setIsLoading(true);

        try {
            const res = await fetch(`/api/campaigns/${selectedCampaign.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: renameTitle }),
            });

            if (res.ok) {
                setIsRenameOpen(false);
                setSelectedCampaign(null);
                setRenameTitle("");
                showToast({
                    type: "success",
                    title: "Campaign renamed",
                    message: `Campaign has been renamed to "${renameTitle}".`,
                });
                router.refresh();
            } else {
                showToast({
                    type: "error",
                    title: "Failed to rename",
                    message: "Please try again.",
                });
            }
        } catch {
            showToast({
                type: "error",
                title: "Error",
                message: "Something went wrong. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    // Duplicate campaign handler - creates a copy for the current user
    async function handleDuplicateCampaign(campaign: Campaign) {
        setIsLoading(true);

        try {
            // Use clone endpoint with the current user's ID to create a copy for themselves
            const res = await fetch(`/api/campaigns/${campaign.id}/clone`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: currentUserId,
                    newTitle: `${campaign.title} (Copy)`,
                }),
            });

            if (res.ok) {
                showToast({
                    type: "success",
                    title: "Campaign duplicated",
                    message: `A copy of "${campaign.title}" has been created.`,
                });
                router.refresh();
            } else {
                const error = await res.json();
                showToast({
                    type: "error",
                    title: "Failed to duplicate",
                    message: error.error || "Please try again.",
                });
            }
        } catch {
            showToast({
                type: "error",
                title: "Error",
                message: "Something went wrong. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    // Remove shared campaign - removes it from the user's shared list
    async function handleRemoveShared(campaign: Campaign) {
        const confirmed = await confirm({
            title: "Remove Shared Campaign",
            message: `Remove "${campaign.title}" from your shared campaigns? This won't delete the original campaign.`,
            confirmText: "Remove",
            cancelText: "Cancel",
            confirmVariant: "destructive",
        });

        if (!confirmed) return;

        setIsLoading(true);
        try {
            const res = await fetch(`/api/campaigns/${campaign.id}/shared-access`, {
                method: "DELETE",
            });

            if (res.ok) {
                showToast({
                    type: "success",
                    title: "Campaign removed",
                    message: `"${campaign.title}" has been removed from your shared campaigns.`,
                });
                router.refresh();
            } else {
                showToast({
                    type: "error",
                    title: "Failed to remove",
                    message: "Please try again.",
                });
            }
        } catch {
            showToast({
                type: "error",
                title: "Error",
                message: "Something went wrong. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    // Transfer shared campaign to My Campaigns - creates a copy owned by the user
    async function handleTransferToMyCampaigns(campaign: Campaign) {
        setIsLoading(true);
        try {
            // Clone the campaign for the current user
            const res = await fetch(`/api/campaigns/${campaign.id}/clone`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: currentUserId,
                    newTitle: campaign.title,
                }),
            });

            if (res.ok) {
                showToast({
                    type: "success",
                    title: "Campaign transferred",
                    message: `"${campaign.title}" has been added to your campaigns.`,
                });
                router.refresh();
            } else {
                const error = await res.json();
                showToast({
                    type: "error",
                    title: "Failed to transfer",
                    message: error.error || "Please try again.",
                });
            }
        } catch {
            showToast({
                type: "error",
                title: "Error",
                message: "Something went wrong. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    // Use template handler - creates a new campaign from template
    async function handleUseTemplate(template: EmailTemplate) {
        setTemplateLoading(template.id);

        try {
            const clonedBlocks = cloneTemplateBlocks(template.blocks);

            const res = await fetch("/api/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: template.name,
                    content_json: { blocks: clonedBlocks },
                }),
            });

            if (res.ok) {
                const campaign = await res.json();
                showToast({
                    type: "success",
                    title: "Template applied",
                    message: `Created new campaign from "${template.name}" template.`,
                });
                router.push(`/editor/${campaign.id}`);
            } else {
                showToast({
                    type: "error",
                    title: "Failed to create campaign",
                    message: "Please try again.",
                });
            }
        } catch {
            showToast({
                type: "error",
                title: "Error",
                message: "Something went wrong. Please try again.",
            });
        } finally {
            setTemplateLoading(null);
        }
    }

    function formatDate(date: Date) {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    // Animation variants
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    };

    return (
        <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Hero Section / Welcome Banner */}
            <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-700 p-8 shadow-2xl text-white">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                            Welcome back, <span className="text-indigo-200">Creator</span>
                        </h1>
                        <p className="text-indigo-100/80 text-lg max-w-xl">
                            Ready to craft your next masterpiece? Manage your campaigns and track your success all in one place.
                        </p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-1 rounded-full px-8 py-6 text-md font-bold group">
                                <div className="bg-indigo-100 p-1.5 rounded-full mr-3 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                Create Campaign
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
            </motion.div>

            {/* Tabs */}
            <Tabs defaultValue="my-campaigns" className="space-y-8">
                <TabsList className="relative z-10 bg-white/40 backdrop-blur-md p-1 rounded-full border border-white/40 shadow-sm inline-flex h-auto w-fit">
                    <TabsTrigger
                        value="my-campaigns"
                        className="rounded-full px-6 py-2 h-auto data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md transition-all font-medium cursor-pointer"
                    >
                        My Campaigns ({myCampaigns.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="templates"
                        className="rounded-full px-6 py-2 h-auto data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md transition-all font-medium cursor-pointer"
                    >
                        📋 Templates
                    </TabsTrigger>
                    <TabsTrigger
                        value="shared"
                        className="rounded-full px-6 py-2 h-auto data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md transition-all font-medium cursor-pointer"
                    >
                        Shared with Me ({sharedCampaigns.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="my-campaigns" className="space-y-4 outline-none">
                    {myCampaigns.length === 0 ? (
                        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass-card rounded-3xl p-16 flex flex-col items-center justify-center text-center animate-float">
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-full mb-8 shadow-inner border border-white/50">
                                <svg className="w-20 h-20 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">No campaigns yet</h3>
                            <p className="text-gray-500 max-w-md mb-10 text-lg">
                                Your dashboard makes it easy to create and manage campaigns. Start your first one today!
                            </p>
                            <Button onClick={() => setIsCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-10 py-6 text-lg shadow-lg hover:shadow-indigo-500/25 transition-all outline-none">
                                Create your first campaign
                            </Button>
                        </motion.div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {myCampaigns.map((campaign) => (
                                <motion.div variants={itemVariants} initial="hidden" animate="visible" key={campaign.id} layoutId={campaign.id}>
                                    <SpotlightCard className="h-full border-t-4 border-t-indigo-500 shadow-sm hover:shadow-xl transition-all duration-300">
                                        <div className="p-6 h-full flex flex-col">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-3.5 rounded-2xl shadow-inner group-hover:scale-105 transition-transform duration-300">
                                                    <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                                                    </svg>
                                                </div>
                                                <div className={`text-xs font-semibold px-3 py-1.5 rounded-full ${campaign.sharedAccess.length > 0
                                                    ? "bg-green-100 text-green-700 border border-green-200"
                                                    : "bg-gray-100 text-gray-500 border border-gray-200"
                                                    }`}>
                                                    {campaign.sharedAccess.length > 0 ? "Shared" : "Private"}
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-bold text-gray-900 truncate mb-2 group-hover:text-indigo-600 transition-colors">
                                                {campaign.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mb-8 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
                                                Updated {formatDate(campaign.updatedAt)}
                                            </p>

                                            <div className="mt-auto flex items-center gap-3 pt-6 border-t border-gray-100/50">
                                                <Button
                                                    size="sm"
                                                    className="flex-1 bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200 shadow-sm transition-all"
                                                    onClick={() => router.push(`/editor/${campaign.id}`)}
                                                >
                                                    Edit
                                                </Button>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button size="icon" variant="ghost" className="h-9 w-9 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
                                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <circle cx="12" cy="12" r="1" />
                                                                <circle cx="12" cy="5" r="1" />
                                                                <circle cx="12" cy="19" r="1" />
                                                            </svg>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem onClick={() => {
                                                            setSelectedCampaign(campaign);
                                                            setIsShareOpen(true);
                                                        }}>
                                                            <span className="mr-2">📤</span> Share
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => {
                                                            setSelectedCampaign(campaign);
                                                            setRenameTitle(campaign.title);
                                                            setIsRenameOpen(true);
                                                        }}>
                                                            <span className="mr-2">✏️</span> Rename
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDuplicateCampaign(campaign)}>
                                                            <span className="mr-2">📋</span> Duplicate
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleDeleteCampaign(campaign)}>
                                                            <span className="mr-2">🗑️</span> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </SpotlightCard>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Templates Tab */}
                <TabsContent value="templates" className="space-y-6 outline-none">
                    <motion.div variants={itemVariants} initial="hidden" animate="visible" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-indigo-900 p-8 text-white shadow-xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                                <span className="text-3xl">⚡</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-1">Start with a Template</h3>
                                <p className="text-gray-200/80 max-w-2xl">
                                    Choose a professionally designed template to jumpstart your campaign.
                                    Fully customizable, responsive, and ready to send.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {defaultTemplates && defaultTemplates.length > 0 ? (
                            defaultTemplates.map((template) => (
                                <motion.div variants={itemVariants} initial="hidden" animate="visible" key={template.id}>
                                    <SpotlightCard className="h-full border-0 ring-1 ring-gray-200/50 hover:ring-indigo-200 shadow-sm hover:shadow-xl transition-all duration-300">
                                        <div className="aspect-video bg-gradient-to-br from-gray-50 to-slate-100 relative group-hover:from-indigo-50/50 group-hover:to-purple-50/50 transition-colors flex items-center justify-center border-b border-gray-100">
                                            <div className="text-6xl transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 drop-shadow-sm filter grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100">
                                                {template.thumbnail}
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">{template.name}</h3>
                                                <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-1 rounded-md border border-gray-200">
                                                    {template.blocks.length} blocks
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-500 mb-6 line-clamp-2 h-10 leading-relaxed">{template.description}</p>

                                            <Button
                                                className="w-full bg-white text-indigo-600 border border-indigo-200 hover:border-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 font-medium shadow-sm group-hover:shadow-md"
                                                onClick={() => handleUseTemplate(template)}
                                                disabled={templateLoading === template.id}
                                            >
                                                {templateLoading === template.id ? (
                                                    <>
                                                        <svg className="animate-spin w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Creating...
                                                    </>
                                                ) : "Use Template"}
                                            </Button>
                                        </div>
                                    </SpotlightCard>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                No templates available.
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="shared" className="space-y-4 outline-none">
                    {sharedCampaigns.length === 0 ? (
                        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass-card rounded-3xl p-16 flex flex-col items-center justify-center text-center animate-float-delayed">
                            <div className="bg-purple-50 p-6 rounded-full mb-6 border border-purple-100">
                                <svg className="w-16 h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No shared campaigns</h3>
                            <p className="text-gray-500 max-w-sm text-base">
                                When team members share campaigns with you, they will appear here.
                            </p>
                        </motion.div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {sharedCampaigns.map((campaign) => (
                                <motion.div variants={itemVariants} initial="hidden" animate="visible" key={campaign.id} layoutId={campaign.id}>
                                    <SpotlightCard className="h-full border-t-4 border-t-purple-500 shadow-sm hover:shadow-xl transition-all duration-300">
                                        <div className="p-6 h-full flex flex-col">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-3 rounded-xl">
                                                    <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                </div>
                                                <div className={`text-xs px-2 py-1 rounded-full ${campaign.permission === "EDIT"
                                                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                                                    : "bg-amber-100 text-amber-700 border border-amber-200"
                                                    }`}>
                                                    {campaign.permission === "EDIT" ? "Can Edit" : "View Only"}
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-bold text-gray-900 truncate mb-1 group-hover:text-purple-600 transition-colors">
                                                {campaign.title}
                                            </h3>
                                            <div className="flex items-center gap-2 mb-6">
                                                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-600 border border-purple-200">
                                                    {campaign.owner.username.slice(0, 2).toUpperCase()}
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    by <span className="font-medium text-gray-700">{campaign.owner.username}</span>
                                                </p>
                                            </div>

                                            <div className="mt-auto flex items-center gap-3 pt-4 border-t border-gray-100/50">
                                                <Button
                                                    size="sm"
                                                    className="flex-1 bg-white text-purple-600 border border-purple-200 hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                                                    onClick={() => router.push(`/editor/${campaign.id}`)}
                                                >
                                                    {campaign.permission === "EDIT" ? "Edit" : "View"}
                                                </Button>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button size="icon" variant="ghost" className="h-9 w-9 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
                                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <circle cx="12" cy="12" r="1" />
                                                                <circle cx="12" cy="5" r="1" />
                                                                <circle cx="12" cy="19" r="1" />
                                                            </svg>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56">
                                                        <DropdownMenuItem onClick={() => handleTransferToMyCampaigns(campaign)}>
                                                            <span className="mr-2">📥</span> Transfer to My Campaigns
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleRemoveShared(campaign)}>
                                                            <span className="mr-2">🗑️</span> Remove from List
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </SpotlightCard>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs >

            {/* Share Dialog */}
            < Dialog open={isShareOpen} onOpenChange={setIsShareOpen} >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Share Campaign</DialogTitle>
                        <DialogDescription>
                            Share &quot;{selectedCampaign?.title}&quot; with a team member.
                            It will appear in their &quot;Shared with Me&quot; tab. They can then transfer it to their own campaigns if needed.
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
            </Dialog >

            {/* Rename Dialog */}
            <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Campaign</DialogTitle>
                        <DialogDescription>
                            Enter a new name for your campaign.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="renameTitle">Campaign Name</Label>
                            <Input
                                id="renameTitle"
                                value={renameTitle}
                                onChange={(e) => setRenameTitle(e.target.value)}
                                placeholder="e.g., Q1 Newsletter"
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleRenameCampaign}
                                disabled={isLoading || !renameTitle.trim()}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isLoading ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div >
    );
}
