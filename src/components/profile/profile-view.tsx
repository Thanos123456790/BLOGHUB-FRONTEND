"use client";

import Link from "next/link";
import { CalendarIcon, Loader2Icon, MapPinIcon, SettingsIcon } from "lucide-react";

import type { UserProfile } from "@/lib/api/types";
import {
  useFollowUserMutation,
  useGetBookmarkedBlogsQuery,
  useGetMeQuery,
  useGetUserBlogsQuery,
  useUnfollowUserMutation,
} from "@/lib/store/api/blogifyApi";
import { compactNumber } from "@/lib/format";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { BackButton } from "@/components/shared/back-button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BlogCard } from "@/components/blog/blog-card";
import { EditProfileDialog } from "./edit-profile-dialog";
import { Feather } from "lucide-react";

export function ProfileView({
  user,
  showBackButton = false,
}: {
  user: UserProfile;
  showBackButton?: boolean;
}) {
  const { data: me } = useGetMeQuery();
  const isMe = me?.id === user.id;
  const [followUser, { isLoading: following_ }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: unfollowing }] = useUnfollowUserMutation();

  const { data: postsPage, isLoading: postsLoading } = useGetUserBlogsQuery({
    handle: user.handle,
    size: 20,
  });
  const { data: bookmarksPage, isLoading: bookmarksLoading } = useGetBookmarkedBlogsQuery(
    { size: 20 },
    { skip: !isMe }
  );

  const myPosts = postsPage?.content ?? [];
  const savedPosts = bookmarksPage?.content ?? [];

  return (
    <div className="max-w-[720px] mx-auto pb-10">
      <div className="relative h-40 sm:h-56 w-full overflow-hidden bg-muted">
        {user.bannerUrl && (
          <img src={user.bannerUrl} alt="" className="size-full object-cover" />
        )}
        {showBackButton && (
          <div className="absolute top-4 left-4 z-10">
            <BackButton variant="floating" />
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6">
        <div className="flex items-end justify-between -mt-10 sm:-mt-12">
          <Avatar className="size-20 sm:size-24 ring-4 ring-background">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
            <AvatarFallback className="text-xl">{user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2 pb-1">
            {isMe ? (
              <>
                <Button variant="outline" size="icon" asChild aria-label="Settings">
                  <Link href="/settings">
                    <SettingsIcon className="size-4" />
                  </Link>
                </Button>
                <EditProfileDialog user={user} />
              </>
            ) : (
              <Button
                variant={user.isFollowing ? "outline" : "default"}
                disabled={following_ || unfollowing}
                onClick={() =>
                  user.isFollowing ? unfollowUser(user.id) : followUser(user.id)
                }
              >
                {user.isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-1.5">
            <h1 className="font-display text-xl font-semibold tracking-tight">
              {user.name}
            </h1>
            {user.isVerified && <VerifiedBadge />}
          </div>
          <p className="text-sm text-muted-foreground">@{user.handle}</p>
        </div>

        {user.bio && <p className="mt-3 text-[15px] leading-relaxed">{user.bio}</p>}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          {user.location && (
            <span className="flex items-center gap-1">
              <MapPinIcon className="size-3.5" />
              {user.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <CalendarIcon className="size-3.5" />
            Joined {new Date(user.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-5 text-sm">
          {isMe ? (
            <>
              <Link href="/follow" className="hover:underline">
                <span className="font-semibold">{compactNumber(user.followingCount)}</span>{" "}
                <span className="text-muted-foreground">Following</span>
              </Link>
              <Link href="/follow" className="hover:underline">
                <span className="font-semibold">{compactNumber(user.followersCount)}</span>{" "}
                <span className="text-muted-foreground">Followers</span>
              </Link>
            </>
          ) : (
            <>
              <span>
                <span className="font-semibold">{compactNumber(user.followingCount)}</span>{" "}
                <span className="text-muted-foreground">Following</span>
              </span>
              <span>
                <span className="font-semibold">{compactNumber(user.followersCount)}</span>{" "}
                <span className="text-muted-foreground">Followers</span>
              </span>
            </>
          )}
          <span>
            <span className="font-semibold">{user.postsCount}</span>{" "}
            <span className="text-muted-foreground">Posts</span>
          </span>
        </div>
      </div>

      <div className="mt-6 px-4 sm:px-6">
        <Tabs defaultValue="posts">
          <TabsList className="w-full sm:w-fit">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            {isMe && <TabsTrigger value="saved">Saved</TabsTrigger>}
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="flex flex-col gap-5 mt-5">
            {postsLoading ? (
              <LoadingTab />
            ) : myPosts.length === 0 ? (
              <EmptyTab text="No posts yet." />
            ) : (
              myPosts.map((b) => <BlogCard key={b.id} blog={b} />)
            )}
          </TabsContent>

          {isMe && (
            <TabsContent value="saved" className="flex flex-col gap-5 mt-5">
              {bookmarksLoading ? (
                <LoadingTab />
              ) : savedPosts.length === 0 ? (
                <EmptyTab text="Posts you bookmark will show up here." />
              ) : (
                savedPosts.map((b) => <BlogCard key={b.id} blog={b} />)
              )}
            </TabsContent>
          )}

          <TabsContent value="about" className="mt-5">
            <div className="rounded-2xl border border-border p-5 flex flex-col gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                  Bio
                </p>
                <p>{user.bio || "No bio yet."}</p>
              </div>
              {user.location && (
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                    Location
                  </p>
                  <p>{user.location}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                  Joined
                </p>
                <p>{new Date(user.joinedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function LoadingTab() {
  return (
    <div className="flex items-center justify-center py-16 text-muted-foreground">
      <Loader2Icon className="size-5 animate-spin" />
    </div>
  );
}

function EmptyTab({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-16 px-6 rounded-2xl border border-dashed border-border">
      <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        <Feather className="size-5" />
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
