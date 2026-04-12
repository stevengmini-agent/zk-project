/**
 * HTTP client for the Agent Reputation backend (`apiUrl`, `apiFetch`, `apiFetchJson`).
 * Uses native `fetch` only (no axios).
 *
 * Env overrides (defaults in `lib/config/public.ts`):
 *   NEXT_PUBLIC_API_ORIGIN
 *   NEXT_PUBLIC_API_VERSION_PREFIX
 *   NEXT_PUBLIC_API_BASE_URL (full root; skips origin + version join)
 */
import {
  API_SEASON_QUERY_EXCLUDE_PATHS,
  DEFAULT_API_ORIGIN,
  normalizeApiOrigin,
  normalizeApiVersionPrefix,
} from "@/lib/config/public";
import { getGlobalSeasonId } from "@/lib/season-store";

export const API_ORIGIN =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_ORIGIN?.trim()
    ? normalizeApiOrigin(process.env.NEXT_PUBLIC_API_ORIGIN)
    : DEFAULT_API_ORIGIN;

function versionPrefix(): string {
  const fromEnv =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_VERSION_PREFIX?.trim() : undefined;
  return normalizeApiVersionPrefix(fromEnv);
}

/** Full API root, e.g. `https://cg.zkpass.org/api/v1` (no trailing slash). */
export const API_ROOT = (() => {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL?.trim()) {
    return normalizeApiOrigin(process.env.NEXT_PUBLIC_API_BASE_URL);
  }
  return `${API_ORIGIN}${versionPrefix()}`;
})();

const SEASON_QUERY_EXCLUDE_PATHS = API_SEASON_QUERY_EXCLUDE_PATHS;

function pathWithoutQuery(path: string): string {
  const i = path.indexOf("?");
  return i === -1 ? path : path.slice(0, i);
}

function shouldAttachSeasonId(path: string): boolean {
  const p = pathWithoutQuery(path);
  return !SEASON_QUERY_EXCLUDE_PATHS.some((ex) => p === ex || p.endsWith(ex));
}

function appendQueryParam(path: string, key: string, value: string): string {
  const qIndex = path.indexOf("?");
  const pathname = qIndex === -1 ? path : path.slice(0, qIndex);
  const query = qIndex === -1 ? "" : path.slice(qIndex + 1);
  const params = new URLSearchParams(query);
  params.set(key, value);
  return `${pathname}?${params.toString()}`;
}

export type ApiCallOptions = {
  /** When true, do not append `season_id` even if a global season is set. */
  skipSeasonId?: boolean;
};

/** Join API root + path (path may omit leading `/`). Applies `season_id` when available. */
export function apiUrl(path: string, callOptions?: ApiCallOptions): string {
  let p = path.startsWith("/") ? path : `/${path}`;
  const sid = getGlobalSeasonId();
  if (sid && !callOptions?.skipSeasonId && shouldAttachSeasonId(p)) {
    p = appendQueryParam(p, "season_id", sid);
  }
  return `${API_ROOT}${p}`;
}

/** Same as `fetch(apiUrl(path, callOptions), init)`. */
export function apiFetch(path: string, init?: RequestInit, callOptions?: ApiCallOptions): Promise<Response> {
  return fetch(apiUrl(path, callOptions), init);
}

export class ApiHttpError extends Error {
  readonly status: number;
  readonly bodyText: string;

  constructor(status: number, message: string, bodyText: string) {
    super(message);
    this.name = "ApiHttpError";
    this.status = status;
    this.bodyText = bodyText;
  }
}

function pickNonEmptyString(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
}

/**
 * Reads backend error text from a JSON body. Prefers `error` (string or nested `{ message }`),
 * then falls back to top-level `message`.
 */
export function extractApiErrorBodyMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const o = data as Record<string, unknown>;
  const errField = o.error;

  const fromError =
    pickNonEmptyString(errField) ??
    (errField && typeof errField === "object"
      ? pickNonEmptyString((errField as Record<string, unknown>).message) ??
        pickNonEmptyString((errField as Record<string, unknown>).error)
      : undefined);

  return fromError ?? pickNonEmptyString(o.message);
}

export type ApiFetchJsonInit = Omit<RequestInit, "body"> & {
  body?: BodyInit;
  /** Shorthand: `JSON.stringify(json)` and sets `Content-Type: application/json` when missing. */
  json?: unknown;
};

/**
 * `fetch` + parse JSON. On non-2xx, throws `ApiHttpError` (still parses body when JSON).
 * Prefer `json: { ... }` for POST payloads instead of passing a raw object as `body`.
 */
export async function apiFetchJson<T = unknown>(
  path: string,
  init?: ApiFetchJsonInit,
  callOptions?: ApiCallOptions,
): Promise<T> {
  const { json, body, ...rest } = init ?? {};
  const headers = new Headers(rest.headers);
  let finalBody: BodyInit | undefined = body;

  if (json !== undefined) {
    finalBody = JSON.stringify(json);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  const res = await apiFetch(path, { ...rest, headers, body: finalBody }, callOptions);
  const text = await res.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      if (!res.ok) {
        throw new ApiHttpError(res.status, `HTTP ${res.status} for ${path}`, text);
      }
      throw new Error(`Expected JSON from ${path}, got: ${text.slice(0, 200)}`);
    }
  }

  if (!res.ok) {
    const msg = extractApiErrorBodyMessage(data) ?? `HTTP ${res.status} for ${path}`;
    throw new ApiHttpError(res.status, msg, text);
  }

  return data as T;
}
