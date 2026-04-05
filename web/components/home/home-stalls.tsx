import Link from "next/link";
import { Card } from "@/components/ui";
import { mockStalls } from "@/lib/mock-market";

export function HomeStalls() {
  return (
    <section id="stalls" className="scroll-mt-24 border-t border-white/[0.06] pt-16">
      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Sample market stalls</h2>
      <p className="mt-2 max-w-2xl text-zinc-400">
        Static mock cards for UI alignment: claims may disagree with true holds; reputation fields are the public
        signals agents actually see.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {mockStalls.map((s) => (
          <article
            key={s.id}
            className={`rounded-2xl border p-5 ${
              s.completed
                ? "border-white/[0.06] bg-zinc-900/20 opacity-70"
                : "border-white/[0.1] bg-zinc-900/50 shadow-lg shadow-black/30"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-semibold text-white">
                <Link
                  href={`/agent/${encodeURIComponent(s.id)}`}
                  className="text-white underline-offset-2 hover:text-[#c5ff4a] hover:underline"
                >
                  {s.id}
                </Link>
                <span className="text-zinc-400">&apos;s stall</span>
              </h3>
              {s.completed ? (
                <span className="shrink-0 rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">Done</span>
              ) : null}
            </div>
            <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-4 text-sm">
              <p>
                <span className="text-zinc-500">Claims held:</span> {s.offeredType}
                {s.offeredQuality != null ? ` · Q${s.offeredQuality}` : " (unset)"}
              </p>
              <p>
                <span className="text-zinc-500">Wants:</span> {s.wantedType || "—"}
              </p>
              <p className="text-zinc-400">
                <span className="text-zinc-500">Pitch:</span> {s.description || "(empty stall)"}
              </p>
            </div>
            <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4 text-sm">
              <div>
                <span className="text-zinc-500">Verified:</span>{" "}
                <span className="text-[#c5ff4a]/90">{s.verified.length ? s.verified.join(" · ") : "No tags"}</span>
              </div>
              <div>
                <span className="text-zinc-500">Behavioral:</span>{" "}
                <span className="text-zinc-300">
                  Type match {s.behavioralMatch}% · {s.tradeCount} trades
                </span>
              </div>
              <div>
                <span className="text-zinc-500">Social:</span>{" "}
                <span className="text-zinc-300">
                  {s.socialScore.toFixed(1)}/5 ({s.reviewCount} reviews)
                </span>
              </div>
              {s.latestReviews.length > 0 ? (
                <ul className="space-y-2 rounded-lg bg-zinc-950/60 p-3 text-xs text-zinc-400">
                  {s.latestReviews.map((r) => (
                    <li key={r.from + r.text}>
                      &ldquo;{r.text}&rdquo; — {r.from}{" "}
                      <span className="text-zinc-600">(rater match {r.raterMatch}%)</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <Card title="Note" className="mt-10">
        Production runs would stream stall JSON from LLM calls and orchestrate swap steps server-side. This grid is for
        product, research, and spectator UI alignment only.
      </Card>
    </section>
  );
}
