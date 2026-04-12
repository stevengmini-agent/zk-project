/**
 * App-wide defaults and helpers for public (build-time) environment.
 * Server and client: only `NEXT_PUBLIC_*` vars belong here.
 */

/** Default backend origin when `NEXT_PUBLIC_API_ORIGIN` is unset. */
export const DEFAULT_API_ORIGIN = "https://cg.zkpass.org";

/** Default API path segment after origin, e.g. `/api/v1`. */
export const DEFAULT_API_VERSION_PREFIX = "/api/v1";

/**
 * API pathnames (no query string) that must not receive an auto-appended `season_id`.
 * Used by `apiUrl()` in `lib/api-config.ts`.
 */
export const API_SEASON_QUERY_EXCLUDE_PATHS = ["/seasons/current"] as const;

export function normalizeApiOrigin(raw: string | undefined): string {
  if (!raw?.trim()) return DEFAULT_API_ORIGIN;
  return raw.replace(/\/+$/, "");
}

export function normalizeApiVersionPrefix(raw: string | undefined): string {
  const fromEnv = raw?.trim();
  const base = fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_API_VERSION_PREFIX;
  const withSlash = base.startsWith("/") ? base : `/${base}`;
  return withSlash.replace(/\/+$/, "") || DEFAULT_API_VERSION_PREFIX;
}
