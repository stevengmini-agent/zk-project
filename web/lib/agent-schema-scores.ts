/** Persisted lab schema scores (1–100) used when POST /agents/create. */

export type SchemaScoreKey = "kyc" | "rich" | "kol" | "creator" | "veteran";

export type SchemaScores = Record<SchemaScoreKey, number>;

const PREFIX = "agent-schema-scores:v1:";

export function schemaScoresStorageKey(agentId: string): string {
  return `${PREFIX}${agentId}`;
}

export function defaultSchemaScores(): SchemaScores {
  return { kyc: 0, rich: 0, kol: 0, creator: 0, veteran: 0 };
}

export function saveSchemaScores(agentId: string, scores: SchemaScores): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(schemaScoresStorageKey(agentId), JSON.stringify(scores));
  } catch {
    /* ignore */
  }
}

export function loadSchemaScores(agentId: string): SchemaScores | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(schemaScoresStorageKey(agentId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const o = parsed as Partial<Record<SchemaScoreKey, unknown>>;
    const out = { ...defaultSchemaScores() };
    for (const k of Object.keys(out) as SchemaScoreKey[]) {
      const v = o[k];
      if (typeof v === "number" && Number.isFinite(v)) {
        out[k] = Math.max(0, Math.min(100, Math.round(v)));
      }
    }
    return out;
  } catch {
    return null;
  }
}

export function clearSchemaScores(agentId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(schemaScoresStorageKey(agentId));
  } catch {
    /* ignore */
  }
}
