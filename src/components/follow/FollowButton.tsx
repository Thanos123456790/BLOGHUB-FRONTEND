import { useState } from 'react';
import { useFollowUserMutation, useUnfollowUserMutation } from '@/lib/store/api/blogifyApi';
import type { UserProfile } from '@/lib/api/types';

interface Props {
  handle: string;
  initialIsFollowing: boolean;
  onUpdated?: (profile: UserProfile) => void;
  className?: string;
}

export function FollowButton({ handle, initialIsFollowing, onUpdated, className }: Props) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followUser, { isLoading: following }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: unfollowing }] = useUnfollowUserMutation();
  const loading = following || unfollowing;

  const toggle = async () => {
    if (loading) return;
    const next = !isFollowing;
    setIsFollowing(next); // optimistic flip
    try {
      const updated = next
        ? await followUser(handle).unwrap()
        : await unfollowUser(handle).unwrap();
      setIsFollowing(updated.isFollowing);
      onUpdated?.(updated);
    } catch {
      setIsFollowing(!next); // revert on error
    }
  };

  const base =
    'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  const variant = isFollowing
    ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400'
    : 'bg-blue-600 text-white hover:bg-blue-700';

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`${base} ${variant} ${className ?? ''}`}
    >
      {loading && (
        <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}