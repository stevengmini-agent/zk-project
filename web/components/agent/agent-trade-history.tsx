"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { AgentDetail } from "@/lib/api/agents";
import {
  type AgentRoundDetailResponse,
  type TradeSummaryRound,
  getAgentRoundDetail,
  getAgentTradeSummary,
} from "@/lib/api/agents";
import { useAppToast } from "@/components/providers/toast-provider";
import { useSeason } from "@/components/providers/season-provider";
import { isServerAgentId } from "@/lib/agent-id";
import { btnSecondary, modalSurface } from "@/components/ui/agent-ui";

/** Wheel/trackpad scroll only — no visible scrollbar (avoids nested panes). */
const modalBodyScroll =
  "min-h-0 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

const VERIFIED_LABELS: Record<keyof AgentDetail["verified_scores"], string> = {
  kyc: "KYC",
  rich: "Rich",
  kol: "KOL",
  creator: "Creator",
  veteran: "Vet",
};

/** Keys we already render explicitly on each trade-summary row. */
const TRADE_SUMMARY_ROW_CORE_KEYS = new Set([
  "round",
  "held",
  "target",
  "rounds_left",
  "traded",
  "got_target",
  "received",
  "partner",
]);

function humanizeSummaryKeyLabel(key: string): string {
  return key
    .replace(/_+/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
    .trim();
}

function stringifyTradeSummaryValue(v: unknown, depth = 0): string {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  if (depth > 2) return "…";
  if (Array.isArray(v)) {
    if (v.length === 0) return "—";
    const inner = v.slice(0, 5).map((x) => stringifyTradeSummaryValue(x, depth + 1));
    const tail = v.length > 5 ? ` (+${v.length - 5} more)` : "";
    return inner.join("; ") + tail;
  }
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    const t = o.type;
    const q = o.quality;
    if (typeof t === "string" && typeof q === "number") return `${t} (q${q})`;
    try {
      return JSON.stringify(v);
    } catch {
      return "[object]";
    }
  }
  return String(v);
}

function extraTradeSummaryFields(row: TradeSummaryRound): { label: string; value: string }[] {
  const obj = row as unknown as Record<string, unknown>;
  const out: { label: string; value: string }[] = [];
  for (const [key, val] of Object.entries(obj)) {
    if (TRADE_SUMMARY_ROW_CORE_KEYS.has(key)) continue;
    const value = stringifyTradeSummaryValue(val);
    if (!value) continue;
    out.push({ label: humanizeSummaryKeyLabel(key), value });
  }
  return out.sort((a, b) => a.label.localeCompare(b.label));
}

function pickStr(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

/** Never return a non-React-child; API may send objects for text fields. */
function safeDisplayText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return "[object]";
    }
  }
  return String(value);
}

/** `round_memory` may be JSON string or already an object / structured blob. */
function formatMemoryField(raw: unknown): string {
  if (raw == null) return "";
  if (typeof raw === "object") {
    return safeDisplayText(raw);
  }
  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) return "";
    try {
      const p = JSON.parse(t) as unknown;
      return typeof p === "string" ? p : JSON.stringify(p, null, 2);
    } catch {
      return t;
    }
  }
  return safeDisplayText(raw);
}

function timelineBorderClass(ev: unknown): string {
  if (ev == null || typeof ev !== "object") return "border-zinc-800 bg-zinc-950/50";
  const blob = JSON.stringify(ev).toLowerCase();
  if (blob.includes("reject")) return "border-red-500/45 bg-red-950/20";
  if (blob.includes("accept")) return "border-emerald-500/40 bg-emerald-950/15";
  return "border-zinc-800 bg-zinc-950/50";
}

function TimelineEntry({ ev, index }: { ev: unknown; index: number }) {
  if (ev == null) return null;
  if (typeof ev === "string") {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3 text-sm text-zinc-300">
        <span className="font-mono text-[10px] text-zinc-600">#{index + 1}</span>
        <p className="mt-1">{ev}</p>
      </div>
    );
  }
  if (typeof ev !== "object") {
    return (
      <div className="rounded-lg border border-zinc-800 p-3 font-mono text-xs text-zinc-400">{String(ev)}</div>
    );
  }
  const o = ev as Record<string, unknown>;
  const kind =
    pickStr(o.kind) ?? pickStr(o.type) ?? pickStr(o.event) ?? pickStr(o.action) ?? "Event";
  const body =
    pickStr(o.message) ??
    pickStr(o.content) ??
    pickStr(o.text) ??
    pickStr(o.summary) ??
    pickStr(o.description);
  const title = pickStr(o.title) ?? pickStr(o.label);

  return (
    <div className={`rounded-lg border p-3 text-sm ${timelineBorderClass(ev)}`}>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{kind}</span>
        {title && title !== kind ? <span className="text-xs text-zinc-400">{title}</span> : null}
      </div>
      {body ? (
        <p className="mt-2 whitespace-pre-wrap text-zinc-200">{body}</p>
      ) : (
        <pre className="mt-2 whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed text-zinc-500">
          {JSON.stringify(ev, null, 2)}
        </pre>
      )}
    </div>
  );
}

