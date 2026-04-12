import { apiFetchJson } from "@/lib/api-config";

export type RoundLeaderboardEntry = {
  rank: number;
  name: string;
  score: number;
};

function pickName(o: Record<string, unknown>): string {
  const keys = ["display_name", "name", "agent_name", "nickname", "agent_id", "id"] as const;
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "—";
}

function pickScore(o: Record<string, unknown>): number {
  for (const k of ["score", "points", "cumulative_score", "total_score"] as const) {
    const v = o[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return 0;
}

function pickRank(o: Record<string, unknown>, index: number): number {
  for (const k of ["rank", "place", "position"] as const) {
    const v = o[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return index + 1;
}

function extractRows(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    for (const key of ["entries", "rows", "leaderboard", "data", "agents", "items"] as const) {
      const v = o[key];
      if (Array.isArray(v)) return v;
    }
  }
  return [];
}

/** Normalizes `GET /leaderboard/round?round=…` payloads (shape may vary by backend). */
export function normalizeRoundLeaderboard(data: unknown): RoundLeaderboardEntry[] {
  const rows = extractRows(data);
  const out: RoundLeaderboardEntry[] = [];
  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    if (!raw || typeof raw !== "object") continue;
    const o = raw as Record<string, unknown>;
    out.push({
      rank: pickRank(o, i),
      name: pickName(o),
      score: pickScore(o),
    });
  }
  out.sort((a, b) => a.rank - b.rank);
  return out;
}

export async function getRoundLeaderboard(round: number): Promise<RoundLeaderboardEntry[]> {
  const data = await apiFetchJson<unknown>(
    `/leaderboard/round?round=${encodeURIComponent(String(round))}`,
  );
  return normalizeRoundLeaderboard(data);
}
