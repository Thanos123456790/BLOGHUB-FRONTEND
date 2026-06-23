"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
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

export function BlockEditorItem({
  block,
  isFirst,
  isLast,
  onChange,
  onMove,
  onRemove,
}: {
  block: EditorBlock;
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: Partial<EditorBlock>) => void;
  onMove: (direction: "up" | "down") => void;
  onRemove: () => void;
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
