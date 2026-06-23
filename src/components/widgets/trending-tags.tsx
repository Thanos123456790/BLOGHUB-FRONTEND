"use client";

import Link from "next/link";
import { TrendingUpIcon } from "lucide-react";

import { useGetTrendingTagsQuery } from "@/lib/store/api/blogifyApi";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function TrendingTagsCard() {
  const { data, isLoading } = useGetTrendingTagsQuery({ size: 8 });
  const tags = data?.content ?? [];

  if (!isLoading && tags.length === 0) return null;

  return (
    <Card className="py-5">
      <CardHeader className="px-5 pt-0 flex-row items-center gap-2 space-y-0">
        <TrendingUpIcon className="size-4 text-brand-amber" />
        <CardTitle className="text-sm">Trending topics</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link key={tag.name} href={`/tags/${encodeURIComponent(tag.name)}`}>
            <Badge
              variant="secondary"
              className="hover:bg-secondary/70 cursor-pointer"
            >
              #{tag.name}
            </Badge>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
