"use client";

import * as React from "react";
import { Loader2Icon, SearchIcon, UsersIcon } from "lucide-react";

import {
  useGetFollowersQuery,
  useGetFollowingQuery,
  useGetMeQuery,
} from "@/lib/store/api/blogifyApi";
import type { UserProfile } from "@/lib/api/types";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { UserRow } from "@/components/shared/user-row";

export default function FollowPage() {
  const { data: me } = useGetMeQuery();
  const [query, setQuery] = React.useState("");

  const { data: followingPage, isLoading: followingLoading } = useGetFollowingQuery(
    { handle: me?.handle ?? "", size: 50 },
    { skip: !me }
  );
  const { data: followersPage, isLoading: followersLoading } = useGetFollowersQuery(
    { handle: me?.handle ?? "", size: 50 },
    { skip: !me }
  );

  const following = followingPage?.content ?? [];
  const followers = followersPage?.content ?? [];

  const filterByQuery = (list: UserProfile[]) =>
    query.trim() === ""
      ? list
      : list.filter(
          (u) =>
            u.name.toLowerCase().includes(query.toLowerCase()) ||
            u.handle.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 lg:py-8 max-w-[640px] mx-auto">
      <h1 className="font-display text-2xl font-semibold tracking-tight mb-5">
        Follow
      </h1>

      <div className="relative mb-5">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people"
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="following">
        <TabsList className="mb-5 w-full sm:w-fit">
          <TabsTrigger value="following">
            Following · {following.length}
          </TabsTrigger>
          <TabsTrigger value="followers">
            Followers · {followers.length}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="following">
          <Card className="p-2">
            {followingLoading ? (
              <LoadingState />
            ) : filterByQuery(following).length === 0 ? (
              <EmptyState text="No one matches that search." />
            ) : (
              filterByQuery(following).map((u) => (
                <div
                  key={u.id}
                  className="px-3 py-3 border-b border-border last:border-0"
                >
                  <UserRow user={u} showBio />
                </div>
              ))
            )}
          </Card>
        </TabsContent>

        <TabsContent value="followers">
          <Card className="p-2">
            {followersLoading ? (
              <LoadingState />
            ) : filterByQuery(followers).length === 0 ? (
              <EmptyState text="No one matches that search." />
            ) : (
              filterByQuery(followers).map((u) => (
                <div
                  key={u.id}
                  className="px-3 py-3 border-b border-border last:border-0"
                >
                  <UserRow user={u} showBio />
                </div>
              ))
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-14 text-muted-foreground">
      <Loader2Icon className="size-5 animate-spin" />
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-14 px-6">
      <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        <UsersIcon className="size-5" />
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
