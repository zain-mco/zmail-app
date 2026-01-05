"use client";

import type { EmailBlock } from "./block-types";

export interface EmailTemplate {
    id: string;
    name: string;
    description: string;
    thumbnail: string;  // Emoji or icon for preview
    blocks: EmailBlock[];
}

// Generate unique IDs for template blocks
function generateId(): string {
    return `tpl-${Math.random().toString(36).substring(2, 11)}`;
}

// Template 1: Conference Announcement
const conferenceTemplate: EmailTemplate = {
    id: "template-conference",
    name: "Conference Announcement",
    description: "Professional conference or event announcement with speaker highlights",
    thumbnail: "🎤",
    blocks: [
        {
            id: generateId(),
            type: "HeaderImage",
            data: {
                src: "",
                alt: "Conference Banner",
            },
        },
        {
            id: generateId(),
            type: "TextBlock",
            data: {
                content: `<h1 style="text-align: center; color: #1e40af;">Annual Conference 2024</h1>
<p style="text-align: center; color: #6b7280;">Join industry leaders for an inspiring day of insights and networking</p>`,
            },
            style: {
                padding: 24,
            },
        },
        {
            id: generateId(),
            type: "TextBlock",
            data: {
                content: `<p>Dear Colleague,</p>
<p>We are excited to invite you to our upcoming Annual Conference, bringing together thought leaders, innovators, and professionals from across the industry.</p>
<p><strong>Event Details:</strong></p>
<ul>
<li>📅 <strong>Date:</strong> March 15-17, 2024</li>
<li>📍 <strong>Location:</strong> Grand Convention Center</li>
<li>⏰ <strong>Time:</strong> 9:00 AM - 5:00 PM</li>
</ul>`,
            },
            style: {
                paddingLeft: 24,
                paddingRight: 24,
            },
        },
        {
            id: generateId(),
            type: "Divider",
            data: {
                color: "#e5e7eb",
                thickness: 1,
                width: 80,
                style: "solid",
            },
        },
        {
            id: generateId(),
            type: "TextBlock",
            data: {
                content: `<h3 style="text-align: center; color: #374151;">Featured Speakers</h3>
<p style="text-align: center; color: #6b7280;">Learn from industry experts and thought leaders</p>`,
            },
            style: {
                padding: 16,
            },
        },
        {
            id: generateId(),
            type: "Button",
            data: {
                text: "Register Now",
                url: "https://example.com/register",
                backgroundColor: "#1e40af",
                textColor: "#ffffff",
                borderRadius: 8,
            },
            style: {
                paddingTop: 16,
                paddingBottom: 24,
            },
        },
        {
            id: generateId(),
            type: "Footer",
            data: {
                companyName: "Your Organization",
                address: "123 Business Avenue, City, Country",
                contactInfo: "contact@organization.com | +1 234 567 890",
                copyrightYear: "2024",
                content: "",
                showSocialIcons: true,
                socialIcons: [
                    { platform: "facebook", url: "", enabled: true },
                    { platform: "linkedin", url: "", enabled: true },
                    { platform: "twitter", url: "", enabled: true },
                ],
                socialIconSize: 32,
                socialIconStyle: "brand",
            },
        },
    ],
};

// Template 2: Newsletter
const newsletterTemplate: EmailTemplate = {
    id: "template-newsletter",
    name: "Newsletter",
    description: "Clean newsletter layout with featured article and news highlights",
    thumbnail: "📰",
    blocks: [
        {
            id: generateId(),
            type: "HeaderImage",
            data: {
                src: "",
                alt: "Newsletter Header",
            },
        },
        {
            id: generateId(),
            type: "TextBlock",
            data: {
                content: `<h1 style="text-align: center; color: #1e40af;">Monthly Newsletter</h1>
<p style="text-align: center; color: #6b7280;">January 2024 Edition</p>`,
            },
            style: {
                padding: 24,
            },
        },
        {
            id: generateId(),
            type: "Image",
            data: {
                src: "",
                alt: "Featured Article Image",
                width: 100,
            },
            style: {
                paddingLeft: 24,
                paddingRight: 24,
            },
        },
        {
            id: generateId(),
            type: "TextBlock",
            data: {
                content: `<h2 style="color: #1e40af;">Featured Story</h2>
<p>This month we're excited to share our latest achievements and upcoming initiatives. Our team has been working hard to bring you the best updates.</p>
<p><a href="#" style="color: #1e40af;">Read the full article →</a></p>`,
            },
            style: {
                paddingLeft: 24,
                paddingRight: 24,
                paddingBottom: 24,
            },
        },
        {
            id: generateId(),
            type: "Divider",
            data: {
                color: "#e5e7eb",
                thickness: 1,
                width: 100,
                style: "solid",
            },
        },
        {
            id: generateId(),
            type: "TextBlock",
            data: {
                content: `<h3 style="color: #374151;">📢 Quick Updates</h3>
<ul>
<li><strong>New Product Launch:</strong> Exciting features coming next month</li>
<li><strong>Community Event:</strong> Join us for our webinar series</li>
<li><strong>Partnership Announcement:</strong> We've partnered with leading brands</li>
</ul>`,
            },
            style: {
                padding: 24,
            },
        },
        {
            id: generateId(),
            type: "Button",
            data: {
                text: "Visit Our Website",
                url: "https://example.com",
                backgroundColor: "#059669",
                textColor: "#ffffff",
                borderRadius: 8,
            },
            style: {
                paddingBottom: 24,
            },
        },
        {
            id: generateId(),
            type: "Footer",
            data: {
                companyName: "Your Company",
                address: "456 Newsletter Lane, City, Country",
                contactInfo: "newsletter@company.com",
                copyrightYear: "2024",
                content: "You're receiving this because you subscribed to our newsletter.",
            },
        },
    ],
};

