"use client";

import * as React from "react";
import { SendIcon } from "lucide-react";

import { getActiveMentionQuery } from "@/lib/mentions";
import { useGetMeQuery, useLazySearchUsersQuery } from "@/lib/store/api/blogifyApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmojiPopover } from "@/components/editor/emoji-popover";

export function CommentComposer({
  placeholder = "Add a comment...",
  autoFocus = false,
  size = "default",
  onSubmit,
  onCancel,
}: {
  placeholder?: string;
  autoFocus?: boolean;
  size?: "default" | "sm";
  onSubmit: (content: string, taggedUserIds: string[]) => void;
  onCancel?: () => void;
}) {
  const { data: me } = useGetMeQuery();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [searchUsers, { data: searchResults }] = useLazySearchUsersQuery();

  const [value, setValue] = React.useState("");
  const [mentionState, setMentionState] = React.useState<{
    query: string;
    start: number;
  } | null>(null);
  // handle -> id for everyone explicitly picked from the mention dropdown,
  // so submit doesn't have to guess at @handles typed without selecting.
  const mentionedRef = React.useRef<Map<string, string>>(new Map());

  React.useEffect(() => {
    if (mentionState && mentionState.query.length > 0) {
      searchUsers({ query: mentionState.query, size: 5 });
    }
  }, [mentionState, searchUsers]);

  const suggestions = mentionState ? (searchResults?.content ?? []) : [];

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value;
    setValue(text);
    const cursor = e.target.selectionStart;
    setMentionState(getActiveMentionQuery(text, cursor));
  }

  function pickMention(handle: string, id: string) {
    if (!mentionState) return;
    const before = value.slice(0, mentionState.start);
    const after = value.slice(
      mentionState.start + 1 + mentionState.query.length
    );
    const next = `${before}@${handle} ${after}`;
    mentionedRef.current.set(handle.toLowerCase(), id);
    setValue(next);
    setMentionState(null);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed) return;

    const mentionedHandles = Array.from(trimmed.matchAll(/@([a-zA-Z0-9_]+)/g)).map(
      (m) => m[1].toLowerCase()
    );
    const taggedUserIds = Array.from(
      new Set(
        mentionedHandles
          .map((h) => mentionedRef.current.get(h))
          .filter((id): id is string => Boolean(id))
      )
    );

    onSubmit(trimmed, taggedUserIds);
    setValue("");
    setMentionState(null);
    mentionedRef.current.clear();
  }

  return (
    <div className="flex gap-2.5">
      <Avatar className={size === "sm" ? "size-7 mt-0.5" : "size-9 mt-0.5"}>
        <AvatarImage src={me?.avatarUrl ?? undefined} alt={me?.name} />
        <AvatarFallback>{me?.name?.[0] ?? "?"}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            autoFocus={autoFocus}
            rows={size === "sm" ? 1 : 2}
            className="rounded-2xl pr-10 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !mentionState) {
                e.preventDefault();
                handleSubmit();
              }
              if (e.key === "Escape") onCancel?.();
            }}
          />
          <div className="absolute bottom-1.5 right-1.5">
            <EmojiPopover onSelect={(emoji) => setValue((v) => v + emoji)} />
          </div>

          {mentionState && suggestions.length > 0 && (
            <div className="absolute z-20 top-full mt-1 left-0 w-64 rounded-xl border border-border bg-popover shadow-md p-1.5">
              {suggestions.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => pickMention(u.handle, u.id)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted text-left"
                >
                  <Avatar className="size-6">
                    <AvatarImage src={u.avatarUrl ?? undefined} alt={u.name} />
                    <AvatarFallback>{u.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    {u.name}{" "}
                    <span className="text-muted-foreground">@{u.handle}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Button
            type="button"
            size="sm"
            className="gap-1.5"
            onClick={handleSubmit}
            disabled={!value.trim()}
          >
            <SendIcon className="size-3.5" />
            {size === "sm" ? "Reply" : "Comment"}
          </Button>
          {onCancel && (
            <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
