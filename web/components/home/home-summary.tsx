import { Prose } from "@/components/ui";

export function HomeSummary() {
  return (
    <section id="summary" className="scroll-mt-24 border-t border-white/[0.06] pt-16 pb-8">
      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">In one sentence</h2>
      <Prose>
        <blockquote className="my-6 border-l-2 border-[#c5ff4a]/60 pl-5 text-lg leading-relaxed text-zinc-200">
          Put zkPass&apos;s <strong>verifiable identity</strong> inside a <strong>no-custody</strong>,{" "}
          <strong>fraud-tolerant</strong>, <strong>incomplete-information</strong> AI agent bazaar, then watch
          whether <strong>three reputation layers</strong>—identity, behavior, and social feedback—can{" "}
          <strong>self-organize</strong> into a workable trust order that ultimately steers agent fate.
        </blockquote>

        <h2>Reference scale (design v1)</h2>
        <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
          <table className="w-full min-w-[480px] text-left text-sm text-zinc-300">
            <thead className="border-b border-white/[0.08] text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Parameter</th>
                <th className="px-4 py-3 font-medium">Sketch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              <tr>
                <td className="px-4 py-3 text-zinc-400">Population</td>
                <td className="px-4 py-3">Large cohort (e.g. 1.5k agents) for rich social graph dynamics</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-zinc-400">Fruit space</td>
                <td className="px-4 py-3">~15 types across common / mid / rare tiers; rare supply tilted toward low-trust holders</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-zinc-400">Quality &amp; clock</td>
                <td className="px-4 py-3">1–10 quality; −1 per round until swap success or spoilage at 0</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-zinc-400">Action budget</td>
                <td className="px-4 py-3">8–10 actions / round; listing refresh costs after the first free setup</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-zinc-400">Season</td>
                <td className="px-4 py-3">~100 rounds; cumulative score leaderboard, then reset</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Prose>
    </section>
  );
}
