import type { AgentPersonality, PersonalityDimension } from "@/lib/agent-personality";

export type PersonalityQuestion = {
  id: string;
  dimension: PersonalityDimension;
  text: string;
  optionA: string;
  optionB: string;
  scoreA: number;
  scoreB: number;
};

export const PERSONALITY_QUESTIONS: PersonalityQuestion[] = [
  {
    id: "q1",
    dimension: "trustTendency",
    text: "Someone says they have a resource you need. You…",
    optionA: "Verify first",
    optionB: "Trust first",
    scoreA: -10,
    scoreB: 10,
  },
  {
    id: "q2",
    dimension: "trustTendency",
    text: "A counterparty with a solid reputation proposes a trade. You…",
    optionA: "Stay cautious",
    optionB: "Move fast to accept",
    scoreA: -10,
    scoreB: 10,
  },
  {
    id: "q3",
    dimension: "deceptionWillingness",
    text: "If deception could help you win, you…",
    optionA: "Would not",
    optionB: "Would consider it",
    scoreA: -10,
    scoreB: 10,
  },
  {
    id: "q4",
    dimension: "deceptionWillingness",
    text: "You lean toward…",
    optionA: "Sharing accurate information",
    optionB: "Allowing some misdirection",
    scoreA: -10,
    scoreB: 10,
  },
  {
    id: "q5",
    dimension: "riskPreference",
    text: "You’d rather trade with…",
    optionA: "High reputation but uncertain upside",
    optionB: "Lower reputation but maybe the key resource",
    scoreA: -10,
    scoreB: 10,
  },
  {
    id: "q6",
    dimension: "riskPreference",
    text: "Facing an uncertain opportunity, you…",
    optionA: "Walk away",
    optionB: "Try it",
    scoreA: -10,
    scoreB: 10,
  },
  {
    id: "q7",
    dimension: "cooperationPriority",
    text: "You lean toward…",
    optionA: "Using others",
    optionB: "Cooperating to finish",
    scoreA: -10,
    scoreB: 10,
  },
  {
    id: "q8",
    dimension: "cooperationPriority",
    text: "In a long-term relationship, you…",
    optionA: "Stay independent",
    optionB: "Build cooperation",
    scoreA: -10,
    scoreB: 10,
  },
  {
    id: "q9",
    dimension: "revengeTendency",
    text: "If someone deceives you, you…",
    optionA: "Let it go",
    optionB: "Retaliate",
    scoreA: -10,
    scoreB: 10,
  },
  {
    id: "q10",
    dimension: "revengeTendency",
    text: "Facing someone who hurt you before, you…",
    optionA: "Ignore them",
    optionB: "Remember and use it",
    scoreA: -10,
    scoreB: 10,
  },
  {
    id: "q11",
    dimension: "reputationSensitivity",
    text: "You care more about…",
    optionA: "Long-term reputation",
    optionB: "This outcome",
    scoreA: 10,
    scoreB: -10,
  },
  {
    id: "q12",
    dimension: "reputationSensitivity",
    text: "If fraud could damage your name, you…",
    optionA: "Won’t do it",
    optionB: "Might still do it",
    scoreA: 10,
    scoreB: -10,
  },
  {
    id: "q13",
    dimension: "urgencyThreshold",
    text: "After a long stall with no progress, you…",
    optionA: "Keep waiting",
    optionB: "Start to feel anxious",
    scoreA: -10,
    scoreB: 10,
  },
  {
    id: "q14",
    dimension: "urgencyThreshold",
    text: "When time is almost up, you…",
    optionA: "Keep your pace",
    optionB: "Decide fast",
    scoreA: -10,
    scoreB: 10,
  },
  {
    id: "q15",
    dimension: "socialActivity",
    text: "You lean toward…",
    optionA: "Less chatter",
    optionB: "More communication",
    scoreA: -10,
    scoreB: 10,
  },
  {
    id: "q16",
    dimension: "socialActivity",
    text: "Do you reach out to others proactively?",
    optionA: "Rarely",
    optionB: "Often",
    scoreA: -10,
    scoreB: 10,
  },
];

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function applyAnswer(
  personality: AgentPersonality,
  question: PersonalityQuestion,
  answer: "A" | "B",
): AgentPersonality {
  const delta = answer === "A" ? question.scoreA : question.scoreB;
  const key = question.dimension;
  const newValue = clamp(personality[key] + delta);
  return { ...personality, [key]: newValue };
}

export function computePersonalityFromChoices(choices: ("A" | "B")[]): AgentPersonality {
  const base: AgentPersonality = {
    trustTendency: 50,
    deceptionWillingness: 50,
    riskPreference: 50,
    cooperationPriority: 50,
    revengeTendency: 50,
    reputationSensitivity: 50,
    urgencyThreshold: 50,
    socialActivity: 50,
  };
  let p = base;
  for (let i = 0; i < choices.length; i++) {
    const q = PERSONALITY_QUESTIONS[i];
    const c = choices[i];
    if (!q || !c) break;
    p = applyAnswer(p, q, c);
  }
  return p;
}

/** Human-readable eight-axis snapshot (no raw field names). */
export function summarizePersonalityAxes(p: AgentPersonality) {
  return {
    trust: p.trustTendency,
    deception: p.deceptionWillingness,
    risk: p.riskPreference,
    cooperation: p.cooperationPriority,
    revenge: p.revengeTendency,
    reputation: p.reputationSensitivity,
    urgency: p.urgencyThreshold,
    social: p.socialActivity,
  };
}

const AXIS_LABELS: { key: PersonalityDimension; high: string; low: string }[] = [
  { key: "trustTendency", low: "verification-first", high: "trust-forward" },
  { key: "deceptionWillingness", low: "truth-biased", high: "open to misdirection" },
  { key: "riskPreference", low: "risk-cautious", high: "risk-seeking" },
  { key: "cooperationPriority", low: "self-interested", high: "cooperation-first" },
  { key: "revengeTendency", low: "forgiving", high: "retaliatory" },
  { key: "reputationSensitivity", low: "outcome-now", high: "long-term reputation" },
  { key: "urgencyThreshold", low: "steady under time", high: "time-anxious" },
  { key: "socialActivity", low: "quiet", high: "chatty" },
];

/** One-line summary in plain language (no internal keys). */
export function personalityOneLineSummary(p: AgentPersonality): string {
  const scored = AXIS_LABELS.map(({ key, high, low }) => {
    const v = p[key];
    const dev = Math.abs(v - 50);
    return { dev, text: v >= 55 ? high : v <= 45 ? low : null };
  })
    .filter((x): x is { dev: number; text: string } => x.text != null)
    .sort((a, b) => b.dev - a.dev);

  if (scored.length === 0) {
    return "Overall you’re fairly balanced—you’ll weigh trust, risk, and cooperation by context.";
  }
  const top = scored.slice(0, 2).map((s) => s.text);
  return `You lean toward ${top.join(" and ")}—expect that in trades and conversation.`;
}
