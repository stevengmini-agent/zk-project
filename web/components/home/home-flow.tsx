import { Card } from "@/components/ui";

const budgetRules = [
  { action: "First stall setup each round", cost: "Free" },
  { action: "Mid-loop stall refresh", cost: "1 action" },
  { action: "Send inquiry (each message)", cost: "1 action" },
  { action: "Reply to inquiry", cost: "Free (passive)" },
  { action: "Send swap proposal (max 1 per loop)", cost: "1 action" },
  { action: "Accept / reject proposal", cost: "Free (passive)" },
];

const steps = [
  {
    phase: "Bootstrap",
    items: [
      "System assigns held fruit (type + quality), target type, budgets; ensures feasible swap paths",
      "Step 0: each agent sets a stall in one LLM call (may be empty or deceptive)",
      "Everyone sees stalls plus non-forgeable reputation fields",
    ],
  },
  {
    phase: "Phase 1 · Inquiries",
    items: [
      "Step 1: unfinished agents with budget broadcast inquiries in parallel (1 budget per message)",
      "Step 2: recipients reply in parallel for free—honest, lying, or silent per counterparty",
    ],
  },
  {
    phase: "Phase 2 · Swaps",
    items: [
      "Step 3: parallel swap proposals (≤1 per agent per loop, costs 1 action) or hold",
      "Step 4: recipients accept at most one proposal; others retry next loop",
      "Step 5: blind swap executes → qualities revealed → mutual public reviews (Social)",
    ],
  },
  {
    phase: "Loop exit",
    items: [
      "Acquire target fruit → task complete, exit market, score = delivered target quality",
      "Out of budget but still passive: can receive inquiries/proposals and respond/choose for free",
      "Stop when everyone finishes / stalled with no new traffic / hit max inner loops (e.g. 3)",
    ],
  },
];

export function HomeFlow() {
  return (
    <section id="flow" className="scroll-mt-24 border-t border-white/[0.06] pt-16">
      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Trading flow</h2>
      <p className="mt-2 max-w-2xl text-zinc-400">
        Nested trading loops per round: inquiries, then proposals, then blind swap + reviews. Agents inside a step run
        in parallel; steps are serial.
      </p>

      <div className="mt-10 overflow-x-auto rounded-xl border border-white/[0.08] bg-zinc-900/30 p-4 font-mono text-xs leading-relaxed text-zinc-400 sm:text-sm">
        <pre className="whitespace-pre text-left">
          {`┌─ Bootstrap ────────────────────────────────────┐
│ Assign fruit & targets → agents open stalls    │
└───────────────────────┬────────────────────────┘
                        ↓
┌─ Trading loop (≤3x) ───────────────────────────┐
│  P1: Step1 inquiries → Step2 replies           │
│  P2: Step3 proposals → Step4 accept/deny       │
│      Step5 blind swap + reviews                │
│  Exit if done / stalled / max loops            │
└────────────────────────────────────────────────┘
                        ↓
┌─ Round wrap: score → update reputation ─────────┐
└────────────────────────────────────────────────┘`}
        </pre>
      </div>

      <div className="mt-10 space-y-6">
        {steps.map((s) => (
          <Card key={s.phase} title={s.phase}>
            <ol className="list-decimal space-y-2 pl-4">
              {s.items.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
          </Card>
        ))}
      </div>

      <h3 className="mt-14 text-lg font-semibold text-zinc-100">Budget cheat sheet</h3>
      <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.08]">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900/80 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] text-zinc-300">
            {budgetRules.map((r) => (
              <tr key={r.action} className="bg-zinc-950/40">
                <td className="px-4 py-3">{r.action}</td>
                <td className="px-4 py-3 text-[#c5ff4a]/90">{r.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Card title="Parallelism" className="mt-8">
        <p>
          Within a step every agent&apos;s LLM call can run concurrently; the next step waits for all results. One
          inner loop spans ~6 steps, capped at three loops per round.
        </p>
      </Card>
    </section>
  );
}
