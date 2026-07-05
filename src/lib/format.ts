export function relativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function compactNumber(n: number): string {
  if (n < 1000) return `${n}`;
  if (n < 1_000_000) return `${(n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0)}k`;
  return `${(n / 1_000_000).toFixed(1)}m`;
}

export function totalReactions(reactions: Partial<Record<string, number>>): number {
  return Object.values(reactions).reduce((sum: number, v) => sum + (v ?? 0), 0);
}

const ACTIVE_NOW_THRESHOLD_MIN = 5;

/** True when the user was last active within the last few minutes. */
export function isActiveNow(lastActiveAt: string): boolean {
  const diffMs = new Date().getTime() - new Date(lastActiveAt).getTime();
  return diffMs / 60000 <= ACTIVE_NOW_THRESHOLD_MIN;
}

/** Short "Active now" / "Active 45m ago" / "Active 3h ago" label. */
export function formatActivity(lastActiveAt: string): string {
  const diffMs = new Date().getTime() - new Date(lastActiveAt).getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin <= ACTIVE_NOW_THRESHOLD_MIN) return "Active now";
  if (diffMin < 60) return `Active ${diffMin}m ago`;

  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `Active ${diffHr}h ago`;

  const diffDay = Math.round(diffHr / 24);
  return `Active ${diffDay}d ago`;
}
