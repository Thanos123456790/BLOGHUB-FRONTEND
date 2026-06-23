"use client";

import { Loader2Icon } from "lucide-react";

import { useGetMeQuery } from "@/lib/store/api/blogifyApi";
import { ProfileView } from "@/components/profile/profile-view";

export default function MyProfilePage() {
  const { data: me, isLoading, isError } = useGetMeQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2Icon className="size-6 animate-spin" />
      </div>
    );
  }

  if (isError || !me) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-2 py-24 px-6">
        <p className="font-medium">Couldn&rsquo;t load your profile</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          The backend may be unreachable, or your session may need a refresh.
        </p>
      </div>
    );
  }

  return <ProfileView user={me} />;
}
