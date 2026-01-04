import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { RichTextToolbar } from './RichTextToolbar';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder = 'Start typing...' }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Disable heading as we're focused on email content
        heading: false,
        // Keep bulletList and orderedList enabled (they're on by default)
        bulletList: {
          HTMLAttributes: {
            style: 'margin: 0; padding-left: 24px; list-style-type: disc;',
          },
        },
        orderedList: {
          HTMLAttributes: {
            style: 'margin: 0; padding-left: 24px; list-style-type: decimal;',
          },
        },
        listItem: {
          HTMLAttributes: {
            style: 'margin: 4px 0; display: list-item;',
          },
        },
        // Configure paragraph to be email-safe
        paragraph: {
          HTMLAttributes: {
            style: 'margin: 0; padding: 0;',
          },
        },
      }),
      TextAlign.configure({
        types: ['paragraph', 'heading'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
          style: 'color: #1e40af; text-decoration: underline;',
        },
      }),
      Underline,
      TextStyle,
      Color,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] p-4',
        style: 'font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6;',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  // Update editor content when prop changes (external updates)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {editor && (
        <div className="border-b border-gray-200">
          <RichTextToolbar editor={editor} />
        </div>
      )}
      <EditorContent
        editor={editor}
        className="rich-text-editor"
      />
      <style jsx global>{`
        .rich-text-editor .ProseMirror {
          min-height: 120px;
        }
        .rich-text-editor .ProseMirror:focus {
          outline: none;
        }
        .rich-text-editor .ProseMirror p {
          margin: 0;
          padding: 0;
        }
        .rich-text-editor .ProseMirror p + p {
          margin-top: 0.5em;
        }
        .rich-text-editor .ProseMirror ul,
        .rich-text-editor .ProseMirror ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        .rich-text-editor .ProseMirror li {
          margin: 0.25em 0;
        }
        .rich-text-editor .ProseMirror li p {
          margin: 0;
        }
        .rich-text-editor .ProseMirror a {
          color: #1e40af;
          text-decoration: underline;
          cursor: pointer;
        }
        .rich-text-editor .ProseMirror a:hover {
          color: #1e3a8a;
        }
        .rich-text-editor .ProseMirror strong {
          font-weight: bold;
        }
        .rich-text-editor .ProseMirror em {
          font-style: italic;
        }
        .rich-text-editor .ProseMirror u {
          text-decoration: underline;
        }
        .rich-text-editor .ProseMirror s {
          text-decoration: line-through;
        }
        /* Placeholder */
        .rich-text-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
}
