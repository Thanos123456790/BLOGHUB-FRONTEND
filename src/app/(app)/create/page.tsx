"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Code,
  DockIcon,
  HeadingIcon,
  ImageIcon,
  Loader2Icon,
  PenLineIcon,
  QuoteIcon,
  SendIcon,
  VideoIcon,
} from "lucide-react";

import {
  useGetMeQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useUploadAssetMutation,
} from "@/lib/store/api/blogifyApi";
import type { BlogBlockRequest, BlockType } from "@/lib/api/types";
import type { EditorBlock } from "@/lib/types";
import type { AssetType } from "@/lib/api/types";
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
  code: "CODE",
  pdf: "PDF",
  video: "VIDEO",
};

export default function CreatePage() {
  const router = useRouter();
  const { data: me } = useGetMeQuery();
  const [createBlog, { isLoading: publishing }] = useCreateBlogMutation();
  const [updateBlog] = useUpdateBlogMutation();

  // ✅ FIX: properly destructure uploadAsset so it can be passed to BlockEditorItem
  const [uploadAsset, { isLoading: uploading }] = useUploadAssetMutation();

  const [title, setTitle] = React.useState("");
  const [subtitle, setSubtitle] = React.useState("");
  const [coverImage, setCoverImage] = React.useState(stockCoverImages[0]);
  const [coverFilter, setCoverFilter] = React.useState("none");
  const [tags, setTags] = React.useState<string[]>([]);
  const [blocks, setBlocks] = React.useState<EditorBlock[]>([
    { id: uid("blk"), type: "paragraph", content: "" },
  ]);

  // Track draft id so Save Draft updates the same draft instead of creating a new one
  const [draftId, setDraftId] = React.useState<string | undefined>(undefined);
  const [savingDraft, setSavingDraft] = React.useState(false);

  // ── Block helpers ──────────────────────────────────────────────────────────

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
    return blocks
      .filter((b) => b.type !== "image")
      .map((b) => b.content)
      .join(" ")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
  }

  // ── Upload helper — passed to every BlockEditorItem ────────────────────────

  async function handleUpload(file: File, type: AssetType): Promise<string> {
  const result = await uploadAsset({ file, filename: file.name, type }).unwrap();
  return result.url;
}

  // ── Build block request list ───────────────────────────────────────────────

  function buildBlockRequests(): BlogBlockRequest[] {
    return blocks
      .filter((b) => b.content.trim() || (b.type === "image" && b.content))
      .map((b, i) => ({
        type: BLOCK_TYPE_MAP[b.type],
        content: b.content,
        caption: b.caption || undefined,
        filter:
          b.filter && b.filter !== "none"
            ? (b.filter as BlogBlockRequest["filter"])
            : undefined,
        language: b.language || undefined,
        position: i,
      }));
  }

  function buildExcerpt(): string {
    const firstParagraph = blocks.find(
      (b) => b.type === "paragraph" && b.content.trim()
    );
    return ((subtitle?.trim() || firstParagraph?.content) ?? "").slice(0, 500);
  }

  function validate(): boolean {
    if (!title.trim()) {
      toast.error("Add a title before publishing.");
      return false;
    }
    if (title.trim().length < 5) {
      toast.error("Title needs to be at least 5 characters.");
      return false;
    }
    if (buildBlockRequests().length === 0) {
      toast.error("Add at least one block of content.");
      return false;
    }
    if (buildExcerpt().trim().length < 10) {
      toast.error("Add a subtitle or a first paragraph of at least 10 characters.", {
        description: "It's used as the post's excerpt.",
      });
      return false;
    }
    return true;
  }

  // ── Publish ────────────────────────────────────────────────────────────────

  async function handlePublish() {
    if (!validate()) return;

    const payload = {
      title: title.trim(),
      excerpt: buildExcerpt(),
      coverImageUrl: coverImage || undefined,
      coverFilter: coverFilter && coverFilter !== "none" ? coverFilter : undefined,
      readTimeMinutes: Math.max(1, Math.round(wordCount() / 200)),
      tags: tags.length ? tags : undefined,
      blocks: buildBlockRequests(),
      isDraft: false,
    };

    try {
      let blog;
      if (draftId) {
        // ✅ Publish an existing draft: flip isDraft → false
        blog = await updateBlog({ id: draftId, body: { ...payload, isDraft: false } }).unwrap();
      } else {
        blog = await createBlog(payload).unwrap();
      }
      toast.success("Published!", { description: "Your post is now live." });
      router.push(`/blog/${blog.id}`);
    } catch {
      toast.error("Couldn't publish", {
        description: "Please check your post and try again.",
      });
    }
  }

  // ── Save Draft ─────────────────────────────────────────────────────────────

  async function handleSaveDraft() {
    if (!title.trim()) {
      toast.error("Add a title before saving a draft.");
      return;
    }

    setSavingDraft(true);
    const payload = {
      title: title.trim(),
      excerpt: buildExcerpt() || title.trim(), // excerpt can be minimal for a draft
      coverImageUrl: coverImage || undefined,
      coverFilter: coverFilter && coverFilter !== "none" ? coverFilter : undefined,
      readTimeMinutes: Math.max(1, Math.round(wordCount() / 200)),
      tags: tags.length ? tags : undefined,
      blocks: buildBlockRequests(),
      isDraft: true,
    };

    try {
      if (draftId) {
        // ✅ Update the existing draft
        await updateBlog({ id: draftId, body: payload }).unwrap();
        toast.success("Draft updated.");
      } else {
        // ✅ Create a new draft and remember its id
        const blog = await createBlog(payload).unwrap();
        setDraftId(blog.id);
        toast.success("Draft saved.", {
          description: "Find it under My Drafts on your profile.",
        });
      }
    } catch {
      toast.error("Couldn't save draft", {
        description: "Please try again.",
      });
    } finally {
      setSavingDraft(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 lg:py-8 max-w-[760px] mx-auto pb-16">
      <BackButton className="mb-5" fallbackHref="/" />

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {draftId ? "Edit draft" : "Write a post"}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={handleSaveDraft}
            disabled={savingDraft || publishing}
          >
            {savingDraft && <Loader2Icon className="size-4 animate-spin mr-1.5" />}
            {savingDraft ? "Saving…" : draftId ? "Update draft" : "Save draft"}
          </Button>
          <Button
            onClick={handlePublish}
            className="gap-1.5"
            disabled={publishing || savingDraft || uploading}
          >
            {publishing ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <SendIcon className="size-4" />
            )}
            {draftId ? "Publish now" : "Publish"}
          </Button>
        </div>
      </div>

      {/* Draft badge */}
      {draftId && (
        <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
          Saved as draft · changes save automatically when you click &ldquo;Update draft&rdquo;
        </p>
      )}

      <div className="flex items-center gap-3 mb-6">
        <Avatar className="size-9">
          <AvatarImage src={me?.avatarUrl ?? undefined} alt={me?.name} />
          <AvatarFallback>{me?.name?.[0] ?? "?"}</AvatarFallback>
        </Avatar>
        <div className="text-sm">
          <p className="font-medium">{me?.name ?? "..."}</p>
          <p className="text-xs text-muted-foreground">
            {draftId ? "Draft — not yet published" : "Publishing publicly"}
          </p>
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
            onUpload={handleUpload}
          />
        ))}
      </div>

      {/* Add block toolbar */}
      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-border p-3">
        <span className="text-xs font-medium text-muted-foreground pl-1 pr-1">
          Add block
        </span>
        {(
          [
            { type: "paragraph", icon: <PenLineIcon className="size-3.5" />, label: "Text" },
            { type: "heading",   icon: <HeadingIcon  className="size-3.5" />, label: "Heading" },
            { type: "quote",     icon: <QuoteIcon    className="size-3.5" />, label: "Quote" },
            { type: "image",     icon: <ImageIcon    className="size-3.5" />, label: "Photo" },
            { type: "video",     icon: <VideoIcon    className="size-3.5" />, label: "Video" },
            { type: "pdf",       icon: <DockIcon     className="size-3.5" />, label: "PDF" },
            { type: "code",      icon: <Code         className="size-3.5" />, label: "Code" },
          ] as Array<{ type: EditorBlock["type"]; icon: React.ReactNode; label: string }>
        ).map(({ type, icon, label }) => (
          <Button
            key={type}
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => addBlock(type)}
          >
            {icon}
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}