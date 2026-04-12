import type { AgentDetail } from "@/lib/api/agents";
import type { AgentProfile, MockZkPassProof, SocialReview } from "@/lib/mock-agent-profile";
import type { Stall } from "@/lib/mock-market";

function normMatchRate(v: number | null | undefined): number {
  if (v == null) return 0;
  if (v >= 0 && v <= 1) return Math.round(v * 100);
  return Math.min(100, Math.round(v));
}

const CLAIM_LABELS: Record<keyof AgentDetail["verified_scores"], string> = {
  kyc: "KYC",
  rich: "Rich",
  kol: "KOL",
  creator: "Creator",
  veteran: "Veteran",
};

function verifiedProof(detail: AgentDetail): MockZkPassProof {
  const claims: MockZkPassProof["claims"] = [];
  const vs = detail.verified_scores;
  (Object.keys(vs) as (keyof typeof vs)[]).forEach((key) => {
    const score = vs[key];
    if (typeof score === "number" && score > 0) {
      claims.push({
        key,
        value: true,
        label: `${CLAIM_LABELS[key]} · ${score}`,
      });
    }
  });
  return {
    attestationId: `agent-${detail.id.slice(0, 8)}`,
    issuer: "cg.zkpass.org",
    issuedAt: detail.created_at,
    claims,
    pseudoHash: "— (server)",
    rawSnippet: JSON.stringify({ agent_id: detail.id, verified_scores: detail.verified_scores }),
  };
}

function buildStall(detail: AgentDetail): Stall {
  const { behavioral } = detail;
  const typeRate =
    behavioral.total_trades === 0 || behavioral.type_match_rate == null
      ? 0
      : Math.round(behavioral.type_match_rate * 100);

  const latestReviews = (detail.reviews ?? []).slice(0, 6).map((r) => ({
    from: r.reviewer_name,
    text: r.content,
    raterMatch: r.reviewer_match_rate == null ? 0 : normMatchRate(r.reviewer_match_rate),
  }));

  const verifiedLabels = (Object.keys(detail.verified_scores) as (keyof typeof detail.verified_scores)[])
    .filter((k) => detail.verified_scores[k] > 0)
    .map((k) => CLAIM_LABELS[k]);

  return {
    id: detail.id,
    offeredType: "—",
    offeredQuality: null,
    wantedType: "—",
    description: detail.bio,
    verified: verifiedLabels,
    behavioralMatch: typeRate,
    tradeCount: behavioral.total_trades,
    socialScore: detail.reviews?.length ? 4.0 : 0,
    reviewCount: detail.reviews?.length ?? 0,
    latestReviews,
    completed: false,
  };
}

function mapReviews(detail: AgentDetail): SocialReview[] {
  return (detail.reviews ?? []).map((r) => ({
    from: r.reviewer_name,
    text: r.content,
    raterMatch: r.reviewer_match_rate == null ? 0 : normMatchRate(r.reviewer_match_rate),
    at: `Round ${r.round}`,
  }));
}

/** Maps `GET /agents/:id` into the UI `AgentProfile` shape. */
export function mapServerAgentToProfile(detail: AgentDetail): AgentProfile {
  const behavioralEvents = (detail.comments ?? []).map((c) => ({
    round: c.round,
    kind: "inquiry" as const,
    summary: c.content,
    at: `Round ${c.round}`,
  }));

  return {
    id: detail.id,
    stall: buildStall(detail),
    proof: verifiedProof(detail),
    privateState: {
      heldType: "—",
      heldQuality: 0,
      targetType: "—",
      budgetRemaining: 0,
      roundsRemaining: 0,
    },
    behavioralEvents,
    typeDeliveryRecent: [],
    reviews: mapReviews(detail),
    serverMeta: {
      display_name: detail.display_name,
      bio: detail.bio,
      cumulative_score: detail.cumulative_score,
      status: detail.status,
      created_at: detail.created_at,
      verified_scores: detail.verified_scores,
    },
  };
}
