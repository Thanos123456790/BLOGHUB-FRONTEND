/**
 * Frontend-only block representation used while composing/editing a post in
 * /create — converted to the backend's BlogBlockRequest[] shape on submit
 * (see src/app/(app)/create/page.tsx). Needs a local `id` for React keys
 * before a block has ever been saved.
 *
 * "video" has no backend equivalent yet (BlockType only has PARAGRAPH /
 * HEADING / QUOTE / IMAGE) — see README "Known backend gaps".
 */
export type EditorBlockType = "paragraph" | "heading" | "quote" | "image";

export interface EditorBlock {
  id: string;
  type: EditorBlockType;
  content: string;
  caption?: string;
  filter?: string;
}
