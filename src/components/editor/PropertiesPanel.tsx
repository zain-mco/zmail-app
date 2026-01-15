"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RichTextEditor } from './RichTextEditor';
import type { EmailBlock } from "@/lib/block-types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageLibraryModal } from "./ImageLibraryModal";
import { BlockStylingSection } from "./BlockStylingSection";
import { BlockIcon, blockGradients } from "./BlockIcons";
import {
    BlockType,
    BlockStyle,
    HeaderImageData,
    ImageData,
    GifData,
    TextBlockData,
    ButtonData,
    DividerData,
    FooterData,
    SpacerData,
    ColumnsData,
    SocialIconsData,
    SocialIconItem,
    ContainerData,
    blockRegistry,
} from "@/lib/block-types";

interface PropertiesPanelProps {
    block: EmailBlock | null;
    onUpdate: (data: EmailBlock["data"], style?: BlockStyle) => void;
    onDelete: () => void;
}

export function PropertiesPanel({ block, onUpdate, onDelete }: PropertiesPanelProps) {
    if (!block) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center animate-in fade-in duration-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-3xl shadow-inner">
                    👆
                </div>
                <h3 className="text-gray-900 font-semibold mb-1">No Block Selected</h3>
                <p className="text-sm">Click on any element in the canvas to customize its settings.</p>
            </div>
        );
    }

    const meta = blockRegistry[block.type];
    const gradient = blockGradients[block.type] || { from: "#6366f1", to: "#8b5cf6", bg: "rgba(99, 102, 241, 0.1)" };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div
                className="flex items-center justify-between pb-4 border-b transition-colors duration-300"
                style={{ borderColor: gradient.bg.replace('0.1', '0.3') }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm transition-all duration-300"
                        style={{
                            background: `linear-gradient(135deg, ${gradient.bg}, ${gradient.bg.replace('0.1', '0.2')})`,
                            boxShadow: `0 2px 8px ${gradient.bg}`,
                        }}
                    >
                        <BlockIcon type={block.type} size={24} />
                    </div>
                    <div>
                        <h3
                            className="font-bold text-sm"
                            style={{ color: gradient.from }}
                        >
                            {meta.label}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">Properties</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDelete}
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors h-8 w-8"
                    title="Delete Block"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </Button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={block.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                >
                    {/* Render properties based on block type */}
                    {renderProperties(block, onUpdate)}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

function renderProperties(block: EmailBlock, onUpdate: (data: any, style?: BlockStyle) => void) {
    switch (block.type) {
        case "HeaderImage": return <HeaderImageProperties block={block} onUpdate={onUpdate} />;
        case "Image": return <ImageProperties block={block} onUpdate={onUpdate} />;
        case "Gif": return <GifProperties block={block} onUpdate={onUpdate} />;
        case "TextBlock": return <TextBlockProperties block={block} onUpdate={onUpdate} />;
        case "Button": return <ButtonProperties block={block} onUpdate={onUpdate} />;
        case "Divider": return <DividerProperties block={block} onUpdate={onUpdate} />;
        case "Footer": return <FooterProperties block={block} onUpdate={onUpdate} />;
        case "Spacer": return <SpacerProperties block={block} onUpdate={onUpdate} />;
        case "Columns": return <ColumnsProperties block={block} onUpdate={onUpdate} />;
        case "SocialIcons": return <SocialIconsProperties block={block} onUpdate={onUpdate} />;
        case "Container": return <ContainerProperties block={block} onUpdate={onUpdate} />;
        default: return <div className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100 italic">No specific properties available for this block.</div>;
    }
}

// --- Property Components ---

function HeaderImageProperties({ block, onUpdate }: { block: EmailBlock; onUpdate: (data: any, style?: BlockStyle) => void }) {
    const data = block.data as HeaderImageData;
    const style = block.style || {};

    return (
        <div className="space-y-4">
            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                <Label className="text-indigo-900 font-semibold mb-1 block">Image Source</Label>
                <ImageUploader
                    currentSrc={data.src}
                    onUpload={(url) => onUpdate({ ...data, src: url })}
                    onAltChange={(alt) => onUpdate({ ...data, alt })}
                    currentAlt={data.alt}
                    imageType="header"
                />
            </div>

            {data.src && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100/50">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🔗</span>
                        <Label className="text-blue-900 font-semibold">Click Link (Optional)</Label>
                    </div>
                    <Input
                        value={data.linkUrl || ""}
                        onChange={(e) => onUpdate({ ...data, linkUrl: e.target.value })}
                        placeholder="https://yourwebsite.com"
                        className="bg-white/80 border-blue-200 focus:bg-white focus:border-blue-400 transition-all"
                    />
                    <p className="text-[10px] text-blue-600/70 mt-1.5">
                        💡 Make the header clickable. Auto-adds https:// if missing.
                    </p>
                    {data.linkUrl && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md w-fit">
                            <span>✓</span>
                            <span>Image is clickable</span>
                        </div>
                    )}
                </div>
            )}

            {/* Image Border Section */}
            {data.src && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-3">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                        <span>🔲</span> Image Border
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">Border Color</Label>
                            <ColorPicker
                                value={data.borderColor || "#e5e7eb"}
                                onChange={(val) => onUpdate({ ...data, borderColor: val })}
                            />
                        </div>
                        <div>
                            <Label className="mb-1.5 block text-xs font-semibold text-gray-400 uppercase flex justify-between">
                                <span>Border Width</span>
                                <span className="text-indigo-600">{data.borderWidth || 0}px</span>
                            </Label>
                            <input
                                type="range"
                                min={0}
                                max={10}
                                step={1}
                                value={data.borderWidth || 0}
                                onChange={(e) => onUpdate({ ...data, borderWidth: parseInt(e.target.value) })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>
                    </div>
                    <div>
                        <Label className="mb-1.5 block text-xs font-semibold text-gray-400 uppercase flex justify-between">
                            <span>Corner Radius</span>
                            <span className="text-indigo-600">{data.borderRadius || 0}px</span>
                        </Label>
                        <input
                            type="range"
                            min={0}
                            max={50}
                            step={2}
                            value={data.borderRadius || 0}
                            onChange={(e) => onUpdate({ ...data, borderRadius: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>
                </div>
            )}

            <BlockStylingSection
                style={style}
                onChange={(newStyle) => onUpdate(data, newStyle)}
            />
        </div>
    );
}

function ImageProperties({ block, onUpdate }: { block: EmailBlock; onUpdate: (data: any, style?: BlockStyle) => void }) {
    const data = block.data as ImageData;
    const style = block.style || {};
    return (
        <div className="space-y-5">
            <div className="bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                <ImageUploader
                    currentSrc={data.src}
                    onUpload={(url) => onUpdate({ ...data, src: url })}
                    onAltChange={(alt) => onUpdate({ ...data, alt })}
                    currentAlt={data.alt}
                    imageType="image"
                />
            </div>

            {data.src && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div>
                        <Label className="mb-2 block text-xs font-semibold text-gray-500 uppercase tracking-wider">Size</Label>
                        <div className="grid grid-cols-3 gap-2 bg-gray-100/50 p-1 rounded-lg">
                            {(["original", "fill", "scale"] as const).map((size) => (
                                <button
                                    key={size}
                                    onClick={() => onUpdate({ ...data, size })}
                                    className={`py-1.5 px-3 rounded-md text-xs font-medium capitalize transition-all duration-200 ${data.size === size
                                        ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {data.size === "original" && (
                        <RangeControl
                            label="Width"
                            value={data.width === "auto" ? 100 : data.width || 100}
                            onChange={(val) => onUpdate({ ...data, width: val })}
                            min={10} max={100} step={5} unit="%"
                        />
                    )}

                    <div>
                        <Label className="mb-2 block text-xs font-semibold text-gray-500 uppercase tracking-wider">Alignment</Label>
                        <div className="flex gap-2 bg-gray-100/50 p-1 rounded-lg">
                            {(["left", "center", "right"] as const).map((align) => {
                                // Default to center if no alignment is explicitly set
                                const currentAlignment = data.alignment || "center";
                                return (
                                    <button
                                        key={align}
                                        onClick={() => onUpdate({ ...data, alignment: align })}
                                        className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium capitalize transition-all duration-200 ${currentAlignment === align
                                            ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                                            }`}
                                    >
                                        {align}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100/50">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-base">🔗</span>
                            <Label htmlFor="linkUrl" className="text-blue-900 font-semibold text-xs">Click Link (Optional)</Label>
                        </div>
                        <Input
                            id="linkUrl"
                            value={data.linkUrl || ""}
                            onChange={(e) => onUpdate({ ...data, linkUrl: e.target.value })}
                            placeholder="https://yourwebsite.com"
                            className="bg-white/80 border-blue-200 focus:bg-white focus:border-blue-400 transition-all text-sm"
                        />
                        {data.linkUrl && (
                            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-green-600 bg-green-50 px-2 py-1 rounded w-fit">
                                <span>✓</span>
                                <span>Image is clickable</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Image Border Section */}
            {data.src && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-3">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                        <span>🔲</span> Image Border
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">Border Color</Label>
                            <ColorPicker
                                value={data.borderColor || "#e5e7eb"}
                                onChange={(val) => onUpdate({ ...data, borderColor: val })}
                            />
                        </div>
                        <div>
                            <Label className="mb-1.5 block text-xs font-semibold text-gray-400 uppercase flex justify-between">
                                <span>Border Width</span>
                                <span className="text-indigo-600">{data.borderWidth || 0}px</span>
                            </Label>
                            <input
                                type="range"
                                min={0}
                                max={10}
                                step={1}
                                value={data.borderWidth || 0}
                                onChange={(e) => onUpdate({ ...data, borderWidth: parseInt(e.target.value) })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>
                    </div>
                    <div>
                        <Label className="mb-1.5 block text-xs font-semibold text-gray-400 uppercase flex justify-between">
                            <span>Corner Radius</span>
                            <span className="text-indigo-600">{data.borderRadius || 0}px</span>
                        </Label>
                        <input
                            type="range"
                            min={0}
                            max={50}
                            step={2}
                            value={data.borderRadius || 0}
                            onChange={(e) => onUpdate({ ...data, borderRadius: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>
                </div>
            )}

            <BlockStylingSection
                style={style}
                onChange={(newStyle) => onUpdate(data, newStyle)}
            />
        </div>
    );
}

function GifProperties({ block, onUpdate }: { block: EmailBlock; onUpdate: (data: any, style?: BlockStyle) => void }) {
    const data = block.data as GifData;
    const style = block.style || {};

    return (
        <div className="space-y-5">
            {/* Outlook Warning */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-xl border border-amber-200 flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <div>
                    <p className="text-amber-800 text-xs font-semibold">Outlook Desktop Limitation</p>
                    <p className="text-amber-700 text-[10px] mt-0.5">Outlook will display only the first frame. Design your GIF so frame #1 looks complete.</p>
                </div>
            </div>

            {/* GIF Source - Uses same ImageUploader as Image block */}
            <div className="bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                <ImageUploader
                    currentSrc={data.src}
                    onUpload={(url) => onUpdate({ ...data, src: url })}
                    onAltChange={(alt) => onUpdate({ ...data, alt })}
                    currentAlt={data.alt}
                    imageType="gif"
                />
                <p className="text-[10px] text-gray-500 px-3 pb-2">
                    💡 Keep file size under 1MB for best deliverability
                </p>
            </div>

            {data.src && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                    {/* Width */}
                    <RangeControl
                        label="Width"
                        value={data.width === "auto" ? 100 : data.width || 100}
                        onChange={(val) => onUpdate({ ...data, width: val })}
                        min={10} max={100} step={5} unit="%"
                    />

                    {/* Alignment */}
                    <div>
                        <Label className="mb-2 block text-xs font-semibold text-gray-500 uppercase tracking-wider">Alignment</Label>
                        <div className="flex gap-2 bg-gray-100/50 p-1 rounded-lg">
                            {(["left", "center", "right"] as const).map((align) => {
                                // Default to center if no alignment is explicitly set
                                const currentAlignment = data.alignment || "center";
                                return (
                                    <button
                                        key={align}
                                        onClick={() => onUpdate({ ...data, alignment: align })}
                                        className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium capitalize transition-all duration-200 ${currentAlignment === align
                                            ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                                            }`}
                                    >
                                        {align}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Link URL */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100/50">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-base">🔗</span>
                            <Label htmlFor="gifLinkUrl" className="text-blue-900 font-semibold text-xs">Click Link (Optional)</Label>
                        </div>
                        <Input
                            id="gifLinkUrl"
                            value={data.linkUrl || ""}
                            onChange={(e) => onUpdate({ ...data, linkUrl: e.target.value })}
                            placeholder="https://yourwebsite.com"
                            className="bg-white/80 border-blue-200 focus:bg-white focus:border-blue-400 transition-all text-sm"
                        />
                        {data.linkUrl && (
                            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-green-600 bg-green-50 px-2 py-1 rounded w-fit">
                                <span>✓</span>
                                <span>GIF is clickable</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* GIF Border Section */}
            {data.src && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-3">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                        <span>🔲</span> GIF Border
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">Border Color</Label>
                            <ColorPicker
                                value={data.borderColor || "#e5e7eb"}
                                onChange={(val) => onUpdate({ ...data, borderColor: val })}
                            />
                        </div>
                        <div>
                            <Label className="mb-1.5 block text-xs font-semibold text-gray-400 uppercase flex justify-between">
                                <span>Border Width</span>
                                <span className="text-indigo-600">{data.borderWidth || 0}px</span>
                            </Label>
                            <input
                                type="range"
                                min={0}
                                max={10}
                                step={1}
                                value={data.borderWidth || 0}
                                onChange={(e) => onUpdate({ ...data, borderWidth: parseInt(e.target.value) })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>
                    </div>
                    <div>
                        <Label className="mb-1.5 block text-xs font-semibold text-gray-400 uppercase flex justify-between">
                            <span>Corner Radius</span>
                            <span className="text-indigo-600">{data.borderRadius || 0}px</span>
                        </Label>
                        <input
                            type="range"
                            min={0}
                            max={50}
                            step={2}
                            value={data.borderRadius || 0}
                            onChange={(e) => onUpdate({ ...data, borderRadius: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>
                </div>
            )}

            <BlockStylingSection
                style={style}
                onChange={(newStyle) => onUpdate(data, newStyle)}
            />
        </div>
    );
}

function TextBlockProperties({ block, onUpdate }: { block: EmailBlock; onUpdate: (data: any, style?: BlockStyle) => void }) {
    const data = block.data as TextBlockData;
    const style = block.style || {};

    return (
        <div className="space-y-5">
            <div>
                <Label htmlFor="content" className="mb-1.5 block">Content</Label>
                <RichTextEditor
                    content={data.content || ""}
                    onChange={(html) => onUpdate({ ...data, content: html })}
                    placeholder="Type your text here..."
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
                        Font

                    </Label>
                    <select
                        value={data.fontFamily || "Arial, Helvetica, sans-serif"}
                        onChange={(e) => onUpdate({ ...data, fontFamily: e.target.value })}
                        className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        title="Only system fonts work reliably in email clients"
                    >
                        <option value="Arial, Helvetica, sans-serif">Arial</option>
                        <option value="Helvetica, Arial, sans-serif">Helvetica</option>
                        <option value="'Lato', Arial, sans-serif">Lato</option>
                        <option value="'Roboto', Arial, sans-serif">Roboto</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="'Times New Roman', Times, serif">Times New Roman</option>
                        <option value="'Courier New', Courier, monospace">Courier</option>
                        <option value="Verdana, Geneva, sans-serif">Verdana</option>
                        <option value="Tahoma, Geneva, sans-serif">Tahoma</option>
                        <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
                    </select>
                </div>
                <div>
                    <Label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">Weight</Label>
                    <select
                        value={data.fontWeight || "normal"}
                        onChange={(e) => onUpdate({ ...data, fontWeight: e.target.value })}
                        className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    >
                        <option value="normal">Regular</option>
                        <option value="bold">Bold</option>
                        <option value="300">Light</option>
                        <option value="600">Semi-Bold</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">Size</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            value={data.fontSize || 16}
                            onChange={(e) => onUpdate({ ...data, fontSize: parseInt(e.target.value) || 16 })}
                            className="bg-gray-50/50"
                        />
                        <span className="text-xs text-gray-400">px</span>
                    </div>
                </div>
                <div>
                    <Label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">Color</Label>
                    <ColorPicker
                        value={data.textColor || "#333333"}
                        onChange={(val) => onUpdate({ ...data, textColor: val })}
                    />
                </div>
            </div>

            {/* Background Image Section */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100/50 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🖼️</span>
                    <Label className="text-purple-900 font-semibold text-xs">Background Image (Optional)</Label>
                </div>
                <p className="text-[10px] text-purple-600/80 -mt-1">
                    Add a background image for text overlay - full width, centered, no repeat.
                </p>

                {data.backgroundImage ? (
                    <div className="space-y-3">
                        {/* Preview */}
                        <div className="relative rounded-lg overflow-hidden border border-purple-200">
                            <img
                                src={data.backgroundImage}
                                alt="Background preview"
                                className="w-full h-24 object-cover"
                            />
                            <button
                                onClick={() => onUpdate({ ...data, backgroundImage: undefined, backgroundMinHeight: undefined })}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                title="Remove background image"
                            >
                                ×
                            </button>
                        </div>

                        {/* Min Height Control */}
                        <div>
                            <Label className="mb-1.5 block text-xs font-semibold text-purple-700 flex justify-between">
                                <span>Min Height</span>
                                <span className="text-purple-500">{data.backgroundMinHeight || 200}px</span>
                            </Label>
                            <input
                                type="range"
                                min={100}
                                max={600}
                                step={20}
                                value={data.backgroundMinHeight || 200}
                                onChange={(e) => onUpdate({ ...data, backgroundMinHeight: parseInt(e.target.value) })}
                                className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                            <p className="text-[10px] text-purple-600/70 mt-1">
                                💡 Set minimum height to ensure background image is visible
                            </p>
                        </div>

                        {/* Vertical Text Alignment */}
                        <div>
                            <Label className="mb-1.5 block text-xs font-semibold text-purple-700">Text Position</Label>
                            <div className="grid grid-cols-3 gap-2 bg-purple-100/50 p-1 rounded-lg">
                                {(["top", "center", "bottom"] as const).map((vAlign) => (
                                    <button
                                        key={vAlign}
                                        onClick={() => onUpdate({ ...data, backgroundVerticalAlign: vAlign })}
                                        className={`py-1.5 px-2 rounded-md text-xs font-medium capitalize transition-all duration-200 ${(data.backgroundVerticalAlign || "center") === vAlign
                                            ? "bg-white text-purple-600 shadow-sm ring-1 ring-purple-300"
                                            : "text-purple-600 hover:text-purple-900 hover:bg-white/50"
                                            }`}
                                    >
                                        {vAlign}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-purple-600/70 mt-1">
                                Position text vertically on the background
                            </p>
                        </div>
                    </div>
                ) : (
                    <ImageUploader
                        currentSrc=""
                        onUpload={(url) => onUpdate({ ...data, backgroundImage: url, backgroundMinHeight: 200 })}
                        onAltChange={() => { }}
                        currentAlt=""
                        imageType="image"
                    />
                )}
            </div>

            <div>
                <Label className="mb-2 block text-xs font-semibold text-gray-500 uppercase">Alignment</Label>
                <div className="flex gap-2 bg-gray-100/50 p-1 rounded-lg">
                    {(["left", "center", "right"] as const).map((align) => (
                        <button
                            key={align}
                            onClick={() => onUpdate({ ...data, alignment: align })}
                            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium capitalize transition-all duration-200 ${data.alignment === align
                                ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
                                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                                }`}
                        >
                            <span className="flex justify-center">
                                {align === 'left' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h7" /></svg>}
                                {align === 'center' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M8.5 18h7" /></svg>}
                                {align === 'right' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M13 18h7" /></svg>}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <BlockStylingSection
                style={style}
                onChange={(newStyle: BlockStyle) => onUpdate(data, newStyle)}
            />
        </div>
    );
}

function ButtonProperties({ block, onUpdate }: { block: EmailBlock; onUpdate: (data: any, style?: BlockStyle) => void }) {
    const data = block.data as ButtonData;
    const style = block.style || {};

    return (
        <div className="space-y-5">
            <div>
                <Label htmlFor="btnText" className="mb-1.5 block">Button Text</Label>
                <Input
                    id="btnText"
                    value={data.text || ""}
                    onChange={(e) => onUpdate({ ...data, text: e.target.value })}
                    className="font-medium"
                />
            </div>
            <div>
                <Label htmlFor="btnUrl" className="mb-1.5 block">Link URL</Label>
                <Input
                    id="btnUrl"
                    value={data.url || ""}
                    onChange={(e) => onUpdate({ ...data, url: e.target.value })}
                    placeholder="https://"
                    className="text-blue-600"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">Background</Label>
                    <ColorPicker
                        value={data.backgroundColor || "#1e40af"}
                        onChange={(val) => onUpdate({ ...data, backgroundColor: val })}
                    />
                </div>
                <div>
                    <Label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">Text Color</Label>
                    <ColorPicker
                        value={data.textColor || "#ffffff"}
                        onChange={(val) => onUpdate({ ...data, textColor: val })}
                    />
                </div>
            </div>

            {/* Button Border Section */}
            <div className="pt-4 border-t border-gray-100">
                <Label className="mb-3 block text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🔲</span> Button Border
                </Label>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">Border Color</Label>
                        <ColorPicker
                            value={data.borderColor || "#1e40af"}
                            onChange={(val) => onUpdate({ ...data, borderColor: val })}
                        />
                    </div>
                    <div>
                        <Label className="mb-1.5 block text-xs font-semibold text-gray-400 uppercase flex justify-between">
                            <span>Border Width</span>
                            <span className="text-indigo-600">{data.borderWidth || 0}px</span>
                        </Label>
                        <input
                            type="range"
                            min={0}
                            max={5}
                            step={1}
                            value={data.borderWidth || 0}
                            onChange={(e) => onUpdate({ ...data, borderWidth: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>
                </div>
            </div>

            {/* Corner Radius - part of button styling */}
            <div className="pt-4 border-t border-gray-100">
                <Label className="mb-1.5 block text-xs font-semibold text-gray-400 uppercase flex justify-between">
                    <span>Corner Radius</span>
                    <span className="text-indigo-600">{data.borderRadius || 6}px</span>
                </Label>
                <input
                    type="range"
                    min={0}
                    max={30}
                    step={2}
                    value={data.borderRadius || 6}
                    onChange={(e) => onUpdate({ ...data, borderRadius: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <p className="text-[10px] text-amber-600 mt-1.5">⚠️ Displays as square corners in Outlook</p>
            </div>

            <BlockStylingSection
                style={style}
                onChange={(newStyle) => onUpdate(data, newStyle)}
                showBackground={false}
                showBorder={false}
            />
        </div>
    );
}

function FooterProperties({ block, onUpdate }: { block: EmailBlock; onUpdate: (data: any, style?: BlockStyle) => void }) {
    const data = block.data as FooterData;
    const style = block.style || {};
    const [showImageSection, setShowImageSection] = useState(false);
    const [showSocialSection, setShowSocialSection] = useState(false);

    return (
        <div className="space-y-4">
            {/* Company / Structured Fields */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100/50 space-y-3">
                <Label className="text-xs font-semibold text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
                    <span>🏢</span> Company Info
                </Label>
                <Input
                    value={data.companyName || ""}
                    onChange={(e) => onUpdate({ ...data, companyName: e.target.value })}
                    placeholder="Company Name"
                    className="bg-white/80 text-sm"
                />
                <Input
                    value={data.address || ""}
                    onChange={(e) => onUpdate({ ...data, address: e.target.value })}
                    placeholder="Address"
                    className="bg-white/80 text-sm"
                />
                <Input
                    value={data.contactInfo || ""}
                    onChange={(e) => onUpdate({ ...data, contactInfo: e.target.value })}
                    placeholder="Contact: email@example.com | +1234567890"
                    className="bg-white/80 text-sm"
                />
                <Input
                    value={data.copyrightYear || ""}
                    onChange={(e) => onUpdate({ ...data, copyrightYear: e.target.value })}
                    placeholder="Copyright Year (e.g., 2024)"
                    className="bg-white/80 text-sm w-1/2"
                />
            </div>

            {/* Custom Text */}
            <div>
                <Label htmlFor="footerContent" className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">Custom Text</Label>
                <textarea
                    id="footerContent"
                    value={data.content || ""}
                    onChange={(e) => onUpdate({ ...data, content: e.target.value })}
                    className="w-full h-16 px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-600 focus:ring-2 focus:ring-indigo-500/20 resize-none bg-gray-50"
                    placeholder="Additional footer text..."
                />
            </div>

            {/* Text Styling */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-3">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                    <span>🔤</span> Text Styling
                </Label>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label className="text-[10px] text-gray-500 mb-1 block">Font</Label>
                        <select
                            value={data.fontFamily || "Arial, Helvetica, sans-serif"}
                            onChange={(e) => onUpdate({ ...data, fontFamily: e.target.value })}
                            className="w-full text-xs border rounded-md py-1.5 px-2 bg-white"
                        >
                            <option value="Arial, Helvetica, sans-serif">Arial</option>
                            <option value="Helvetica, Arial, sans-serif">Helvetica</option>
                            <option value="'Lato', Arial, sans-serif">Lato</option>
                            <option value="'Roboto', Arial, sans-serif">Roboto</option>
                            <option value="Georgia, serif">Georgia</option>
                            <option value="'Times New Roman', Times, serif">Times New Roman</option>
                            <option value="Verdana, Geneva, sans-serif">Verdana</option>
                            <option value="Tahoma, Geneva, sans-serif">Tahoma</option>
                        </select>
                    </div>
                    <div>
                        <Label className="text-[10px] text-gray-500 mb-1 block">Weight</Label>
                        <select
                            value={data.fontWeight || "normal"}
                            onChange={(e) => onUpdate({ ...data, fontWeight: e.target.value })}
                            className="w-full text-xs border rounded-md py-1.5 px-2 bg-white"
                        >
                            <option value="normal">Regular</option>
                            <option value="bold">Bold</option>
                            <option value="300">Light</option>
                            <option value="600">Semi-Bold</option>
                        </select>
                    </div>
                </div>
                <div>
                    <Label className="text-[10px] text-gray-400 mb-1 flex justify-between">
                        <span>Font Size</span>
                        <span className="text-indigo-600">{data.fontSize || 12}px</span>
                    </Label>
                    <input
                        type="range"
                        min={10}
                        max={18}
                        step={1}
                        value={data.fontSize || 12}
                        onChange={(e) => onUpdate({ ...data, fontSize: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                </div>
            </div>

            {/* Footer Image Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                    onClick={() => setShowImageSection(!showImageSection)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                    <Label className="text-xs font-semibold text-gray-600 uppercase flex items-center gap-1.5 cursor-pointer">
                        <span>🖼️</span> Footer Image (Optional)
                    </Label>
                    <span className="text-gray-400">{showImageSection ? "−" : "+"}</span>
                </button>
                {showImageSection && (
                    <div className="p-3 space-y-3 bg-white">
                        <ImageUploader
                            currentSrc={data.footerImage?.src || ""}
                            onUpload={(url) => onUpdate({
                                ...data,
                                footerImage: {
                                    ...data.footerImage,
                                    src: url,
                                    alt: data.footerImage?.alt || "Footer image",
                                    position: data.footerImage?.position || "above"
                                }
                            })}
                            onAltChange={(alt) => onUpdate({ ...data, footerImage: { ...data.footerImage, alt } })}
                            currentAlt={data.footerImage?.alt}
                            imageType="footer"
                        />
                        {data.footerImage?.src && (
                            <>
                                <div>
                                    <Label className="text-xs text-gray-500 mb-1.5 block">Position</Label>
                                    <div className="grid grid-cols-2 gap-2 bg-gray-100/50 p-1 rounded-lg">
                                        {(["above", "below"] as const).map(pos => (
                                            <button
                                                key={pos}
                                                onClick={() => onUpdate({ ...data, footerImage: { ...data.footerImage, position: pos } })}
                                                className={`py-1.5 rounded-md text-xs font-medium capitalize transition-all ${data.footerImage?.position === pos ? "bg-white text-indigo-600 shadow-sm" : "text-gray-600"}`}
                                            >
                                                {pos} Text
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <Input
                                    value={data.footerImage?.linkUrl || ""}
                                    onChange={(e) => onUpdate({ ...data, footerImage: { ...data.footerImage, linkUrl: e.target.value } })}
                                    placeholder="Image link URL (optional)"
                                    className="text-xs"
                                />
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Social Icons Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                    onClick={() => setShowSocialSection(!showSocialSection)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                    <Label className="text-xs font-semibold text-gray-600 uppercase flex items-center gap-1.5 cursor-pointer">
                        <span>🔗</span> Social Icons (Optional)
                    </Label>
                    <span className="text-gray-400">{showSocialSection ? "−" : "+"}</span>
                </button>
                {showSocialSection && (
                    <div className="p-3 space-y-3 bg-white">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.showSocialIcons || false}
                                onChange={(e) => onUpdate({ ...data, showSocialIcons: e.target.checked })}
                                className="rounded border-gray-300 text-indigo-600"
                            />
                            <span className="text-sm text-gray-700">Show social icons in footer</span>
                        </label>

                        {data.showSocialIcons && (
                            <div className="space-y-3 pt-2 border-t border-gray-100">
                                {/* Quick add platforms */}
                                <div className="flex flex-wrap gap-1.5">
                                    {["facebook", "twitter", "instagram", "linkedin", "youtube", "email", "phone"].map(platform => {
                                        const exists = data.socialIcons?.some(i => i.platform === platform);
                                        return (
                                            <button
                                                key={platform}
                                                onClick={() => {
                                                    if (exists) {
                                                        onUpdate({ ...data, socialIcons: data.socialIcons?.filter(i => i.platform !== platform) });
                                                    } else {
                                                        onUpdate({
                                                            ...data,
                                                            socialIcons: [...(data.socialIcons || []), { platform, url: "", enabled: true }]
                                                        });
                                                    }
                                                }}
                                                className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${exists ? "bg-indigo-100 text-indigo-700 border border-indigo-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                                            >
                                                {exists ? "✓" : "+"} {platform}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Icon URLs */}
                                {data.socialIcons?.map((icon, idx) => (
                                    <div key={`${icon.platform}-${idx}`} className="flex gap-2 items-center">
                                        <span className="text-xs font-medium text-gray-500 w-16 capitalize">{icon.platform}</span>
                                        <Input
                                            value={icon.url}
                                            onChange={(e) => {
                                                const newIcons = [...(data.socialIcons || [])];
                                                newIcons[idx] = { ...newIcons[idx], url: e.target.value };
                                                onUpdate({ ...data, socialIcons: newIcons });
                                            }}
                                            placeholder={icon.platform === "email" ? "mailto:..." : icon.platform === "phone" ? "tel:+..." : "https://..."}
                                            className="text-xs flex-1"
                                        />
                                    </div>
                                ))}

                                {/* Icon Size & Style */}
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div>
                                        <Label className="text-[10px] text-gray-500 mb-1 block">Size</Label>
                                        <select
                                            value={data.socialIconSize || 32}
                                            onChange={(e) => onUpdate({ ...data, socialIconSize: parseInt(e.target.value) })}
                                            className="w-full text-xs border rounded-md py-1 px-2"
                                        >
                                            <option value={20}>20px</option>
                                            <option value={24}>24px</option>
                                            <option value={28}>28px</option>
                                            <option value={32}>32px</option>
                                            <option value={40}>40px</option>
                                            <option value={48}>48px</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label className="text-[10px] text-gray-500 mb-1 block">Style</Label>
                                        <select
                                            value={data.socialIconStyle || "brand"}
                                            onChange={(e) => onUpdate({ ...data, socialIconStyle: e.target.value as any })}
                                            className="w-full text-xs border rounded-md py-1 px-2"
                                        >
                                            <option value="white">White (on color bg)</option>
                                            <option value="black">Black</option>
                                            <option value="brand">Brand Colors</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Background Circle Toggle */}
                                <div className="pt-2 border-t border-gray-100 mt-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.socialIconShowBackground !== false}
                                            onChange={(e) => onUpdate({ ...data, socialIconShowBackground: e.target.checked })}
                                            className="rounded border-gray-300 text-indigo-600"
                                        />
                                        <span className="text-xs text-gray-700">Show colored background</span>
                                    </label>
                                </div>

                                {/* Spacing & Radius */}
                                {data.socialIconShowBackground !== false && (
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <div>
                                            <Label className="text-[10px] text-gray-400 mb-1 flex justify-between">
                                                <span>Spacing</span>
                                                <span className="text-indigo-600">{data.socialIconSpacing || 8}px</span>
                                            </Label>
                                            <input
                                                type="range"
                                                min={4}
                                                max={24}
                                                step={2}
                                                value={data.socialIconSpacing || 8}
                                                onChange={(e) => onUpdate({ ...data, socialIconSpacing: parseInt(e.target.value) })}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-[10px] text-gray-400 mb-1 flex justify-between">
                                                <span>Corner</span>
                                                <span className="text-indigo-600">{data.socialIconBackgroundRadius ?? 50}%</span>
                                            </Label>
                                            <input
                                                type="range"
                                                min={0}
                                                max={50}
                                                step={10}
                                                value={data.socialIconBackgroundRadius ?? 50}
                                                onChange={(e) => onUpdate({ ...data, socialIconBackgroundRadius: parseInt(e.target.value) })}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">Background</Label>
                    <ColorPicker
                        value={data.backgroundColor || "#f8f9fa"}
                        onChange={(val) => onUpdate({ ...data, backgroundColor: val })}
                    />
                </div>
                <div>
                    <Label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">Text Color</Label>
                    <ColorPicker
                        value={data.textColor || "#6c757d"}
                        onChange={(val) => onUpdate({ ...data, textColor: val })}
                    />
                </div>
            </div>

            <BlockStylingSection
                style={style}
                onChange={(newStyle) => onUpdate(data, newStyle)}
            />
        </div>
    );
}

function DividerProperties({ block, onUpdate }: { block: EmailBlock; onUpdate: (data: any, style?: BlockStyle) => void }) {
    const data = block.data as DividerData;
    const style = block.style || {};
    return (
        <div className="space-y-4">
            <div>
                <Label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">Color</Label>
                <ColorPicker
                    value={data.color || "#e5e7eb"}
                    onChange={(val) => onUpdate({ ...data, color: val })}
                />
            </div>

            <RangeControl
                label="Thickness"
                value={data.thickness || 1}
                onChange={(val) => onUpdate({ ...data, thickness: val })}
                min={1} max={10} step={1} unit="px"
            />

            <RangeControl
                label="Width"
                value={data.width || 100}
                onChange={(val) => onUpdate({ ...data, width: val })}
                min={10} max={100} step={5} unit="%"
            />

            <div>
                <Label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">Style</Label>
                <div className="flex bg-gray-100/50 p-1 rounded-lg">
                    {(["solid", "dashed", "dotted"] as const).map((style) => (
                        <button
                            key={style}
                            onClick={() => onUpdate({ ...data, style })}
                            className={`flex-1 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${data.style === style
                                ? "bg-white text-indigo-600 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {style}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SpacerProperties({ block, onUpdate }: { block: EmailBlock; onUpdate: (data: any, style?: BlockStyle) => void }) {
    const data = block.data as SpacerData;
    const style = block.style || {};
    return (
        <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
            <RangeControl
                label="Height"
                value={data.height || 20}
                onChange={(val) => onUpdate({ ...data, height: val })}
                min={10} max={200} step={10} unit="px"
            />

            <BlockStylingSection
                style={style}
                onChange={(newStyle) => onUpdate(data, newStyle)}
                showBorder={false}
            />
        </div>
    );
}

function ColumnsProperties({ block, onUpdate }: { block: EmailBlock; onUpdate: (data: any, style?: BlockStyle) => void }) {
    const data = block.data as ColumnsData;
    const style = block.style || {};
    return (
        <div className="space-y-6">
            {/* Desktop Layout */}
            <div>
                <Label className="mb-2 block text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🖥️</span> Desktop Columns
                </Label>
                <div className="grid grid-cols-3 gap-3">
                    {([1, 2, 3] as const).map((count) => (
                        <button
                            key={count}
                            onClick={() => {
                                const newColumns = Array.from({ length: count }, (_, i) => data.columns[i] || []);
                                onUpdate({ ...data, columnCount: count, columns: newColumns });
                            }}
                            className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1.5 ${data.columnCount === count
                                ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm"
                                : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                                }`}
                        >
                            <span className="font-bold text-lg leading-none">{count}</span>
                            <span className="text-[10px] font-medium uppercase tracking-wide opacity-80">Column{count > 1 ? 's' : ''}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Mobile Layout */}
            <div>
                <Label className="mb-2 block text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📱</span> Mobile Columns
                </Label>
                <div className="grid grid-cols-3 gap-3">
                    {([1, 2, 3] as const).map((count) => (
                        <button
                            key={count}
                            onClick={() => onUpdate({ ...data, mobileColumnCount: count })}
                            className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1.5 ${(data.mobileColumnCount || 1) === count
                                ? "border-purple-500 bg-purple-50 text-purple-700 shadow-sm"
                                : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                                }`}
                        >
                            <span className="font-bold text-lg leading-none">{count}</span>
                            <span className="text-[10px] font-medium uppercase tracking-wide opacity-80">Column{count > 1 ? 's' : ''}</span>
                        </button>
                    ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-2">📱 Defaults to 1 column (stacked) on mobile</p>
            </div>

            {/* Gutter Size */}
            <div className="pt-4 border-t border-gray-100">
                <RangeControl
                    label="Gutter Size"
                    value={data.gap || 0}
                    onChange={(val) => onUpdate({ ...data, gap: val })}
                    min={0} max={60} step={4} unit="px"
                />
            </div>

            {/* Vertical Alignment */}
            <div className="pt-4 border-t border-gray-100">
                <Label className="mb-2 block text-xs font-semibold text-gray-500 uppercase tracking-wider">Vertical Alignment</Label>
                <div className="flex bg-gray-100/50 p-1 rounded-lg">
                    {(["start", "center", "end"] as const).map((align) => (
                        <button
                            key={align}
                            onClick={() => onUpdate({ ...data, alignItems: align })}
                            className={`flex-1 py-1.5 rounded-md transition-all ${data.alignItems === align
                                ? "bg-white text-indigo-600 shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                            title={`Align ${align}`}
                        >
                            <div className="flex flex-col gap-0.5 items-center justify-center h-4 w-full">
                                <div className={`w-3 h-0.5 rounded-full ${data.alignItems === align ? 'bg-indigo-600' : 'bg-current'}`}></div>
                                <div className={`w-2 h-0.5 rounded-full ${data.alignItems === align ? 'bg-indigo-600' : 'bg-current'}`}></div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Transparent Background Toggle */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <Label className="text-xs font-semibold text-gray-500 uppercase">
                    Transparent Background
                </Label>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={data.transparentBackground || false}
                        onChange={(e) => onUpdate({ ...data, transparentBackground: e.target.checked })}
                        className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                </label>
            </div>

            {/* Background Color - only show when not transparent */}
            {!data.transparentBackground && (
                <div>
                    <Label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">
                        Background Color
                    </Label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="color"
                            value={data.backgroundColor || "#ffffff"}
                            onChange={(e) => onUpdate({ ...data, backgroundColor: e.target.value })}
                            className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                        />
                        <Input
                            value={data.backgroundColor || ""}
                            onChange={(e) => onUpdate({ ...data, backgroundColor: e.target.value })}
                            placeholder="#ffffff"
                            className="flex-1 bg-white/80"
                        />
                        {data.backgroundColor && (
                            <button
                                onClick={() => onUpdate({ ...data, backgroundColor: undefined })}
                                className="text-xs text-gray-400 hover:text-gray-600"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-xs text-indigo-800 leading-relaxed flex gap-2">
                <span className="text-lg">💡</span>
                <span><strong>Pro Tip:</strong> Use Gutter to space out the columns.</span>
            </div>
        </div>
    );
}

// Social platform display names and icons
const socialPlatforms: Record<string, { name: string; icon: string; placeholder: string }> = {
    facebook: { name: "Facebook", icon: "📘", placeholder: "https://facebook.com/yourpage" },
    twitter: { name: "X (Twitter)", icon: "✖️", placeholder: "https://x.com/yourhandle" },
    instagram: { name: "Instagram", icon: "📸", placeholder: "https://instagram.com/yourhandle" },
    linkedin: { name: "LinkedIn", icon: "💼", placeholder: "https://linkedin.com/company/yourcompany" },
    youtube: { name: "YouTube", icon: "🎬", placeholder: "https://youtube.com/@yourchannel" },
    tiktok: { name: "TikTok", icon: "🎵", placeholder: "https://tiktok.com/@yourhandle" },
    whatsapp: { name: "WhatsApp", icon: "💬", placeholder: "https://wa.me/971501234567" },
    website: { name: "Website", icon: "🌐", placeholder: "https://yourwebsite.com" },
    email: { name: "Email", icon: "✉️", placeholder: "mailto:contact@example.com" },
    phone: { name: "Phone", icon: "📞", placeholder: "tel:+971501234567" },
};

function SocialIconsProperties({ block, onUpdate }: { block: EmailBlock; onUpdate: (data: any, style?: BlockStyle) => void }) {
    const data = block.data as SocialIconsData;
    const style = block.style || {};

    const updateIcon = (index: number, updates: Partial<SocialIconItem>) => {
        const newIcons = [...data.icons];
        newIcons[index] = { ...newIcons[index], ...updates };
        onUpdate({ ...data, icons: newIcons });
    };

    const addIcon = (platform: string) => {
        const newIcon: SocialIconItem = {
            platform: platform as SocialIconItem["platform"],
            url: "",
            enabled: true,
        };
        onUpdate({ ...data, icons: [...data.icons, newIcon] });
    };

    const removeIcon = (index: number) => {
        const newIcons = data.icons.filter((_, i) => i !== index);
        onUpdate({ ...data, icons: newIcons });
    };

    // Get platforms not yet added
    const availablePlatforms = Object.keys(socialPlatforms).filter(
        platform => !data.icons.some(icon => icon.platform === platform)
    );

    return (
        <div className="space-y-5">
            {/* Social Links */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Social Links</Label>
                    <span className="text-[10px] text-gray-400">{data.icons.filter(i => i.enabled && i.url).length} active</span>
                </div>

                {data.icons.map((icon, index) => {
                    const platform = socialPlatforms[icon.platform];
                    return (
                        <div key={`${icon.platform}-${index}`} className="bg-gray-50 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{platform?.icon || "🔗"}</span>
                                    <span className="font-medium text-sm text-gray-700">{platform?.name || icon.platform}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={icon.enabled}
                                            onChange={(e) => updateIcon(index, { enabled: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-8 h-4 bg-gray-300 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                                    </label>
                                    <button
                                        onClick={() => removeIcon(index)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                        title="Remove"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <Input
                                value={icon.url}
                                onChange={(e) => updateIcon(index, { url: e.target.value })}
                                placeholder={platform?.placeholder || "https://..."}
                                className="text-xs bg-white"
                            />
                            {icon.enabled && !icon.url && (
                                <p className="text-[10px] text-amber-600">⚠️ Add URL to display this icon</p>
                            )}

                            {/* Per-icon customization toggle */}
                            <details className="group">
                                <summary className="text-[10px] text-indigo-600 cursor-pointer hover:text-indigo-800 flex items-center gap-1">
                                    <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                    Customize this icon
                                </summary>
                                <div className="mt-2 p-2 bg-purple-50 rounded-lg border border-purple-100 space-y-2">
                                    {/* Per-icon Size */}
                                    <div className="flex items-center gap-2">
                                        <Label className="text-[10px] text-gray-500 w-12">Size:</Label>
                                        <select
                                            value={icon.iconSize ?? ""}
                                            onChange={(e) => updateIcon(index, { iconSize: e.target.value ? parseInt(e.target.value) : undefined })}
                                            className="flex-1 text-[10px] border rounded py-0.5 px-1"
                                        >
                                            <option value="">Default ({data.iconSize || 32}px)</option>
                                            <option value="24">24px</option>
                                            <option value="32">32px</option>
                                            <option value="40">40px</option>
                                            <option value="48">48px</option>
                                        </select>
                                    </div>
                                    {/* Per-icon Style */}
                                    <div className="flex items-center gap-2">
                                        <Label className="text-[10px] text-gray-500 w-12">Style:</Label>
                                        <select
                                            value={icon.iconStyle ?? ""}
                                            onChange={(e) => updateIcon(index, { iconStyle: e.target.value as any || undefined })}
                                            className="flex-1 text-[10px] border rounded py-0.5 px-1"
                                        >
                                            <option value="">Default ({data.iconStyle || "brand"})</option>
                                            <option value="brand">Brand</option>
                                            <option value="black">Black</option>
                                            <option value="white">White</option>
                                        </select>
                                    </div>
                                    {/* Per-icon Background */}
                                    <div className="flex items-center gap-2">
                                        <Label className="text-[10px] text-gray-500 w-12">Bg:</Label>
                                        <select
                                            value={icon.showBackground === undefined ? "" : icon.showBackground ? "yes" : "no"}
                                            onChange={(e) => updateIcon(index, { showBackground: e.target.value === "" ? undefined : e.target.value === "yes" })}
                                            className="text-[10px] border rounded py-0.5 px-1"
                                        >
                                            <option value="">Default</option>
                                            <option value="yes">Show</option>
                                            <option value="no">Hide</option>
                                        </select>
                                        {icon.showBackground !== false && (
                                            <div className="flex items-center gap-1">
                                                <div className="relative w-5 h-5 rounded overflow-hidden border border-gray-200 cursor-pointer">
                                                    <input
                                                        type="color"
                                                        value={icon.backgroundColor || "#1877F2"}
                                                        onChange={(e) => updateIcon(index, { backgroundColor: e.target.value })}
                                                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                                    />
                                                    <div className="w-full h-full" style={{ backgroundColor: icon.backgroundColor || "#1877F2" }} />
                                                </div>
                                                {icon.backgroundColor && (
                                                    <button
                                                        onClick={() => updateIcon(index, { backgroundColor: undefined })}
                                                        className="text-[9px] text-gray-400 hover:text-gray-600"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </details>
                        </div>
                    );
                })}

                {/* Add new platform */}
                {availablePlatforms.length > 0 && (
                    <div className="pt-2">
                        <Label className="text-xs text-gray-500 mb-2 block">Add Platform</Label>
                        <div className="flex flex-wrap gap-2">
                            {availablePlatforms.map(platform => (
                                <button
                                    key={platform}
                                    onClick={() => addIcon(platform)}
                                    className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded-md text-xs text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                                >
                                    <span>{socialPlatforms[platform].icon}</span>
                                    <span>{socialPlatforms[platform].name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Display Options */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Display Options</Label>

                {/* Icon Size */}
                <div>
                    <Label className="text-xs text-gray-600 mb-2 block">Icon Size</Label>
                    <div className="grid grid-cols-4 gap-2 bg-gray-100/50 p-1 rounded-lg">
                        {[24, 32, 40, 48].map(size => (
                            <button
                                key={size}
                                onClick={() => onUpdate({ ...data, iconSize: size })}
                                className={`py-1.5 rounded-md text-xs font-medium transition-all ${data.iconSize === size
                                    ? "bg-white text-indigo-600 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                {size}px
                            </button>
                        ))}
                    </div>
                </div>

                {/* Spacing */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <Label className="text-xs text-gray-600">Spacing</Label>
                        <span className="text-xs font-mono font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {data.iconSpacing || 12}px
                        </span>
                    </div>
                    <input
                        type="range"
                        min={4}
                        max={32}
                        step={4}
                        value={data.iconSpacing || 12}
                        onChange={(e) => onUpdate({ ...data, iconSpacing: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                </div>

                {/* Alignment */}
                <div>
                    <Label className="text-xs text-gray-600 mb-2 block">Alignment</Label>
                    <div className="grid grid-cols-3 gap-2 bg-gray-100/50 p-1 rounded-lg">
                        {(["left", "center", "right"] as const).map(align => (
                            <button
                                key={align}
                                onClick={() => onUpdate({ ...data, alignment: align })}
                                className={`py-1.5 rounded-md text-xs font-medium capitalize transition-all ${data.alignment === align
                                    ? "bg-white text-indigo-600 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                {align}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Icon Style */}
                <div>
                    <Label className="text-xs text-gray-600 mb-2 block">Icon Style</Label>
                    <div className="grid grid-cols-3 gap-2 bg-gray-100/50 p-1 rounded-lg">
                        {([
                            { value: "white", label: "White" },
                            { value: "black", label: "Black" },
                            { value: "brand", label: "Brand" },
                        ] as const).map(styleOption => (
                            <button
                                key={styleOption.value}
                                onClick={() => onUpdate({ ...data, iconStyle: styleOption.value })}
                                className={`py-1.5 px-2 rounded-md text-xs transition-all ${data.iconStyle === styleOption.value
                                    ? "bg-white text-indigo-600 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                {styleOption.label}
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">White icons work best with colored backgrounds</p>
                </div>

                {/* Background Circle Settings */}
                <div className="space-y-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100/50">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs text-indigo-900 font-semibold">Background Circle</Label>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.showBackground !== false}
                                onChange={(e) => onUpdate({ ...data, showBackground: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-8 h-4 bg-gray-300 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                        </label>
                    </div>

                    {data.showBackground !== false && (
                        <>
                            <div>
                                <Label className="text-xs text-gray-600 mb-1 block">Background Color</Label>
                                <div className="flex gap-2">
                                    <div className="relative w-8 h-8 rounded overflow-hidden border border-gray-200 shrink-0 cursor-pointer">
                                        <input
                                            type="color"
                                            value={data.backgroundColor || "#1877F2"}
                                            onChange={(e) => onUpdate({ ...data, backgroundColor: e.target.value })}
                                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                        />
                                        <div className="w-full h-full" style={{ backgroundColor: data.backgroundColor || "#1877F2" }} />
                                    </div>
                                    <button
                                        onClick={() => onUpdate({ ...data, backgroundColor: undefined })}
                                        className="text-[10px] text-indigo-600 hover:text-indigo-800"
                                    >
                                        Use brand colors
                                    </button>
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs text-gray-600 mb-1 block">Corner Radius</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {([{ value: 50, label: "Circle" }, { value: 8, label: "Rounded" }, { value: 0, label: "Square" }] as const).map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => onUpdate({ ...data, backgroundRadius: opt.value })}
                                            className={`py-1 rounded text-[10px] transition-all ${(data.backgroundRadius ?? 50) === opt.value
                                                ? "bg-indigo-600 text-white"
                                                : "bg-white text-gray-600 hover:bg-gray-50"
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <BlockStylingSection
                style={style}
                onChange={(newStyle) => onUpdate(data, newStyle)}
            />
        </div>
    );
}


// --- Helper Components ---

function ColorPicker({ value, onChange }: { value: string; onChange: (val: string) => void }) {
    return (
        <div className="flex gap-2">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200 shadow-sm shrink-0 group cursor-pointer transition-transform hover:scale-105 active:scale-95">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                />
                <div className="w-full h-full" style={{ backgroundColor: value }} />
            </div>
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="font-mono text-xs uppercase"
            />
        </div>
    );
}

function RangeControl({ label, value, onChange, min, max, step, unit }: { label: string, value: number, onChange: (val: number) => void, min: number, max: number, step: number, unit: string }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase">{label}</Label>
                <span className="text-xs font-mono font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{value}{unit}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all"
            />
        </div>
    );
}

function ImageUploader({ currentSrc, onUpload, imageType, currentAlt, onAltChange }: {
    currentSrc?: string;
    onUpload: (url: string) => void;
    imageType: string;
    currentAlt?: string;
    onAltChange?: (alt: string) => void;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showLibrary, setShowLibrary] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "campaigns");
        formData.append("imageType", imageType);

        try {
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const result = await res.json();
            if (result.success && result.url) {
                onUpload(result.url);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-3">
            {currentSrc ? (
                <div
                    className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-video flex items-center justify-center"
                    style={{
                        // Checkerboard pattern for transparent images (like Photoshop)
                        backgroundImage: `linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
                                          linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
                                          linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
                                          linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)`,
                        backgroundSize: '16px 16px',
                        backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                        backgroundColor: '#ffffff'
                    }}
                >
                    <img src={currentSrc} alt="Preview" className="max-w-full max-h-full object-contain" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()} className="h-8 text-xs">Replace</Button>
                        <Button size="sm" variant="secondary" onClick={() => setShowLibrary(true)} className="h-8 text-xs">Library</Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="h-20 flex flex-col gap-1 border-dashed">
                        <span className="text-2xl">📤</span>
                        <span className="text-xs font-medium">{isUploading ? "Uploading..." : "Upload New"}</span>
                    </Button>
                    <Button variant="outline" onClick={() => setShowLibrary(true)} className="h-20 flex flex-col gap-1 border-dashed">
                        <span className="text-2xl">🖼️</span>
                        <span className="text-xs font-medium">From Library</span>
                    </Button>
                </div>
            )}

            {currentSrc && onAltChange && (
                <div>
                    <Label className="sr-only">Alt Text</Label>
                    <Input
                        value={currentAlt || ""}
                        onChange={(e) => onAltChange(e.target.value)}
                        placeholder="Image description (Alt text)"
                        className="text-xs"
                    />
                </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

            <ImageLibraryModal
                isOpen={showLibrary}
                onClose={() => setShowLibrary(false)}
                onSelect={onUpload}
                onUploadNew={() => { setShowLibrary(false); fileInputRef.current?.click(); }}
            />
        </div>
    );
}

// Container Properties - email-safe table-based container
function ContainerProperties({ block, onUpdate }: { block: EmailBlock; onUpdate: (data: any, style?: BlockStyle) => void }) {
    const data = block.data as ContainerData;

    return (
        <div className="space-y-4">



            {/* Max Width */}
            <div>
                <Label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">
                    Container Width (px)
                </Label>
                <Input
                    type="number"
                    value={data.maxWidth || 600}
                    onChange={(e) => onUpdate({ ...data, maxWidth: parseInt(e.target.value) || 600 })}
                    min={200}
                    max={600}
                    step={10}
                    className="bg-white/80"
                />
                <p className="text-xs text-gray-400 mt-1">Standard: 600px</p>
            </div>

            {/* Alignment */}
            <div>
                <Label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">
                    Alignment
                </Label>
                <div className="flex gap-2">
                    {(["left", "center", "right"] as const).map((align) => (
                        <button
                            key={align}
                            onClick={() => onUpdate({ ...data, alignment: align })}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${(data.alignment || "center") === align
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {align.charAt(0).toUpperCase() + align.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Desktop Layout Direction */}
            <div>
                <Label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
                    <span>🖥️</span> Desktop Layout
                </Label>
                <div className="flex gap-2">
                    <button
                        onClick={() => onUpdate({ ...data, layoutDirection: "column" })}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${(data.layoutDirection || "column") === "column"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Column
                    </button>
                    <button
                        onClick={() => onUpdate({ ...data, layoutDirection: "row" })}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${data.layoutDirection === "row"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Row
                    </button>
                </div>
            </div>

            {/* Mobile Layout Direction */}
            <div>
                <Label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
                    <span>📱</span> Mobile Layout
                </Label>
                <div className="flex gap-2">
                    <button
                        onClick={() => onUpdate({ ...data, mobileLayoutDirection: "column" })}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${(data.mobileLayoutDirection || data.layoutDirection || "column") === "column"
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Column
                    </button>
                    <button
                        onClick={() => onUpdate({ ...data, mobileLayoutDirection: "row" })}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${data.mobileLayoutDirection === "row"
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Row
                    </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">📱 Mobile defaults to desktop layout if not set</p>
            </div>

            {/* Vertical Alignment */}
            <div>
                <Label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">
                    Vertical Alignment
                </Label>
                <div className="flex gap-2">
                    <button
                        onClick={() => onUpdate({ ...data, verticalAlignment: "start" })}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${(data.verticalAlignment || "start") === "start"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        Top
                    </button>
                    <button
                        onClick={() => onUpdate({ ...data, verticalAlignment: "center" })}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${data.verticalAlignment === "center"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        Middle
                    </button>
                    <button
                        onClick={() => onUpdate({ ...data, verticalAlignment: "end" })}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${data.verticalAlignment === "end"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        Bottom
                    </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Align items within the container</p>
            </div>

            {/* Transparent Background Toggle */}
            <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-gray-500 uppercase">
                    Transparent Background
                </Label>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={data.transparentBackground || false}
                        onChange={(e) => onUpdate({ ...data, transparentBackground: e.target.checked })}
                        className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                </label>
            </div>

            {/* Background Color - only show when not transparent */}
            {!data.transparentBackground && (
                <div>
                    <Label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">
                        Background Color
                    </Label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="color"
                            value={data.backgroundColor || "#ffffff"}
                            onChange={(e) => onUpdate({ ...data, backgroundColor: e.target.value })}
                            className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                        />
                        <Input
                            value={data.backgroundColor || ""}
                            onChange={(e) => onUpdate({ ...data, backgroundColor: e.target.value })}
                            placeholder="#ffffff"
                            className="flex-1 bg-white/80"
                        />
                        {data.backgroundColor && (
                            <button
                                onClick={() => onUpdate({ ...data, backgroundColor: undefined })}
                                className="text-xs text-gray-400 hover:text-gray-600"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Padding */}
            <div>
                <Label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">
                    Padding (px)
                </Label>
                <div className="grid grid-cols-4 gap-2">
                    <div>
                        <span className="text-[10px] text-gray-400 block text-center">Top</span>
                        <Input
                            type="number"
                            value={data.paddingTop ?? 20}
                            onChange={(e) => onUpdate({ ...data, paddingTop: parseInt(e.target.value) || 0 })}
                            min={0}
                            max={100}
                            className="text-center bg-white/80"
                        />
                    </div>
                    <div>
                        <span className="text-[10px] text-gray-400 block text-center">Right</span>
                        <Input
                            type="number"
                            value={data.paddingRight ?? 20}
                            onChange={(e) => onUpdate({ ...data, paddingRight: parseInt(e.target.value) || 0 })}
                            min={0}
                            max={100}
                            className="text-center bg-white/80"
                        />
                    </div>
                    <div>
                        <span className="text-[10px] text-gray-400 block text-center">Bottom</span>
                        <Input
                            type="number"
                            value={data.paddingBottom ?? 20}
                            onChange={(e) => onUpdate({ ...data, paddingBottom: parseInt(e.target.value) || 0 })}
                            min={0}
                            max={100}
                            className="text-center bg-white/80"
                        />
                    </div>
                    <div>
                        <span className="text-[10px] text-gray-400 block text-center">Left</span>
                        <Input
                            type="number"
                            value={data.paddingLeft ?? 20}
                            onChange={(e) => onUpdate({ ...data, paddingLeft: parseInt(e.target.value) || 0 })}
                            min={0}
                            max={100}
                            className="text-center bg-white/80"
                        />
                    </div>
                </div>
            </div>

            {/* Border */}
            <div>
                <Label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">
                    Border
                </Label>
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            value={data.borderWidth || 0}
                            onChange={(e) => onUpdate({ ...data, borderWidth: parseInt(e.target.value) || 0 })}
                            min={0}
                            max={10}
                            placeholder="Width"
                            className="w-20 bg-white/80"
                        />
                        <select
                            value={data.borderStyle || "solid"}
                            onChange={(e) => onUpdate({ ...data, borderStyle: e.target.value as any })}
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
                        >
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                            <option value="none">None</option>
                        </select>
                        <input
                            type="color"
                            value={data.borderColor || "#e5e7eb"}
                            onChange={(e) => onUpdate({ ...data, borderColor: e.target.value })}
                            className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                        />
                    </div>
                    <div>
                        <span className="text-[10px] text-gray-400">Border Radius (limited Outlook support)</span>
                        <Input
                            type="number"
                            value={data.borderRadius || 0}
                            onChange={(e) => onUpdate({ ...data, borderRadius: parseInt(e.target.value) || 0 })}
                            min={0}
                            max={50}
                            className="bg-white/80"
                        />
                    </div>
                </div>
            </div>

            {/* Email Compatibility Note */}
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                <div className="flex items-start gap-2">
                    <span className="text-sm">⚠️</span>
                    <div className="text-xs text-amber-800">
                        <strong>Outlook Note:</strong> Border-radius is ignored in Outlook desktop. All other styles are fully supported.
                    </div>
                </div>
            </div>
        </div>
    );
}

