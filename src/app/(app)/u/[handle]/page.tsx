"use client";

import { useParams, useRouter } from "next/navigation";
import { FileQuestionIcon, Loader2Icon } from "lucide-react";

import { useGetPublicProfileQuery } from "@/lib/store/api/blogifyApi";
import { ProfileView } from "@/components/profile/profile-view";
import { Button } from "@/components/ui/button";

export default function UserProfilePage() {
  const params = useParams<{ handle: string }>();
  const router = useRouter();
  const { data: user, isLoading, isError } = useGetPublicProfileQuery(params.handle);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2Icon className="size-6 animate-spin" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-3 py-24 px-6">
        <FileQuestionIcon className="size-8 text-muted-foreground" />
        <p className="font-medium">User not found</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          This profile may not exist or the link is incorrect.
        </p>
        <Button onClick={() => router.push("/")} className="mt-2">
          Back to home
        </Button>
      </div>
    );
  }

  return <ProfileView user={user} showBackButton />;
}
