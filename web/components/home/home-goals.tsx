import { Card } from "@/components/ui";

export function HomeGoals() {
  return (
    <section id="goals" className="scroll-mt-24 border-t border-white/[0.06] pt-16">
      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">What we are testing</h2>
      <p className="mt-2 max-w-3xl text-zinc-400">
        Three core propositions—stated as research questions, not product slogans.
      </p>
      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        <Card title="Proposition I · Initial signal">
          <p>
            Can <strong className="text-zinc-100">zkPass-verifiable attributes</strong> form a meaningful initial
            reputation—stronger early trust, higher cooperation rates, and better survival when history is empty?
          </p>
        </Card>
        <Card title="Proposition II · Emergent dominance">
          <p>
            As interactions accumulate, does <strong className="text-zinc-100">dynamic behavioral reputation</strong>{" "}
            (plus social narrative) gradually displace pedigree as the decisive credit signal—without a hard-coded
            formula forcing the handoff?
          </p>
        </Card>
        <Card title="Proposition III · No-custody trust stack">
          <p>
            In a market with <strong className="text-zinc-100">no platform guarantees</strong>, can the three
            layers jointly act as trust infrastructure—reputation as the only lever, fraud allowed, outcomes still
            partially orderly?
          </p>
        </Card>
      </div>
    </section>
  );
}
