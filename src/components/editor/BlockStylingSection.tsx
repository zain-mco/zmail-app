// Block Styling Section Component - Reusable styling controls for all blocks
// This provides email-safe background colors, borders, and padding options

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { BlockStyle } from "@/lib/block-types";
import { ChevronDown, ChevronUp } from "lucide-react";

interface BlockStylingSectionProps {
    style?: BlockStyle;
    onChange: (style: BlockStyle) => void;
    showBackground?: boolean;
    showBorder?: boolean;
    showPadding?: boolean;
}

export function BlockStylingSection({
    style = {},
    onChange, showBackground = true,
    showBorder = true,
    showPadding = true
}: BlockStylingSectionProps) {
    // Track whether we're using individual padding or uniform
    const hasIndividualPadding = style.paddingTop !== undefined ||
        style.paddingRight !== undefined ||
        style.paddingBottom !== undefined ||
        style.paddingLeft !== undefined;

    const [useIndividualPadding, setUseIndividualPadding] = useState(hasIndividualPadding);
    const [isExpanded, setIsExpanded] = useState(true);

    const updateStyle = (updates: Partial<BlockStyle>) => {
        onChange({ ...style, ...updates });
    };

    // Get effective padding values (individual or from uniform)
    const getPaddingValues = () => {
        if (useIndividualPadding) {
            return {
                top: style.paddingTop ?? 0,
                right: style.paddingRight ?? 0,
                bottom: style.paddingBottom ?? 0,
                left: style.paddingLeft ?? 0,
            };
        }
        const uniform = style.padding ?? 0;
        return { top: uniform, right: uniform, bottom: uniform, left: uniform };
    };

    // Update individual padding and clear uniform
    const updateIndividualPadding = (side: 'top' | 'right' | 'bottom' | 'left', value: number) => {
        const current = getPaddingValues();
        updateStyle({
            padding: undefined,
            paddingTop: side === 'top' ? value : current.top,
            paddingRight: side === 'right' ? value : current.right,
            paddingBottom: side === 'bottom' ? value : current.bottom,
            paddingLeft: side === 'left' ? value : current.left,
        });
    };

    // Toggle between uniform and individual padding
    const togglePaddingMode = (individual: boolean) => {
        setUseIndividualPadding(individual);
        if (!individual) {
            // Convert to uniform - use max of current values
            const current = getPaddingValues();
            const uniform = Math.max(current.top, current.right, current.bottom, current.left);
            updateStyle({
                padding: uniform,
                paddingTop: undefined,
                paddingRight: undefined,
                paddingBottom: undefined,
                paddingLeft: undefined,
            });
        } else {
            // Convert to individual
            const uniform = style.padding ?? 0;
            updateStyle({
                padding: undefined,
                paddingTop: uniform,
                paddingRight: uniform,
                paddingBottom: uniform,
                paddingLeft: uniform,
            });
        }
    };

    const paddingValues = getPaddingValues();

    return (
        <div className="space-y-4 pt-4 mt-4 border-t border-gray-100">
            {/* Collapsible Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full group"
            >
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm shadow-sm">
                        🎨
                    </div>
                    <div className="text-left">
                        <h4 className="font-semibold text-sm text-gray-900">Styling</h4>
                        <p className="text-[10px] text-gray-400">Customize appearance</p>
                    </div>
                </div>
                <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </button>

            {isExpanded && (
                <div className="space-y-5 animate-in slide-in-from-top-2 duration-200">
                    {showBackground && (
                        <div>
                            <Label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Background Color
                            </Label>
                            <ColorPicker
                                value={style.backgroundColor || "transparent"}
                                onChange={(val) => updateStyle({ backgroundColor: val === "transparent" ? undefined : val })}
                                allowTransparent
                            />
                        </div>
                    )}

                    {showPadding && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Padding
                                </Label>
                                <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5">
                                    <button
                                        onClick={() => togglePaddingMode(false)}
                                        className={`px-2 py-1 text-[10px] font-medium rounded transition-all ${!useIndividualPadding
                                            ? 'bg-white text-indigo-600 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        Uniform
                                    </button>
                                    <button
                                        onClick={() => togglePaddingMode(true)}
                                        className={`px-2 py-1 text-[10px] font-medium rounded transition-all ${useIndividualPadding
                                            ? 'bg-white text-indigo-600 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        Individual
                                    </button>
                                </div>
                            </div>

                            {useIndividualPadding ? (
                                <div className="space-y-3">
                                    {/* Visual padding box */}
                                    <div className="relative bg-gray-50 rounded-lg p-3 border border-gray-200">
                                        {/* Top */}
                                        <div className="flex justify-center mb-2">
                                            <PaddingInput
                                                label="Top"
                                                value={paddingValues.top}
                                                onChange={(v) => updateIndividualPadding('top', v)}
                                            />
                                        </div>
                                        {/* Left - Content - Right */}
                                        <div className="flex items-center justify-between gap-2">
                                            <PaddingInput
                                                label="Left"
                                                value={paddingValues.left}
                                                onChange={(v) => updateIndividualPadding('left', v)}
                                            />
                                            <div className="flex-1 h-12 bg-white border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-[10px] text-gray-400 font-medium">
                                                Content
                                            </div>
                                            <PaddingInput
                                                label="Right"
                                                value={paddingValues.right}
                                                onChange={(v) => updateIndividualPadding('right', v)}
                                            />
                                        </div>
                                        {/* Bottom */}
                                        <div className="flex justify-center mt-2">
                                            <PaddingInput
                                                label="Bottom"
                                                value={paddingValues.bottom}
                                                onChange={(v) => updateIndividualPadding('bottom', v)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <RangeControl
                                    label=""
                                    value={style.padding ?? 0}
                                    onChange={(val) => updateStyle({ padding: val })}
                                    min={0}
                                    max={60}
                                    step={4}
                                    unit="px"
                                />
                            )}
                        </div>
                    )}

                    {showBorder && (
                        <>
                            {/* Border Width and Color */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Border Color
                                    </Label>
                                    <ColorPicker
                                        value={style.borderColor || "#e5e7eb"}
                                        onChange={(val) => updateStyle({ borderColor: val })}
                                    />
                                </div>
                                <div>
                                    <RangeControl
                                        label="Border Width"
                                        value={style.borderWidth || 0}
                                        onChange={(val) => updateStyle({
                                            borderWidth: val,
                                            borderStyle: val > 0 ? "solid" : "none"
                                        })}
                                        min={0}
                                        max={10}
                                        step={1}
                                        unit="px"
                                    />
                                </div>
                            </div>

                            {/* Border Radius - Independent Section */}
                            <div className="pt-3 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-3">
                                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                                        <span>🔲</span> Corner Radius
                                    </Label>
                                    <div className="flex bg-gray-100 rounded-md p-0.5 text-[10px]">
                                        <button
                                            onClick={() => {
                                                // Convert to uniform
                                                const tl = style.borderRadiusTopLeft ?? 0;
                                                const tr = style.borderRadiusTopRight ?? 0;
                                                const br = style.borderRadiusBottomRight ?? 0;
                                                const bl = style.borderRadiusBottomLeft ?? 0;
                                                const max = Math.max(tl, tr, br, bl, style.borderRadius ?? 0);
                                                updateStyle({
                                                    borderRadius: max,
                                                    borderRadiusTopLeft: undefined,
                                                    borderRadiusTopRight: undefined,
                                                    borderRadiusBottomRight: undefined,
                                                    borderRadiusBottomLeft: undefined,
                                                });
                                            }}
                                            className={`px-2 py-1 rounded transition-all ${!(style.borderRadiusTopLeft !== undefined ||
                                                style.borderRadiusTopRight !== undefined ||
                                                style.borderRadiusBottomRight !== undefined ||
                                                style.borderRadiusBottomLeft !== undefined)
                                                ? "bg-white text-indigo-600 shadow-sm font-semibold"
                                                : "text-gray-500 hover:text-gray-700"
                                                }`}
                                        >
                                            Uniform
                                        </button>
                                        <button
                                            onClick={() => {
                                                // Convert to individual
                                                const radius = style.borderRadius ?? 0;
                                                updateStyle({
                                                    borderRadius: undefined,
                                                    borderRadiusTopLeft: radius,
                                                    borderRadiusTopRight: radius,
                                                    borderRadiusBottomRight: radius,
                                                    borderRadiusBottomLeft: radius,
                                                });
                                            }}
                                            className={`px-2 py-1 rounded transition-all ${(style.borderRadiusTopLeft !== undefined ||
                                                style.borderRadiusTopRight !== undefined ||
                                                style.borderRadiusBottomRight !== undefined ||
                                                style.borderRadiusBottomLeft !== undefined)
                                                ? "bg-white text-indigo-600 shadow-sm font-semibold"
                                                : "text-gray-500 hover:text-gray-700"
                                                }`}
                                        >
                                            Individual
                                        </button>
                                    </div>
                                </div>

                                {(style.borderRadiusTopLeft !== undefined ||
                                    style.borderRadiusTopRight !== undefined ||
                                    style.borderRadiusBottomRight !== undefined ||
                                    style.borderRadiusBottomLeft !== undefined) ? (
                                    /* Individual corner radius controls */
                                    <div className="relative bg-gray-50 rounded-lg p-3 border border-gray-200">
                                        {/* Top corners */}
                                        <div className="flex justify-between mb-2">
                                            <RadiusInput
                                                label="TL"
                                                value={style.borderRadiusTopLeft ?? 0}
                                                onChange={(v) => updateStyle({ borderRadiusTopLeft: v })}
                                            />
                                            <RadiusInput
                                                label="TR"
                                                value={style.borderRadiusTopRight ?? 0}
                                                onChange={(v) => updateStyle({ borderRadiusTopRight: v })}
                                            />
                                        </div>
                                        {/* Visual box */}
                                        <div
                                            className="h-12 bg-white border-2 border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400 font-medium"
                                            style={{
                                                borderRadius: `${style.borderRadiusTopLeft ?? 0}px ${style.borderRadiusTopRight ?? 0}px ${style.borderRadiusBottomRight ?? 0}px ${style.borderRadiusBottomLeft ?? 0}px`,
                                            }}
                                        >
                                            Preview
                                        </div>
                                        {/* Bottom corners */}
                                        <div className="flex justify-between mt-2">
                                            <RadiusInput
                                                label="BL"
                                                value={style.borderRadiusBottomLeft ?? 0}
                                                onChange={(v) => updateStyle({ borderRadiusBottomLeft: v })}
                                            />
                                            <RadiusInput
                                                label="BR"
                                                value={style.borderRadiusBottomRight ?? 0}
                                                onChange={(v) => updateStyle({ borderRadiusBottomRight: v })}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <RangeControl
                                        label=""
                                        value={style.borderRadius ?? 0}
                                        onChange={(val) => updateStyle({ borderRadius: val })}
                                        min={0}
                                        max={30}
                                        step={2}
                                        unit="px"
                                    />
                                )}

                                {((style.borderRadius ?? 0) > 0 ||
                                    (style.borderRadiusTopLeft ?? 0) > 0 ||
                                    (style.borderRadiusTopRight ?? 0) > 0 ||
                                    (style.borderRadiusBottomRight ?? 0) > 0 ||
                                    (style.borderRadiusBottomLeft ?? 0) > 0) && (
                                        <p className="text-[10px] text-amber-600 mt-2">
                                            ⚠️ Displays as square corners in Outlook
                                        </p>
                                    )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// Compact padding input for individual values
function PaddingInput({ label, value, onChange }: {
    label: string;
    value: number;
    onChange: (val: number) => void;
}) {
    return (
        <div className="flex flex-col items-center gap-0.5">
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                min={0}
                max={100}
                className="w-14 h-7 text-center text-xs font-medium border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none bg-white"
            />
            <span className="text-[9px] text-gray-400 uppercase font-medium">{label}</span>
        </div>
    );
}

// Compact radius input for corner values
function RadiusInput({ label, value, onChange }: {
    label: string;
    value: number;
    onChange: (val: number) => void;
}) {
    return (
        <div className="flex flex-col items-center gap-0.5">
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                min={0}
                max={50}
                className="w-12 h-7 text-center text-xs font-medium border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 outline-none bg-white"
            />
            <span className="text-[9px] text-purple-500 uppercase font-medium">{label}</span>
        </div>
    );
}

// Color Picker with optional transparent support
function ColorPicker({ value, onChange, allowTransparent = false }: {
    value: string;
    onChange: (val: string) => void;
    allowTransparent?: boolean;
}) {
    const displayValue = value === "transparent" || !value ? "#ffffff" : value;
    const isTransparent = value === "transparent" || !value;

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-gray-200 shadow-sm shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95">
                    <input
                        type="color"
                        value={displayValue}
                        onChange={(e) => onChange(e.target.value)}
                        disabled={isTransparent}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                    />
                    <div
                        className="w-full h-full"
                        style={{
                            backgroundColor: isTransparent ? "#ffffff" : value,
                            backgroundImage: isTransparent ? "repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%) 50% / 8px 8px" : "none"
                        }}
                    />
                </div>
                <Input
                    value={isTransparent ? "transparent" : value}
                    onChange={(e) => onChange(e.target.value)}
                    className="font-mono text-xs uppercase flex-1"
                    placeholder="#000000"
                />
            </div>

            {allowTransparent && (
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isTransparent}
                        onChange={(e) => onChange(e.target.checked ? "transparent" : "#ffffff")}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-gray-600">Transparent</span>
                </label>
            )}
        </div>
    );
}

// Range Control component
function RangeControl({ label, value, onChange, min, max, step, unit }: {
    label: string;
    value: number;
    onChange: (val: number) => void;
    min: number;
    max: number;
    step: number;
    unit: string;
}) {
    return (
        <div>
            {label && (
                <div className="flex justify-between items-center mb-2">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</Label>
                    <span className="text-xs font-mono font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {value}{unit}
                    </span>
                </div>
            )}
            {!label && (
                <div className="flex justify-end mb-2">
                    <span className="text-xs font-mono font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {value}{unit}
                    </span>
                </div>
            )}
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
