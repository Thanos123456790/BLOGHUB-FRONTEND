import { Heart, Lightbulb, PartyPopper, ThumbsUp } from "lucide-react";
import type { ReactionType } from "@/lib/api/types";

export const reactionConfig: Record<
  ReactionType,
  { label: string; icon: typeof ThumbsUp; countKey: "like" | "clap" | "love" | "insightful" }
> = {
  LIKE: { label: "Like", icon: ThumbsUp, countKey: "like" },
  CLAP: { label: "Clap", icon: PartyPopper, countKey: "clap" },
  LOVE: { label: "Love", icon: Heart, countKey: "love" },
  INSIGHTFUL: { label: "Insightful", icon: Lightbulb, countKey: "insightful" },
};

export const reactionOrder: ReactionType[] = ["LIKE", "CLAP", "LOVE", "INSIGHTFUL"];
