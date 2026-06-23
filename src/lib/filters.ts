export interface FilterOption {
  id: string;
  label: string;
  css: string;
}

export const imageFilters: FilterOption[] = [
  { id: "none", label: "Original", css: "none" },
  { id: "grayscale", label: "Mono", css: "grayscale(1) contrast(1.05)" },
  {
    id: "warm",
    label: "Warm",
    css: "sepia(0.35) saturate(1.3) brightness(1.05)",
  },
  {
    id: "cool",
    label: "Cool",
    css: "hue-rotate(-10deg) saturate(1.15) brightness(1.02) contrast(1.02)",
  },
  {
    id: "vintage",
    label: "Vintage",
    css: "sepia(0.5) contrast(0.92) brightness(1.05) saturate(0.85)",
  },
  {
    id: "dramatic",
    label: "Dramatic",
    css: "contrast(1.3) saturate(1.2) brightness(0.95)",
  },
];

export function getFilterCss(filterId?: string): string {
  return imageFilters.find((f) => f.id === filterId)?.css ?? "none";
}

export const stockCoverImages = [
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
  "https://images.unsplash.com/photo-1488998427799-e3362cec87c3?w=1200&q=80",
  "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1200&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80",
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&q=80",
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&q=80",
  "https://images.unsplash.com/photo-1487147264018-f937fba0c817?w=1200&q=80",
  "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80",
  "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1200&q=80",
];

export const emojiPalette = [
  "😀","😂","😍","🥲","😎","🤔","😴","🥳",
  "😢","😡","👏","🙌","🙏","👍","👎","💪",
  "❤️","🔥","✨","🎉","💡","📌","✅","⭐",
  "☕","🌱","📷","🎵","🧠","🚀","🌍","📚",
];
