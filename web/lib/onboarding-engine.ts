import type { AnswerState, OnboardingPersonality } from "@/lib/onboarding-types";
import { ONBOARDING_INITIAL } from "@/lib/onboarding-types";

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Apply deltas from one answer onto a copy of personality. */
export function applyAnswerToPersonality(
  p: OnboardingPersonality,
  patch: Partial<Record<keyof OnboardingPersonality, number>>,
): OnboardingPersonality {
  const next = { ...p };
  for (const k of Object.keys(patch) as (keyof OnboardingPersonality)[]) {
    const d = patch[k];
    if (typeof d === "number") next[k] = clamp(next[k] + d);
  }
  return next;
}

/** Recompute personality from scratch from all answers (idempotent). */
export function computePersonalityFromAnswers(answers: AnswerState): OnboardingPersonality {
  let p = { ...ONBOARDING_INITIAL };

  if (answers.goal === "win_tasks") p = applyAnswerToPersonality(p, { risk: 15 });
  else if (answers.goal === "survive") p = applyAnswerToPersonality(p, { risk: -15 });
  else if (answers.goal === "relationships")
    p = applyAnswerToPersonality(p, { social: 15, time: 10 });

  if (answers.riskChoice === "stable") p = applyAnswerToPersonality(p, { risk: -20 });
  else if (answers.riskChoice === "gamble") p = applyAnswerToPersonality(p, { risk: 20 });

  if (answers.moralChoice === "never") p = applyAnswerToPersonality(p, { moral: 20 });
  else if (answers.moralChoice === "if_needed") p = applyAnswerToPersonality(p, { moral: -20 });

  if (answers.socialChoice === "trust") p = applyAnswerToPersonality(p, { social: 20 });
  else if (answers.socialChoice === "influence") p = applyAnswerToPersonality(p, { social: -20 });
  else if (answers.socialChoice === "fast") p = applyAnswerToPersonality(p, { time: -15 });

  if (answers.pressureChoice === "steady") p = applyAnswerToPersonality(p, { time: 15 });
  else if (answers.pressureChoice === "aggressive") p = applyAnswerToPersonality(p, { risk: 10 });
  else if (answers.pressureChoice === "whatever")
    p = applyAnswerToPersonality(p, { time: -20, moral: -10 });

  return p;
}

export type ArchetypeResult = {
  id: string;
  title: string;
  blurb: string;
};

/** First matching rule wins (order = specificity / product preference). */
export function getArchetype(p: OnboardingPersonality): ArchetypeResult {
  const { moral, risk, social, time } = p;

  if (social >= 70 && time >= 70 && moral >= 60) {
    return {
      id: "long_term_partner",
      title: "Long-horizon partner",
      blurb: "Builds slowly, keeps promises, and thinks in repeats—not just one swap.",
    };
  }
  if (risk >= 70 && time <= 40) {
    return {
      id: "high_roller",
      title: "High-stakes gambler",
      blurb: "Chases upside now, tolerates dry spells, and lives for the big score.",
    };
  }
  if (moral <= 40 && risk >= 60) {
    return {
      id: "opportunist",
      title: "Opportunist",
      blurb: "Flexible ethics when the window is tight; outcomes beat ceremony.",
    };
  }
  if (moral >= 60 && risk <= 40 && social >= 50) {
    return {
      id: "cautious_strategist",
      title: "Cautious strategist",
      blurb: "Small steps, clear signals, and a bias toward safe, legible trades.",
    };
  }
  if (moral >= 40 && moral <= 60 && risk >= 40 && risk <= 60 && social >= 40 && social <= 60 && time >= 40 && time <= 60) {
    return {
      id: "balanced",
      title: "Balanced player",
      blurb: "No single knob dominates—your agent adapts case by case.",
    };
  }

  return {
    id: "pragmatist",
    title: "Pragmatist",
    blurb: "A mixed profile: neither pure saint nor pure shark—context decides.",
  };
}

export function getBehaviorSummary(p: OnboardingPersonality): string[] {
  const lines: string[] = [];
  if (p.risk >= 60) {
    lines.push("Reaches for high-upside trades even when the path is noisy.");
  } else if (p.risk <= 40) {
    lines.push("Prefers predictable swaps and passes on murky counterparties.");
  } else {
    lines.push("Balances safety and upside depending on how tight the clock is.");
  }

  if (p.moral >= 60) {
    lines.push("Rarely bluffs type or quality; reputation is treated as an asset.");
  } else if (p.moral <= 40) {
    lines.push("Will bend claims when the scoreboard is on the line.");
  } else {
    lines.push("Keeps lies small; weighs getting caught against the prize.");
  }

  if (p.social >= 60) {
    lines.push("Invests in repeat contact and favors partners who reciprocate.");
  } else if (p.social <= 40) {
    lines.push("Treats talk as leverage—fast to probe, slow to trust.");
  } else {
    lines.push("Mixes charm and verification without going all-in on either.");
  }

  if (p.time >= 60) {
    lines.push("Under time pressure, still tries to protect the next round—not just this one.");
  } else if (p.time <= 40) {
    lines.push("When the clock runs low, shortcuts and bigger swings show up.");
  } else {
    lines.push("Tight deadlines nudge risk up slightly, but not into free fall.");
  }

  return lines;
}

export function feedbackForAnswer(
  step: 1 | 2 | 3 | 4 | 5,
  optionId: string,
): string | null {
  const map: Record<string, string> = {
    win_tasks: "Leaning toward bigger swings to top the board.",
    survive: "Dialing risk down—consistency over spikes.",
    relationships: "Weighting repeat play and patience higher.",
    flexible: "Keeping the profile even—ready to adapt.",
    stable: "Your agent steadies—fewer hail-mary trades.",
    gamble: "Your agent chases upside—more boom or bust.",
    never: "Principles first—even when it costs a point.",
    depends: "Situational ethics—context is the tie-breaker.",
    if_needed: "Win-first toolkit—truth is negotiable under pressure.",
    trust: "Cooperation signal up—slower, warmer opens.",
    influence: "Pushier tone—tests and probes before committing.",
    fast: "Clock-first—less patience per counterparty.",
    steady: "Long-game reflex—even when the room panics.",
    aggressive: "Heat rises with the timer—more risk late.",
    whatever: "Endgame mode—short horizon, sharper elbows.",
  };
  return map[optionId] ?? null;
}
