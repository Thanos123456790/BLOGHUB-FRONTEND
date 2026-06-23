import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
  ApiPage,
  AssetType,
  AssetUploadResponse,
  BlogCard,
  BlogDetail,
  CommentResponse,
  CreateBlogRequest,
  CreateCommentRequest,
  NotificationResponse,
  ReactionRequest,
  TagResponse,
  UpdateBlogRequest,
  UpdateProfileRequest,
  UserProfile,
} from "@/lib/api/types";

interface PageArg {
  page?: number;
  size?: number;
}

function pageParams({ page = 0, size = 10 }: PageArg) {
  return { page, size };
}

/**
 * Every call goes through our own `/api/backend/*` proxy (see
 * src/app/api/backend/[...path]/route.ts) rather than the real backend
 * directly — that route is what actually attaches the Authorization
 * header server-side from the httpOnly accessToken cookie. Client code
 * never sees, stores, or sends the token itself.
 */
export const blogifyApi = createApi({
  reducerPath: "blogifyApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/backend" }),
  tagTypes: ["Blog", "BlogList", "Comments", "Notifications", "Me", "User", "UserList", "Tags"],
  endpoints: (builder) => ({
    // ── Blogs ──────────────────────────────────────────────────────────
    getFeed: builder.query<
      ApiPage<BlogCard>,
      { feed?: "for-you" | "following"; tag?: string } & PageArg
    >({
      query: ({ feed = "for-you", tag, ...rest }) => ({
        url: "blogs",
        params: { feed, tag, ...pageParams(rest) },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map((b) => ({ type: "Blog" as const, id: b.id })),
              { type: "BlogList" as const, id: "FEED" },
            ]
          : [{ type: "BlogList" as const, id: "FEED" }],
    }),

    getTrendingBlogs: builder.query<ApiPage<BlogCard>, PageArg | void>({
      query: (arg) => ({ url: "blogs/trending", params: pageParams(arg ?? {}) }),
      providesTags: [{ type: "BlogList", id: "TRENDING" }],
    }),

    getBlog: builder.query<BlogDetail, string>({
      query: (id) => `blogs/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Blog", id }],
    }),

    createBlog: builder.mutation<BlogDetail, CreateBlogRequest>({
      query: (body) => ({ url: "blogs", method: "POST", body }),
      invalidatesTags: [{ type: "BlogList", id: "FEED" }, { type: "BlogList", id: "TRENDING" }, "Me"],
    }),

    updateBlog: builder.mutation<BlogDetail, { id: string; body: UpdateBlogRequest }>({
      query: ({ id, body }) => ({ url: `blogs/${id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Blog", id },
        { type: "BlogList", id: "FEED" },
      ],
    }),

    deleteBlog: builder.mutation<void, string>({
      query: (id) => ({ url: `blogs/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Blog", id },
        { type: "BlogList", id: "FEED" },
        { type: "BlogList", id: "TRENDING" },
        "Me",
      ],
    }),

    reactToBlog: builder.mutation<void, { id: string; reactionType: ReactionRequest["reactionType"] }>({
      query: ({ id, reactionType }) => ({
        url: `blogs/${id}/reactions`,
        method: "POST",
        body: { reactionType },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Blog", id },
        { type: "BlogList", id: "FEED" },
        { type: "BlogList", id: "TRENDING" },
      ],
    }),

    removeBlogReaction: builder.mutation<void, string>({
      query: (id) => ({ url: `blogs/${id}/reactions`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Blog", id },
        { type: "BlogList", id: "FEED" },
        { type: "BlogList", id: "TRENDING" },
      ],
    }),

    getBookmarkedBlogs: builder.query<ApiPage<BlogCard>, PageArg | void>({
      query: (arg) => ({ url: "blogs/bookmarks", params: pageParams(arg ?? {}) }),
      providesTags: [{ type: "BlogList", id: "BOOKMARKS" }],
    }),

    bookmarkBlog: builder.mutation<void, string>({
      query: (id) => ({ url: `blogs/${id}/bookmark`, method: "POST" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Blog", id },
        { type: "BlogList", id: "BOOKMARKS" },
      ],
    }),

    removeBookmark: builder.mutation<void, string>({
      query: (id) => ({ url: `blogs/${id}/bookmark`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Blog", id },
        { type: "BlogList", id: "BOOKMARKS" },
      ],
    }),

    // ── Comments ───────────────────────────────────────────────────────
    getComments: builder.query<ApiPage<CommentResponse>, { blogId: string } & PageArg>({
      query: ({ blogId, ...rest }) => ({
        url: `comments/blogs/${blogId}`,
        params: pageParams(rest),
      }),
      providesTags: (_r, _e, { blogId }) => [{ type: "Comments", id: blogId }],
    }),

    postComment: builder.mutation<CommentResponse, { blogId: string; body: CreateCommentRequest }>({
      query: ({ blogId, body }) => ({
        url: `comments/blogs/${blogId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { blogId }) => [
        { type: "Comments", id: blogId },
        { type: "Blog", id: blogId },
      ],
    }),

    replyToComment: builder.mutation<
      CommentResponse,
      { blogId: string; commentId: string; body: CreateCommentRequest }
    >({
      query: ({ blogId, commentId, body }) => ({
        url: `comments/blogs/${blogId}/comments/${commentId}/replies`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { blogId }) => [
        { type: "Comments", id: blogId },
        { type: "Blog", id: blogId },
      ],
    }),

    updateComment: builder.mutation<
      CommentResponse,
      { id: string; blogId: string; body: CreateCommentRequest }
    >({
      query: ({ id, body }) => ({ url: `comments/${id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, { blogId }) => [{ type: "Comments", id: blogId }],
    }),

    deleteComment: builder.mutation<void, { id: string; blogId: string }>({
      query: ({ id }) => ({ url: `comments/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, { blogId }) => [
        { type: "Comments", id: blogId },
        { type: "Blog", id: blogId },
      ],
    }),

    reactToComment: builder.mutation<
      void,
      { id: string; blogId: string; reactionType: ReactionRequest["reactionType"] }
    >({
      query: ({ id, reactionType }) => ({
        url: `comments/${id}/reactions`,
        method: "POST",
        body: { reactionType },
      }),
      invalidatesTags: (_r, _e, { blogId }) => [{ type: "Comments", id: blogId }],
    }),

    removeCommentReaction: builder.mutation<void, { id: string; blogId: string }>({
      query: ({ id }) => ({ url: `comments/${id}/reactions`, method: "DELETE" }),
      invalidatesTags: (_r, _e, { blogId }) => [{ type: "Comments", id: blogId }],
    }),

    // ── Notifications ──────────────────────────────────────────────────
    getNotifications: builder.query<ApiPage<NotificationResponse>, PageArg | void>({
      query: (arg) => ({ url: "notifications", params: pageParams(arg ?? {}) }),
      providesTags: [{ type: "Notifications", id: "LIST" }],
    }),

    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({ url: "notifications/read-all", method: "POST" }),
      invalidatesTags: [{ type: "Notifications", id: "LIST" }],
    }),

    markNotificationRead: builder.mutation<void, string>({
      query: (id) => ({ url: `notifications/${id}/read`, method: "PATCH" }),
      invalidatesTags: [{ type: "Notifications", id: "LIST" }],
    }),

    // ── Users ──────────────────────────────────────────────────────────
    getMe: builder.query<UserProfile, void>({
      query: () => "users/me",
      providesTags: ["Me"],
    }),

    updateMe: builder.mutation<UserProfile, UpdateProfileRequest>({
      query: (body) => ({ url: "users/me", method: "PUT", body }),
      invalidatesTags: (result) =>
        result ? ["Me", { type: "User", id: result.handle }] : ["Me"],
    }),

    getPublicProfile: builder.query<UserProfile, string>({
      query: (handle) => `users/${handle}`,
      providesTags: (_r, _e, handle) => [{ type: "User", id: handle }],
    }),

    getUserBlogs: builder.query<ApiPage<BlogCard>, { handle: string } & PageArg>({
      query: ({ handle, ...rest }) => ({
        url: `users/${handle}/blogs`,
        params: pageParams(rest),
      }),
      providesTags: (_r, _e, { handle }) => [{ type: "BlogList", id: `profile:${handle}` }],
    }),

    getFollowers: builder.query<ApiPage<UserProfile>, { handle: string } & PageArg>({
      query: ({ handle, ...rest }) => ({
        url: `users/${handle}/followers`,
        params: pageParams(rest),
      }),
      providesTags: (_r, _e, { handle }) => [{ type: "UserList", id: `followers:${handle}` }],
    }),

    getFollowing: builder.query<ApiPage<UserProfile>, { handle: string } & PageArg>({
      query: ({ handle, ...rest }) => ({
        url: `users/${handle}/following`,
        params: pageParams(rest),
      }),
      providesTags: (_r, _e, { handle }) => [{ type: "UserList", id: `following:${handle}` }],
    }),

    getSuggestedUsers: builder.query<ApiPage<UserProfile>, PageArg | void>({
      query: (arg) => ({ url: "users/suggested", params: pageParams(arg ?? {}) }),
      providesTags: [{ type: "UserList", id: "SUGGESTED" }],
    }),

    // ── Follow ─────────────────────────────────────────────────────────
    followUser: builder.mutation<UserProfile, string>({
      query: (id) => ({ url: `users/${id}/follow`, method: "POST" }),
      invalidatesTags: ["Me", "User", "UserList", "BlogList"],
    }),

    unfollowUser: builder.mutation<UserProfile, string>({
      query: (id) => ({ url: `users/${id}/follow`, method: "DELETE" }),
      invalidatesTags: ["Me", "User", "UserList", "BlogList"],
    }),

    // ── Search & tags ──────────────────────────────────────────────────
    searchBlogs: builder.query<ApiPage<BlogCard>, { query: string } & PageArg>({
      query: ({ query, ...rest }) => ({ url: "search/blogs", params: { query, ...pageParams(rest) } }),
    }),

    searchUsers: builder.query<ApiPage<UserProfile>, { query: string } & PageArg>({
      query: ({ query, ...rest }) => ({ url: "search/users", params: { query, ...pageParams(rest) } }),
    }),

    getTrendingTags: builder.query<ApiPage<TagResponse>, PageArg | void>({
      query: (arg) => ({ url: "tags/trending", params: pageParams(arg ?? {}) }),
      providesTags: [{ type: "Tags", id: "TRENDING" }],
    }),

    getTaggedBlogs: builder.query<ApiPage<BlogCard>, { tagName: string } & PageArg>({
      query: ({ tagName, ...rest }) => ({
        url: `tags/${encodeURIComponent(tagName)}/blogs`,
        params: pageParams(rest),
      }),
      providesTags: (_r, _e, { tagName }) => [{ type: "BlogList", id: `tag:${tagName}` }],
    }),

    // ── Assets ─────────────────────────────────────────────────────────
    uploadAsset: builder.mutation<AssetUploadResponse, { file: Blob; filename: string; type: AssetType }>({
      query: ({ file, filename, type }) => {
        const formData = new FormData();
        formData.append("file", file, filename);
        formData.append("type", type);
        return { url: "assets/upload", method: "POST", body: formData };
      },
    }),
  }),
});

export const {
  useGetFeedQuery,
  useGetTrendingBlogsQuery,
  useGetBlogQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useReactToBlogMutation,
  useRemoveBlogReactionMutation,
  useGetBookmarkedBlogsQuery,
  useBookmarkBlogMutation,
  useRemoveBookmarkMutation,
  useGetCommentsQuery,
  usePostCommentMutation,
  useReplyToCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useReactToCommentMutation,
  useRemoveCommentReactionMutation,
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useGetMeQuery,
  useUpdateMeMutation,
  useGetPublicProfileQuery,
  useGetUserBlogsQuery,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useGetSuggestedUsersQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useLazySearchBlogsQuery,
  useLazySearchUsersQuery,
  useGetTrendingTagsQuery,
  useGetTaggedBlogsQuery,
  useUploadAssetMutation,
} = blogifyApi;
