"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

import { useGetSuggestedUsersQuery } from "@/lib/store/api/blogifyApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserRow } from "@/components/shared/user-row";

export function SuggestedWritersCard() {
  const { data, isLoading } = useGetSuggestedUsersQuery({ size: 4 });
  const suggested = data?.content ?? [];

  if (!isLoading && suggested.length === 0) return null;

  return (
    <Card className="py-5">
      <CardHeader className="px-5 pt-0 flex-row items-center gap-2 space-y-0">
        <Sparkles className="size-4 text-brand-amber" />
        <CardTitle className="text-sm">Writers to follow</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {suggested.map((u) => (
          <UserRow key={u.id} user={u} dense />
        ))}
        <Link
          href="/follow"
          className="text-xs font-medium text-primary hover:underline"
        >
          See more suggestions
        </Link>
      </CardContent>
    </Card>
  );
}
