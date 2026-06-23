"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";

import { useGetFeedQuery } from "@/lib/store/api/blogifyApi";
import { BlogCard } from "@/components/blog/blog-card";
import { ComposerPrompt } from "@/components/blog/composer-prompt";
import { TrendingTagsCard } from "@/components/widgets/trending-tags";
import { SuggestedWritersCard } from "@/components/widgets/suggested-writers";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Feather } from "lucide-react";

export default function HomePage() {
  const [tab, setTab] = React.useState<"for-you" | "following">("for-you");
  const { data, isLoading, isFetching } = useGetFeedQuery({ feed: tab, size: 20 });

  const blogs = data?.content ?? [];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 lg:py-8 xl:flex xl:gap-8 max-w-[1100px] mx-auto">
      <div className="xl:max-w-[640px] xl:flex-1 min-w-0">
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Home
          </h1>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="mb-5">
            <TabsTrigger value="for-you">For you</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="flex flex-col gap-5">
            {tab === "for-you" && <ComposerPrompt />}

            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2Icon className="size-5 animate-spin" />
              </div>
            ) : blogs.length === 0 ? (
              tab === "following" ? (
                <EmptyFollowingState />
              ) : (
                <EmptyFeedState />
              )
            ) : (
              <>
                {blogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
                {isFetching && (
                  <div className="flex items-center justify-center py-4 text-muted-foreground">
                    <Loader2Icon className="size-4 animate-spin" />
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <aside className="hidden xl:flex w-80 shrink-0 flex-col gap-5 sticky top-8 self-start">
        <TrendingTagsCard />
        <SuggestedWritersCard />
      </aside>
    </div>
  );
}

function EmptyFollowingState() {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-16 px-6 rounded-2xl border border-dashed border-border">
      <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        <Feather className="size-5" />
      </div>
      <p className="font-medium">Nothing here yet</p>
      <p className="text-sm text-muted-foreground max-w-xs">
        Follow a few writers and their posts will start showing up in this feed.
      </p>
    </div>
  );
}

function EmptyFeedState() {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-16 px-6 rounded-2xl border border-dashed border-border">
      <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        <Feather className="size-5" />
      </div>
      <p className="font-medium">No posts yet</p>
      <p className="text-sm text-muted-foreground max-w-xs">
        Be the first to publish something.
      </p>
    </div>
  );
}
