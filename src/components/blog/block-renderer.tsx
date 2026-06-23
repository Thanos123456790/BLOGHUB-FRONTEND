import type { BlogBlockResponse } from "@/lib/api/types";
import { getFilterCss } from "@/lib/filters";

// VLN-07 FIX: Allowlist of trusted image host patterns.
// Only URLs from these origins are rendered as <img> elements.
const TRUSTED_IMAGE_HOSTS = [
  /^https:\/\/[\w-]+\.s3\.amazonaws\.com\//,
  /^https:\/\/[\w-]+\.amazonaws\.com\//,
  /^https:\/\/images\.unsplash\.com\//,
  /^https:\/\/img\.clerk\.com\//,
  /^https:\/\/[\w-]+\.clerk\.com\//,
];

function isTrustedImageUrl(url: string): boolean {
  if (!url) return false;
  // Block javascript:, data:, and any non-https scheme
  if (!url.startsWith("https://")) return false;
  return TRUSTED_IMAGE_HOSTS.some((pattern) => pattern.test(url));
}

export function BlockRenderer({ blocks }: { blocks: BlogBlockResponse[] }) {
  const sorted = [...blocks].sort((a, b) => a.position - b.position);

  return (
    <div className="flex flex-col gap-5">
      {sorted.map((block) => {
        switch (block.type) {
          case "HEADING":
            return (
              <h2
                key={block.id}
                className="font-display text-xl sm:text-2xl font-semibold tracking-tight mt-2"
              >
                {block.content}
              </h2>
            );
          case "PARAGRAPH":
            return (
              <p
                key={block.id}
                className="text-[15px] sm:text-base leading-relaxed text-foreground/90 whitespace-pre-wrap"
              >
                {block.content}
              </p>
            );
          case "QUOTE":
            return (
              <blockquote
                key={block.id}
                className="border-l-2 border-primary pl-4 sm:pl-5 py-1 text-base sm:text-lg italic text-foreground/85"
              >
                {block.content}
              </blockquote>
            );
          case "IMAGE":
            // VLN-07 FIX: Only render image if URL is from a trusted host.
            if (!isTrustedImageUrl(block.content)) {
              return (
                <figure key={block.id} className="-mx-1">
                  <div className="overflow-hidden rounded-2xl border border-border bg-muted flex items-center justify-center h-24 text-muted-foreground text-sm">
                    Image unavailable (untrusted source)
                  </div>
                </figure>
              );
            }
            return (
              <figure key={block.id} className="-mx-1">
                <div className="overflow-hidden rounded-2xl border border-border bg-muted">
                  <img
                    src={block.content}
                    alt={block.caption ?? ""}
                    className="w-full object-cover"
                    style={{ filter: getFilterCss(block.filter ?? undefined) }}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                  />
                </div>
                {block.caption && (
                  <figcaption className="mt-2 text-center text-xs text-muted-foreground">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
