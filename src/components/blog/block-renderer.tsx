import { useState } from "react";
import type { BlogBlockResponse } from "@/lib/api/types";
import { getFilterCss } from "@/lib/filters";

function isTrustedImageUrl(url: string): boolean {
  if (!url) return false;
  if (!url.startsWith("https://")) {
    if (!url.startsWith("http")) return true;
    return false;
  }
  try {
    const u = new URL(url);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

function resolveImageUrl(url: string): string {
  if (url.startsWith("https://") || url.startsWith("http://")) return url;
  const cleanPath = url.startsWith("/") ? url.slice(1) : url;
  return `https://amzn-s3-spark-buket.s3.ap-south-1.amazonaws.com/${cleanPath}`;
}

function PdfBlock({ src, caption }: { src: string; caption?: string | null }) {
  const [showEmbed, setShowEmbed] = useState(false);
  const resolvedSrc = resolveImageUrl(src);
  return (
    <div className="my-4 border border-border rounded-2xl overflow-hidden">
      {showEmbed ? (
        <iframe src={resolvedSrc} className="w-full h-[600px]" title={caption ?? "PDF"} />
      ) : (
        <div className="flex items-center gap-4 p-4 bg-muted">
          <span className="text-4xl">📄</span>
          <div className="flex-1 min-w-0">
            {caption && (
              <p className="text-sm font-medium text-foreground mb-1">{caption}</p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowEmbed(true)}
                className="text-sm text-primary hover:underline"
              >
                Preview
              </button>
              <a
                href={resolvedSrc}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:underline"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VideoBlock({ src, caption }: { src: string; caption?: string | null }) {
  const isEmbed =
    src.includes("youtube.com") || src.includes("youtu.be") || src.includes("vimeo.com");
  const embedSrc = src
    .replace("watch?v=", "embed/")
    .replace("youtu.be/", "youtube.com/embed/");

  return (
    <div className="my-4">
      {isEmbed ? (
        <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-md">
          <iframe src={embedSrc} className="w-full h-full" allowFullScreen title={caption ?? "video"} />
        </div>
      ) : (
        <video
          controls
          className="w-full rounded-2xl max-h-[480px] bg-black shadow-md"
          aria-label={caption ?? undefined}
        >
          <source src={resolveImageUrl(src)} />
          Your browser does not support video playback.
        </video>
      )}
      {caption && (
        <p className="mt-2 text-center text-xs text-muted-foreground italic">{caption}</p>
      )}
    </div>
  );
}

function CodeBlock({ content, language, id }: { content: string; language?: string | null; id: string }) {
  const [copied, setCopied] = useState(false);
  const lang = language ?? "text";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div key={id} className="my-4 rounded-2xl overflow-hidden border border-border bg-gray-950">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
        <span className="text-xs font-mono text-gray-400">{lang}</span>
        <button
          type="button"
          onClick={copy}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className={`language-${lang} text-green-400 font-mono`}>{content}</code>
      </pre>
    </div>
  );
}

export function BlockRenderer({ blocks }: { blocks: BlogBlockResponse[] }) {
  const sorted = [...blocks].sort((a, b) => a.position - b.position);

  return (
    <div className="flex flex-col gap-5">
      {sorted.map((block) => {
        switch (block.type) {
          case "HEADING":
            return (
              <h2 key={block.id} className="font-display text-xl sm:text-2xl font-semibold tracking-tight mt-2">
                {block.content}
              </h2>
            );
          case "PARAGRAPH":
            return (
              <p key={block.id} className="text-[15px] sm:text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {block.content}
              </p>
            );
          case "QUOTE":
            return (
              <blockquote key={block.id} className="border-l-2 border-primary pl-4 sm:pl-5 py-1 text-base sm:text-lg italic text-foreground/85">
                {block.content}
              </blockquote>
            );
          case "IMAGE": {
            const resolvedUrl = resolveImageUrl(block.content);
            if (!isTrustedImageUrl(resolvedUrl)) {
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
                    src={resolvedUrl}
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
          }
          case "PDF":
            return <PdfBlock key={block.id} src={block.content} caption={block.caption} />;
          case "VIDEO":
            return <VideoBlock key={block.id} src={block.content} caption={block.caption} />;
          case "CODE":
            return <CodeBlock key={block.id} id={block.id} content={block.content} language={block.language} />;
          default:
            return null;
        }
      })}
    </div>
  );
}