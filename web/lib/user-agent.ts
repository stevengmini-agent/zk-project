/** Browser-local id for this visitor's created agent (not shared across devices). */

export const USER_AGENT_ID_KEY = "user-demo-agent-id:v1";

export function getOrCreateUserAgentId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(USER_AGENT_ID_KEY);
    if (id && id.trim()) return id.trim();
    const suffix =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
        : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    id = `Agent-${suffix}`;
    localStorage.setItem(USER_AGENT_ID_KEY, id);
    return id;
  } catch {
    return "Agent-local";
  }
}

export function peekUserAgentId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const id = localStorage.getItem(USER_AGENT_ID_KEY);
    return id?.trim() || null;
  } catch {
    return null;
  }
}
