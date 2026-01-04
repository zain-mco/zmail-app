"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

    async function handleDelete(id: string, e: React.MouseEvent) {
        e.stopPropagation();

        if (!confirm("Delete this image? This cannot be undone.")) {
            return;
        }

        setIsDeleting(id);
        try {
            await fetch(`/api/images/${id}`, { method: "DELETE" });
            setImages(images.filter((img) => img.id !== id));
        } catch (error) {
            console.error("Failed to delete image:", error);
            alert("Failed to delete image");
        } finally {
            setIsDeleting(null);
        }
    }

    const filteredImages = images.filter((img) =>
        img.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Image Library</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
                    {/* Search and Upload */}
                    <div className="flex gap-3">
                        <Input
                            placeholder="Search images..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1"
                        />
                        <Button onClick={onUploadNew} className="bg-blue-600 hover:bg-blue-700">
                            Upload New
                        </Button>
                    </div>

                    {/* Image Grid */}
                    <div className="flex-1 overflow-y-auto border rounded-lg p-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-32">
                                <p className="text-gray-500">Loading...</p>
                            </div>
                        ) : filteredImages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 text-center">
                                <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-gray-500">
                                    {searchQuery ? "No images found" : "No images uploaded yet"}
                                </p>
                                <Button onClick={onUploadNew} variant="outline" className="mt-4">
                                    Upload First Image
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-4">
                                {filteredImages.map((image) => (
                                    <div
                                        key={image.id}
                                        className="relative group cursor-pointer border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                                        onClick={() => {
                                            onSelect(image.url);
                                            onClose();
                                        }}
                                    >
                                        <img
                                            src={image.url}
                                            alt={image.filename}
                                            className="w-full h-48 object-cover bg-gray-100"
                                            onError={(e) => {
                                                console.error("Image failed to load:", image.url);
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const parent = target.parentElement;
                                                if (parent) {
                                                    const errorDiv = document.createElement('div');
                                                    errorDiv.className = 'w-full h-48 flex flex-col items-center justify-center bg-gray-100 text-gray-400';
                                                    errorDiv.innerHTML = `
                                                        <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                        <p class="text-xs">Failed to load</p>
                                                    `;
                                                    parent.insertBefore(errorDiv, target);
                                                }
                                            }}
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="opacity-0 group-hover:opacity-100"
                                                onClick={(e) => handleDelete(image.id, e)}
                                                disabled={isDeleting === image.id}
                                            >
                                                {isDeleting === image.id ? "Deleting..." : "Delete"}
                                            </Button>
                                        </div>
                                        <div className="p-2 bg-white">
                                            <p className="text-xs text-gray-600 truncate" title={image.filename}>
                                                {image.filename}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
