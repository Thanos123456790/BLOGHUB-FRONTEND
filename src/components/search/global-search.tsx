"use client";

import * as React from "react";
import Link from "next/link";
import { FileTextIcon, Loader2Icon, SearchIcon, UsersIcon } from "lucide-react";

import { useLazySearchBlogsQuery, useLazySearchUsersQuery } from "@/lib/store/api/blogifyApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function GlobalSearch({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const [searchUsers, { data: userResults, isFetching: usersLoading }] = useLazySearchUsersQuery();
  const [searchBlogs, { data: blogResults, isFetching: blogsLoading }] = useLazySearchBlogsQuery();

  const q = query.trim();

  React.useEffect(() => {
    if (q.length === 0) return;
    const handle = setTimeout(() => {
      searchUsers({ query: q, size: 5 });
      searchBlogs({ query: q, size: 5 });
    }, 300);
    return () => clearTimeout(handle);
  }, [q, searchUsers, searchBlogs]);

  const matchedUsers = q ? (userResults?.content ?? []) : [];
  const matchedBlogs = q ? (blogResults?.content ?? []) : [];
  const loading = usersLoading || blogsLoading;

  function close() {
    setOpen(false);
    setQuery("");
  }

  return (
    <>
      <div onClick={() => setOpen(true)} className="contents">
        {trigger ?? (
          <Button variant="ghost" size="icon" aria-label="Search">
            <SearchIcon className="size-5" />
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : close())}>
        <DialogContent className="sm:max-w-lg gap-4">
          <DialogHeader>
            <DialogTitle>Search Blogify</DialogTitle>
            <DialogDescription>
              Find posts, writers, and tags.
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts, people, tags..."
              className="pl-10"
            />
            {loading && (
              <Loader2Icon className="absolute right-4 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="flex flex-col gap-1 max-h-80 overflow-y-auto -mx-1.5 px-1.5">
            {q === "" && (
              <p className="text-sm text-muted-foreground py-10 text-center">
                Start typing to search Blogify.
              </p>
            )}

            {q !== "" && !loading && matchedUsers.length === 0 && matchedBlogs.length === 0 && (
              <p className="text-sm text-muted-foreground py-10 text-center">
                No results for &ldquo;{query}&rdquo;.
              </p>
            )}

            {matchedUsers.length > 0 && (
              <div className="mb-1">
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground px-1.5 py-1.5">
                  <UsersIcon className="size-3.5" /> People
                </p>
                {matchedUsers.map((u) => (
                  <Link
                    key={u.id}
                    href={`/u/${u.handle}`}
                    onClick={close}
                    className="flex items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-muted transition-colors"
                  >
                    <Avatar className="size-8">
                      <AvatarImage src={u.avatarUrl ?? undefined} alt={u.name} />
                      <AvatarFallback>{u.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm min-w-0">
                      <span className="font-medium">{u.name}</span>{" "}
                      <span className="text-muted-foreground">@{u.handle}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {matchedBlogs.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground px-1.5 py-1.5">
                  <FileTextIcon className="size-3.5" /> Posts
                </p>
                {matchedBlogs.map((b) => (
                  <Link
                    key={b.id}
                    href={`/blog/${b.id}`}
                    onClick={close}
                    className="block rounded-xl px-2 py-2 hover:bg-muted transition-colors"
                  >
                    <p className="text-sm font-medium line-clamp-1">{b.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {b.tags.map((t) => `#${t}`).join(" ")}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
