import React from 'react';
import { Editor } from '@tiptap/react';
import { Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Link2, Link2Off, Palette, Eraser, Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface RichTextToolbarProps {
    editor: Editor | null;
}

// Quick color palette for easy access
const colorSwatches = [
    '#000000', '#374151', '#6B7280', '#9CA3AF',
    '#EF4444', '#F97316', '#EAB308', '#22C55E',
    '#3B82F6', '#8B5CF6', '#EC4899', '#1e40af',
];

export function RichTextToolbar({ editor }: RichTextToolbarProps) {
    if (!editor) return null;

    const [linkUrl, setLinkUrl] = React.useState('');
    const [linkPopoverOpen, setLinkPopoverOpen] = React.useState(false);
    const [colorPickerOpen, setColorPickerOpen] = React.useState(false);
    const [customColor, setCustomColor] = React.useState('#000000');

    // Insert or update link
    const insertLink = () => {
        if (linkUrl) {
            // Auto-add https:// if not present
            let url = linkUrl.trim();
            if (url && !url.match(/^https?:\/\//i)) {
                url = 'https://' + url;
            }
            editor.chain().focus().setLink({ href: url }).run();
            setLinkUrl('');
            setLinkPopoverOpen(false);
        }
    };

    // Apply color and close immediately
    const applyColor = (color: string) => {
        editor.chain().focus().setColor(color).run();
        setColorPickerOpen(false);
    };

    // Get current link if any
    const getCurrentLink = () => {
        const attrs = editor.getAttributes('link');
        return attrs.href || '';
    };

    // When opening link popover, populate with existing link
    React.useEffect(() => {
        if (linkPopoverOpen) {
            const currentHref = getCurrentLink();
            setLinkUrl(currentHref);
        }
    }, [linkPopoverOpen]);

    const ToolbarButton = ({
        onClick,
        isActive,
        icon: Icon,
        tooltip,
        disabled = false
    }: {
        onClick: () => void;
        isActive?: boolean;
        icon: React.ComponentType<{ className?: string }>;
        tooltip: string;
        disabled?: boolean;
    }) => (
        <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
                <button
                    onClick={onClick}
                    disabled={disabled}
                    className={`p-2 rounded-md hover:bg-gray-100 transition-all duration-150 ${isActive ? 'bg-indigo-100 text-indigo-600 ring-1 ring-indigo-200' : 'text-gray-600 hover:text-gray-900'
                        } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
                    type="button"
                >
                    <Icon className="w-4 h-4" />
                </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
                {tooltip}
            </TooltipContent>
        </Tooltip>
    );

    const Divider = () => <div className="w-px h-6 bg-gray-200 mx-1.5" />;

    return (
        <TooltipProvider>
            <div className="flex items-center gap-0.5 p-2 bg-gray-50/80 border-b border-gray-200 flex-wrap">
                {/* Text Formatting */}
                <div className="flex items-center gap-0.5 bg-white rounded-lg p-1 shadow-sm border border-gray-100">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        icon={Bold}
                        tooltip="Bold"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        icon={Italic}
                        tooltip="Italic"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive('underline')}
                        icon={Underline}
                        tooltip="Underline"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive('strike')}
                        icon={Strikethrough}
                        tooltip="Strikethrough"
                    />
                </div>

                {/* Text Color with swatches */}
                <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
                    <PopoverTrigger asChild>
                        <button
                            className="p-2 rounded-md hover:bg-white hover:shadow-sm transition-all text-gray-600 hover:text-gray-900 border border-transparent hover:border-gray-200 ml-1"
                            type="button"
                            title="Text Color"
                        >
                            <div className="relative">
                                <Palette className="w-4 h-4" />
                                <div
                                    className="absolute -bottom-0.5 left-0 right-0 h-1 rounded-full"
                                    style={{ backgroundColor: customColor }}
                                />
                            </div>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-3">
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Quick Colors</label>
                            <div className="grid grid-cols-6 gap-1.5">
                                {colorSwatches.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => {
                                            setCustomColor(color);
                                            applyColor(color);
                                        }}
                                        className="w-7 h-7 rounded-md border-2 border-white shadow-sm hover:scale-110 hover:shadow-md transition-all duration-150 active:scale-95"
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                            </div>
                            <div className="pt-2 border-t border-gray-100">
                                <label className="text-xs font-semibold text-gray-500">Custom Color</label>
                                <div className="flex gap-2 mt-1.5">
                                    <input
                                        type="color"
                                        value={customColor}
                                        onChange={(e) => setCustomColor(e.target.value)}
                                        className="w-9 h-9 rounded-md cursor-pointer border border-gray-200"
                                    />
                                    <Input
                                        value={customColor}
                                        onChange={(e) => setCustomColor(e.target.value)}
                                        className="font-mono text-xs uppercase flex-1"
                                        placeholder="#000000"
                                    />
                                    <Button
                                        onClick={() => applyColor(customColor)}
                                        size="sm"
                                        className="px-3"
                                    >
                                        <Check className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                <Divider />

                {/* Alignment */}
                <div className="flex items-center gap-0.5 bg-white rounded-lg p-1 shadow-sm border border-gray-100">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        isActive={editor.isActive({ textAlign: 'left' })}
                        icon={AlignLeft}
                        tooltip="Align Left"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        isActive={editor.isActive({ textAlign: 'center' })}
                        icon={AlignCenter}
                        tooltip="Center"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        isActive={editor.isActive({ textAlign: 'right' })}
                        icon={AlignRight}
                        tooltip="Align Right"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                        isActive={editor.isActive({ textAlign: 'justify' })}
                        icon={AlignJustify}
                        tooltip="Justify"
                    />
                </div>

                <Divider />

                {/* Lists */}
                <div className="flex items-center gap-0.5 bg-white rounded-lg p-1 shadow-sm border border-gray-100">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        icon={List}
                        tooltip="Bullet List"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        icon={ListOrdered}
                        tooltip="Numbered List"
                    />
                </div>

                <Divider />

                {/* Links */}
                <div className="flex items-center gap-0.5">
                    <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
                        <PopoverTrigger asChild>
                            <button
                                className={`p-2 rounded-md hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-200 ${editor.isActive('link') ? 'bg-indigo-100 text-indigo-600 border-indigo-200' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                type="button"
                                title="Insert Link"
                            >
                                <Link2 className="w-4 h-4" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-80 p-3">
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                    {editor.isActive('link') ? 'Edit Link' : 'Insert Link'}
                                </label>
                                <Input
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    placeholder="example.com or https://..."
                                    className="text-sm"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            insertLink();
                                        }
                                    }}
                                    autoFocus
                                />
                                <p className="text-[10px] text-gray-400">
                                    💡 Select text first, then add link. https:// added automatically.
                                </p>
                                <div className="flex gap-2">
                                    <Button onClick={insertLink} size="sm" className="flex-1">
                                        {editor.isActive('link') ? 'Update Link' : 'Insert Link'}
                                    </Button>
                                    {editor.isActive('link') && (
                                        <Button
                                            onClick={() => {
                                                editor.chain().focus().unsetLink().run();
                                                setLinkPopoverOpen(false);
                                            }}
                                            size="sm"
                                            variant="outline"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {editor.isActive('link') && (
                        <ToolbarButton
                            onClick={() => editor.chain().focus().unsetLink().run()}
                            icon={Link2Off}
                            tooltip="Remove Link"
                        />
                    )}
                </div>

                <Divider />

                {/* Clear Formatting */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                    icon={Eraser}
                    tooltip="Clear Formatting"
                />
            </div>
        </TooltipProvider>
    );
}
