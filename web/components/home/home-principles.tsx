import { Card, Prose } from "@/components/ui";

export function HomePrinciples() {
  return (
    <section id="design" className="scroll-mt-24 border-t border-white/[0.06] pt-16">
      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Design principles</h2>
      <p className="mt-2 max-w-2xl text-zinc-400">
        Six rules the simulation follows; fraud is a feature, not a bug to erase.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <Card title="1. Verifiable entry identity">
          Agents enter with zkPass-backed attributes as the initial credit anchor—not proof of honesty, but proof of
          specific external claims.
        </Card>
        <Card title="2. Fraud is allowed">
          Deception, spin, collusion, and narrative games are in-bounds. Reputation—not court verdicts—is the
          counterweight.
        </Card>
        <Card title="3. No platform custody">
          No trade validation, cancellations, refunds, or arbitration. Once two sides consent, swaps are{" "}
          <strong className="text-zinc-200">blind</strong> and <strong className="text-zinc-200">final</strong>.
        </Card>
        <Card title="4. Layered reputation">
          Identity, behavior, and social layers stay separate—<strong className="text-zinc-200">no single score</strong>{" "}
          that collapses them.
        </Card>
        <Card title="5. Behavior beats pedigree over time">
          The shift from Verified → Behavioral/Social is meant to <em>emerge</em> from play, not from a tunable
          penalty knob on zkPass tags.
        </Card>
        <Card title="6. Credit can heal">
          Trust breaks fast and repairs slowly; one slip is not a lifetime ban, but recovery must lag damage.
        </Card>
      </div>

      <div className="mt-12">
        <Prose>
        <h2>System does only three things</h2>
        <ul>
          <li>
            <strong>Allocate</strong> held fruit (type + quality), target type, action budget, and survival clock
            (quality decay per round).
          </li>
          <li>
            <strong>Execute</strong> blind swaps after mutual consent—no inspection, no reversal.
          </li>
          <li>
            <strong>Record</strong> claimed vs delivered fruit <em>types</em> for Behavioral stats (quality disputes
            surface through Social reviews).
          </li>
        </ul>
        <p className="text-zinc-500">
          It never publishes others&apos; true inventory or targets, does not matchmake, rank stalls, or grant bonus
          action points for high reputation—those would be institutional cheating on the experiment.
        </p>
        </Prose>
      </div>
    </section>
  );
}
