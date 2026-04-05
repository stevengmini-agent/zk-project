import type { AgentPersonality } from "@/lib/agent-personality";
import type { OnboardingPersonality } from "@/lib/onboarding-types";

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Maps wizard 4-axis model → persisted 5-axis used by chat, watch, agent UI.
 *
 * - risk → risk (1:1)
 * - moral → honesty (straight talk vs hype)
 * - time → patience (long-term ↔ multi-round gather)
 * - social: cooperative → lower aggression, lower trustVerified (trust behavioral record more)
 *   manipulative / low social → higher aggression, higher trustVerified (lean on labels/signals)
 */
export function mapOnboardingToStoragePersonality(o: OnboardingPersonality): AgentPersonality {
  const honesty = clamp(o.moral);
  const risk = clamp(o.risk);
  const patience = clamp(o.time);

  // social 100 = cooperative → aggression down; social 0 = manipulative → aggression up
  const aggression = clamp(50 + (50 - o.social) * 0.45);

  // High social → prefer behavioral track record (low trustVerified); low social → more label-weighted
  const trustVerified = clamp(50 + (50 - o.social) * 0.35);

  return {
    risk,
    honesty,
    trustVerified,
    aggression,
    patience,
  };
}
