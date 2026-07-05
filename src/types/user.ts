// src/types/user.ts
// Single source of truth for all user/profile types.

export interface EducationEntry {
  institution: string;
  degree?: string;
  field?: string;
  startYear?: number;
  endYear?: number;
  description?: string;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  startDate?: string; // ISO "YYYY-MM"
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

/**
 * Base profile shape returned by the API (/users/me, /users/:handle).
 * Keep this in sync with your backend DTO.
 */
export interface UserProfile {
  id: string;
  handle: string;
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  location?: string | null;
  joinedAt: string;
  isVerified: boolean;
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;

  // Extended fields — populated when the backend supports them
  website?: string | null;
  profession?: string | null;
  skills?: string[] | null;
  interests?: string[] | null;
  languages?: string[] | null;
  socialLinks?: SocialLink[] | null;
  education?: EducationEntry[] | null;
  experience?: ExperienceEntry[] | null;
}

/**
 * Payload sent to PUT /users/me.
 * Only include fields the backend accepts.
 */
export interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  website?: string;
  profession?: string;
  skills?: string[];
  interests?: string[];
  languages?: string[];
  socialLinks?: SocialLink[];
  education?: EducationEntry[];
  experience?: ExperienceEntry[];
}