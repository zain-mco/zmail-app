"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Trash2, ImageIcon, Loader2, Search, Upload, AlertTriangle, Calendar, FileImage } from "lucide-react";

interface Image {
    id: string;
    url: string;
    filename: string;
    createdAt: string;
}

interface ImageLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    onUploadNew: () => void;
}

// Delete Confirmation Dialog Component
function DeleteConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    imageName,
    isDeleting,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    imageName: string;
    isDeleting: boolean;
}) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <DialogTitle className="text-center text-xl">Delete Image</DialogTitle>
                    <DialogDescription className="text-center">
                        Are you sure you want to delete <span className="font-semibold text-gray-900">{imageName}</span>?
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex gap-3 sm:gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Permanently
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Individual image thumbnail component with loading state
function ImageThumbnail({
    image,
    onSelect,
    onDelete,
    isDeleting
}: {
    image: Image;
    onSelect: () => void;
    onDelete: () => void;
    isDeleting: boolean;
}) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Format date
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch {
            return '';
        }
    };

    return (
        <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
            {/* Image Container */}
            <div
                className="relative aspect-square cursor-pointer overflow-hidden"
                onClick={onSelect}
                style={{
                    background: 'linear-gradient(45deg, #f8fafc 25%, #f1f5f9 25%, #f1f5f9 50%, #f8fafc 50%, #f8fafc 75%, #f1f5f9 75%)',
                    backgroundSize: '20px 20px'
                }}
            >
                {/* Loading skeleton */}
                {!isLoaded && !hasError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        <div className="text-center">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                            <span className="text-xs text-gray-400">Loading...</span>
                        </div>
                    </div>
                )}

                {/* Error state */}
                {hasError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400">
                        <FileImage className="w-12 h-12 mb-2 text-gray-300" />
                        <p className="text-xs font-medium">Failed to load</p>
                    </div>
                )}

                {/* Actual image */}
                <img
                    src={image.url}
                    alt={image.filename}
                    className={`w-full h-full object-contain transition-all duration-300 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                    onLoad={() => setIsLoaded(true)}
                    onError={() => {
                        setHasError(true);
                        console.error("Image failed to load:", image.url);
                    }}
                    loading="lazy"
                />

                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Select indicator - center */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-blue-600 text-white rounded-full p-3 shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-200">
                        <Check className="w-6 h-6" />
                    </div>
                </div>

                {/* Click to select label */}
                <div className="absolute bottom-3 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                        Click to select
                    </span>
                </div>
            </div>

            {/* Info Footer */}
            <div className="p-3 bg-white border-t border-gray-50">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate" title={image.filename}>
                            {image.filename}
                        </p>
                        {image.createdAt && (
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(image.createdAt)}
                            </p>
                        )}
                    </div>

                    {/* Delete button */}
                    <button
                        className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        disabled={isDeleting}
                        title="Delete image"
                    >
                        {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function ImageLibraryModal({
    isOpen,
    onClose,
    onSelect,
    onUploadNew,
}: ImageLibraryModalProps) {
    const [images, setImages] = useState<Image[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Image | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchImages();
        }
    }, [isOpen]);

    async function fetchImages() {
        setIsLoading(true);
        try {
            const res = await fetch("/api/images");
            const data = await res.json();
            setImages(data.images || []);
        } catch (error) {
            console.error("Failed to fetch images:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDelete() {
        if (!deleteConfirm) return;

        setIsDeleting(deleteConfirm.id);
        try {
            const res = await fetch(`/api/images/${deleteConfirm.id}`, { method: "DELETE" });
            if (res.ok) {
                setImages(images.filter((img) => img.id !== deleteConfirm.id));
                setDeleteConfirm(null);
            } else {
                throw new Error("Failed to delete");
            }
        } catch (error) {
            console.error("Failed to delete image:", error);
            alert("Failed to delete image. Please try again.");
        } finally {
            setIsDeleting(null);
        }
    }

    const filteredImages = images.filter((img) =>
        img.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col p-0">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3 text-xl">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                    <ImageIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <span className="text-gray-900">Image Library</span>
                                    <p className="text-sm font-normal text-gray-500 mt-0.5">
                                        Select an image to use in your email
                                    </p>
                                </div>
                            </DialogTitle>
                        </DialogHeader>
                    </div>

                    {/* Search and Upload Bar */}
                    <div className="px-6 py-4 bg-white border-b border-gray-100">
                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search by filename..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                />
                            </div>
                            <Button
                                onClick={onUploadNew}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload New
                            </Button>
                        </div>
                    </div>

                    {/* Image Grid */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-64">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse" />
                                    <Loader2 className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
                                </div>
                                <p className="text-gray-500 mt-4 font-medium">Loading your images...</p>
                            </div>
                        ) : filteredImages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                                    <ImageIcon className="w-10 h-10 text-gray-400" />
                                </div>
                                <p className="text-gray-700 font-semibold text-lg">
                                    {searchQuery ? "No images found" : "No images uploaded yet"}
                                </p>
                                <p className="text-gray-400 mt-1 mb-6 max-w-sm">
                                    {searchQuery
                                        ? `No images match "${searchQuery}". Try a different search term.`
                                        : "Upload your first image to start building beautiful emails."
                                    }
                                </p>
                                <Button
                                    onClick={onUploadNew}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Your First Image
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm text-gray-500">
                                        <span className="font-semibold text-gray-700">{filteredImages.length}</span> image{filteredImages.length !== 1 ? 's' : ''}
                                        {searchQuery && ` matching "${searchQuery}"`}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {filteredImages.map((image) => (
                                        <ImageThumbnail
                                            key={image.id}
                                            image={image}
                                            onSelect={() => {
                                                onSelect(image.url);
                                                onClose();
                                            }}
                                            onDelete={() => setDeleteConfirm(image)}
                                            isDeleting={isDeleting === image.id}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleDelete}
                imageName={deleteConfirm?.filename || ""}
                isDeleting={!!isDeleting}
            />
        </>
    );
}
