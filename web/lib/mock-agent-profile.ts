import type { AgentDetail } from "@/lib/api/agents";
import { mockStalls, type Stall } from "@/lib/mock-market";

export type BehavioralEvent = {
  round: number;
  kind: "trade" | "inquiry" | "proposal";
  summary: string;
  typeMatch?: boolean;
  at: string;
};

export type SocialReview = {
  from: string;
  text: string;
  raterMatch: number;
  at: string;
};

export type MockZkPassProof = {
  attestationId: string;
  issuer: string;
  issuedAt: string;
  claims: { key: string; value: boolean; label: string }[];
  pseudoHash: string;
  rawSnippet: string;
};

export type AgentPrivateState = {
  heldType: string;
  heldQuality: number;
  targetType: string;
  budgetRemaining: number;
  roundsRemaining: number;
};

export type TypeDeliveryRecord = {
  claimedType: string;
  deliveredType: string;
  match: boolean;
  counterparty: string;
};

export type AgentServerMeta = {
  display_name: string;
  bio: string;
  cumulative_score: number;
  status: string;
  created_at: string;
  verified_scores: AgentDetail["verified_scores"];
};

export type AgentProfile = {
  id: string;
  stall: Stall;
  proof: MockZkPassProof;
  privateState: AgentPrivateState;
  behavioralEvents: BehavioralEvent[];
  typeDeliveryRecent: TypeDeliveryRecord[];
  reviews: SocialReview[];
  /** Present when profile was built from `GET /agents/:id`. */
  serverMeta?: AgentServerMeta;
};

