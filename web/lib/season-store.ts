/** In-memory global `season_id` (refreshed on each full load / visibility refresh). */

let seasonId: string | null = null;
const listeners = new Set<() => void>();

export function getGlobalSeasonId(): string | null {
  return seasonId;
}

export function setGlobalSeasonId(id: string | null): void {
  seasonId = id;
  for (const cb of listeners) {
    try {
      cb();
    } catch {
      /* ignore subscriber errors */
    }
  }
}

export function subscribeSeasonId(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
