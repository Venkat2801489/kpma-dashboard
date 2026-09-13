import type { ReactNode } from "react";

const paths: Record<string, ReactNode> = {
  video: (
    <>
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="M16 10l5-3v10l-5-3" />
    </>
  ),
  smm: (
    <>
      <circle cx="7" cy="8" r="3" />
      <circle cx="17" cy="6" r="2.5" />
      <circle cx="17" cy="17" r="2.5" />
      <path d="M9.5 9.5L14.7 6.8M9.5 10.7L14.7 15.5" />
    </>
  ),
  seo: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4.35-4.35" />
    </>
  ),
  ai: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2 2M17.5 17.5l2 2M4.5 19.5l2-2M17.5 6.5l2-2" />
    </>
  ),
  web: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 010 18 14 14 0 010-18z" />
    </>
  ),
  ppc: (
    <>
      <path d="M4 20V10M12 20V4M20 20v-7" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" />
      <path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z" />
    </>
  ),
};

export function CategoryIcon({ icon, className }: { icon: string; className?: string }) {
  const content = paths[icon] ?? paths.sparkles;
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {content}
    </svg>
  );
}

export const ICON_OPTIONS = Object.keys(paths);
