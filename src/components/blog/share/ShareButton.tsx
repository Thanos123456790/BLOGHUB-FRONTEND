// src/components/blog/share/ShareButton.tsx
// Fixes: share button was throwing a silent TypeError on desktop because
// navigator.share is undefined in non-mobile browsers.
// Now uses three-layer fallback: Web Share API → clipboard → window.prompt.

import { Copy, Send, Share, Share2, ShareIcon } from 'lucide-react';
import { useState } from 'react';

interface Props {
  blogId: string;
  className?: string;
}

export function ShareButton({ blogId, className }: Props) {
  const [copied, setCopied] = useState(false);

  const url = `${window.location.origin}/blog/${blogId}`;

  const handleShare = async () => {
    // Layer 1: Web Share API (Android Chrome, iOS Safari, some desktop browsers)
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ url });
        return;
      } catch {
        // User cancelled or API unavailable — fall through
      }
    }

    // Layer 2: Clipboard API (all modern desktop browsers)
    if (typeof navigator.clipboard?.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        return;
      } catch {
        // Clipboard blocked — fall through
      }
    }

    // Layer 3: window.prompt fallback (always works)
    window.prompt('Copy this link to share:', url);
  };

  return (
    <button
      onClick={handleShare}
      title="Share this post"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
        ${className ?? ''}`}
    >
      {copied ? (
        <>
          <Copy width={16} height={16}/>
          <span>Copied!</span>
        </>
      ) : (
        <>
         <Share2 width={16} height={16} />
          <span>Share</span>
        </>
      )}
    </button>
  );
}
