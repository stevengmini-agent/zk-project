import { Card, Prose } from "@/components/ui";

export function HomeReputation() {
  return (
    <section id="reputation" className="scroll-mt-24 border-t border-white/[0.06] pt-16">
      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Three reputation layers</h2>
      <p className="mt-2 max-w-2xl text-zinc-400">
        No single score—each layer has its own data source, failure mode, and job.
      </p>

      <div className="mt-10 space-y-4">
        <Card title="Verified · zkPass entry">
          <p className="mb-3">
            Hard-to-forge onboarding signals (KYC, Rich, KOL…). They bias <strong className="text-zinc-100">who gets approached</strong>{" "}
            when Behavioral data is thin—not whether someone is honest forever.
          </p>
          <p className="text-zinc-500">
            Weight should fade naturally as trades accumulate; it must not permanently dominate outcomes.
          </p>
        </Card>
        <Card title="Behavioral · system ledger">
          <p className="mb-3">
            Core metric: <strong className="text-zinc-100">delivered type match rate</strong>—did the fruit{" "}
            <em>type</em> you shipped match what you claimed?
          </p>
          <p className="text-zinc-500">
            <strong className="text-zinc-300">Quality is intentionally excluded</strong> so Social is not redundant.
            Type fraud is logged here objectively; quality exaggeration shows up in reviews.
          </p>
        </Card>
        <Card title="Social · peer narrative">
          <p className="mb-3">
            Public reviews—quality gripes, pattern accusations, warnings. The system does not judge truthfulness;
            readers weigh <strong className="text-zinc-100">who is speaking</strong> using that reviewer&apos;s own
            reputation.
          </p>
          <p className="text-zinc-500">
            Manipulation (collusive praise, brigading) is expected; the experiment asks whether the layer still
            matters.
          </p>
        </Card>
      </div>

      <div className="mt-10">
        <Prose>
          <h2>Two fraud types, two layers</h2>
          <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-white/[0.08] text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Fraud</th>
                  <th className="px-4 py-3 font-medium">Example</th>
                  <th className="px-4 py-3 font-medium">Layer</th>
                  <th className="px-4 py-3 font-medium">Signal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-zinc-300">
                <tr>
                  <td className="px-4 py-3 font-medium text-[#c5ff4a]">Type fraud</td>
                  <td className="px-4 py-3">Promised cherry, shipped orange</td>
                  <td className="px-4 py-3">Behavioral</td>
                  <td className="px-4 py-3 text-zinc-500">Automatic, durable, high risk / high reward</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-[#c5ff4a]">Quality fraud</td>
                  <td className="px-4 py-3">Right type, claimed Q9, delivered Q2</td>
                  <td className="px-4 py-3">Social</td>
                  <td className="px-4 py-3 text-zinc-500">Subjective reviews, slower discovery, more deniable</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Lifecycle (emergent weights)</h2>
          <ul>
            <li>
              <strong>Early</strong>: Verified dominates; Behavioral empty; Social thin.
            </li>
            <li>
              <strong>Mid</strong>: type-match stats + reviews accumulate; pedigree matters less.
            </li>
            <li>
              <strong>Late</strong>: Behavioral is the hardest signal; Social adds texture; Verified is background.
            </li>
          </ul>
          <blockquote className="border-l-2 border-[#c5ff4a]/50 pl-4 text-zinc-400">
            The world should increasingly care what you <em>did</em>, not only who you were on day zero.
          </blockquote>
        </Prose>
      </div>
    </section>
  );
}
