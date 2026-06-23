"use client";

import { useParams } from "next/navigation";
import { Loader2Icon, TagIcon } from "lucide-react";

import { useGetTaggedBlogsQuery } from "@/lib/store/api/blogifyApi";
import { BackButton } from "@/components/shared/back-button";
import { BlogCard } from "@/components/blog/blog-card";

export default function TaggedBlogsPage() {
  const params = useParams<{ tagName: string }>();
  const tagName = decodeURIComponent(params.tagName);
  const { data, isLoading } = useGetTaggedBlogsQuery({ tagName, size: 20 });

  const blogs = data?.content ?? [];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 lg:py-8 max-w-[640px] mx-auto">
      <BackButton className="mb-5" fallbackHref="/" />

      <div className="flex items-center gap-2 mb-5">
        <TagIcon className="size-5 text-brand-amber" />
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          #{tagName}
        </h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2Icon className="size-5 animate-spin" />
        </div>
      ) : blogs.length === 0 ? (
        <div className="flex flex-col items-center text-center gap-3 py-16 px-6 rounded-2xl border border-dashed border-border">
          <p className="text-sm text-muted-foreground">
            No posts tagged #{tagName} yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
}
