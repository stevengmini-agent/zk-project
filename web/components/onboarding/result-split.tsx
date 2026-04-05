"use client";

import type { OnboardingPersonality } from "@/lib/onboarding-types";
import { getArchetype, getBehaviorSummary } from "@/lib/onboarding-engine";

const AXIS: { key: keyof OnboardingPersonality; label: string; low: string; high: string }[] = [
  { key: "moral", label: "Principles", low: "Flexible", high: "Firm" },
  { key: "risk", label: "Risk", low: "Safe", high: "Bold" },
  { key: "social", label: "Social", low: "Pushy", high: "Cooperative" },
  { key: "time", label: "Horizon", low: "Now", high: "Later" },
];

export function ResultSplit({
  personality,
  onChange,
  readOnlySliders,
}: {
  personality: OnboardingPersonality;
  onChange: (next: OnboardingPersonality) => void;
  readOnlySliders?: boolean;
}) {
  const archetype = getArchetype(personality);
  const summary = getBehaviorSummary(personality);

  function setAxis(key: keyof OnboardingPersonality, v: number) {
    onChange({ ...personality, [key]: Math.max(0, Math.min(100, v)) });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
      <div className="space-y-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">Archetype</p>
          <h2 className="mt-1 font-sans text-xl font-semibold text-white">{archetype.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">{archetype.blurb}</p>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">Behavior sketch</p>
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
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
        <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">Fine-tune (0–100)</p>
        <div className="mt-4 space-y-5">
          {AXIS.map(({ key, label, low, high }) => (
            <div key={key}>
              <div className="flex justify-between font-sans text-xs text-zinc-400">
                <span>{label}</span>
                <span className="font-mono text-zinc-500">{personality[key]}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-600">
                <span>{low}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={personality[key]}
                  disabled={readOnlySliders}
                  onChange={(e) => setAxis(key, Number(e.target.value))}
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-zinc-800 accent-[#c5ff4a] disabled:cursor-not-allowed disabled:opacity-50"
                />
                <span>{high}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
