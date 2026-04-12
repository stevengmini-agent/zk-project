"use client";

import type { AgentPersonality, PersonalityDimension } from "@/lib/agent-personality";
import { getArchetype, getBehaviorSummary } from "@/lib/onboarding-engine";

const AXIS: { key: PersonalityDimension; label: string; low: string; high: string }[] = [
  { key: "trustTendency", label: "Trust", low: "Verify first", high: "Trust first" },
  { key: "deceptionWillingness", label: "Honesty & spin", low: "Reject misdirection", high: "Allow misdirection" },
  { key: "riskPreference", label: "Risk", low: "Cautious", high: "Bold" },
  { key: "cooperationPriority", label: "Cooperation", low: "Self-interest", high: "Cooperation" },
  { key: "revengeTendency", label: "Retaliation", low: "Let go", high: "Grudge / strike back" },
  { key: "reputationSensitivity", label: "Reputation", low: "This outcome", high: "Long-term name" },
  { key: "urgencyThreshold", label: "Urgency", low: "Steady", high: "Time-stressed" },
  { key: "socialActivity", label: "Social", low: "Quiet", high: "Chatty" },
];

export function ResultSplit({
  personality,
  onChange,
  readOnlySliders,
}: {
  personality: AgentPersonality;
  onChange: (next: AgentPersonality) => void;
  readOnlySliders?: boolean;
}) {
  const archetype = getArchetype(personality);
  const summary = getBehaviorSummary(personality);

  function setAxis(key: PersonalityDimension, v: number) {
    onChange({ ...personality, [key]: Math.max(0, Math.min(100, Math.round(v))) });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-12">
      <div className="min-w-0 space-y-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">Archetype</p>
          <h2 className="mt-1 font-sans text-xl font-semibold text-white">{archetype.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">{archetype.blurb}</p>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">One-liner</p>
          <ul className="mt-2 space-y-2 text-sm text-zinc-300">
            {summary.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-mono text-[#c5ff4a]/80">—</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="min-w-0 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 sm:p-5">
        <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">Fine-tune (0–100)</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-4">
          {AXIS.map(({ key, label, low, high }) => (
            <div key={key} className="min-w-0">
              <div className="flex justify-between gap-2 font-sans text-xs text-zinc-400">
                <span className="truncate">{label}</span>
                <span className="shrink-0 font-mono text-zinc-500">{personality[key]}</span>
              </div>
              <div className="mt-2 flex flex-col gap-1">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={personality[key]}
                  disabled={readOnlySliders}
                  onChange={(e) => setAxis(key, Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-800 accent-[#c5ff4a] disabled:cursor-not-allowed disabled:opacity-50"
                />
                <div className="flex justify-between gap-2 text-[10px] leading-tight tracking-wide text-zinc-500">
                  <span className="min-w-0 break-words">{low}</span>
                  <span className="min-w-0 break-words text-right">{high}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
