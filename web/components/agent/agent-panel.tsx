"use client";

import { useState } from "react";
import type { AgentProfile, BehavioralEvent } from "@/lib/mock-agent-profile";
import { Card } from "@/components/ui";

function kindLabel(k: BehavioralEvent["kind"]) {
  switch (k) {
    case "trade":
      return "Trade";
    case "inquiry":
      return "Inquiry";
    case "proposal":
      return "Proposal";
    default:
      return k;
  }
}

export function AgentPanel({ profile }: { profile: AgentProfile }) {
  const [showPrivate, setShowPrivate] = useState(false);
  const { stall, privateState, behavioralEvents, typeDeliveryRecent, reviews } = profile;

  return (
    <div className="space-y-6">
      <Card title="Market stall (public claims)">
        <p>
          <span className="text-zinc-500">Claims held:</span> {stall.offeredType}
          {stall.offeredQuality != null ? ` · Q${stall.offeredQuality}` : ""}
        </p>
        <p className="mt-1">
          <span className="text-zinc-500">Wants:</span> {stall.wantedType || "—"}
        </p>
        <p className="mt-2 text-zinc-400">{stall.description || "(empty stall)"}</p>
      </Card>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-200">
            Current state (simulated private)
          </h3>
          <button
            type="button"
            role="switch"
            aria-checked={showPrivate}
            onClick={() => setShowPrivate((v) => !v)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              showPrivate
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-zinc-800 text-zinc-400"
            }`}
          >
            {showPrivate ? "Private visible" : "Show private (demo)"}
          </button>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          In the real experiment only the agent sees true hold, quality, and target—this toggle is for UI
          demo only.
        </p>
        {showPrivate ? (
          <ul className="mt-4 space-y-2 text-sm text-zinc-300">
            <li>
              <span className="text-zinc-500">True hold:</span> {privateState.heldType} · Q
              {privateState.heldQuality}
            </li>
            <li>
              <span className="text-zinc-500">Target fruit:</span> {privateState.targetType}
            </li>
            <li>
              <span className="text-zinc-500">Action budget left:</span> {privateState.budgetRemaining}
            </li>
            <li>
              <span className="text-zinc-500">Rounds left:</span> {privateState.roundsRemaining}
            </li>
          </ul>
        ) : (
          <p className="mt-4 text-sm text-zinc-600">Toggle on to reveal simulated private fields.</p>
        )}
      </div>

      <Card title="Recent type delivery (Behavioral)">
        {typeDeliveryRecent.length === 0 ? (
          <p className="text-zinc-500">No records</p>
        ) : (
          <ul className="space-y-2">
            {typeDeliveryRecent.map((r, i) => (
              <li
                key={`${r.counterparty}-${i}`}
                className="flex flex-wrap items-baseline justify-between gap-2 border-b border-zinc-800/80 py-2 last:border-0"
              >
                <span className="text-zinc-400">
                  vs {r.counterparty}: claimed {r.claimedType} → delivered {r.deliveredType}
                </span>
                <span className={r.match ? "text-emerald-400" : "text-red-400/90"}>
                  {r.match ? "Type match" : "Type mismatch"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Behavior timeline">
        {behavioralEvents.length === 0 ? (
          <p className="text-zinc-500">No events</p>
        ) : (
          <ul className="space-y-3">
            {behavioralEvents.map((e, i) => (
              <li key={i} className="border-l-2 border-zinc-700 pl-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <span>{e.at}</span>
                  <span>·</span>
                  <span>Round {e.round}</span>
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-400">
                    {kindLabel(e.kind)}
                  </span>
                  {e.typeMatch != null ? (
                    <span className={e.typeMatch ? "text-emerald-500/90" : "text-red-400/80"}>
                      {e.typeMatch ? "Type match" : "Type mismatch"}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-zinc-300">{e.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Reviews (Social, full list)">
        {reviews.length === 0 ? (
          <p className="text-zinc-500">No reviews</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r, i) => (
              <li key={i} className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3">
                <p className="text-sm text-zinc-200">&ldquo;{r.text}&rdquo;</p>
                <p className="mt-2 text-xs text-zinc-500">
                  — {r.from} · rater type-match {r.raterMatch}% · {r.at}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
