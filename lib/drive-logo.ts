const DRIVE_ID_PATTERNS = [/\/file\/d\/([a-zA-Z0-9_-]+)/, /\/d\/([a-zA-Z0-9_-]+)/, /[?&]id=([a-zA-Z0-9_-]+)/];

/**
 * Pulls the file ID out of a Drive share link (or one of our own resolved
 * embed URLs, which share the same /d/<ID> shape) so callers can build
 * alternate embed URLs for the same file.
 */
export function extractDriveFileId(input: string | null | undefined): string | null {
  if (!input) return null;
  for (const pattern of DRIVE_ID_PATTERNS) {
    const match = input.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

/**
 * Rewrites a pasted Google Drive share link into a directly-embeddable image
 * URL. Supports the common share-link shapes:
 *   https://drive.google.com/file/d/<ID>/view?usp=sharing
 *   https://drive.google.com/open?id=<ID>
 *   https://drive.google.com/uc?id=<ID>&export=download
 * Uses the googleusercontent.com CDN rather than drive.google.com/uc, which
 * Google increasingly blocks for cross-origin <img> hotlinking even when
 * the file is shared publicly. Returns null if no Drive file ID can be
 * found (caller should fall back to a placeholder), or the original string
 * unchanged if it isn't a Drive link at all (e.g. a direct image URL).
 */
export function resolveLogoUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (!trimmed.includes("drive.google.com")) {
    return trimmed;
  }

  const id = extractDriveFileId(trimmed);
  return id ? `https://lh3.googleusercontent.com/d/${id}=w512` : trimmed;
}

/** A second embed URL shape to try for the same Drive file if the primary one fails to load. */
export function resolveLogoFallbackUrl(input: string | null | undefined): string | null {
  const id = extractDriveFileId(input);
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w512` : null;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
