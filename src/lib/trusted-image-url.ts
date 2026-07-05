/**
 * Client-side trusted image URL checker.
 * Allows AWS S3, Clerk, Unsplash, and any valid https:// external image URL.
 * S3 keys (no "https://" prefix) are also trusted as they came through our upload endpoint.
 */

const ALWAYS_TRUSTED_HOSTS = [
  /^https:\/\/[\w-]+\.s3\.amazonaws\.com\//,
  /^https:\/\/[\w-]+\.amazonaws\.com\//,
  /^https:\/\/images\.unsplash\.com\//,
  /^https:\/\/img\.clerk\.com\//,
  /^https:\/\/[\w-]+\.clerk\.com\//,
];

export function isTrustedImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  // S3 key stored in DB (no scheme) — trusted because it came through our upload endpoint
  if (!url.startsWith("http")) return true;
  // Block non-https schemes (javascript:, data:, etc.)
  if (!url.startsWith("https://")) return false;
  // Always trust known providers
  if (ALWAYS_TRUSTED_HOSTS.some((pattern) => pattern.test(url))) return true;
  // Allow any valid https:// external image URL
  try {
    const u = new URL(url);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Returns the URL if trusted, otherwise undefined (safe for img src). */
export function trustedSrc(url: string | null | undefined): string | undefined {
  return isTrustedImageUrl(url) ? url ?? undefined : undefined;
}
