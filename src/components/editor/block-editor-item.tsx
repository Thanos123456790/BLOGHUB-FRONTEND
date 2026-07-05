"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  DockIcon,
  GripVerticalIcon,
  ImageIcon,
  Trash2Icon,
} from "lucide-react";

import type { EditorBlock } from "@/lib/types";
import { getFilterCss, imageFilters } from "@/lib/filters";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { EmojiPopover } from "./emoji-popover";
import { ImagePickerDialog } from "./image-picker-dialog";
import { AssetType } from "@/lib/api/types";

export function BlockEditorItem({
  block,
  isFirst,
  isLast,
  onChange,
  onMove,
  onRemove,
  onUpload, 
}: {
  block: EditorBlock;
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: Partial<EditorBlock>) => void;
  onMove: (direction: "up" | "down") => void;
  onRemove: () => void;
  onUpload?: (file: File, type: AssetType) => Promise<string>;
}) {

  return (
    <div className="group relative rounded-2xl border border-border bg-card p-4">
      <div className="absolute -left-2 top-4 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVerticalIcon className="size-4 text-muted-foreground" />
      </div>

      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {block.type}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isFirst}
            onClick={() => onMove("up")}
            aria-label="Move up"
          >
            <ArrowUpIcon className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isLast}
            onClick={() => onMove("down")}
            aria-label="Move down"
          >
            <ArrowDownIcon className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            aria-label="Delete block"
            className="text-destructive hover:text-destructive"
          >
            <Trash2Icon className="size-3.5" />
          </Button>
        </div>
      </div>

      {block.type === "heading" && (
        <Input
          value={block.content}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder="Section heading"
          className="text-lg font-display font-semibold rounded-xl h-auto py-2.5"
        />
      )}

      {block.type === "paragraph" && (
        <div className="relative">
          <Textarea
            value={block.content}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder="Write a paragraph..."
            rows={4}
            className="rounded-xl pr-10"
          />
          <div className="absolute bottom-2 right-2">
            <EmojiPopover
              onSelect={(emoji) => onChange({ content: block.content + emoji })}
            />
          </div>
        </div>
      )}

      {block.type === "quote" && (
        <div className="relative border-l-2 border-primary pl-4">
          <Textarea
            value={block.content}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder="A quote worth pulling out..."
            rows={2}
            className="rounded-xl italic pr-10"
          />
          <div className="absolute bottom-2 right-2">
            <EmojiPopover
              onSelect={(emoji) => onChange({ content: block.content + emoji })}
            />
          </div>
        </div>
      )}

      {block.type === "pdf" && (
        <div className="space-y-2">
          {block.content ? (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-xl border border-border">
              <span className="text-3xl"><DockIcon/></span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">PDF attached</p>
                <p className="text-xs text-muted-foreground truncate">{block.content.split("/").pop()}</p>
              </div>
              <button type="button" onClick={() => onChange({ content: "" })} className="text-xs text-destructive hover:underline">
                Remove
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:border-primary transition-colors">
              <span className="text-4xl mb-2">📄</span>
              <span className="text-sm text-muted-foreground">Click to upload PDF (max 50 MB)</span>
              <input type="file" accept="application/pdf" className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file && onUpload) {
                    const url = await onUpload(file, "BLOG_BLOCK_PDF");
                    onChange({ content: url });
                  }
                }}
              />
            </label>
          )}
          <input type="text" placeholder="Caption (optional)" value={block.caption ?? ""}
            onChange={(e) => onChange({ caption: e.target.value })}
            className="w-full text-sm bg-transparent outline-none border-b border-border pb-1 text-muted-foreground placeholder:text-muted-foreground"
          />
        </div>
      )}
{/* 
      {block.type === "video" && (
        <div className="space-y-3">
          <input type="url" placeholder="Paste YouTube / Vimeo URL…" value={block.content}
            onChange={(e) => onChange({ content: e.target.value })}
            className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-transparent outline-none"
          />
          {!block.content && (
            <label className="flex items-center gap-2 text-sm text-primary cursor-pointer hover:underline w-fit">
              <span>📁</span> Or upload a video file (max 500 MB)
              <input type="file" accept="video/*" className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file && onUpload) {
                    const url = await onUpload(file, "BLOG_BLOCK_VIDEO");
                    onChange({ content: url });
                  }
                }}
              />
            </label>
          )}
          {block.content && (
            <video controls className="w-full rounded-xl max-h-48 bg-black">
              <source src={block.content} />
            </video>
          )}
        </div>
      )} */}

      {block.type === "code" && (
        <div className="rounded-xl overflow-hidden border border-border bg-gray-950">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border-b border-gray-700">
            <label className="text-xs text-gray-400">Language:</label>
            <select value={block.language ?? "javascript"}
              onChange={(e) => onChange({ language: e.target.value })}
              className="bg-gray-800 text-gray-200 text-xs rounded px-2 py-0.5 outline-none border border-gray-700"
            >
              {["javascript", "typescript", "python", "java", "kotlin", "go", "rust", "c", "cpp", "csharp", "bash", "sql", "json", "yaml", "html", "css"].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <textarea
            className="w-full min-h-[150px] bg-transparent text-green-400 font-mono text-sm px-4 py-3 outline-none resize-y"
            placeholder="// paste or type your code here"
            value={block.content}
            spellCheck={false}
            onChange={(e) => onChange({ content: e.target.value })}
          />
        </div>
      )}

      {block.type === "image" && (
        <div>
          <ImagePickerDialog
            assetType="BLOG_BLOCK_IMAGE"
            onSelect={(url) => onChange({ content: url })}
            trigger={
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border bg-muted cursor-pointer group/img">
                {block.content ? (
                  <img
                    src={block.content}
                    alt=""
                    className="size-full object-cover"
                    style={{ filter: getFilterCss(block.filter) }}
                  />
                ) : (
                  <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <ImageIcon className="size-5" />
                    <span className="text-sm">Choose an image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/15 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover/img:opacity-100 transition-opacity text-xs font-medium text-white bg-black/50 rounded-full px-3 py-1.5">
                    {block.content ? "Change photo" : "Choose photo"}
                  </span>
                </div>
              </div>
            }
          />

          {block.content && (
            <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {imageFilters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onChange({ filter: f.id })}
                  className="flex flex-col items-center gap-1.5 shrink-0"
                >
                  <span
                    className={cn(
                      "size-10 rounded-lg overflow-hidden border-2",
                      block.filter === f.id ? "border-primary" : "border-transparent"
                    )}
                  >
                    <img
                      src={block.content}
                      alt=""
                      className="size-full object-cover"
                      style={{ filter: getFilterCss(f.id) }}
                    />
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {f.label}
                  </span>
                </button>
              ))}
            </div>
          )}



          <Input
            value={block.caption ?? ""}
            onChange={(e) => onChange({ caption: e.target.value })}
            placeholder="Add a caption (optional)"
            className="mt-3 h-9 text-sm"
          />
        </div>
      )}
    </div>
  );
}
