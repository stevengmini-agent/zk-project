import { hasPersonality } from "@/lib/agent-personality";

const DISPLAY_PREFIX = "agent-display-name:v1:";
const FIRST_VISIT_PREFIX = "agent-first-visit-done:v1:";
const SESSION_VERIFIED_PREFIX = "agent-session-verified:v1:";

export function displayNameStorageKey(stallId: string): string {
  return `${DISPLAY_PREFIX}${stallId}`;
}

export function firstVisitDoneStorageKey(stallId: string): string {
  return `${FIRST_VISIT_PREFIX}${stallId}`;
}

export function loadDisplayName(stallId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(displayNameStorageKey(stallId));
    if (!v) return null;
    const t = v.trim();
    return t.length ? t : null;
  } catch {
    return null;
  }
}

export function saveDisplayName(stallId: string, name: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(displayNameStorageKey(stallId), name.trim());
  } catch {
    /* ignore */
  }
}

export function isFirstVisitDone(stallId: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(firstVisitDoneStorageKey(stallId)) === "1";
  } catch {
    return true;
  }
}

export function markFirstVisitDone(stallId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(firstVisitDoneStorageKey(stallId), "1");
  } catch {
    /* ignore */
  }
}

export function sessionVerifiedStorageKey(agentId: string): string {
  return `${SESSION_VERIFIED_PREFIX}${agentId}`;
}

export function isSessionVerified(agentId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(sessionVerifiedStorageKey(agentId)) === "1";
  } catch {
    return false;
  }
}

export function markSessionVerified(agentId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(sessionVerifiedStorageKey(agentId), "1");
  } catch {
    /* ignore */
  }
}

/** Verification + display name + saved personality (defaults or guided). */
export function isAgentSetupComplete(agentId: string): boolean {
  if (typeof window === "undefined") return false;
  return (
    isSessionVerified(agentId) &&
    !!loadDisplayName(agentId) &&
    hasPersonality(agentId)
  );
}
