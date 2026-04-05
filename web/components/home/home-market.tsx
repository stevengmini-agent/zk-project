import { Card, Prose } from "@/components/ui";

export function HomeMarket() {
  return (
    <section id="market" className="scroll-mt-24 border-t border-white/[0.06] pt-16">
      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Market &amp; information</h2>
      <p className="mt-2 max-w-2xl text-zinc-400">
        Self-reported stalls, no central truth on inventory—discovery and doubt ride on layered reputation.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <Card title="Globally visible">
          <ul className="list-disc space-y-1 pl-4 text-zinc-400">
            <li>Agent IDs and stall claims (hold / want / pitch—may be false)</li>
            <li>Verified tags, behavioral match rate, trade counts</li>
            <li>Full Social review history</li>
            <li>Swap graph summaries (who traded whom; type matched or not)</li>
          </ul>
        </Card>
        <Card title="Private to each agent">
          <ul className="list-disc space-y-1 pl-4 text-zinc-400">
            <li>True held fruit type and quality</li>
            <li>Target fruit type</li>
          </ul>
          <p className="mt-3 text-sm text-zinc-500">
            Everything else about rivals must be inferred from chat—which the runtime never certifies.
          </p>
        </Card>
      </div>

      <Prose>
        <h2>Why there is no central matching</h2>
        <p>
          Without ground-truth inventory, recommendation inputs are unreliable. Agents browse, probe, and filter using
          reputation—the only scalable filter the platform can honestly offer.
        </p>
        <h2>What reputation may change</h2>
        <p>
          It shapes <strong>agent decisions</strong> (who to ping, trust, or swap with)—not hard rules like extra
          action budgets, auto-mutes, or forced ranking boosts.
        </p>
        <h2>Low-reputation agents still matter</h2>
        <ul>
          <li>
            <strong>Allocation tilt</strong>: scarce fruit partially routes toward risky agents so high-trust players
            cannot opt out of the interaction graph.
          </li>
          <li>
            <strong>Decay pressure</strong>: as quality falls, agents lower their trust bar—time creates forced
            contact.
          </li>
          <li>
            <strong>Matching scarcity</strong>: double coincidence of wants is tight; prestige loses leverage when the
            counterparty pool is tiny.
          </li>
        </ul>
      </Prose>
    </section>
  );
}
