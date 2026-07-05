"use client";

import Link from "next/link";
import { useState } from "react";

import type { UserProfile } from "@/lib/api/types";
import { compactNumber } from "@/lib/format";
import { useGetMeQuery } from "@/lib/store/api/blogifyApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerifiedBadge } from "./verified-badge";
import { FollowButton } from "@/components/follow/FollowButton";
import { cn } from "@/lib/utils";

export function UserRow({
  user,
  showBio = false,
  showFollowerCount = false,
  dense = false,
}: {
  user: UserProfile;
  showBio?: boolean;
  showFollowerCount?: boolean;
  dense?: boolean;
}) {
  const { data: me } = useGetMeQuery();
  const [isFollowing, setIsFollowing] = useState(user.isFollowing);
  const isMe = me?.id === user.id;

  return (
    <div className="flex items-center gap-3">
      <Link href={`/u/${user.handle}`} className="shrink-0">
        <Avatar className={cn(dense ? "size-9" : "size-11")}>
          <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={`/u/${user.handle}`}
          className="flex items-center gap-1 text-sm font-medium hover:underline w-fit"
        >
          <span className="truncate">{user.name}</span>
          {user.isVerified && <VerifiedBadge className="size-3.5" />}
        </Link>
        <p className="text-xs text-muted-foreground truncate">
          @{user.handle}
          {showFollowerCount && (
            <span> · {compactNumber(user.followersCount)} followers</span>
          )}
        </p>
        {showBio && user.bio && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {user.bio}
          </p>
        )}
      </div>

      {!isMe && (
        <FollowButton
          handle={user.handle}
          initialIsFollowing={isFollowing}
          onUpdated={(updated) => setIsFollowing(updated.isFollowing)}
          className="shrink-0"
        />
      )}
    </div>
  );
}