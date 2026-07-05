"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarIcon,
  GlobeIcon,
  Loader2Icon,
  MapPinIcon,
  SettingsIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  SparklesIcon,
  HeartIcon,
  LinkIcon,
  LanguagesIcon,
  LockIcon,
} from "lucide-react";

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
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/lib/store/hooks";
import { selectSettings } from "@/lib/store/slices/settingsSlice";

// Extended profile fields (stored in bio as structured JSON or shown separately if backend supports)
interface ExtendedProfile extends UserProfile {
  website?: string | null;
  profession?: string | null;
  education?: string | null;
  skills?: string[] | null;
  interests?: string[] | null;
  languages?: string[] | null;
  socialLinks?: { platform: string; url: string }[] | null;
}

export function ProfileView({
  user,
  showBackButton = false,
}: {
  user: ExtendedProfile;
  showBackButton?: boolean;
}) {
  const { data: me } = useGetMeQuery();
  const settings = useAppSelector(selectSettings);
  const isMe = me?.id === user.id;
  const [followUser, { isLoading: following_ }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: unfollowing }] = useUnfollowUserMutation();

  // Privacy check: if profile is private and viewer is not the owner and not following
  const isPrivate = !isMe && settings.privateAccount && !user.isFollowing;

  const { data: postsPage, isLoading: postsLoading } = useGetUserBlogsQuery(
    { handle: user.handle, size: 20 },
    { skip: isPrivate && !isMe }
  );
  const { data: bookmarksPage, isLoading: bookmarksLoading } = useGetBookmarkedBlogsQuery(
    { size: 20 },
    { skip: !isMe }
  );

  const myPosts = postsPage?.content ?? [];
  const savedPosts = bookmarksPage?.content ?? [];

  const [bannerLoaded, setBannerLoaded] = React.useState(false);
  const [avatarLoaded, setAvatarLoaded] = React.useState(false);

  return (
    <div className="max-w-[720px] mx-auto pb-10">
      {/* Banner with loading skeleton */}
      <div className="relative h-40 sm:h-56 w-full overflow-hidden bg-muted">
        {/* {!bannerLoaded && user.bannerUrl && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )} */}
        {user.bannerUrl && (
          <img
            src={user.bannerUrl}
            alt=""
            className={cn("size-full object-cover transition-opacity duration-300", bannerLoaded ? "opacity-100" : "opacity-0")}
            onLoad={() => setBannerLoaded(true)}
          />
        )}
        {showBackButton && (
          <div className="absolute top-4 left-4 z-10">
            <BackButton variant="floating" />
          </div>
        )}
        {!isMe && !user.isFollowing && (
          <div className="absolute top-3 right-3">
            <LockIcon className="size-4 text-white/70 hidden" />
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6">
        <div className="flex items-end justify-between -mt-10 sm:-mt-12">
          {/* Avatar with loading skeleton */}
          <div className="relative">
            {!avatarLoaded && (
              <div className="size-20 sm:size-24 rounded-full ring-4 ring-background bg-muted animate-pulse" />
            )}
            <Avatar className={cn("size-20 sm:size-24 ring-4 ring-background", !avatarLoaded && "opacity-0 absolute")}>
              <AvatarImage
                src={user.avatarUrl ?? undefined}
                alt={user.name}
                onLoad={() => setAvatarLoaded(true)}
              />
              <AvatarFallback className="text-xl">{user.name[0]}</AvatarFallback>
            </Avatar>
            {/* Always show fallback after short delay */}
            {/* {!avatarLoaded && !user.avatarUrl && (
              <Avatar className="size-20 sm:size-24 ring-4 ring-background">
                <AvatarFallback className="text-xl">{user.name[0]}</AvatarFallback>
              </Avatar>
            )} */}
          </div>
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
                  user.isFollowing
                    ? unfollowUser(user.handle)
                    : followUser(user.handle)
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

        {/* Private account badge for non-followers */}
        {isPrivate && (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground rounded-xl border border-dashed border-border px-3 py-2">
            <LockIcon className="size-4 shrink-0" />
            <span>This account is private. Follow to see their posts.</span>
          </div>
        )}

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
          {user.website && (
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <LinkIcon className="size-3.5" />
              {user.website.replace(/^https?:\/\//, "")}
            </a>
          )}
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
            {isPrivate ? (
              <PrivateAccountTab />
            ) : postsLoading ? (
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
            <AboutSection user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AboutSection({ user }: { user: ExtendedProfile }) {
  const hasExtra =
    user.website ||
    user.profession ||
    user.education ||
    (user.skills?.length ?? 0) > 0 ||
    (user.interests?.length ?? 0) > 0 ||
    (user.languages?.length ?? 0) > 0 ||
    (user.socialLinks?.length ?? 0) > 0;

  return (
    <div className="rounded-2xl border border-border p-5 flex flex-col gap-4 text-sm">
      {/* Bio */}
      <AboutRow label="Bio">
        <p>{user.bio || "No bio yet."}</p>
      </AboutRow>

      {/* Location */}
      {user.location && (
        <AboutRow label="Location" icon={<MapPinIcon className="size-3.5 text-muted-foreground" />}>
          <p>{user.location}</p>
        </AboutRow>
      )}

      {/* Profession */}
      {user.profession && (
        <AboutRow label="Profession" icon={<BriefcaseIcon className="size-3.5 text-muted-foreground" />}>
          <p>{user.profession}</p>
        </AboutRow>
      )}

      {/* Education */}
      {user.education && (
        <AboutRow label="Education" icon={<GraduationCapIcon className="size-3.5 text-muted-foreground" />}>
          <p>{user.education}</p>
        </AboutRow>
      )}

      {/* Website */}
      {user.website && (
        <AboutRow label="Website" icon={<GlobeIcon className="size-3.5 text-muted-foreground" />}>
          <a
            href={user.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline break-all"
          >
            {user.website}
          </a>
        </AboutRow>
      )}

      {/* Skills */}
      {(user.skills?.length ?? 0) > 0 && (
        <AboutRow label="Skills" icon={<SparklesIcon className="size-3.5 text-muted-foreground" />}>
          <div className="flex flex-wrap gap-1.5">
            {user.skills!.map((s) => (
              <span key={s} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                {s}
              </span>
            ))}
          </div>
        </AboutRow>
      )}

      {/* Interests */}
      {(user.interests?.length ?? 0) > 0 && (
        <AboutRow label="Interests" icon={<HeartIcon className="size-3.5 text-muted-foreground" />}>
          <div className="flex flex-wrap gap-1.5">
            {user.interests!.map((i) => (
              <span key={i} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                {i}
              </span>
            ))}
          </div>
        </AboutRow>
      )}

      {/* Languages */}
      {(user.languages?.length ?? 0) > 0 && (
        <AboutRow label="Languages" icon={<LanguagesIcon className="size-3.5 text-muted-foreground" />}>
          <p>{user.languages!.join(", ")}</p>
        </AboutRow>
      )}

      {/* Social Links */}
      {(user.socialLinks?.length ?? 0) > 0 && (
        <AboutRow label="Social" icon={<LinkIcon className="size-3.5 text-muted-foreground" />}>
          <div className="flex flex-col gap-1">
            {user.socialLinks!.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm"
              >
                {link.platform}
              </a>
            ))}
          </div>
        </AboutRow>
      )}

      {/* Joined */}
      <AboutRow label="Joined" icon={<CalendarIcon className="size-3.5 text-muted-foreground" />}>
        <p>
          {new Date(user.joinedAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </AboutRow>

      {!hasExtra && !user.bio && (
        <p className="text-muted-foreground text-xs text-center py-2">
          No additional information added yet.
        </p>
      )}
    </div>
  );
}

function AboutRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-muted-foreground text-xs uppercase tracking-wide mb-1">
        {icon}
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}

function PrivateAccountTab() {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-16 px-6 rounded-2xl border border-dashed border-border">
      <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        <LockIcon className="size-5" />
      </div>
      <p className="font-medium">This account is private</p>
      <p className="text-sm text-muted-foreground max-w-xs">
        Follow this account to see their posts and activity.
      </p>
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