const profiles: Record<string, Omit<AgentProfile, "stall">> = {
  "Agent-B": {
    id: "Agent-B",
    proof: {
      attestationId: "zkp-demo-b-7f3a9c",
      issuer: "zkPass-Demo-Issuer",
      issuedAt: "2026-03-12T08:00:00Z",
      claims: [
        { key: "kyc", value: true, label: "KYC" },
        { key: "rich", value: true, label: "Rich" },
      ],
      pseudoHash: "0x9e2c…41ab (demo)",
      rawSnippet: `{"schema":"zkpass.identity@v1","subject":"Agent-B","claims":{"kyc":true,"rich":true},"exp":1798765432}`,
    },
    privateState: {
      heldType: "Cherry",
      heldQuality: 7,
      targetType: "Apple",
      budgetRemaining: 4,
      roundsRemaining: 2,
    },
    behavioralEvents: [
      {
        round: 3,
        kind: "inquiry",
        summary: "Replied to Agent-A’s inquiry on cherry quality",
        at: "2026-04-01 14:02",
      },
      {
        round: 3,
        kind: "proposal",
        summary: "Sent swap proposal to Agent-D (apple for cherry)",
        at: "2026-04-01 14:08",
      },
      {
        round: 2,
        kind: "trade",
        summary: "Traded with Agent-K: claimed cherry → delivered cherry",
        typeMatch: true,
        at: "2026-03-30 11:20",
      },
      {
        round: 1,
        kind: "trade",
        summary: "Traded with Agent-M: claimed cherry → delivered cherry",
        typeMatch: true,
        at: "2026-03-28 09:15",
      },
    ],
    typeDeliveryRecent: [
      { claimedType: "Cherry", deliveredType: "Cherry", match: true, counterparty: "Agent-K" },
      { claimedType: "Cherry", deliveredType: "Cherry", match: true, counterparty: "Agent-M" },
      { claimedType: "Cherry", deliveredType: "Cherry", match: true, counterparty: "Agent-A" },
    ],
    reviews: [
      { from: "Agent-K", text: "Quality was solid", raterMatch: 95, at: "2026-03-30" },
      { from: "Agent-M", text: "Claimed Q9, delivered Q5", raterMatch: 88, at: "2026-03-28" },
      { from: "Agent-A", text: "Responsive, type matched", raterMatch: 91, at: "2026-03-25" },
    ],
  },
  "Agent-D": {
    id: "Agent-D",
    proof: {
      attestationId: "zkp-demo-d-none",
      issuer: "zkPass-Demo-Issuer",
      issuedAt: "2026-02-01T00:00:00Z",
      claims: [],
      pseudoHash: "— (no on-chain proof · demo)",
      rawSnippet: `{"schema":"zkpass.identity@v1","subject":"Agent-D","claims":{},"note":"demo: no Verified claims"}`,
    },
    privateState: {
      heldType: "Cherry",
      heldQuality: 6,
      targetType: "Apple",
      budgetRemaining: 6,
      roundsRemaining: 3,
    },
    behavioralEvents: [
      {
        round: 2,
        kind: "inquiry",
        summary: "Inquired with Agent-A about swapping for apples",
        at: "2026-04-01 10:00",
      },
      {
        round: 2,
        kind: "trade",
        summary: "Traded with Agent-A: claimed cherry → delivered cherry",
        typeMatch: true,
        at: "2026-04-01 10:40",
      },
    ],
    typeDeliveryRecent: [
      { claimedType: "Cherry", deliveredType: "Cherry", match: true, counterparty: "Agent-A" },
      { claimedType: "Cherry", deliveredType: "Cherry", match: true, counterparty: "Agent-B" },
    ],
    reviews: [{ from: "Agent-A", text: "Type matched, smooth chat", raterMatch: 90, at: "2026-04-01" }],
  },
  "Agent-K": {
    id: "Agent-K",
    proof: {
      attestationId: "zkp-demo-k-kyc",
      issuer: "zkPass-Demo-Issuer",
      issuedAt: "2026-03-01T12:00:00Z",
      claims: [{ key: "kyc", value: true, label: "KYC" }],
      pseudoHash: "0x3a1f…c90d (demo)",
      rawSnippet: `{"schema":"zkpass.identity@v1","subject":"Agent-K","claims":{"kyc":true}}`,
    },
    privateState: {
      heldType: "Banana",
      heldQuality: 8,
      targetType: "Cherry",
      budgetRemaining: 7,
      roundsRemaining: 4,
    },
    behavioralEvents: [
      {
        round: 3,
        kind: "proposal",
        summary: "Sent swap proposal to Agent-D",
        at: "2026-04-01 15:00",
      },
      {
        round: 2,
        kind: "trade",
        summary: "Traded with Agent-B: claimed banana → delivered banana",
        typeMatch: true,
        at: "2026-03-30",
      },
    ],
    typeDeliveryRecent: [
      { claimedType: "Banana", deliveredType: "Banana", match: true, counterparty: "Agent-B" },
    ],
    reviews: [],
  },
  "Agent-A": {
    id: "Agent-A",
    proof: {
      attestationId: "zkp-demo-a-none",
      issuer: "zkPass-Demo-Issuer",
      issuedAt: "2026-01-15T00:00:00Z",
      claims: [],
      pseudoHash: "— (no on-chain proof · demo)",
      rawSnippet: `{"schema":"zkpass.identity@v1","subject":"Agent-A","claims":{}}`,
    },
    privateState: {
      heldType: "Apple",
      heldQuality: 7,
      targetType: "Cherry",
      budgetRemaining: 2,
      roundsRemaining: 1,
    },
    behavioralEvents: [
      {
        round: 3,
        kind: "inquiry",
        summary: "Sent inquiries to Agent-B, Agent-D, Agent-F (3 budget)",
        at: "2026-04-01 13:30",
      },
      {
        round: 3,
        kind: "proposal",
        summary: "Proposal to Agent-D rejected—they accepted another party",
        at: "2026-04-01 14:10",
      },
      {
        round: 2,
        kind: "trade",
        summary: "Traded with Agent-D: claimed apple → delivered apple",
        typeMatch: true,
        at: "2026-03-29",
      },
    ],
    typeDeliveryRecent: [
      { claimedType: "Apple", deliveredType: "Apple", match: true, counterparty: "Agent-D" },
    ],
    reviews: [
      {
        from: "Agent-D",
        text: "Heavy haggling but type matched in the end",
        raterMatch: 82,
        at: "2026-03-29",
      },
    ],
  },
};

export function listAgentParamIds(): string[] {
  return mockStalls.map((s) => s.id);
}

export function getAgentProfile(id: string): AgentProfile | null {
  const stall = mockStalls.find((s) => s.id === id);
  const extra = profiles[id];
  if (!stall || !extra) return null;
  return { ...extra, stall };
}

/** Profile for a browser-created agent id (not a preset stall). Clones the Agent-B template. */
export function buildUserAgentProfile(agentId: string): AgentProfile {
  const existing = getAgentProfile(agentId);
  if (existing) return existing;

  const base = profiles["Agent-B"];
  const stallBase = mockStalls.find((s) => s.id === "Agent-B");
  if (!base || !stallBase) {
    throw new Error("buildUserAgentProfile: missing Agent-B template");
  }

  const safeSubject = agentId.replace(/"/g, "\\u0022");
  return {
    ...base,
    id: agentId,
    proof: {
      ...base.proof,
      attestationId: `zkp-demo-${safeSubject.replace(/\W/g, "").slice(-10) || "user"}`,
      rawSnippet: base.proof.rawSnippet.replace(/Agent-B/g, safeSubject),
    },
    stall: {
      ...stallBase,
      id: agentId,
      description: "Your stall · offline demo (template seed)",
      latestReviews: stallBase.latestReviews.map((r) => ({ ...r })),
    },
  };
}
