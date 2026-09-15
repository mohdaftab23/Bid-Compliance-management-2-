import React, { useRef } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo2,
  Redo2,
  FileText
} from 'lucide-react';

interface RichDocumentEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
  title?: string;
}

export const RichDocumentEditor: React.FC<RichDocumentEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write tender specifications, scope of work, deliverables, and operational requirements...',
  minHeight = '360px',
  title,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Formatting helpers for the textarea
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.substring(start, end);
    const replacement = prefix + selected + suffix;

    const nextValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(nextValue);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const insertHeading = (level: number) => {
    const hashes = '#'.repeat(level) + ' ';
    insertFormatting(`\n${hashes}`, '\n');
  };

  const insertBullet = () => {
    insertFormatting('\n• ');
  };

  const insertNumbered = () => {
    insertFormatting('\n1. ');
  };

  const insertQuote = () => {
    insertFormatting('\n> ');
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  return (
    <div className="border border-slate-300 rounded-xl bg-white shadow-xs overflow-hidden focus-within:border-blue-800 transition-colors">
      {/* Document Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-1 flex-wrap">
          {/* Headings */}
          <div className="flex items-center bg-white border border-slate-200 rounded-md p-0.5 shadow-xs mr-1">
            <button
              type="button"
              onClick={() => insertHeading(1)}
              title="Heading 1"
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors text-xs font-bold"
            >
              <Heading1 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertHeading(2)}
              title="Heading 2"
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors text-xs font-bold"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertHeading(3)}
              title="Heading 3"
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors text-xs font-bold"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Text Styles */}
          <div className="flex items-center bg-white border border-slate-200 rounded-md p-0.5 shadow-xs mr-1">
            <button
              type="button"
              onClick={() => insertFormatting('**', '**')}
              title="Bold"
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*')}
              title="Italic"
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('<u>', '</u>')}
              title="Underline"
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors"
            >
              <UnderlineIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Lists & Quotes */}
          <div className="flex items-center bg-white border border-slate-200 rounded-md p-0.5 shadow-xs mr-1">
            <button
              type="button"
              onClick={insertBullet}
              title="Bullet List"
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={insertNumbered}
              title="Numbered List"
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={insertQuote}
              title="Blockquote"
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {title && (
          <div className="text-xs font-semibold text-slate-500 hidden sm:flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>{title}</span>
          </div>
        )}
      </div>

      {/* Editor Body */}
      <div className="p-4 sm:p-6 bg-white">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ minHeight }}
          className="w-full text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 border-0 focus:outline-none focus:ring-0 resize-y font-normal"
        />
      </div>

      {/* Editor Footer / Word Count */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
        <div className="text-slate-400">
          Markdown & formatted text supported
        </div>
      </div>
    </div>
  );
};
