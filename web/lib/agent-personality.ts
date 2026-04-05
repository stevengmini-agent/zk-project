export type DimensionId = "risk" | "honesty" | "trustVerified" | "aggression" | "patience";

export type AgentPersonality = Record<DimensionId, number>;

export const DIMENSIONS: readonly {
  id: DimensionId;
  left: string;
  right: string;
}[] = [
  { id: "risk", left: "Risk-averse", right: "Risk-seeking" },
  { id: "honesty", left: "Straight talk", right: "Hype / spin" },
  { id: "trustVerified", left: "Trust zkPass labels", right: "Trust behavioral record" },
  { id: "aggression", left: "Wait passively", right: "Push inquiries / offers" },
  { id: "patience", left: "Close fast", right: "Gather info over rounds" },
] as const;

export const PERSONALITY_STORAGE_PREFIX = "agent-personality:v1:";

export function personalityStorageKey(agentId: string): string {
  return `${PERSONALITY_STORAGE_PREFIX}${agentId}`;
}

export const DEFAULT_PERSONALITY: AgentPersonality = {
  risk: 50,
  honesty: 50,
  trustVerified: 50,
  aggression: 50,
  patience: 50,
};

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function normalizePersonality(raw: Partial<Record<DimensionId, unknown>> | null): AgentPersonality {
  const out: AgentPersonality = { ...DEFAULT_PERSONALITY };
  if (!raw || typeof raw !== "object") return out;
  for (const d of DIMENSIONS) {
    const v = raw[d.id];
    if (typeof v === "number" && Number.isFinite(v)) {
      out[d.id] = clamp(v);
    }
  }
  return out;
}

export function loadPersonality(agentId: string): AgentPersonality | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(personalityStorageKey(agentId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    return normalizePersonality(parsed as Partial<Record<DimensionId, unknown>>);
  } catch {
    return null;
  }
}

export function savePersonality(agentId: string, p: AgentPersonality): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(personalityStorageKey(agentId), JSON.stringify(normalizePersonality(p)));
  } catch {
    /* ignore */
  }
}

export function hasPersonality(agentId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(personalityStorageKey(agentId)) != null;
  } catch {
    return false;
  }
}

export function clearPersonality(agentId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(personalityStorageKey(agentId));
  } catch {
    /* ignore */
  }
}

export function summarizePersonality(p: AgentPersonality): string {
  const parts: string[] = [];
  if (p.risk >= 60) parts.push("cautious");
  else if (p.risk <= 40) parts.push("bold");
  if (p.honesty >= 60) parts.push("understated");
  else if (p.honesty <= 40) parts.push("marketing-heavy");
  if (p.trustVerified >= 60) parts.push("label-focused");
  else if (p.trustVerified <= 40) parts.push("behavior-focused");
  if (p.aggression >= 60) parts.push("proactive");
  else if (p.aggression <= 40) parts.push("wait-and-see");
  if (p.patience >= 60) parts.push("multi-round scout");
  else if (p.patience <= 40) parts.push("quick flip");
  return parts.length ? parts.join(", ") : "balanced";
}
