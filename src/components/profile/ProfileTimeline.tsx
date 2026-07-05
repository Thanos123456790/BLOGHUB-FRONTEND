// src/components/profile/ProfileTimeline.tsx
// Renders Education and Experience as a vertical timeline.

import type { EducationEntry, ExperienceEntry } from "../../types/user";

function Dot() {
  return (
    <span className="absolute -left-[7px] top-1.5 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white dark:border-gray-950 flex-shrink-0" />
  );
}

// ── Education ──────────────────────────────────────────────────────────────────

interface EduProps {
  items?: EducationEntry[] | null;
}

export function EducationTimeline({ items }: EduProps) {
  if (!items?.length) return null;

  const sorted = [...items].sort((a, b) => (b.startYear ?? 0) - (a.startYear ?? 0));

  return (
    <section className="mt-6">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Education
      </h3>
      <ol className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-1.5 space-y-6">
        {sorted.map((item, i) => (
          <li key={i} className="relative pl-6">
            <Dot />
            <p className="font-medium text-gray-900 dark:text-white leading-snug">
              {item.institution}
            </p>
            {(item.degree || item.field) && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                {[item.degree, item.field].filter(Boolean).join(" · ")}
              </p>
            )}
            {(item.startYear || item.endYear) && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {item.startYear ?? "?"} – {item.endYear ?? "Present"}
              </p>
            )}
            {item.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                {item.description}
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

// ── Experience ─────────────────────────────────────────────────────────────────

interface ExpProps {
  items?: ExperienceEntry[] | null;
}

export function ExperienceTimeline({ items }: ExpProps) {
  if (!items?.length) return null;

  const sorted = [...items].sort((a, b) =>
    (b.startDate ?? "").localeCompare(a.startDate ?? "")
  );

  function formatDate(d?: string) {
    if (!d) return "?";
    const [y, m] = d.split("-");
    if (!m) return y;
    const month = new Date(Number(y), Number(m) - 1).toLocaleString("default", {
      month: "short",
    });
    return `${month} ${y}`;
  }

  return (
    <section className="mt-6">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Experience
      </h3>
      <ol className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-1.5 space-y-6">
        {sorted.map((item, i) => (
          <li key={i} className="relative pl-6">
            <Dot />
            <p className="font-medium text-gray-900 dark:text-white leading-snug">
              {item.title}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-0.5">
              {item.company}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {formatDate(item.startDate)} –{" "}
              {item.current ? "Present" : formatDate(item.endDate)}
            </p>
            {item.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                {item.description}
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}