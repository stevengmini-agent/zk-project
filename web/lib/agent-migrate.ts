import {
  displayNameStorageKey,
  firstVisitDoneStorageKey,
  loadDisplayName,
  saveDisplayName,
  schemasVerifiedStorageKey,
  sessionVerifiedStorageKey,
} from "@/lib/agent-display-name";
import { clearSchemaScores, loadSchemaScores, saveSchemaScores } from "@/lib/agent-schema-scores";
import { clearPersonality, loadPersonality, savePersonality } from "@/lib/agent-personality";
import { setUserAgentId } from "@/lib/user-agent";

/** Copy local demo keys to the server `agent_id`, then point the browser id at `toId`. */
export function migrateAgentLocalStorage(fromId: string, toId: string): void {
  if (typeof window === "undefined" || fromId === toId) return;
  try {
    const dn = loadDisplayName(fromId);
    if (dn) saveDisplayName(toId, dn);

    const p = loadPersonality(fromId);
    if (p) savePersonality(toId, p);

    const scores = loadSchemaScores(fromId);
    if (scores) saveSchemaScores(toId, scores);

    const sv = localStorage.getItem(sessionVerifiedStorageKey(fromId));
    if (sv) localStorage.setItem(sessionVerifiedStorageKey(toId), sv);
    const sc = localStorage.getItem(schemasVerifiedStorageKey(fromId));
    if (sc) localStorage.setItem(schemasVerifiedStorageKey(toId), sc);
    const fv = localStorage.getItem(firstVisitDoneStorageKey(fromId));
    if (fv) localStorage.setItem(firstVisitDoneStorageKey(toId), fv);

    localStorage.removeItem(displayNameStorageKey(fromId));
    localStorage.removeItem(sessionVerifiedStorageKey(fromId));
    localStorage.removeItem(schemasVerifiedStorageKey(fromId));
    localStorage.removeItem(firstVisitDoneStorageKey(fromId));
    clearPersonality(fromId);
    clearSchemaScores(fromId);

    setUserAgentId(toId);
  } catch {
    setUserAgentId(toId);
  }
}
