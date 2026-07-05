"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AtSignIcon,
  BellIcon,
  HeartIcon,
  Loader2Icon,
  MessageCircleIcon,
  ReplyIcon,
  UserPlusIcon,
} from "lucide-react";

import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/lib/store/api/blogifyApi";
import { relativeTime } from "@/lib/format";
import type { NotificationType } from "@/lib/api/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const iconByType: Record<NotificationType, typeof BellIcon> = {
  FOLLOW: UserPlusIcon,
  REACTION: HeartIcon,
  COMMENT: MessageCircleIcon,
  REPLY: ReplyIcon,
  MENTION: AtSignIcon,
  COMMENT_REACTION: HeartIcon,
};

function buildSentence(actorNames: string[], message: string) {
  if (actorNames.length <= 1) return message;
  if (actorNames.length === 2)
    return `${actorNames[0]} and ${actorNames[1]} ${message}`;
  return `${actorNames[0]}, ${actorNames[1]} and ${actorNames.length - 2} others ${message}`;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { data, isLoading } = useGetNotificationsQuery({ size: 50 });
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const [markRead] = useMarkNotificationReadMutation();

  const notifications = data?.content ?? [];

  const handleClick = (
    e: React.MouseEvent,
    id: string,
    isRead: boolean,
    href: string
  ) => {
    e.preventDefault();
    if (!isRead) markRead(id);
    router.push(href);
  };

  console.log("All notifications",data);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 lg:py-8 max-w-[640px] mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Notifications
        </h1>
        <Button variant="ghost" size="sm" onClick={() => markAllRead()}>
          Mark all read
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2Icon className="size-5 animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-1.5">
          {notifications.map((n) => {
            const Icon = iconByType[n.type];
            const linkHref =
              n.type === "FOLLOW" && n.actors[0]
                ? `/u/${n.actors[0].handle}`
                : n.blog
                  ? `/blog/${n.blog.id}`
                  : "/";

            return (
              <Link
                key={n.id}
                href={linkHref}
                onClick={(e) => handleClick(e, n.id, n.isRead, linkHref)}
                className={cn(
                  "flex items-start gap-3.5 rounded-2xl border border-transparent px-4 py-3.5 transition-colors hover:border-border hover:bg-muted/60",
                  !n.isRead && "bg-secondary/60"
                )}
              >
                <div className="relative shrink-0">
                  <div className="flex -space-x-3">
                    {n.actors.slice(0, 2).map((a) => (
                      <Avatar key={a.id} className="size-10 ring-2 ring-card">
                        <AvatarImage src={a.avatarUrl ?? undefined} alt={a.name} />
                        <AvatarFallback>{a.name[0]}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <span
                    className={cn(
                      "absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full ring-2 ring-card",
                      n.type === "FOLLOW"
                        ? "bg-primary text-primary-foreground"
                        : "bg-brand-amber text-brand-amber-foreground"
                    )}
                  >
                    <Icon className="size-3" />
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">
                    <span className="font-medium">
                      {buildSentence(n.actors.map((a) => a.name), n.message)}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {relativeTime(n.createdAt)}
                  </p>
                </div>

                {!n.isRead && (
                  <span className="mt-1.5 size-2 rounded-full bg-brand-amber shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-20 px-6 rounded-2xl border border-dashed border-border">
      <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        <BellIcon className="size-5" />
      </div>
      <p className="font-medium">You&rsquo;re all caught up</p>
      <p className="text-sm text-muted-foreground max-w-xs">
        New follows, reactions, and comments will show up here.
      </p>
    </div>
  );
}