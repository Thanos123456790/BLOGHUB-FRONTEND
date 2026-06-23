"use client";

import Link from "next/link";

import type { UserProfile } from "@/lib/api/types";
import { compactNumber } from "@/lib/format";
import {
  useFollowUserMutation,
  useGetMeQuery,
  useUnfollowUserMutation,
} from "@/lib/store/api/blogifyApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "./verified-badge";
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
  const [followUser, { isLoading: following_ }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: unfollowing }] = useUnfollowUserMutation();
  const isMe = me?.id === user.id;
  const busy = following_ || unfollowing;

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
        <Button
          variant={user.isFollowing ? "outline" : "default"}
          size="sm"
          className="shrink-0"
          disabled={busy}
          onClick={() =>
            user.isFollowing ? unfollowUser(user.id) : followUser(user.id)
          }
        >
          {user.isFollowing ? "Following" : "Follow"}
        </Button>
      )}
    </div>
  );
}
