// src/components/blog/editor/EditorToolbar.tsx
// Add Save Draft + Publish buttons to your blog editor toolbar.
//
// USAGE inside your editor page:
//   const editor = useBlogEditor({ token, existingId: draft?.id, onPublished: (b) => router.push(`/blog/${b.id}`) });
//   ...
//   <EditorToolbar
//     draftId={editor.blogId}
//     isSavingDraft={editor.isSavingDraft}
//     isPublishing={editor.isPublishing}
//     error={editor.error}
//     onSaveDraft={() => editor.handleSaveDraft(formPayload)}
//     onPublish={() => editor.handlePublish(formPayload)}
//   />

interface Props {
  draftId?: string;
  isSavingDraft: boolean;
  isPublishing: boolean;
  error: string | null;
  onSaveDraft: () => void;
  onPublish: () => void;
}

export function EditorToolbar({ draftId, isSavingDraft, isPublishing, error, onSaveDraft, onPublish }: Props) {
  return (
    <div className="flex items-center gap-2">
      {error && (
        <p className="text-sm text-red-500 mr-2 max-w-xs truncate" title={error}>
          {error}
        </p>
      )}

      {/* Save Draft */}
      <button
        type="button"
        onClick={onSaveDraft}
        disabled={isSavingDraft || isPublishing}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
          bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300
          hover:bg-gray-200 dark:hover:bg-gray-700
          disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSavingDraft ? (
          <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
        )}
        {isSavingDraft ? 'Saving…' : draftId ? 'Update Draft' : 'Save Draft'}
      </button>

      {/* Publish */}
      <button
        type="button"
        onClick={onPublish}
        disabled={isSavingDraft || isPublishing}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
          bg-blue-600 text-white hover:bg-blue-700
          disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPublishing ? (
          <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {isPublishing ? 'Publishing…' : draftId ? 'Publish Now' : 'Publish'}
      </button>
    </div>
  );
}
