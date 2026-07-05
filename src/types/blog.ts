// src/types/blog.ts
// Replace / merge with your existing blog types file

export type BlockType = 'PARAGRAPH' | 'HEADING' | 'QUOTE' | 'IMAGE' | 'PDF' | 'VIDEO' | 'CODE';

export interface BlogBlock {
  id?: string;
  type: BlockType;
  content: string;
  caption?: string;
  filter?: string;
  language?: string;  // CODE blocks only
  position: number;
}

export interface ReactionCounts {
  like: number;
  clap: number;
  love: number;
  insightful: number;
}

export interface BlogCard {
  id: string;
  author: import('./user').UserProfile;
  title: string;
  excerpt: string;
  coverImageUrl?: string;
  coverFilter?: string;
  tags: string[];
  readTimeMinutes: number;
  reactions: ReactionCounts;
  myReaction?: 'LIKE' | 'CLAP' | 'LOVE' | 'INSIGHTFUL';
  bookmarked: boolean;
  commentsCount: number;
  isDraft: boolean;
  createdAt: string;
}

export interface BlogDetail extends BlogCard {
  blocks: BlogBlock[];
  updatedAt: string;
}