function RoundDetailPanels({
  summaryRow,
  detail,
  verifiedScores,
}: {
  summaryRow: TradeSummaryRound;
  detail: AgentRoundDetailResponse;
  verifiedScores?: AgentDetail["verified_scores"];
}) {
  const snapshot = detail.snapshot ?? {
    held_fruit_type: "—",
    held_fruit_quality: 0,
    target_fruit_type: "—",
    action_points: 0,
    status: "—",
    cumulative_score: 0,
  };
  const my_listing = detail.my_listing ?? null;
  const market_listings = Array.isArray(detail.market_listings) ? detail.market_listings : [];
  const timeline = Array.isArray(detail.timeline) ? detail.timeline : [];
  const outcome = detail.outcome ?? {
    completed: false,
    eliminated: false,
    score_gained: 0,
    fruit_after: null,
  };
  const fraud = detail.fraud
    ? {
        committed: Array.isArray(detail.fraud.committed) ? detail.fraud.committed : [],
        suffered: Array.isArray(detail.fraud.suffered) ? detail.fraud.suffered : [],
      }
    : { committed: [], suffered: [] };
  const round_memory = detail.round_memory ?? null;
  const comment = detail.comment ?? null;
  const memoryText = formatMemoryField(round_memory);
  const commentText = safeDisplayText(comment);
  const statusLabel = outcome.completed ? "COMPLETED" : snapshot.status?.toUpperCase() || "—";

  return (
    <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
      <div className="space-y-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Agent · round snapshot</p>
          <p className="mt-2 text-lg font-semibold text-white">
            Round {detail.round}
            <span className="ml-2 rounded border border-sky-500/40 bg-sky-500/15 px-2 py-0.5 font-mono text-xs font-medium uppercase text-sky-300">
              {statusLabel}
            </span>
          </p>
          {summaryRow.partner?.name ? (
            <p className="mt-1 text-sm text-zinc-500">Partner: {summaryRow.partner.name}</p>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-lg border border-white/[0.08]">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-white/[0.06]">
              <tr>
                <th className="bg-zinc-900/80 px-3 py-2 font-medium text-zinc-500">Holding</th>
                <td className="px-3 py-2 text-zinc-200">
                  {snapshot.held_fruit_type} (q{snapshot.held_fruit_quality})
                </td>
              </tr>
              <tr>
                <th className="bg-zinc-900/80 px-3 py-2 font-medium text-zinc-500">AP</th>
                <td className="px-3 py-2 text-zinc-200">{snapshot.action_points}</td>
              </tr>
              <tr>
                <th className="bg-zinc-900/80 px-3 py-2 font-medium text-zinc-500">Traded</th>
                <td className="px-3 py-2 text-zinc-200">{summaryRow.traded ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <th className="bg-zinc-900/80 px-3 py-2 font-medium text-zinc-500">Target</th>
                <td className="px-3 py-2 text-zinc-200">{snapshot.target_fruit_type}</td>
              </tr>
              <tr>
                <th className="bg-zinc-900/80 px-3 py-2 font-medium text-zinc-500">Score</th>
                <td className="px-3 py-2 text-zinc-200">
                  cumulative {snapshot.cumulative_score}
                  {outcome.score_gained != null ? ` · round +${outcome.score_gained}` : ""}
                </td>
              </tr>
              <tr>
                <th className="bg-zinc-900/80 px-3 py-2 font-medium text-zinc-500">Got target</th>
                <td className="px-3 py-2 text-zinc-200">{summaryRow.got_target ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <th className="bg-zinc-900/80 px-3 py-2 font-medium text-zinc-500">Eliminated</th>
                <td className="px-3 py-2 text-zinc-200">{outcome.eliminated ? "Yes" : "No"}</td>
              </tr>
              {outcome.fruit_after ? (
                <tr>
                  <th className="bg-zinc-900/80 px-3 py-2 font-medium text-zinc-500">Fruit after</th>
                  <td className="px-3 py-2 text-zinc-200">
                    {outcome.fruit_after.type} (q{outcome.fruit_after.quality})
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {verifiedScores ? (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Verified</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(Object.keys(VERIFIED_LABELS) as (keyof typeof VERIFIED_LABELS)[]).map((k) => (
                <span
                  key={k}
                  className="rounded-md border border-white/10 bg-zinc-950/60 px-2 py-1 font-mono text-xs text-zinc-300"
                >
                  {VERIFIED_LABELS[k]} <span className="text-[#c5ff4a]">{verifiedScores[k]}</span>
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {my_listing ? (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">My listing</p>
            <div className="mt-2 rounded-lg border border-white/[0.08] bg-zinc-950/40 p-3 text-sm text-zinc-300">
              <p>
                Claims: {my_listing.claimed_type} (q{my_listing.claimed_quality}) · wants {my_listing.wanted_type}
              </p>
              {my_listing.description ? (
                <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                  {safeDisplayText(my_listing.description)}
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="text-xs text-zinc-600">No listing this round.</p>
        )}

        {fraud.committed.length > 0 || (Array.isArray(fraud.suffered) && fraud.suffered.length > 0) ? (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Fraud</p>
            <ul className="mt-2 space-y-1 text-xs text-zinc-400">
              {fraud.committed.map((c, i) => (
                <li key={`c-${i}`} className="rounded border border-red-500/25 bg-red-950/20 px-2 py-1">
                  Committed vs {c.victim}: claimed {c.claimed}, actual {c.actual}
                </li>
              ))}
              {Array.isArray(fraud.suffered)
                ? fraud.suffered.map((s, i) => (
                    <li key={`s-${i}`} className="rounded border border-amber-500/25 bg-amber-950/15 px-2 py-1">
                      Suffered: {typeof s === "object" && s !== null ? JSON.stringify(s) : String(s)}
                    </li>
                  ))
                : null}
            </ul>
          </div>
        ) : null}

        {(memoryText.trim() || commentText.trim()) ? (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Memory & comment</p>
            {memoryText.trim() ? (
              <pre className="mt-2 whitespace-pre-wrap break-words rounded-lg border border-[#c5ff4a]/20 bg-[#c5ff4a]/5 p-3 font-sans text-xs leading-relaxed text-zinc-200">
                {memoryText}
              </pre>
            ) : null}
            {commentText.trim() ? (
              <p className="mt-2 text-sm italic text-zinc-400">&ldquo;{commentText}&rdquo;</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="space-y-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            Round {detail.round} timeline ({timeline.length} events)
          </p>
        </div>
        <div className="space-y-3">
          {timeline.length === 0 ? (
            <p className="text-sm text-zinc-600">No timeline events.</p>
          ) : (
            timeline.map((ev, i) => <TimelineEntry key={i} ev={ev} index={i} />)
          )}
        </div>

        {market_listings.length > 0 ? (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Market listings</p>
            <ul className="mt-2 space-y-2 text-xs">
              {market_listings.map((m) => (
                <li key={m.agent_id} className="rounded border border-white/[0.06] bg-zinc-950/50 px-2 py-2 text-zinc-400">
                  <span className="font-medium text-zinc-200">{m.display_name}</span>: {m.claimed_type} (q
                  {m.claimed_quality}) → wants {m.wanted_type}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AgentTradeHistory({
  agentId,
  verifiedScores,
}: {
  agentId: string;
  /** Current UI display name; trade summary returns its own display_name per season. */
  verifiedScores?: AgentDetail["verified_scores"];
}) {
  const { showToast } = useAppToast();
  const { seasonId, status: seasonStatus } = useSeason();
  const [rounds, setRounds] = useState<TradeSummaryRound[]>([]);
  const [summaryName, setSummaryName] = useState<string>("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [modalRound, setModalRound] = useState<number | null>(null);
  const modalTitleId = useId();
  const [detailByRound, setDetailByRound] = useState<Partial<Record<number, AgentRoundDetailResponse>>>({});
  const [detailLoading, setDetailLoading] = useState<Partial<Record<number, boolean>>>({});
  const [detailError, setDetailError] = useState<Partial<Record<number, string>>>({});
  const detailCacheRef = useRef<Partial<Record<number, AgentRoundDetailResponse>>>({});
  const detailInflightRef = useRef<Set<number>>(new Set());
  /** Bumped when `agentId` changes so in-flight round fetches cannot apply to the wrong agent. */
  const agentRequestGenRef = useRef(0);

  const canFetch = isServerAgentId(agentId) && seasonStatus === "ready" && Boolean(seasonId);

  useEffect(() => {
    agentRequestGenRef.current += 1;
    setRounds([]);
    setSummaryName("");
    setSummaryError(null);
    setModalRound(null);
    setDetailByRound({});
    detailCacheRef.current = {};
    detailInflightRef.current.clear();
    setDetailLoading({});
    setDetailError({});
  }, [agentId]);

  const loadSummary = useCallback(async () => {
    if (!canFetch) return;
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const data = await getAgentTradeSummary(agentId);
      setRounds(data.rounds ?? []);
      setSummaryName(data.display_name);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load trade summary";
      setSummaryError(msg);
      showToast(msg, "error");
      setRounds([]);
    } finally {
      setSummaryLoading(false);
    }
  }, [agentId, canFetch, showToast]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const summaryRowByRound = useMemo(() => {
    const m = new Map<number, TradeSummaryRound>();
    for (const r of rounds) m.set(r.round, r);
    return m;
  }, [rounds]);

  useEffect(() => {
    detailCacheRef.current = detailByRound;
  }, [detailByRound]);

  const ensureDetail = useCallback(
    async (round: number) => {
      if (detailCacheRef.current[round] || detailInflightRef.current.has(round)) return;
      const gen = agentRequestGenRef.current;
      const forAgentId = agentId;
      detailInflightRef.current.add(round);
      setDetailLoading((d) => ({ ...d, [round]: true }));
      setDetailError((d) => {
        const next = { ...d };
        delete next[round];
        return next;
      });
      try {
        const d = await getAgentRoundDetail(forAgentId, round);
        if (gen !== agentRequestGenRef.current) return;
        detailCacheRef.current = { ...detailCacheRef.current, [round]: d };
        setDetailByRound((prev) => ({ ...prev, [round]: d }));
      } catch (e) {
        if (gen !== agentRequestGenRef.current) return;
        const msg = e instanceof Error ? e.message : "Failed to load round";
        setDetailError((prev) => ({ ...prev, [round]: msg }));
        showToast(msg, "error");
      } finally {
        detailInflightRef.current.delete(round);
        setDetailLoading((d) => ({ ...d, [round]: false }));
      }
    },
    [agentId, showToast],
  );

  const closeRoundModal = useCallback(() => setModalRound(null), []);

  const onRoundRowClick = (round: number) => {
    setModalRound((prev) => (prev === round ? null : round));
    void ensureDetail(round);
  };

  useEffect(() => {
    if (modalRound == null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRoundModal();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modalRound, closeRoundModal]);

  if (!isServerAgentId(agentId)) {
    return null;
  }

  return (
    <div className="mt-10 rounded-xl border border-white/[0.08] bg-zinc-900/20">
      <div className="border-b border-white/[0.06] px-4 py-4 sm:px-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">Trade history</p>
        <p className="mt-1 text-sm text-zinc-500">
          Per-round summary from the API. Click anywhere on a row for snapshot, listings, timeline, and memory.
        </p>
      </div>

      <div className="px-4 py-4 sm:px-5">
        {seasonStatus === "loading" || seasonStatus === "idle" ? (
          <p className="text-sm text-zinc-500">Loading season…</p>
        ) : seasonStatus === "error" || !seasonId ? (
          <p className="text-sm text-zinc-500">Season unavailable — trade history needs a valid season.</p>
        ) : summaryLoading ? (
          <p className="text-sm text-zinc-500">Loading trade summary…</p>
        ) : summaryError ? (
          <p className="text-sm text-red-400/90">{summaryError}</p>
        ) : rounds.length === 0 ? (
          <div className="flex min-h-[140px] flex-col items-center justify-center py-10 text-center">
            <p className="text-sm text-zinc-400">No trade records</p>
          </div>
        ) : (
          <div className="space-y-2">
            {summaryName ? (
              <p className="mb-3 text-xs text-zinc-500">
                Agent: <span className="font-medium text-zinc-300">{summaryName}</span>
              </p>
            ) : null}
            {rounds.map((row) => {
              const active = modalRound === row.round;
              const extras = extraTradeSummaryFields(row);
              const roundsLeftUrgent = row.rounds_left <= 3;
              return (
                <button
                  key={row.round}
                  type="button"
                  title="Click this row for full round detail"
                  onClick={() => onRoundRowClick(row.round)}
                  className={`group w-full overflow-hidden rounded-lg border border-white/[0.08] bg-black/20 px-3 py-3 text-left transition hover:border-white/[0.14] hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5ff4a]/45 sm:px-4 sm:py-3.5 ${active ? "border-[#c5ff4a]/35 bg-white/[0.06]" : ""}`}
                  aria-haspopup="dialog"
                  aria-expanded={active}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-mono text-xs font-medium tracking-wide text-zinc-400">
                          Round <span className="text-white">{row.round}</span>
                        </span>
                        <span
                          className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                            roundsLeftUrgent
                              ? "border-amber-500/50 bg-amber-500/15 text-amber-200"
                              : "border-white/10 bg-zinc-950/60 text-zinc-400"
                          }`}
                        >
                          {roundsLeftUrgent ? "Low " : ""}Rounds left: {row.rounds_left}
                        </span>
                        {row.got_target ? (
                          <span className="rounded border border-[#c5ff4a]/45 bg-[#c5ff4a]/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#c5ff4a]">
                            Target met
                          </span>
                        ) : (
                          <span className="rounded border border-zinc-700/80 bg-zinc-900/50 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                            Target pending
                          </span>
                        )}
                        <span
                          className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                            row.traded
                              ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-200"
                              : "border-zinc-700/80 bg-zinc-900/50 text-zinc-500"
                          }`}
                        >
                          {row.traded ? "Traded" : "No trade"}
                        </span>
                      </div>

                      <p className="text-sm leading-relaxed text-zinc-300">
                        <span className="text-zinc-500">Holding</span>{" "}
                        <span className="font-semibold text-white">{row.held.type}</span>{" "}
                        <span className="font-mono text-zinc-400">q{row.held.quality}</span>
                        <span className="text-zinc-600"> · </span>
                        <span className="text-zinc-500">Want</span>{" "}
                        <span className="font-semibold text-sky-200">{row.target}</span>
                      </p>

                      {row.traded ? (
                        <p className="text-xs leading-relaxed text-zinc-400">
                          {row.partner ? (
                            <>
                              Partner{" "}
                              <span className="font-medium text-[#c5ff4a]">{row.partner.name}</span>
                              {row.partner.id ? (
                                <span className="font-mono text-zinc-600"> · {row.partner.id}</span>
                              ) : null}
                            </>
                          ) : (
                            <span>Partner unknown</span>
                          )}
                          {row.received ? (
                            <>
                              <span className="text-zinc-600"> · </span>
                              Received{" "}
                              <span className="font-medium text-zinc-200">
                                {row.received.type} (q{row.received.quality})
                              </span>
                            </>
                          ) : null}
                        </p>
                      ) : null}

                      {extras.length > 0 ? (
                        <ul className="space-y-1 border-t border-white/[0.06] pt-2 font-mono text-[11px] text-zinc-500">
                          {extras.map((x) => (
                            <li key={x.label} className="flex flex-wrap gap-x-2 gap-y-0.5">
                              <span className="shrink-0 text-zinc-600">{x.label}:</span>
                              <span className="min-w-0 break-all text-zinc-400">{x.value}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>

                    <div className="shrink-0 border-t border-white/[0.06] pt-2 text-right sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0 sm:text-left">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600 transition group-hover:text-[#c5ff4a]/90">
                        Full detail
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-zinc-500 transition group-hover:text-zinc-300">
                        Click row →
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {modalRound != null ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center p-3 sm:items-center sm:p-6"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-black/75"
            onClick={closeRoundModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTitleId}
            className={`relative z-[101] flex max-h-[min(94vh,1040px)] w-full max-w-[min(96vw,1320px)] flex-col ${modalSurface}`}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/[0.08] px-5 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0">
                <h2 id={modalTitleId} className="text-lg font-semibold text-white sm:text-xl">
                  Round {modalRound}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">Snapshot, listings, timeline, and memory</p>
              </div>
              <button type="button" onClick={closeRoundModal} className={`shrink-0 ${btnSecondary}`}>
                Close
              </button>
            </div>

            <div className={`px-5 py-4 sm:px-6 sm:py-5 ${modalBodyScroll}`}>
              {(() => {
                const err = detailError[modalRound];
                const detail = detailByRound[modalRound];
                const loading = detailLoading[modalRound];
                const summaryRow = summaryRowByRound.get(modalRound) ?? rounds.find((r) => r.round === modalRound);
                if (err) {
                  return <p className="text-sm text-red-400/90">{err}</p>;
                }
                if (detail && summaryRow) {
                  return (
                    <RoundDetailPanels summaryRow={summaryRow} detail={detail} verifiedScores={verifiedScores} />
                  );
                }
                return (
                  <p className="text-sm text-zinc-500">
                    {loading ? "Loading round detail…" : "Could not load this round."}
                  </p>
                );
              })()}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
