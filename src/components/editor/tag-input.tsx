"use client";

import * as React from "react";
import { XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function TagInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [value, setValue] = React.useState("");

  function commit() {
    const clean = value.trim().replace(/^#/, "");
    if (clean && !tags.includes(clean) && tags.length < 6) {
      onChange([...tags, clean]);
    }
    setValue("");
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-full border border-input bg-card px-3 py-2">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 pr-1.5">
          #{tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
            aria-label={`Remove ${tag}`}
            className="rounded-full hover:bg-secondary-foreground/10 p-0.5"
          >
            <XIcon className="size-3" />
          </button>
        </Badge>
      ))}
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          }
        }}
        onBlur={commit}
        placeholder={tags.length === 0 ? "Add up to 6 tags..." : ""}
        className="flex-1 min-w-[100px] bg-transparent text-sm outline-none placeholder:text-muted-foreground py-1"
      />
    </div>
  );
}
