/**
 * VLN-13 FIX: Client-side trusted image URL checker.
 *
 * Mirrors the server-side allowlist in block-renderer.tsx so that
 * avatar/banner/cover images rendered outside the block renderer
 * (e.g. account-section.tsx, profile-view.tsx) are equally protected.
 *
 * An S3 key (no "https://" prefix) is also considered trusted because
 * it was uploaded through our own backend and will be served via a
 * server-generated presigned URL — the key itself is never used as an
 * img src directly.
 */

const TRUSTED_IMAGE_HOSTS = [
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
  if (!url.startsWith("https://")) return false;
  return TRUSTED_IMAGE_HOSTS.some((pattern) => pattern.test(url));
}

/** Returns the URL if trusted, otherwise undefined (safe for img src). */
export function trustedSrc(url: string | null | undefined): string | undefined {
  return isTrustedImageUrl(url) ? url ?? undefined : undefined;
}
