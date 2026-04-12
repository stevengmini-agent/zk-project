/** Response shape for `GET /seasons/current` (tolerant of wrappers). */
export function parseSeasonIdFromResponse(raw: unknown): string | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const direct = o.id ?? o.season_id;
  if (direct != null && (typeof direct === "string" || typeof direct === "number")) {
    return String(direct);
  }
  const data = o.data;
  if (data && typeof data === "object") {
    const id = (data as Record<string, unknown>).id;
    if (id != null && (typeof id === "string" || typeof id === "number")) {
      return String(id);
    }
  }
  return null;
}

/** Optional `current_round` / `round` on `GET /seasons/current` (shape varies by backend). */
export function parseCurrentRoundFromResponse(raw: unknown): number | null {
  if (raw == null || typeof raw !== "object") return null;
  const read = (o: Record<string, unknown>): number | null => {
    for (const key of ["current_round", "round", "active_round", "currentRound"] as const) {
      const v = o[key];
      if (typeof v === "number" && Number.isFinite(v) && v > 0) return Math.floor(v);
      if (typeof v === "string") {
        const n = parseInt(v, 10);
        if (!Number.isNaN(n) && n > 0) return n;
      }
    }
    return null;
  };
  const top = read(raw as Record<string, unknown>);
  if (top != null) return top;
  const data = (raw as Record<string, unknown>).data;
  if (data && typeof data === "object") return read(data as Record<string, unknown>);
  return null;
}
