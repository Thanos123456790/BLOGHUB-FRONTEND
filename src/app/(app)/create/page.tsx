"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  HeadingIcon,
  ImageIcon,
  Loader2Icon,
  PenLineIcon,
  QuoteIcon,
  SendIcon,
} from "lucide-react";

import { useGetMeQuery, useCreateBlogMutation } from "@/lib/store/api/blogifyApi";
import type { BlogBlockRequest, BlockType } from "@/lib/api/types";
import type { EditorBlock } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BackButton } from "@/components/shared/back-button";
import { CoverPicker } from "@/components/editor/cover-picker";
import { TagInput } from "@/components/editor/tag-input";
import { BlockEditorItem } from "@/components/editor/block-editor-item";
import { EmojiPopover } from "@/components/editor/emoji-popover";
import { stockCoverImages } from "@/lib/filters";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

const BLOCK_TYPE_MAP: Record<EditorBlock["type"], BlockType> = {
  paragraph: "PARAGRAPH",
  heading: "HEADING",
  quote: "QUOTE",
  image: "IMAGE",
};

export default function CreatePage() {
  const router = useRouter();
  const { data: me } = useGetMeQuery();
  const [createBlog, { isLoading: publishing }] = useCreateBlogMutation();

  const [title, setTitle] = React.useState("");
  const [subtitle, setSubtitle] = React.useState("");
  const [coverImage, setCoverImage] = React.useState(stockCoverImages[0]);
  const [coverFilter, setCoverFilter] = React.useState("none");
  const [tags, setTags] = React.useState<string[]>([]);
  const [blocks, setBlocks] = React.useState<EditorBlock[]>([
    { id: uid("blk"), type: "paragraph", content: "" },
  ]);

  function addBlock(type: EditorBlock["type"]) {
    setBlocks((prev) => [
      ...prev,
      { id: uid("blk"), type, content: "", caption: "", filter: "none" },
    ]);
  }

  function updateBlock(id: string, patch: Partial<EditorBlock>) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
    );
  }

  function removeBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  function moveBlock(id: string, direction: "up" | "down") {
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === id);
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      [copy[index], copy[targetIndex]] = [copy[targetIndex], copy[index]];
      return copy;
    });
  }

  function wordCount() {
    const text = blocks
      .filter((b) => b.type !== "image")
      .map((b) => b.content)
      .join(" ");
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  async function handlePublish() {
    if (!title.trim()) {
      toast.error("Add a title before publishing.");
      return;
    }
    if (title.trim().length < 5) {
      toast.error("Title needs to be at least 5 characters.");
      return;
    }

    const filledBlocks = blocks.filter(
      (b) => b.content.trim() || (b.type === "image" && b.content)
    );
    if (filledBlocks.length === 0) {
      toast.error("Add at least one block of content.");
      return;
    }

    const firstParagraph = blocks.find(
      (b) => b.type === "paragraph" && b.content.trim()
    );
    const excerpt = (
      subtitle.trim() || (firstParagraph ? firstParagraph.content : "")
    ).slice(0, 500);

    if (excerpt.trim().length < 10) {
      toast.error("Add a subtitle, or a first paragraph, of at least 10 characters.", {
        description: "It's used as the post's excerpt.",
      });
      return;
    }

    const blockRequests: BlogBlockRequest[] = filledBlocks.map((b, i) => ({
      type: BLOCK_TYPE_MAP[b.type],
      content: b.content,
      caption: b.caption || undefined,
      filter: (b.filter && b.filter !== "none" ? b.filter : undefined) as
        | BlogBlockRequest["filter"]
        | undefined,
      position: i,
    }));

    try {
      const blog = await createBlog({
        title: title.trim(),
        excerpt,
        coverImageUrl: coverImage || undefined,
        coverFilter: coverFilter && coverFilter !== "none" ? coverFilter : undefined,
        readTimeMinutes: Math.max(1, Math.round(wordCount() / 200)),
        tags: tags.length ? tags : undefined,
        blocks: blockRequests,
      }).unwrap();

      toast.success("Published", { description: "Your post is now live." });
      router.push(`/blog/${blog.id}`);
    } catch {
      toast.error("Couldn't publish", {
        description: "Please check your post and try again.",
      });
    }
  }

  function handleSaveDraft() {
    toast("Drafts aren't supported by the backend yet.", {
      description: "Publish directly, or keep this tab open for now.",
    });
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 lg:py-8 max-w-[760px] mx-auto pb-16">
      <BackButton className="mb-5" fallbackHref="/" />

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Write a post
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleSaveDraft}>
            Save draft
          </Button>
          <Button onClick={handlePublish} className="gap-1.5" disabled={publishing}>
            {publishing ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <SendIcon className="size-4" />
            )}
            Publish
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Avatar className="size-9">
          <AvatarImage src={me?.avatarUrl ?? undefined} alt={me?.name} />
          <AvatarFallback>{me?.name?.[0] ?? "?"}</AvatarFallback>
        </Avatar>
        <div className="text-sm">
          <p className="font-medium">{me?.name ?? "..."}</p>
          <p className="text-xs text-muted-foreground">Publishing publicly</p>
        </div>
      </div>

      <CoverPicker
        coverImage={coverImage}
        filter={coverFilter}
        onImageChange={setCoverImage}
        onFilterChange={setCoverFilter}
      />

      <div className="mt-6 relative">
        <Textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Your post title"
          rows={1}
          className="font-display text-2xl sm:text-3xl font-semibold rounded-xl border-none shadow-none px-0 resize-none focus-visible:ring-0 min-h-0"
        />
        <div className="absolute top-1 right-0">
          <EmojiPopover onSelect={(e) => setTitle((t) => t + e)} />
        </div>
      </div>

      <Textarea
        value={subtitle}
        onChange={(e) => setSubtitle(e.target.value)}
        placeholder="Add a one-line subtitle (optional)"
        rows={1}
        className="text-muted-foreground rounded-xl border-none shadow-none px-0 resize-none focus-visible:ring-0 min-h-0 -mt-1"
      />

      <div className="mt-4">
        <TagInput tags={tags} onChange={setTags} />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {blocks.map((block, i) => (
          <BlockEditorItem
            key={block.id}
            block={block}
            isFirst={i === 0}
            isLast={i === blocks.length - 1}
            onChange={(patch) => updateBlock(block.id, patch)}
            onMove={(dir) => moveBlock(block.id, dir)}
            onRemove={() => removeBlock(block.id)}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-border p-3">
        <span className="text-xs font-medium text-muted-foreground pl-1 pr-1">
          Add block
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => addBlock("paragraph")}
        >
          <PenLineIcon className="size-3.5" />
          Text
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => addBlock("heading")}
        >
          <HeadingIcon className="size-3.5" />
          Heading
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => addBlock("quote")}
        >
          <QuoteIcon className="size-3.5" />
          Quote
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => addBlock("image")}
        >
          <ImageIcon className="size-3.5" />
          Photo
        </Button>
        {/* Video blocks are not supported by the backend yet (BlockType has
            no VIDEO variant) — see README "Known backend gaps". Add a
            "Video" button here, mirroring "Photo" above, once it does. */}
      </div>
    </div>
  );
}
