import { AssetType } from '@/lib/api/types';
import { BlogBlock } from '@/types/blog';

const LANGUAGES = [
  'javascript','typescript','python','java','kotlin','go','rust',
  'c','cpp','csharp','bash','shell','sql','json','yaml','html','css','jsx','tsx',
];

interface Props {
  block: BlogBlock;
  onChange: (patch: Partial<BlogBlock>) => void;
  onUpload?: (file: File, type: AssetType) => Promise<string>;
}

export function BlockEditor({ block, onChange, onUpload }: Props) {
  const { type } = block;

  if (type === 'PARAGRAPH') {
    return (
      <textarea
        className="w-full min-h-[80px] resize-y bg-transparent text-gray-800 dark:text-gray-200 text-base outline-none placeholder-gray-400 leading-relaxed"
        placeholder="Write something…"
        value={block.content}
        onChange={e => onChange({ content: e.target.value })}
      />
    );
  }

  if (type === 'HEADING') {
    return (
      <input
        type="text"
        className="w-full bg-transparent text-2xl font-bold text-gray-900 dark:text-gray-100 outline-none placeholder-gray-400"
        placeholder="Heading"
        value={block.content}
        onChange={e => onChange({ content: e.target.value })}
      />
    );
  }

  if (type === 'QUOTE') {
    return (
      <textarea
        className="w-full min-h-[60px] resize-y bg-transparent border-l-4 border-blue-500 pl-4 italic text-gray-700 dark:text-gray-300 outline-none text-lg leading-relaxed"
        placeholder="Enter a quote…"
        value={block.content}
        onChange={e => onChange({ content: e.target.value })}
      />
    );
  }

  if (type === 'IMAGE') {
    return (
      <div className="space-y-2">
        {block.content ? (
          <div className="relative group">
            <img src={block.content} alt={block.caption ?? ''} className="max-h-80 w-full rounded-xl object-cover" />
            <button
              type="button"
              onClick={() => onChange({ content: '' })}
              className="absolute top-2 right-2 hidden group-hover:flex w-7 h-7 items-center justify-center rounded-full bg-red-500 text-white text-xs"
            >✕</button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 cursor-pointer hover:border-blue-400 transition-colors">
            <span className="text-4xl mb-2">🖼</span>
            <span className="text-sm text-gray-500">Click to upload image</span>
            <input
              type="file" accept="image/*" className="hidden"
              onChange={async e => {
                const file = e.target.files?.[0];
                if (file && onUpload) {
                  const url = await onUpload(file, 'BLOG_BLOCK_IMAGE');
                  onChange({ content: url });
                }
              }}
            />
          </label>
        )}
        <input
          type="text"
          className="w-full text-sm bg-transparent text-gray-600 dark:text-gray-400 outline-none placeholder-gray-400 border-b border-gray-200 dark:border-gray-700 pb-1"
          placeholder="Caption (optional)"
          value={block.caption ?? ''}
          onChange={e => onChange({ caption: e.target.value })}
        />
      </div>
    );
  }

  if (type === 'PDF') {
    return (
      <div className="space-y-2">
        {block.content ? (
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <span className="text-3xl">📄</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">PDF attached</p>
              <p className="text-xs text-gray-500 truncate">{block.content.split('/').pop()}</p>
            </div>
            <button
              type="button"
              onClick={() => onChange({ content: '' })}
              className="text-xs text-red-500 hover:underline flex-shrink-0"
            >
              Remove
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 cursor-pointer hover:border-blue-400 transition-colors">
            <span className="text-4xl mb-2">📄</span>
            <span className="text-sm text-gray-500">Click to upload PDF (max 50 MB)</span>
            <input
              type="file" accept="application/pdf" className="hidden"
              onChange={async e => {
                const file = e.target.files?.[0];
                if (file && onUpload) {
                  const url = await onUpload(file, 'BLOG_BLOCK_PDF');
                  onChange({ content: url });
                }
              }}
            />
          </label>
        )}
        <input
          type="text"
          className="w-full text-sm bg-transparent text-gray-600 dark:text-gray-400 outline-none placeholder-gray-400 border-b border-gray-200 dark:border-gray-700 pb-1"
          placeholder="Caption (optional)"
          value={block.caption ?? ''}
          onChange={e => onChange({ caption: e.target.value })}
        />
      </div>
    );
  }

  if (type === 'VIDEO') {
    const isEmbed = block.content.includes('youtube') || block.content.includes('youtu.be') || block.content.includes('vimeo');
    const embedSrc = block.content
      .replace('watch?v=', 'embed/')
      .replace('youtu.be/', 'youtube.com/embed/');

    return (
      <div className="space-y-3">
        <input
          type="url"
          className="w-full text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 outline-none placeholder-gray-400"
          placeholder="Paste YouTube / Vimeo URL…"
          value={block.content}
          onChange={e => onChange({ content: e.target.value })}
        />
        {!block.content && (
          <label className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:underline w-fit">
            <span>📁</span> Or upload a video file (max 500 MB)
            <input
              type="file" accept="video/*" className="hidden"
              onChange={async e => {
                const file = e.target.files?.[0];
                if (file && onUpload) {
                  const url = await onUpload(file, 'BLOG_BLOCK_VIDEO');
                  onChange({ content: url });
                }
              }}
            />
          </label>
        )}
        {block.content && isEmbed && (
          <div className="aspect-video rounded-xl overflow-hidden bg-black">
            <iframe src={embedSrc} className="w-full h-full" allowFullScreen title="video preview" />
          </div>
        )}
        {block.content && !isEmbed && (
          <video controls className="w-full rounded-xl max-h-64 bg-black">
            <source src={block.content} />
          </video>
        )}
      </div>
    );
  }

  if (type === 'CODE') {
    return (
      <div className="rounded-xl overflow-hidden border border-gray-700 bg-gray-950">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border-b border-gray-700">
          <label className="text-xs text-gray-400 flex-shrink-0">Language:</label>
          <select
            value={block.language ?? 'javascript'}
            onChange={e => onChange({ language: e.target.value })}
            className="bg-gray-800 text-gray-200 text-xs rounded-md px-2 py-0.5 outline-none border border-gray-700"
          >
            {LANGUAGES.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        {/* Code area */}
        <textarea
          className="w-full min-h-[150px] bg-transparent text-green-400 font-mono text-sm px-4 py-3 outline-none resize-y leading-relaxed"
          placeholder="// paste or type your code here"
          value={block.content}
          spellCheck={false}
          onChange={e => onChange({ content: e.target.value })}
        />
      </div>
    );
  }

  return null;
}
