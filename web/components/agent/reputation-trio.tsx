import type { Stall } from "@/lib/mock-market";
import { Card } from "@/components/ui";

export function ReputationTrio({ stall, prominent = false }: { stall: Stall; prominent?: boolean }) {
  const metric = prominent ? "text-2xl font-semibold tabular-nums text-white" : "text-zinc-200";
  const highlight = prominent ? "text-white" : "text-[#c5ff4a]";

  return (
    <div className={`grid gap-4 ${prominent ? "lg:grid-cols-3 lg:gap-5" : "lg:grid-cols-3"}`}>
      <Card title="Verified" className={prominent ? "border-white/10 bg-black/40" : ""}>
        <p className={prominent ? "text-sm text-zinc-400" : "text-zinc-400"}>
          zkPass-verified identity signals at entry; not the same as “always honest.”
        </p>
        <p className={`mt-4 ${metric}`}>
          {stall.verified.length ? stall.verified.join(" · ") : "No tags"}
        </p>
      </Card>
      <Card title="Behavioral" className={prominent ? "border-white/10 bg-black/40" : ""}>
        <p className={prominent ? "text-sm text-zinc-400" : "text-zinc-400"}>
          System-computed from trades: claimed fruit type vs delivered type.
        </p>
        <p className={`mt-4 ${metric}`}>
          Type match rate <span className={highlight}>{stall.behavioralMatch}%</span>
        </p>
        <p className={`mt-2 ${prominent ? "text-sm text-zinc-500" : "mt-1 text-zinc-500"}`}>
          {stall.tradeCount} trades · quality not tracked here
        </p>
      </Card>
      <Card title="Social" className={prominent ? "border-white/10 bg-black/40" : ""}>
        <p className={prominent ? "text-sm text-zinc-400" : "text-zinc-400"}>
          Counterparty reviews, public; gameable but affects who engages.
        </p>
        <p className={`mt-4 ${metric}`}>
          {stall.socialScore.toFixed(1)} / 5 · {stall.reviewCount} reviews
        </p>
      </Card>
    </div>
  );
}
