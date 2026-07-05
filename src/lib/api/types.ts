// Mirrors the backend's DTOs (com.subho.bloghub.client.dtos.*) field-for-field.
// Keep this in sync with the backend if those DTOs change.

export type ReactionType = "LIKE" | "CLAP" | "LOVE" | "INSIGHTFUL";
export type BlockType = "PARAGRAPH" | "HEADING" | "QUOTE" | "IMAGE" | "PDF" | "VIDEO" | "CODE";
export type NotificationType =
  | "FOLLOW"
  | "REACTION"
  | "COMMENT"
  | "REPLY"
  | "MENTION"
  | "COMMENT_REACTION";
export type AssetType =
  | "AVATAR"
  | "BANNER"
  | "BLOG_COVER"
  | "BLOG_BLOCK_IMAGE"
  | "BLOG_BLOCK_PDF"
  | "BLOG_BLOCK_VIDEO";

/** Backend validates this against ^(grayscale|warm|cool|vintage|dramatic)?$ */
export type CoverFilterId = "grayscale" | "warm" | "cool" | "vintage" | "dramatic";

// ── Pagination / errors ──────────────────────────────────────────────────
// Spring Boot 3.3+ serializes Page<T> as { content, page: {...} } by default
// (no `last`/`first`/`pageable` — see PageModule's PagedModel-style output).

export interface ApiPage<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface ApiFieldError {
  field: string;
  rejectedValue: unknown;
  message: string;
}

export interface ApiErrorBody {
  status: number;
  error: string;
  message: string;
  path?: string;
  timestamp?: string;
  fieldErrors?: ApiFieldError[];
}

// ── Users ─────────────────────────────────────────────────────────────────

export interface EducationEntry {
  institution: string;
  degree?: string;
  field?: string;
  startYear?: number;
  endYear?: number;
  description?: string;
}

export interface ExperienceEntry {
  company: string;
  title: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  location: string | null;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  joinedAt: string;
  /** Whether the *currently authenticated* caller follows this profile. */
  isFollowing: boolean;
  // Online presence
  isOnline: boolean;
  lastSeenAt?: string;
  // Social links
  websiteUrl?: string | null;
  twitterHandle?: string | null;
  githubHandle?: string | null;
  linkedinUrl?: string | null;
  instagramHandle?: string | null;
  youtubeUrl?: string | null;
  // Professional
  currentJobTitle?: string | null;
  currentCompany?: string | null;
  education?: EducationEntry[];
  experience?: ExperienceEntry[];
}

export interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  websiteUrl?: string;
  twitterHandle?: string;
  githubHandle?: string;
  linkedinUrl?: string;
  instagramHandle?: string;
  youtubeUrl?: string;
  currentJobTitle?: string;
  currentCompany?: string;
  education?: EducationEntry[];
  experience?: ExperienceEntry[];
}

// ── Reactions ─────────────────────────────────────────────────────────────

export interface ReactionCount {
  like: number;
  clap: number;
  love: number;
  insightful: number;
  total: number;
}

export interface ReactionRequest {
  reactionType: ReactionType;
}

// ── Blogs ─────────────────────────────────────────────────────────────────

export interface BlogBlockRequest {
  type: BlockType;
  content: string;
  caption?: string;
  filter?: string;
  language?: string;
  position: number;
}

export interface BlogBlockResponse {
  id: string;
  type: BlockType;
  content: string;
  caption: string | null;
  filter: string | null;
  language: string | null;
  position: number;
}

export interface BlogCard {
  id: string;
  author: UserProfile;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  coverFilter: string | null;
  tags: string[];
  readTimeMinutes: number;
  reactions: ReactionCount;
  myReaction: ReactionType | null;
  bookmarked: boolean;
  commentsCount: number;
  isDraft: boolean;
  createdAt: string;
}

export interface BlogDetail {
  id: string;
  author: UserProfile;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  coverFilter: string | null;
  readTimeMinutes: number;
  tags: string[];
  blocks: BlogBlockResponse[];
  reactions: ReactionCount;
  myReaction: ReactionType | null;
  bookmarked: boolean;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogRequest {
  title: string;
  excerpt: string;
  coverImageUrl?: string;
  coverFilter?: string;
  readTimeMinutes: number;
  tags?: string[];
  blocks: BlogBlockRequest[];
  isDraft?: boolean;
}

export interface UpdateBlogRequest {
  title?: string;
  excerpt?: string;
  coverImageUrl?: string;
  coverFilter?: string;
  readTimeMinutes?: number;
  tags?: string[];
  blocks?: BlogBlockRequest[];
  isDraft?: boolean;
}

// ── Comments ──────────────────────────────────────────────────────────────

export interface CommentResponse {
  id: string;
  author: UserProfile;
  content: string;
  reactions: ReactionCount;
  myReaction: ReactionType | null;
  taggedUsers: UserProfile[];
  replies: CommentResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
  taggedUserIds?: string[];
}

// ── Notifications ─────────────────────────────────────────────────────────

export interface NotificationActor {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string | null;
}

export interface NotificationResponse {
  id: string;
  type: NotificationType;
  actors: NotificationActor[];
  blog: { id: string; title: string } | null;
  commentId: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ── Tags ──────────────────────────────────────────────────────────────────

export interface TagResponse {
  name: string;
  postCount: number;
}

// ── Assets ────────────────────────────────────────────────────────────────

export interface AssetUploadResponse {
  url: string;
  key: string;
  contentType: string;
  sizeBytes: number;
}
