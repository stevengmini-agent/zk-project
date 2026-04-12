import type { AgentPersonality } from "@/lib/agent-personality";
import { personalityOneLineSummary } from "@/lib/personality-questions";

export type ArchetypeResult = {
  id: string;
  title: string;
  blurb: string;
};

export function getArchetype(p: AgentPersonality): ArchetypeResult {
  const { trustTendency, deceptionWillingness, riskPreference, cooperationPriority } = p;

  if (cooperationPriority >= 65 && trustTendency >= 60 && deceptionWillingness <= 40) {
    return {
      id: "trusted_partner",
      title: "Trusted collaborator",
      blurb: "Builds trust first, favors truthful claims, and weights repeat play over one-off wins.",
    };
  }
  if (riskPreference >= 65 && deceptionWillingness >= 55) {
    return {
      id: "sharp_operator",
      title: "Aggressive operator",
      blurb: "Comfortable with ambiguity and spin—more focused on winning the round than looking perfect.",
    };
  }
  if (trustTendency <= 40 && riskPreference <= 40) {
    return {
      id: "skeptic_guard",
      title: "Cautious gatekeeper",
      blurb: "Defaults to verification, avoids fuzzy opportunities, trades speed for control.",
    };
  }
  if (
    Math.abs(trustTendency - 50) < 12 &&
    Math.abs(deceptionWillingness - 50) < 12 &&
    Math.abs(riskPreference - 50) < 12
  ) {
    return {
      id: "balanced",
      title: "Balanced",
      blurb: "No single axis dominates—you read the room and adjust.",
    };
  }

  return {
    id: "pragmatist",
    title: "Pragmatist",
    blurb: "Mixed pulls: you compromise between trust, risk, and how hard you push the narrative.",
  };
}

export function getBehaviorSummary(p: AgentPersonality): string[] {
  return [personalityOneLineSummary(p)];
}
