import Link from "next/link";

import type { UserProfile } from "@/lib/api/types";

export function CommentText({
  content,
  taggedUsers,
}: {
  content: string;
  taggedUsers: UserProfile[];
}) {
  const parts = content.split(/(@[a-zA-Z0-9_]+)/g);

  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
      {parts.map((part, i) => {
        if (part.startsWith("@")) {
          const handle = part.slice(1).toLowerCase();
          const user = taggedUsers.find((u) => u.handle.toLowerCase() === handle);
          if (user) {
            return (
              <Link
                key={i}
                href={`/u/${user.handle}`}
                className="text-primary font-medium hover:underline"
              >
                {part}
              </Link>
            );
          }
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}
