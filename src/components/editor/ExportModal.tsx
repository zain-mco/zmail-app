"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmailBlock, EmailContent } from "@/lib/block-types";
import { blocksToHtml } from "@/lib/email-export";

interface ExportModalProps {
    campaignId: string;
    blocks: EmailBlock[];
    onClose: () => void;
}

export function ExportModal({ campaignId, blocks, onClose }: ExportModalProps) {
    const [html, setHtml] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const content: EmailContent = { blocks };
        const generatedHtml = blocksToHtml(content);
        setHtml(generatedHtml);
    }, [blocks]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(html);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `campaign-${campaignId}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handlePreviewInNewWindow = () => {
        // Create a new window and write the HTML directly
        const previewWindow = window.open("", "_blank");
        if (previewWindow) {
            previewWindow.document.write(html);
            previewWindow.document.close();
        }
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Export HTML</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col gap-4">
                    <div className="flex gap-2 flex-wrap">
                        <Button onClick={handleCopy} variant="outline">
                            {copied ? "✓ Copied!" : "Copy to Clipboard"}
                        </Button>
                        <Button onClick={handleDownload} variant="outline">
                            Download .html
                        </Button>
                        <Button onClick={handlePreviewInNewWindow} variant="default" className="bg-indigo-600 hover:bg-indigo-700">
                            🔗 Preview in New Window
                        </Button>
                    </div>

                    <div className="bg-gray-100 p-2 rounded text-xs">
                        <p className="text-gray-600">
                            ✅ This HTML is optimized for email clients:
                        </p>
                        <ul className="text-gray-500 list-disc list-inside">
                            <li>Table-based layout (600px width)</li>
                            <li>All inline CSS styles</li>
                            <li>No JavaScript or external CSS</li>
                            <li>Compatible with EventsAir</li>
                        </ul>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto">
                            <code>{html}</code>
                        </pre>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

