"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function BackButton({
  fallbackHref = "/",
  label = "Back",
  variant = "default",
  className,
}: {
  fallbackHref?: string;
  label?: string;
  variant?: "default" | "floating";
  className?: string;
}) {
  const router = useRouter();

  function handleClick() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  if (variant === "floating") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={label}
        className={cn(
          "flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/55 transition-colors",
          className
        )}
      >
        <ArrowLeftIcon className="size-4.5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
    >
      <ArrowLeftIcon className="size-4" />
      {label}
    </button>
  );
}
