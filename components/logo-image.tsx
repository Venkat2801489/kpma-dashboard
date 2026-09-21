"use client";

import { useState } from "react";
import { initials, resolveLogoFallbackUrl } from "@/lib/drive-logo";

export function LogoImage({ name, src, size = 40 }: { name: string; src: string | null; size?: number }) {
  const [stage, setStage] = useState<"primary" | "fallback" | "failed">("primary");
  const [prevSrc, setPrevSrc] = useState(src);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setStage("primary");
  }

  const fallback = stage !== "primary" ? resolveLogoFallbackUrl(src) : null;
  const effectiveSrc = stage === "fallback" ? fallback : src;

  if (!effectiveSrc || stage === "failed") {
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
      src={effectiveSrc}
      alt={`${name} logo`}
      width={size}
      height={size}
      onError={() => setStage((s) => (s === "primary" && resolveLogoFallbackUrl(src) ? "fallback" : "failed"))}
      className="shrink-0 rounded-full border border-border object-cover"
      style={{ width: size, height: size }}
    />
  );
}
