/**
 * Reads a local File/Blob into a base64 data URL. Used for the avatar/cover
 * canvas editor's live preview (src/components/editor/image-editor-dialog.tsx)
 * before its final, edited output is uploaded to the backend via
 * uploadAsset() — never sent to the backend directly (data URLs blow past
 * the 2048-char limit on avatarUrl/bannerUrl/coverImageUrl).
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/** Converts a data URL (e.g. a canvas.toDataURL() result) back into a Blob for upload. */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);base64/)?.[1] ?? "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export const ACCEPTED_IMAGE_TYPES = "image/png,image/jpeg,image/webp,image/gif";

// Matches the backend's app.aws.s3.max-file-size-bytes (5MB) and
// allowed-content-types (jpeg/png/webp/gif) in application-local.yaml.
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
