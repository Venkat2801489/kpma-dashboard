"use client";

import { useState } from "react";
import { initials } from "@/lib/drive-logo";

export function LogoImage({ name, src, size = 40 }: { name: string; src: string | null; size?: number }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-full bg-brand font-semibold text-brand-fg"
        style={{ width: size, height: size, fontSize: size * 0.38 }}
      >
        {initials(name)}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${name} logo`}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className="shrink-0 rounded-full border border-border object-cover"
      style={{ width: size, height: size }}
    />
  );
}
