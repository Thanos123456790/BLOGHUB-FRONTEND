"use client";

import Link from "next/link";
import { ImageIcon, SmileIcon } from "lucide-react";

import { useGetMeQuery } from "@/lib/store/api/blogifyApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function ComposerPrompt() {
  const { data: me } = useGetMeQuery();

  return (
    <Card className="p-4">
      <Link href="/create" className="flex items-center gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarImage src={me?.avatarUrl ?? undefined} alt={me?.name} />
          <AvatarFallback>{me?.name?.[0] ?? "?"}</AvatarFallback>
        </Avatar>
        <span className="flex-1 rounded-full border border-border bg-muted px-4 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors">
          Share something you&rsquo;re thinking about...
        </span>
      </Link>
      <Separator className="my-3" />
      <div className="flex items-center gap-5 px-1">
        <Link
          href="/create"
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ImageIcon className="size-4 text-brand-amber" />
          Photo
        </Link>
        <Link
          href="/create"
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <SmileIcon className="size-4 text-brand-amber" />
          Mood
        </Link>
      </div>
    </Card>
  );
}
