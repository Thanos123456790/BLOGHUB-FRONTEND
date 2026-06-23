import { BadgeCheckIcon } from "lucide-react";

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <BadgeCheckIcon
      className={`size-4 text-primary fill-primary/15 ${className ?? ""}`}
      strokeWidth={2.2}
    />
  );
}
