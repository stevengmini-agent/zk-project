"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AgentPersonality } from "@/lib/agent-personality";
import { normalizePersonality, savePersonality } from "@/lib/agent-personality";
import { loadDisplayName, markFirstVisitDone, saveDisplayName } from "@/lib/agent-display-name";
import { defaultSchemaScores, loadSchemaScores } from "@/lib/agent-schema-scores";
import {
  createAgent,
  getAgent,
  personalityToStrategyPatch,
  strategyDtoToPersonality,
  updateAgentStrategy,
} from "@/lib/api/agents";
import { ApiHttpError } from "@/lib/api-config";
import { migrateAgentLocalStorage } from "@/lib/agent-migrate";
import { PERSONALITY_QUESTIONS, computePersonalityFromChoices, personalityOneLineSummary } from "@/lib/personality-questions";
import { getOrCreateUserAgentId } from "@/lib/user-agent";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { OptionCard } from "@/components/onboarding/option-card";
import { ResultSplit } from "@/components/onboarding/result-split";
import { TerminalPrompt } from "@/components/onboarding/terminal-prompt";
import { useAppToast } from "@/components/providers/toast-provider";
import { btnPrimary, btnPrimarySpinner } from "@/components/ui/agent-ui";

const Q_TOTAL = PERSONALITY_QUESTIONS.length;

function OnboardWizard() {
  const router = useRouter();
  const { showToast } = useAppToast();
  const [agentId, setAgentId] = useState("");
  /** 0 intro; 1..Q_TOTAL questions; Q_TOTAL+1 results */
  const [step, setStep] = useState(0);
  const [choices, setChoices] = useState<("A" | "B")[]>([]);
  const [draftPersonality, setDraftPersonality] = useState<AgentPersonality | null>(null);
  const [createBusy, setCreateBusy] = useState(false);

  useEffect(() => {
    setAgentId(getOrCreateUserAgentId());
  }, []);

  const liveFromChoices = useMemo(() => computePersonalityFromChoices(choices), [choices]);

  useEffect(() => {
    if (step === Q_TOTAL + 1) {
      setDraftPersonality(computePersonalityFromChoices(choices));
    }
  }, [step, choices]);

  function handlePick(letter: "A" | "B") {
    if (step < 1 || step > Q_TOTAL) return;
    const qi = step - 1;
    setChoices((prev) => {
      const next = prev.slice(0, qi);
      next.push(letter);
      return next;
    });
    setStep((s) => s + 1);
  }

  function goBackFromQuestion() {
    if (step <= 1) {
      setStep(0);
      setChoices([]);
      return;
    }
    setChoices((c) => c.slice(0, step - 2));
    setStep((s) => s - 1);
  }

  function goBackFromResult() {
    setDraftPersonality(null);
    setStep(Q_TOTAL);
    setChoices((c) => c.slice(0, Q_TOTAL - 1));
  }

  async function handleCreateAgent() {
    const localId = agentId;
    const pers = draftPersonality ?? liveFromChoices;
    const name = loadDisplayName(localId)?.trim() || "Agent";
    const scores = loadSchemaScores(localId) ?? defaultSchemaScores();

    setCreateBusy(true);
    try {
      const created = await createAgent({
        name,
        kyc_score: scores.kyc,
        rich_score: scores.rich,
        kol_score: scores.kol,
        creator_score: scores.creator,
        veteran_score: scores.veteran,
      });

      migrateAgentLocalStorage(localId, created.agent_id);

      await updateAgentStrategy(created.agent_id, personalityToStrategyPatch(pers));

      const detail = await getAgent(created.agent_id);

      if (detail.strategy) {
        savePersonality(created.agent_id, strategyDtoToPersonality(detail.strategy));
      } else {
        savePersonality(created.agent_id, normalizePersonality(pers));
      }
      saveDisplayName(created.agent_id, detail.display_name);
      markFirstVisitDone(created.agent_id);
      router.push("/agent");
    } catch (e) {
      const msg =
        e instanceof ApiHttpError ? `${e.message} (${e.status})` : e instanceof Error ? e.message : "Create failed";
      showToast(msg, "error");
    } finally {
      setCreateBusy(false);
    }
  }

  if (!agentId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 font-mono text-sm text-zinc-500">Loading…</div>
    );
  }

  if (step === 0) {
    return (
      <OnboardingShell
        progress={false}
        title="Calibrate your agent"
        subtitle="Sixteen A/B questions produce eight behavior axes for this offline demo’s chat and watch tone—not production proofs."
        footer={
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/agent"
              className="font-mono text-xs text-zinc-500 underline-offset-4 hover:text-[#c5ff4a]"
            >
              Back to agent
            </Link>
            <button type="button" onClick={() => setStep(1)} className={btnPrimary}>
              Begin
            </button>
          </div>
        }
      >
        <TerminalPrompt>guided — personality lab (this browser)</TerminalPrompt>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400">
          No on-chain identity yet—this step only calibrates behavior. When you finish, we save locally for this browser’s
          agent demo.
        </p>
      </OnboardingShell>
    );
  }

  if (step >= 1 && step <= Q_TOTAL) {
    const q = PERSONALITY_QUESTIONS[step - 1]!;
    return (
      <OnboardingShell
        progress={{ current: step, total: Q_TOTAL }}
        title={q.text}
        subtitle="Pick A or B—you’ll advance automatically."
        footer={
          <button
            type="button"
            onClick={goBackFromQuestion}
            className="font-mono text-xs text-zinc-500 hover:text-zinc-400"
          >
            ← back
          </button>
        }
      >
        <div className="mt-2 space-y-2">
          <OptionCard prefix="A" label={q.optionA} selected={false} onSelect={() => handlePick("A")} />
          <OptionCard prefix="B" label={q.optionB} selected={false} onSelect={() => handlePick("B")} />
        </div>
      </OnboardingShell>
    );
  }

  const displayP = draftPersonality ?? liveFromChoices;

  return (
    <OnboardingShell
      wide
      progress={{ current: Q_TOTAL, total: Q_TOTAL }}
      title="Your agent personality profile"
      subtitle="Eight axes (0–100) plus a one-liner. Adjust sliders, then enter the app."
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={goBackFromResult}
            disabled={createBusy}
            className="font-mono text-xs text-zinc-500 hover:text-zinc-400 disabled:opacity-40"
          >
            ← back
          </button>
          <button
            type="button"
            onClick={() => void handleCreateAgent()}
            disabled={createBusy}
            aria-busy={createBusy}
            className={`${btnPrimary} inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2`}
          >
            {createBusy ? <span className={btnPrimarySpinner} aria-hidden /> : null}
            Create agent
          </button>
        </div>
      }
    >
      <p className="font-mono text-xs text-[#c5ff4a]/90">{personalityOneLineSummary(displayP)}</p>
      <div className="mt-6">
        <ResultSplit personality={displayP} onChange={setDraftPersonality} />
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
