// src/hooks/useBlogEditor.ts
// Manages create/update, save-draft, and publish in the blog editor.
// Usage:
//   const editor = useBlogEditor({ token, existingDraftId: blog?.id });
//   <button onClick={() => editor.handleSaveDraft(formData)}>Save Draft</button>
//   <button onClick={() => editor.handlePublish(formData)}>Publish</button>

import { useState, useCallback } from 'react';
import {
  createBlog,
  saveDraft,
  updateDraft,
  publishDraft,
  type CreateBlogPayload,
} from '../api/blogs';
import type { BlogDetail } from '../types/blog';

interface Options {
  token: string;
  /** Pass the existing blog id when editing a draft or an existing post. */
  existingId?: string;
  /** Called after a successful publish with the blog id, e.g. to navigate to /blog/:id */
  onPublished?: (blog: BlogDetail) => void;
  /** Called after a successful draft save with the returned blog (has its id set). */
  onDraftSaved?: (blog: BlogDetail) => void;
}

interface EditorState {
  /** The id of the draft / blog being edited, once it has been saved at least once. */
  blogId?: string;
  isSavingDraft: boolean;
  isPublishing: boolean;
  error: string | null;
  handleSaveDraft: (payload: Omit<CreateBlogPayload, 'isDraft'>) => Promise<void>;
  handlePublish: (payload: Omit<CreateBlogPayload, 'isDraft'>) => Promise<void>;
}

export function useBlogEditor({ token, existingId, onPublished, onDraftSaved }: Options): EditorState {
  const [blogId, setBlogId] = useState<string | undefined>(existingId);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveDraft = useCallback(
    async (payload: Omit<CreateBlogPayload, 'isDraft'>) => {
      setIsSavingDraft(true);
      setError(null);
      try {
        let blog: BlogDetail;
        if (blogId) {
          blog = await updateDraft(token, blogId, payload);
        } else {
          blog = await saveDraft(token, payload);
          setBlogId(blog.id);
        }
        onDraftSaved?.(blog);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to save draft');
      } finally {
        setIsSavingDraft(false);
      }
    },
    [blogId, token, onDraftSaved]
  );

  const handlePublish = useCallback(
    async (payload: Omit<CreateBlogPayload, 'isDraft'>) => {
      setIsPublishing(true);
      setError(null);
      try {
        let blog: BlogDetail;
        if (blogId) {
          // Existing draft or post — flip isDraft to false
          blog = await publishDraft(token, blogId, payload);
        } else {
          // Brand new post — create and publish in one shot
          blog = await createBlog(token, { ...payload, isDraft: false });
          setBlogId(blog.id);
        }
        onPublished?.(blog);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to publish');
      } finally {
        setIsPublishing(false);
      }
    },
    [blogId, token, onPublished]
  );

  return { blogId, isSavingDraft, isPublishing, error, handleSaveDraft, handlePublish };
}
