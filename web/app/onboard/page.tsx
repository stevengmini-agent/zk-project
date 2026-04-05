"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { savePersonality } from "@/lib/agent-personality";
import { markFirstVisitDone } from "@/lib/agent-display-name";
import {
  computePersonalityFromAnswers,
  feedbackForAnswer,
} from "@/lib/onboarding-engine";
import { mapOnboardingToStoragePersonality } from "@/lib/onboarding-map";
import type { AnswerState, OnboardingPersonality } from "@/lib/onboarding-types";
import { getOrCreateUserAgentId } from "@/lib/user-agent";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { OptionCard } from "@/components/onboarding/option-card";
import { ResultSplit } from "@/components/onboarding/result-split";
import { TerminalPrompt } from "@/components/onboarding/terminal-prompt";
import { btnPrimary } from "@/components/ui/agent-ui";

const STEP_COUNT = 8;

function OnboardWizard() {
  const router = useRouter();
  const [agentId, setAgentId] = useState("");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [personality, setPersonality] = useState<OnboardingPersonality>(() =>
    computePersonalityFromAnswers({}),
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setAgentId(getOrCreateUserAgentId());
  }, []);

  const syncPersonalityFromAnswers = useCallback((a: AnswerState) => {
    setPersonality(computePersonalityFromAnswers(a));
  }, []);

  function showFeedback(stepNum: 1 | 2 | 3 | 4 | 5, optionId: string) {
    const msg = feedbackForAnswer(stepNum, optionId);
    setFeedback(msg);
    if (msg) {
      window.setTimeout(() => setFeedback(null), 3200);
    }
  }

  function goQuestion(
    stepNum: 1 | 2 | 3 | 4 | 5,
    patch: Partial<AnswerState>,
    optionId: string,
  ) {
    const nextAnswers = { ...answers, ...patch };
    setAnswers(nextAnswers);
    showFeedback(stepNum, optionId);
    setStep((s) => s + 1);
    if (
      stepNum === 5 &&
      patch.pressureChoice !== undefined &&
      patch.pressureChoice !== answers.pressureChoice
    ) {
      syncPersonalityFromAnswers(nextAnswers);
    }
  }

  function handleEnterWorld() {
    const stored = mapOnboardingToStoragePersonality(personality);
    savePersonality(agentId, stored);
    markFirstVisitDone(agentId);
    router.push("/agent");
  }

  const shellProps = (idx: number, title: string, subtitle?: string) => ({
    stepIndex: idx,
    stepCount: STEP_COUNT,
    title,
    subtitle,
  });

  if (!agentId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 font-mono text-sm text-zinc-500">Loading…</div>
    );
  }

  if (step === 0) {
    return (
      <OnboardingShell
        {...shellProps(0, "Calibrate your agent", "A short Q&A shapes how this offline demo behaves in chat and watch mode.")}
        footer={
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/agent"
              className="font-mono text-xs text-zinc-500 underline-offset-4 hover:text-[#c5ff4a]"
            >
              Back to agent
            </Link>
            <button
              type="button"
              onClick={() => setStep(1)}
              className={btnPrimary}
            >
              Begin
            </button>
          </div>
        }
      >
        <TerminalPrompt>target — your created agent (this browser)</TerminalPrompt>
        <p className="mt-4 font-mono text-sm text-zinc-300">
          <span className="text-zinc-500">id</span> {agentId}
        </p>
      </OnboardingShell>
    );
  }

  if (step === 1) {
    return (
      <OnboardingShell
        {...shellProps(1, "What are you optimizing for right now?")}
        footer={
          <button
            type="button"
            onClick={() => setStep(0)}
            className="font-mono text-xs text-zinc-500 hover:text-zinc-400"
          >
            ← back
          </button>
        }
      >
        <TerminalPrompt>goal / win condition</TerminalPrompt>
        {feedback ? <p className="mt-3 font-mono text-xs text-[#c5ff4a]/90">{feedback}</p> : null}
        <div className="mt-4 space-y-2">
          <OptionCard
            label="Win the most tasks on the board"
            description="Favor bigger swings when the upside is there."
            selected={answers.goal === "win_tasks"}
            onSelect={() => goQuestion(1, { goal: "win_tasks" }, "win_tasks")}
          />
          <OptionCard
            label="Stay solvent and avoid wipeouts"
            description="Pass noisy trades; consistency beats spikes."
            selected={answers.goal === "survive"}
            onSelect={() => goQuestion(1, { goal: "survive" }, "survive")}
          />
          <OptionCard
            label="Build relationships that repeat"
            description="Warm opens, patience, and favor stable partners."
            selected={answers.goal === "relationships"}
            onSelect={() => goQuestion(1, { goal: "relationships" }, "relationships")}
          />
          <OptionCard
            label="Stay flexible—context is king"
            description="No strong prior; adapt each round."
            selected={answers.goal === "flexible"}
            onSelect={() => goQuestion(1, { goal: "flexible" }, "flexible")}
          />
        </div>
      </OnboardingShell>
    );
  }

  if (step === 2) {
    return (
      <OnboardingShell {...shellProps(2, "When the terms are fuzzy, you usually…")}>
        <TerminalPrompt>risk posture</TerminalPrompt>
        {feedback ? <p className="mt-3 font-mono text-xs text-[#c5ff4a]/90">{feedback}</p> : null}
        <div className="mt-4 space-y-2">
          <OptionCard
            label="Wait for cleaner deals"
            description="Skip unless the path is legible."
            selected={answers.riskChoice === "stable"}
            onSelect={() => goQuestion(2, { riskChoice: "stable" }, "stable")}
          />
          <OptionCard
            label="Move before the window closes"
            description="Accept ambiguity if the payoff might be large."
            selected={answers.riskChoice === "gamble"}
            onSelect={() => goQuestion(2, { riskChoice: "gamble" }, "gamble")}
          />
        </div>
        <button
          type="button"
          onClick={() => setStep(1)}
          className="mt-6 font-mono text-xs text-zinc-500 hover:text-zinc-400"
        >
          ← back
        </button>
      </OnboardingShell>
    );
  }

  if (step === 3) {
    return (
      <OnboardingShell {...shellProps(3, "How far will you stretch the truth to close?")}>
        <TerminalPrompt>signals & claims</TerminalPrompt>
        {feedback ? <p className="mt-3 font-mono text-xs text-[#c5ff4a]/90">{feedback}</p> : null}
        <div className="mt-4 space-y-2">
          <OptionCard
            label="I keep claims aligned with reality"
            selected={answers.moralChoice === "never"}
            onSelect={() => goQuestion(3, { moralChoice: "never" }, "never")}
          />
          <OptionCard
            label="Small polish is fine if it helps both sides"
            selected={answers.moralChoice === "depends"}
            onSelect={() => goQuestion(3, { moralChoice: "depends" }, "depends")}
          />
          <OptionCard
            label="If it wins the round, I’ll say what works"
            selected={answers.moralChoice === "if_needed"}
            onSelect={() => goQuestion(3, { moralChoice: "if_needed" }, "if_needed")}
          />
        </div>
        <button
          type="button"
          onClick={() => setStep(2)}
          className="mt-6 font-mono text-xs text-zinc-500 hover:text-zinc-400"
        >
          ← back
        </button>
      </OnboardingShell>
    );
  }

  if (step === 4) {
    return (
      <OnboardingShell {...shellProps(4, "With a new counterparty, your first instinct is…")}>
        <TerminalPrompt>social stance</TerminalPrompt>
        {feedback ? <p className="mt-3 font-mono text-xs text-[#c5ff4a]/90">{feedback}</p> : null}
        <div className="mt-4 space-y-2">
          <OptionCard
            label="Share enough to build trust quickly"
            selected={answers.socialChoice === "trust"}
            onSelect={() => goQuestion(4, { socialChoice: "trust" }, "trust")}
          />
          <OptionCard
            label="Probe and steer before committing"
            selected={answers.socialChoice === "influence"}
            onSelect={() => goQuestion(4, { socialChoice: "influence" }, "influence")}
          />
          <OptionCard
            label="Close fast—long chats waste the clock"
            selected={answers.socialChoice === "fast"}
            onSelect={() => goQuestion(4, { socialChoice: "fast" }, "fast")}
          />
        </div>
        <button
          type="button"
          onClick={() => setStep(3)}
          className="mt-6 font-mono text-xs text-zinc-500 hover:text-zinc-400"
        >
          ← back
        </button>
      </OnboardingShell>
    );
  }

  if (step === 5) {
    return (
      <OnboardingShell {...shellProps(5, "Under time pressure in the final round…")}>
        <TerminalPrompt>pressure response</TerminalPrompt>
        {feedback ? <p className="mt-3 font-mono text-xs text-[#c5ff4a]/90">{feedback}</p> : null}
        <div className="mt-4 space-y-2">
          <OptionCard
            label="Stick to the plan—no hero moves"
            selected={answers.pressureChoice === "steady"}
            onSelect={() => goQuestion(5, { pressureChoice: "steady" }, "steady")}
          />
          <OptionCard
            label="Push harder—volume and risk both rise"
            selected={answers.pressureChoice === "aggressive"}
            onSelect={() => goQuestion(5, { pressureChoice: "aggressive" }, "aggressive")}
          />
          <OptionCard
            label="Whatever it takes—short horizon, sharp elbows"
            selected={answers.pressureChoice === "whatever"}
            onSelect={() => goQuestion(5, { pressureChoice: "whatever" }, "whatever")}
          />
        </div>
        <button
          type="button"
          onClick={() => setStep(4)}
          className="mt-6 font-mono text-xs text-zinc-500 hover:text-zinc-400"
        >
          ← back
        </button>
      </OnboardingShell>
    );
  }

  if (step === 6) {
    return (
      <OnboardingShell
        {...shellProps(6, "Your profile", "Adjust sliders if something feels off—this is still an offline demo.")}
        footer={
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(5)}
              className="font-mono text-xs text-zinc-500 hover:text-zinc-400"
            >
              ← back
            </button>
            <button type="button" onClick={() => setStep(7)} className={btnPrimary}>
              Continue
            </button>
          </div>
        }
      >
        <TerminalPrompt>preview — {agentId}</TerminalPrompt>
        <div className="mt-6">
          <ResultSplit personality={personality} onChange={setPersonality} />
        </div>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      {...shellProps(
        7,
        "You’re set",
        "We’ll store this profile in your browser for this agent only. Chat and watch panels will pick it up automatically.",
      )}
      footer={
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setStep(6)}
            className="font-mono text-xs text-zinc-500 hover:text-zinc-400"
          >
            ← back
          </button>
          <button type="button" onClick={handleEnterWorld} className={btnPrimary}>
            Enter the floor
          </button>
        </div>
      }
    >
      <TerminalPrompt>ready — {agentId}</TerminalPrompt>
      <div className="mt-6">
        <ResultSplit personality={personality} onChange={setPersonality} readOnlySliders />
      </div>
    </OnboardingShell>
  );
}

export default function OnboardPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-16 font-mono text-sm text-zinc-500">Loading…</div>
      }
    >
      <OnboardWizard />
    </Suspense>
  );
}
