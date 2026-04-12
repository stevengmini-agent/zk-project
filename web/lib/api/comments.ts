import { apiFetchJson } from "@/lib/api-config";
import type { StoryType } from "@/lib/watch";

export type WatchCommentPartner = {
  id: string;
  name: string;
};

export type WatchComment = {
  agent_id: string;
  display_name: string;
  round: number;
  title: string;
  content: string;
  insight: string;
  partner: WatchCommentPartner | null;
  tags: string[];
  created_at: string;
};

export function watchCommentId(c: WatchComment): string {
  return `${c.agent_id}:${c.created_at}`;
}

function unwrapComments(data: unknown): WatchComment[] {
  if (Array.isArray(data)) return data as WatchComment[];
  if (data && typeof data === "object") {
    const inner = (data as Record<string, unknown>).data;
    if (Array.isArray(inner)) return inner as WatchComment[];
    const comments = (data as Record<string, unknown>).comments;
    if (Array.isArray(comments)) return comments as WatchComment[];
  }
  return [];
}

/**
 * `GET /comments?season_id=…` (+ optional `round`, `tag`).
 * `season_id` is appended by `apiUrl` when a global season is set.
 */
export async function getWatchComments(options: { round?: number; tag?: StoryType }): Promise<WatchComment[]> {
  const params = new URLSearchParams();
  if (options.round != null && Number.isFinite(options.round)) {
    params.set("round", String(Math.floor(options.round)));
  }
  if (options.tag) {
    params.set("tag", options.tag);
  }
  const q = params.toString();
  const path = q ? `/comments?${q}` : "/comments";
  const data = await apiFetchJson<unknown>(path);
  return unwrapComments(data);
}

export function sortCommentsByTimeDesc(items: WatchComment[]): WatchComment[] {
  return [...items].sort((a, b) => {
    const ta = Date.parse(a.created_at);
    const tb = Date.parse(b.created_at);
    const na = Number.isNaN(ta) ? 0 : ta;
    const nb = Number.isNaN(tb) ? 0 : tb;
    return nb - na;
  });
}
