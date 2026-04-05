/** Four-axis model used only inside the Q&A wizard before mapping to storage. */

export type OnboardingPersonality = {
  moral: number;
  risk: number;
  social: number;
  time: number;
};

export type OnboardingStepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type AnswerState = {
  goal?: "win_tasks" | "survive" | "relationships" | "flexible";
  riskChoice?: "stable" | "gamble";
  moralChoice?: "never" | "depends" | "if_needed";
  socialChoice?: "trust" | "influence" | "fast";
  pressureChoice?: "steady" | "aggressive" | "whatever";
};

export const ONBOARDING_INITIAL: OnboardingPersonality = {
  moral: 50,
  risk: 50,
  social: 50,
  time: 50,
};
