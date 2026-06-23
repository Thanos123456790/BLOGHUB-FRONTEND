"use client";

import { CameraIcon } from "lucide-react";

import { getFilterCss, imageFilters } from "@/lib/filters";
import { cn } from "@/lib/utils";
import { ImagePickerDialog } from "./image-picker-dialog";

export function CoverPicker({
  coverImage,
  filter,
  onImageChange,
  onFilterChange,
}: {
  coverImage: string;
  filter: string;
  onImageChange: (url: string) => void;
  onFilterChange: (filterId: string) => void;
}) {
  return (
    <div>
      <ImagePickerDialog
        assetType="BLOG_COVER"
        onSelect={onImageChange}
        trigger={
          <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl border border-border bg-muted cursor-pointer group">
            {coverImage ? (
              <img
                src={coverImage}
                alt=""
                className="size-full object-cover transition-transform group-hover:scale-[1.02]"
                style={{ filter: getFilterCss(filter) }}
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <CameraIcon className="size-6" />
                <span className="text-sm font-medium">Add a cover photo</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-white bg-black/50 rounded-full px-3 py-1.5">
                {coverImage ? "Change photo" : "Choose photo"}
              </span>
            </div>
          </div>
        }
      />

      {coverImage && (
        <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {imageFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilterChange(f.id)}
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <span
                className={cn(
                  "size-12 rounded-xl overflow-hidden border-2",
                  filter === f.id ? "border-primary" : "border-transparent"
                )}
              >
                <img
                  src={coverImage}
                  alt=""
                  className="size-full object-cover"
                  style={{ filter: getFilterCss(f.id) }}
                />
              </span>
              <span
                className={cn(
                  "text-[11px]",
                  filter === f.id
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {f.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