// Template 3: Event Invitation
const eventInvitationTemplate: EmailTemplate = {
    id: "template-event-invitation",
    name: "Event Invitation",
    description: "Elegant event invitation with RSVP and venue details",
    thumbnail: "🎉",
    blocks: [
        {
            id: generateId(),
            type: "HeaderImage",
            data: {
                src: "",
                alt: "Event Banner",
            },
        },
        {
            id: generateId(),
            type: "TextBlock",
            data: {
                content: `<p style="text-align: center; color: #6b7280; font-size: 14px; letter-spacing: 2px;">YOU'RE INVITED TO</p>
<h1 style="text-align: center; color: #1e40af; font-size: 32px; margin-top: 8px;">Exclusive Gala Evening</h1>`,
            },
            style: {
                paddingTop: 32,
                paddingBottom: 16,
            },
        },
        {
            id: generateId(),
            type: "TextBlock",
            data: {
                content: `<p style="text-align: center;">We cordially invite you to join us for an evening of celebration, networking, and entertainment.</p>`,
            },
            style: {
                paddingLeft: 40,
                paddingRight: 40,
            },
        },
        {
            id: generateId(),
            type: "Spacer",
            data: {
                height: 24,
            },
        },
        {
            id: generateId(),
            type: "TextBlock",
            data: {
                content: `<table width="100%" style="text-align: center;">
<tr>
<td style="padding: 16px;">
<p style="font-size: 24px; margin: 0;">📅</p>
<p style="font-weight: bold; margin: 8px 0 4px;">Date</p>
<p style="color: #6b7280; margin: 0;">Saturday, April 20, 2024</p>
</td>
<td style="padding: 16px;">
<p style="font-size: 24px; margin: 0;">⏰</p>
<p style="font-weight: bold; margin: 8px 0 4px;">Time</p>
<p style="color: #6b7280; margin: 0;">7:00 PM - 11:00 PM</p>
</td>
<td style="padding: 16px;">
<p style="font-size: 24px; margin: 0;">📍</p>
<p style="font-weight: bold; margin: 8px 0 4px;">Venue</p>
<p style="color: #6b7280; margin: 0;">The Grand Ballroom</p>
</td>
</tr>
</table>`,
            },
            style: {
                backgroundColor: "#f8fafc",
                padding: 16,
            },
        },
        {
            id: generateId(),
            type: "Spacer",
            data: {
                height: 24,
            },
        },
        {
            id: generateId(),
            type: "TextBlock",
            data: {
                content: `<p style="text-align: center;"><strong>Dress Code:</strong> Black Tie / Formal Attire</p>`,
            },
        },
        {
            id: generateId(),
            type: "Button",
            data: {
                text: "RSVP Now",
                url: "https://example.com/rsvp",
                backgroundColor: "#7c3aed",
                textColor: "#ffffff",
                borderRadius: 24,
            },
            style: {
                paddingTop: 24,
                paddingBottom: 24,
            },
        },
        {
            id: generateId(),
            type: "TextBlock",
            data: {
                content: `<p style="text-align: center; font-size: 12px; color: #9ca3af;">Please RSVP by April 10, 2024</p>`,
            },
        },
        {
            id: generateId(),
            type: "Footer",
            data: {
                companyName: "Event Hosts",
                address: "Grand Ballroom, 789 Celebration Ave",
                contactInfo: "events@example.com | +1 555 123 4567",
                copyrightYear: "2024",
                content: "",
                showSocialIcons: true,
                socialIcons: [
                    { platform: "instagram", url: "", enabled: true },
                    { platform: "facebook", url: "", enabled: true },
                ],
                socialIconSize: 32,
                socialIconStyle: "brand",
            },
        },
    ],
};

// Export all default templates
export const defaultTemplates: EmailTemplate[] = [
    conferenceTemplate,
    newsletterTemplate,
    eventInvitationTemplate,
];

// Helper function to get template by ID
export function getTemplateById(id: string): EmailTemplate | undefined {
    return defaultTemplates.find(t => t.id === id);
}

// Helper to create a copy with new IDs (for use in workspace)
export function cloneTemplateBlocks(blocks: EmailBlock[]): EmailBlock[] {
    return blocks.map(block => ({
        ...block,
        id: `blk-${Math.random().toString(36).substring(2, 11)}`,
        // Deep clone nested data
        data: JSON.parse(JSON.stringify(block.data)),
        style: block.style ? JSON.parse(JSON.stringify(block.style)) : undefined,
    }));
}
