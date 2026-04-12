/** Eight-axis behavior model (aligned with the Q&A wizard); migrates legacy 5-axis localStorage. */

export type PersonalityDimension =
  | "trustTendency"
  | "deceptionWillingness"
  | "riskPreference"
  | "cooperationPriority"
  | "revengeTendency"
  | "reputationSensitivity"
  | "urgencyThreshold"
  | "socialActivity";

export type AgentPersonality = Record<PersonalityDimension, number> & {
  freeText?: string;
};

export const DIMENSIONS: readonly {
  id: PersonalityDimension;
  left: string;
  right: string;
}[] = [
  { id: "trustTendency", left: "Skeptical / verify", right: "Trusting" },
  { id: "deceptionWillingness", left: "Reject deception", right: "Accept spin" },
  { id: "riskPreference", left: "Risk-off", right: "Opportunity-seeking" },
  { id: "cooperationPriority", left: "Exploit others", right: "Prioritize cooperation" },
  { id: "revengeTendency", left: "Let go", right: "Grudge / retaliate" },
  { id: "reputationSensitivity", left: "Care about reputation", right: "This deal only" },
  { id: "urgencyThreshold", left: "Steady pace", right: "Time pressure / rush" },
  { id: "socialActivity", left: "Quiet", right: "High-touch comms" },
] as const;

export const PERSONALITY_STORAGE_PREFIX = "agent-personality:v1:";

export function personalityStorageKey(agentId: string): string {
  return `${PERSONALITY_STORAGE_PREFIX}${agentId}`;
}

export const DEFAULT_PERSONALITY: AgentPersonality = {
  trustTendency: 50,
  deceptionWillingness: 50,
  riskPreference: 50,
  cooperationPriority: 50,
  revengeTendency: 50,
  reputationSensitivity: 50,
  urgencyThreshold: 50,
  socialActivity: 50,
};

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function migrateLegacyPersonality(raw: Record<string, unknown>): AgentPersonality {
  const risk = typeof raw.risk === "number" ? clamp(raw.risk) : 50;
  const honesty = typeof raw.honesty === "number" ? clamp(raw.honesty) : 50;
  const trustVerified = typeof raw.trustVerified === "number" ? clamp(raw.trustVerified) : 50;
  const aggression = typeof raw.aggression === "number" ? clamp(raw.aggression) : 50;
  const patience = typeof raw.patience === "number" ? clamp(raw.patience) : 50;

  return {
    trustTendency: clamp(50 + (trustVerified - 50) * 0.5),
    deceptionWillingness: clamp(100 - honesty),
    riskPreference: risk,
    cooperationPriority: clamp(100 - aggression * 0.5),
    revengeTendency: 50,
    reputationSensitivity: trustVerified,
    urgencyThreshold: clamp(100 - patience),
    socialActivity: aggression,
  };
}

export function normalizePersonality(raw: Partial<Record<string, unknown>> | null): AgentPersonality {
  const out: AgentPersonality = { ...DEFAULT_PERSONALITY };
  if (!raw || typeof raw !== "object") return out;

  const hasNew =
    typeof raw.trustTendency === "number" ||
    typeof raw.deceptionWillingness === "number" ||
    typeof raw.riskPreference === "number";

  const hasLegacy =
    typeof (raw as Record<string, unknown>).honesty === "number" ||
    typeof (raw as Record<string, unknown>).trustVerified === "number";

  if (!hasNew && hasLegacy) {
    return migrateLegacyPersonality(raw as Record<string, unknown>);
  }

  for (const d of DIMENSIONS) {
    const v = raw[d.id];
    if (typeof v === "number" && Number.isFinite(v)) {
      out[d.id] = clamp(v);
    }
  }
  const ft = raw.freeText;
  if (typeof ft === "string" && ft.trim()) {
    out.freeText = ft.trim().slice(0, 2000);
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
    return normalizePersonality(parsed as Partial<Record<string, unknown>>);
  } catch {
    return null;
  }
}

export function savePersonality(agentId: string, p: AgentPersonality): void {
  if (typeof window === "undefined") return;
  try {
    const { freeText, ...dims } = p;
    const payload: Record<string, unknown> = { ...dims };
    if (freeText != null && freeText.length > 0) payload.freeText = freeText;
    localStorage.setItem(personalityStorageKey(agentId), JSON.stringify(normalizePersonality(payload)));
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

/** Short English tags for welcome messages and chat tone. */
export function summarizePersonality(p: AgentPersonality): string {
  const parts: string[] = [];
  if (p.trustTendency >= 60) parts.push("trust-forward");
  else if (p.trustTendency <= 40) parts.push("verify-first");

  if (p.deceptionWillingness >= 60) parts.push("flexible-truth");
  else if (p.deceptionWillingness <= 40) parts.push("straight-shooter");

  if (p.riskPreference >= 60) parts.push("opportunity-seeking");
  else if (p.riskPreference <= 40) parts.push("risk-cautious");

  if (p.cooperationPriority >= 60) parts.push("cooperative");
  else if (p.cooperationPriority <= 40) parts.push("self-interested");

  if (p.revengeTendency >= 60) parts.push("retaliatory");
  else if (p.revengeTendency <= 40) parts.push("forgiving");

  if (p.reputationSensitivity >= 60) parts.push("reputation-careful");
  else if (p.reputationSensitivity <= 40) parts.push("outcome-now");

  if (p.urgencyThreshold >= 60) parts.push("time-sensitive");
  else if (p.urgencyThreshold <= 40) parts.push("patient");

  if (p.socialActivity >= 60) parts.push("chatty");
  else if (p.socialActivity <= 40) parts.push("quiet");

  return parts.length ? parts.join(", ") : "balanced";
}
