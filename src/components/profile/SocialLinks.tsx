// src/components/profile/SocialLinks.tsx
// Renders social links from the unified UserProfile.socialLinks array.
// Place inside ProfileView's header or AboutSection.

import type { UserProfile } from "../../types/user";

interface LinkDef {
  href: string;
  label: string;
  icon: string;
  colorClass: string;
}

const PLATFORM_META: Record<
  string,
  { icon: string; colorClass: string; buildHref: (url: string) => string }
> = {
  twitter:  { icon: "𝕏",  colorClass: "text-sky-500",                    buildHref: (u) => u.startsWith("http") ? u : `https://x.com/${u}` },
  x:        { icon: "𝕏",  colorClass: "text-sky-500",                    buildHref: (u) => u.startsWith("http") ? u : `https://x.com/${u}` },
  github:   { icon: "",  colorClass: "text-gray-800 dark:text-gray-200", buildHref: (u) => u.startsWith("http") ? u : `https://github.com/${u}` },
  linkedin: { icon: "💼", colorClass: "text-blue-700",                   buildHref: (u) => u },
  instagram:{ icon: "📸", colorClass: "text-pink-500",                   buildHref: (u) => u.startsWith("http") ? u : `https://instagram.com/${u}` },
  youtube:  { icon: "▶",  colorClass: "text-red-600",                    buildHref: (u) => u },
  website:  { icon: "🌐", colorClass: "text-gray-600 dark:text-gray-400",buildHref: (u) => u },
};

function buildLinks(user: UserProfile): LinkDef[] {
  if (!user.socialLinks?.length) return [];

  return user.socialLinks
    .filter((l) => l.url)
    .map((l) => {
      const key = l.platform.toLowerCase();
      const meta = PLATFORM_META[key] ?? {
        icon: "🔗",
        colorClass: "text-gray-500",
        buildHref: (u: string) => u,
      };

      let label = l.platform;
      try {
        // For plain URLs show just the hostname
        if (l.url.startsWith("http")) label = new URL(l.url).hostname;
      } catch {
        label = l.url;
      }

      return { href: meta.buildHref(l.url), label, icon: meta.icon, colorClass: meta.colorClass };
    });
}

interface Props {
  user: UserProfile;
}

export function SocialLinks({ user }: Props) {
  const links = buildLinks(user);
  if (!links.length) return null;

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
      {links.map((link, i) => (
        <a
          key={i}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-1.5 text-sm hover:underline transition-colors ${link.colorClass}`}
        >
          <span aria-hidden="true">{link.icon}</span>
          <span className="max-w-[160px] truncate">{link.label}</span>
        </a>
      ))}
    </div>
  );
}