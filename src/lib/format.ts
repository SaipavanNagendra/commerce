export function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return '0 min';
  const mins = Math.round(totalSeconds / 60);
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'}`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${hrs}h ${rem}m` : `${hrs}h`;
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds || 0));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  if (!bytes) return '—';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}

export function initials(firstName?: string, lastName?: string): string {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
}

// The backend's API base URL looks like "https://commerceedge.onrender.com/api/v1".
// Uploaded files (avatars) are served from the same host, but NOT under
// "/api/v1" — so we strip that off to get the plain origin to build
// image URLs from.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://commerceedge.onrender.com/api/v1';
const API_ORIGIN = API_BASE_URL.replace(/\/api\/v\d+\/?$/, '');

/**
 * Turns whatever the backend sends back for avatarPath into a URL an
 * <img> tag can actually load.
 * - Already a full URL (http/https, e.g. S3/Cloudinary)? Use it as-is.
 * - A relative path (e.g. "/uploads/avatar123.png")? Prefix it with the
 *   backend's origin so it doesn't try to load from the frontend's domain.
 */
export function resolveAvatarUrl(avatarPath: string | null | undefined): string | null {
  if (!avatarPath) return null;
  if (/^https?:\/\//i.test(avatarPath)) return avatarPath;
  return `${API_ORIGIN}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`;
}