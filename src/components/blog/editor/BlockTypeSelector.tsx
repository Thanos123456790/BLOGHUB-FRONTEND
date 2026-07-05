// src/components/blog/editor/BlockTypeSelector.tsx
// Drop-down menu shown when user clicks "+" to add a new block.
// Includes PDF, Video, Code — the three new block types.

import type { BlockType } from '../../../types/blog';

const BLOCK_OPTIONS: Array<{ type: BlockType; label: string; icon: string; description: string }> = [
  { type: 'PARAGRAPH', label: 'Text',    icon: '¶',    description: 'Plain paragraph' },
  { type: 'HEADING',   label: 'Heading', icon: 'H',    description: 'Section heading' },
  { type: 'QUOTE',     label: 'Quote',   icon: '"',    description: 'Block quote or pull quote' },
  { type: 'IMAGE',     label: 'Image',   icon: '🖼',   description: 'Photo with optional caption' },
  { type: 'PDF',       label: 'PDF',     icon: '📄',   description: 'Attach a PDF document' },
  { type: 'VIDEO',     label: 'Video',   icon: '🎬',   description: 'Upload or embed a video' },
  { type: 'CODE',      label: 'Code',    icon: '</>',  description: 'Syntax-highlighted code snippet' },
];

interface Props {
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

export function BlockTypeSelector({ onSelect, onClose }: Props) {
  return (
    <div className="absolute z-50 mt-1 w-60 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
      {BLOCK_OPTIONS.map(opt => (
        <button
          key={opt.type}
          type="button"
          onClick={() => { onSelect(opt.type); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
        >
          <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-mono flex-shrink-0">
            {opt.icon}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{opt.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{opt.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
