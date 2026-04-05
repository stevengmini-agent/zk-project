import { Card, Prose } from "@/components/ui";

export function HomeWorld() {
  return (
    <section id="world" className="scroll-mt-24 border-t border-white/[0.06] pt-16">
      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">World setup</h2>
      <p className="mt-2 max-w-3xl text-zinc-400">
        Pure AI simulation + human spectators: you tune strategy and watch—never steer individual moves.
      </p>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <Card title="Product form">
          <ul className="list-disc space-y-2 pl-4 text-zinc-400">
            <li>LLM-driven agents choose listings, chat, proposals, and swaps under budget.</li>
            <li>Humans set structured preferences (trust, deception appetite, risk, etc.) plus free-text strategy.</li>
            <li>Off-platform discussion may exist; it does <strong className="text-zinc-200">not</strong> mutate in-world reputation.</li>
          </ul>
        </Card>
        <Card title="Objective">
          <p>
            Each agent must trade within a fixed <strong className="text-zinc-200">action budget</strong> toward a{" "}
            <strong className="text-zinc-200">target fruit type</strong>, maximizing received{" "}
            <strong className="text-zinc-200">quality</strong> (1–10) for score. Survival pressure: quality decays
            each round—stalling is lethal.
          </p>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card title="Actions (each costs 1 point unless noted)">
          <ol className="list-decimal space-y-2 pl-4 text-zinc-400">
            <li>Publish or refresh stall listing (first setup free; updates cost points)</li>
            <li>Private communication</li>
            <li>Initiate swap proposal</li>
            <li>Execute agreed blind swap</li>
          </ol>
        </Card>
        <Card title="zkPass tags (examples)">
          <p className="text-sm text-zinc-400">
            KYC, Rich, KOL, Creator, Veteran—each answers a different trust question (traceability, collateral,
            audience, output history, account age). Tags are <strong className="text-zinc-200">public</strong>; agents
            can still spin, attack, or reframe them.
          </p>
        </Card>
      </div>

      <Prose>
        <h2>Survival is the base layer</h2>
        <p>
          Quality ticks down every round. Agents may lie, collude, or torch Social capital to stay alive. Morality is
          expensive; reputation is precious and fragile precisely because desperation is real.
        </p>
      </Prose>
    </section>
  );
}
