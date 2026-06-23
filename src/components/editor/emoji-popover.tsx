"use client";

import { SmileIcon } from "lucide-react";

import { emojiPalette } from "@/lib/filters";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function EmojiPopover({
  onSelect,
}: {
  onSelect: (emoji: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Insert emoji" type="button">
          <SmileIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="grid grid-cols-8 gap-1">
          {emojiPalette.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => onSelect(e)}
              className="flex items-center justify-center rounded-lg p-1.5 text-lg hover:bg-muted transition-colors"
            >
              {e}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
