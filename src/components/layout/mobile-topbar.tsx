"use client";

import Link from "next/link";
import { Feather, SearchIcon } from "lucide-react";

import { useGetMeQuery } from "@/lib/store/api/blogifyApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/search/global-search";

export function MobileTopBar() {
  const { data: me } = useGetMeQuery();

  return (
    <header className="md:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-background/90 backdrop-blur border-b border-border">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Feather className="size-3.5" />
        </div>
        <span className="font-display text-base font-semibold tracking-tight">
          Blogify
        </span>
      </Link>
      <div className="flex items-center gap-1.5">
        <GlobalSearch
          trigger={
            <Button variant="ghost" size="icon" aria-label="Search">
              <SearchIcon className="size-5" />
            </Button>
          }
        />
        <Link href="/profile">
          <Avatar className="size-8">
            <AvatarImage src={me?.avatarUrl ?? undefined} alt={me?.name} />
            <AvatarFallback>{me?.name?.[0] ?? "?"}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
