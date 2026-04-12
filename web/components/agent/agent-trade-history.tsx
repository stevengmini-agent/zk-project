"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import {
  type AgentRoundDetailResponse,
  type TradeSummaryFraudOutcome,
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
  "fraud",
]);

const TRADE_SUMMARY_FRAUD_KNOWN = new Set<string>([
  "honest",
  "i_was_scammed",
  "i_scammed",
  "both_scammed",
]);

const TRADE_SUMMARY_FRAUD_PRESENTATION: Record<
  TradeSummaryFraudOutcome,
  { title: string; detail: string; boxClass: string }
> = {
  honest: {
    title: "Honest swap",
    detail: "Both sides delivered what they claimed.",
    boxClass: "border-emerald-500/35 bg-emerald-950/25 text-emerald-100",
  },
  i_was_scammed: {
    title: "You were misled",
    detail: "Counterparty’s claim did not match what you actually received.",
    boxClass: "border-amber-500/45 bg-amber-950/30 text-amber-100",
  },
  i_scammed: {
    title: "You misled them",
    detail: "What you delivered did not match what you claimed.",
    boxClass: "border-orange-500/40 bg-orange-950/25 text-orange-100",
  },
  both_scammed: {
    title: "Mutual misrepresentation",
    detail: "Both sides claimed something different from what they delivered.",
    boxClass: "border-red-500/40 bg-red-950/30 text-red-100",
  },
};

function presentationForTradeSummaryFraud(raw: unknown): {
  title: string;
  detail: string;
  boxClass: string;
} | null {
  if (raw == null) return null;
  if (typeof raw !== "string") return null;
  const key = raw.trim();
  if (!key) return null;
  if (TRADE_SUMMARY_FRAUD_KNOWN.has(key)) {
    return TRADE_SUMMARY_FRAUD_PRESENTATION[key as TradeSummaryFraudOutcome];
  }
  return {
    title: "Swap outcome",
    detail: key,
    boxClass: "border-zinc-600 bg-zinc-900/60 text-zinc-300",
  };
}

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

/** One row from `trade-summary`: mission, swap, payout, counterparty, completion (matches API shape). */
function TradeSummaryListRow({
  row,
  active,
  onOpen,
}: {
  row: TradeSummaryRound;
  active: boolean;
  onOpen: () => void;
}) {
  const extras = extraTradeSummaryFields(row);
  const roundsLeftUrgent = row.rounds_left <= 3;
  const fraudUi = presentationForTradeSummaryFraud(row.fraud);

  return (
    <button
      type="button"
      title="Click this row for full round detail"
      onClick={onOpen}
      className={`group w-full overflow-hidden rounded-lg border border-white/[0.08] bg-black/20 px-3 py-3 text-left transition hover:border-white/[0.14] hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5ff4a]/45 sm:px-4 sm:py-3.5 ${active ? "border-[#c5ff4a]/35 bg-white/[0.06]" : ""}`}
      aria-haspopup="dialog"
      aria-expanded={active}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
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
            <span
              className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                row.got_target
                  ? "border-[#c5ff4a]/50 bg-[#c5ff4a]/20 text-[#c5ff4a]"
                  : "border-zinc-600 bg-zinc-900/80 text-zinc-400"
              }`}
            >
              {row.got_target ? "Target acquired" : "Target not acquired"}
            </span>
            <span
              className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                row.traded
                  ? "border-emerald-500/45 bg-emerald-500/15 text-emerald-200"
                  : "border-zinc-700 bg-zinc-900/70 text-zinc-500"
              }`}
            >
              {row.traded ? "Swap occurred" : "No swap"}
            </span>
          </div>

          <p className="text-[15px] leading-relaxed text-zinc-300">
            <span className="font-medium text-zinc-500">Round task:</span> Exchange your{" "}
            <span className="font-semibold text-amber-200">{row.held.type}</span>
            <span className="font-mono text-amber-200/80"> (q{row.held.quality})</span>
            <span className="text-zinc-500"> for </span>
            <span className="font-semibold text-sky-300">{row.target}</span>
            <span className="text-zinc-600">.</span>
          </p>

          {row.traded ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-white/[0.07] bg-zinc-950/50 px-3 py-2.5">
                <p className="text-sm leading-relaxed">
                  <span className="text-zinc-500">Counterparty </span>
                  <span className="font-semibold text-[#c5ff4a]">{row.partner?.name ?? "—"}</span>
                </p>
              </div>
              <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 px-3 py-2.5">
                <p className="text-sm leading-relaxed">
                  <span className="text-zinc-500">Received after swap </span>
                  {row.received ? (
                    <>
                      <span className="font-semibold text-white">{row.received.type}</span>
                      <span className="font-mono text-[#c5ff4a]"> · quality {row.received.quality}</span>
                    </>
                  ) : (
                    <span className="text-zinc-500">—</span>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-600">No counterparty or payout — no swap this round.</p>
          )}

          {fraudUi ? (
            <div className={`rounded-lg border px-3 py-2.5 ${fraudUi.boxClass}`}>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] opacity-90">
                Trade outcome
              </p>
              <p className="mt-1 text-sm font-semibold leading-snug">{fraudUi.title}</p>
              <p className="mt-1 text-xs leading-relaxed opacity-90">{fraudUi.detail}</p>
            </div>
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
          <p className="mt-0.5 font-mono text-xs text-zinc-500 transition group-hover:text-zinc-300">Click row →</p>
        </div>
      </div>
    </button>
  );
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

const TIMELINE_TYPE_META: Record<
  string,
  { title: string; subtitle: string }
> = {
  listing: { title: "Listing", subtitle: "Your market listing content" },
  message_sent: { title: "Message sent", subtitle: "You reached out" },
  message_received: { title: "Message received", subtitle: "They messaged you" },
  proposal_sent: { title: "Proposal sent", subtitle: "Your trade proposal" },
  proposal_received: { title: "Proposal received", subtitle: "Their trade proposal" },
  trade_executed: { title: "Trade executed", subtitle: "Swap completed" },
  review_written: { title: "Review written", subtitle: "Your review of them" },
  review_received: { title: "Review received", subtitle: "Their review of you" },
};

function normalizeTimelineKind(o: Record<string, unknown>): string {
  const raw = (pickStr(o.type) ?? pickStr(o.kind) ?? pickStr(o.event) ?? "").toLowerCase();
  return raw.replace(/-/g, "_").trim();
}

/** Listing rows are shown under “My market listing”; hide from Activity thread. */
function isActivityTimelineKindExcluded(kind: string): boolean {
  return kind === "listing" || kind === "list";
}

/** Short tag next to the speaker name in the activity thread (message / proposal / review). */
function timelineDialogueTypeTag(kind: string): string | undefined {
  if (kind.startsWith("message_")) return "Message";
  if (kind.startsWith("proposal_")) return "Proposal";
  if (kind.startsWith("review_")) return "Review";
  return undefined;
}

const DISPLAY_NAME_ACCENT_CLASSES = [
  "text-sky-400",
  "text-violet-400",
  "text-amber-300",
  "text-emerald-400",
  "text-rose-400",
  "text-cyan-400",
  "text-fuchsia-400",
  "text-orange-300",
  "text-teal-400",
  "text-pink-400",
] as const;

function displayNameAccentClass(name: string): string {
  const normalized = name.trim().toLowerCase();
  if (normalized === "you" || normalized === "me") return "text-[#c5ff4a]";
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const idx = h % DISPLAY_NAME_ACCENT_CLASSES.length;
  return DISPLAY_NAME_ACCENT_CLASSES[idx] ?? "text-sky-400";
}

function pickPeerName(o: Record<string, unknown>): string | undefined {
  for (const k of [
    "peer_name",
    "partner_name",
    "counterparty_name",
    "to_name",
    "from_name",
    "agent_name",
    "display_name",
    "recipient_name",
    "sender_name",
    "other_name",
    "name",
  ]) {
    const v = pickStr(o[k]);
    if (v) return v;
  }
  const partner = o.partner;
  if (partner && typeof partner === "object") {
    const p = partner as Record<string, unknown>;
    return pickStr(p.name) ?? pickStr(p.display_name);
  }
  const peer = o.peer;
  if (peer && typeof peer === "object") {
    const p = peer as Record<string, unknown>;
    return pickStr(p.name) ?? pickStr(p.display_name);
  }
  return undefined;
}

/** Prefer API `other_name` for activity cards (matches “Other Name” in structured rows). */
function pickIncomingActivityName(
  o: Record<string, unknown>,
  peer: string | undefined,
  hint: string | null,
): string {
  const explicit = pickStr(o.other_name);
  if (explicit) return explicit;
  return peer ?? hint ?? "Them";
}

/** Left column: same value as the card’s “Other Name” row / `other_name` field (not generic peer). */
function pickActivityAsideDisplayName(
  o: Record<string, unknown>,
  detailRows: { label: string; value: string }[],
  peer: string | undefined,
  hint: string | null,
): string {
  const fromPayload = pickStr(o.other_name);
  if (fromPayload) return fromPayload;
  const fromRow = detailRows
    .find((r) => r.label.replace(/\s+/g, " ").trim().toLowerCase() === "other name")
    ?.value?.trim();
  if (fromRow) return fromRow;
  return pickIncomingActivityName(o, peer, hint);
}

/** Shown in the left aside; omit duplicate row inside Activity detail lists. */
function activityDetailRowsWithoutOtherName(
  rows: { label: string; value: string }[],
): { label: string; value: string }[] {
  return rows.filter((r) => r.label.replace(/\s+/g, " ").trim().toLowerCase() !== "other name");
}

const TIMELINE_META_KEYS = new Set(["type", "kind", "event", "action", "order", "iteration"]);

/** Hidden in nested detail / stringify (not the same as meta keys — keeps nested `type` visible). */
const TIMELINE_DETAIL_NOISE_KEYS = new Set(["order", "iteration"]);

/** Text body for timeline cards: plain dialogue text only (not JSON blobs). */
function timelineBodyText(o: Record<string, unknown>): string | undefined {
  const c = o.content;
  if (typeof c === "string" && c.trim()) return c.trim();
  if (c && typeof c === "object") {
    const co = c as Record<string, unknown>;
    const msg = pickStr(co.message) ?? pickStr(co.text) ?? pickStr(co.body);
    if (msg) return msg;
    return undefined;
  }
  return (
    pickStr(o.message) ??
    pickStr(o.text) ??
    pickStr(o.summary) ??
    pickStr(o.description) ??
    (typeof o.title === "string" && o.title !== pickStr(o.type) ? o.title : undefined)
  );
}

function humanizeTimelineKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
    .trim();
}

function isTimelineFruitRecord(obj: Record<string, unknown>): boolean {
  const t = pickStr(obj.type) ?? pickStr(obj.fruit_type) ?? pickStr(obj.fruit);
  const q = obj.quality ?? obj.q ?? obj.fruit_quality;
  return typeof t === "string" && typeof q === "number";
}

/** Partner one-liner only when there are no extra fields beyond identity. */
const TIMELINE_PARTNER_KEYS = new Set(["name", "display_name", "id"]);

function isCompactTimelinePartner(obj: Record<string, unknown>): boolean {
  const keysWithVal = Object.keys(obj).filter((k) => obj[k] != null && obj[k] !== "");
  if (keysWithVal.length === 0) return false;
  const name = pickStr(obj.name) ?? pickStr(obj.display_name);
  if (!name) return false;
  return keysWithVal.every((k) => TIMELINE_PARTNER_KEYS.has(k));
}

function formatTimelineValue(v: unknown, depth = 0): string {
  if (v == null) return "—";
  if (typeof v === "string") {
    const t = v.trim();
    return t || "—";
  }
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (depth > 4) return "…";
  if (Array.isArray(v)) {
    if (v.length === 0) return "—";
    return v.map((x) => formatTimelineValue(x, depth + 1)).join("; ");
  }
  if (typeof v === "object") {
    const obj = v as Record<string, unknown>;
    if (isTimelineFruitRecord(obj)) {
      const t = pickStr(obj.type) ?? pickStr(obj.fruit_type) ?? pickStr(obj.fruit);
      const q = obj.quality ?? obj.q ?? obj.fruit_quality;
      if (typeof t === "string" && typeof q === "number") return `${t}, quality ${q}`;
    }
    const tOnly = pickStr(obj.type) ?? pickStr(obj.fruit_type) ?? pickStr(obj.fruit);
    if (typeof tOnly === "string") return tOnly;
    if (isCompactTimelinePartner(obj)) {
      const name = pickStr(obj.name) ?? pickStr(obj.display_name) ?? "";
      const id = pickStr(obj.id);
      return id ? `${name} (${id})` : name;
    }
    const entries = Object.entries(obj).filter(
      ([k, x]) => x != null && x !== "" && !TIMELINE_DETAIL_NOISE_KEYS.has(k),
    );
    if (entries.length === 0) return "—";
    try {
      return JSON.stringify(Object.fromEntries(entries));
    } catch {
      return "[object]";
    }
  }
  return String(v);
}

/**
 * One UI row per field: never join multiple object keys with " · " in a single cell.
 */
function pushTimelineValueAsRows(
  pushRow: (label: string, value: string) => void,
  baseLabel: string,
  val: unknown,
  depth = 0,
): void {
  if (val == null || val === "") return;
  if (depth > 8) return;

  if (typeof val !== "object" || val === null || Array.isArray(val)) {
    const s = formatTimelineValue(val);
    if (s && s !== "—") pushRow(baseLabel, s);
    return;
  }

  const obj = val as Record<string, unknown>;
  if (isTimelineFruitRecord(obj) || isCompactTimelinePartner(obj)) {
    const s = formatTimelineValue(obj);
    if (s && s !== "—") pushRow(baseLabel, s);
    return;
  }

  const entries = Object.entries(obj).filter(
    ([k, x]) => x != null && x !== "" && !TIMELINE_DETAIL_NOISE_KEYS.has(k),
  );
  if (entries.length === 0) return;

  if (entries.length === 1) {
    const [ck, cv] = entries[0];
    const childLabel = humanizeTimelineKey(ck);
    pushTimelineValueAsRows(pushRow, childLabel, cv, depth + 1);
    return;
  }

  for (const [ck, cv] of entries) {
    pushTimelineValueAsRows(pushRow, humanizeTimelineKey(ck), cv, depth + 1);
  }
}

function collectTimelineDetailRows(
  o: Record<string, unknown>,
  options?: { omitContent?: boolean },
): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  const seenPairs = new Set<string>();

  function pushRow(label: string, value: string) {
    const display = value.trim();
    if (!display || display === "—") return;
    const dedupe = `${label.toLowerCase()}::${display.slice(0, 200)}`;
    if (seenPairs.has(dedupe)) return;
    seenPairs.add(dedupe);
    rows.push({ label, value: display });
  }

  for (const [key, val] of Object.entries(o)) {
    if (TIMELINE_META_KEYS.has(key)) continue;
    if (key === "content") {
      if (typeof val === "string" && val.trim()) {
        if (!options?.omitContent) pushRow("Message", val.trim());
      } else if (val && typeof val === "object" && !Array.isArray(val)) {
        for (const [ck, cv] of Object.entries(val as Record<string, unknown>)) {
          if (TIMELINE_DETAIL_NOISE_KEYS.has(ck)) continue;
          if (cv == null || cv === "") continue;
          const isDialogueField =
            options?.omitContent &&
            ["message", "text", "body"].includes(ck) &&
            typeof cv === "string";
          if (isDialogueField) continue;
          pushTimelineValueAsRows(pushRow, humanizeTimelineKey(ck), cv);
        }
      }
      continue;
    }
    if (val == null || val === "") continue;
    pushTimelineValueAsRows(pushRow, humanizeTimelineKey(key), val);
  }
  return rows;
}

function isPlainDialogueText(s: string): boolean {
  const t = s.trim();
  if (t.length > 6000) return false;
  if (/^\s*[\[{]/.test(t)) return false;
  return true;
}

function TimelineDetailList({
  rows,
  className = "mt-3",
  variant = "bordered",
  suppressUpperLabels,
}: {
  rows: { label: string; value: string }[];
  className?: string;
  variant?: "bordered" | "plain";
  /** Row labels (case-insensitive) for which the small caps title is hidden; value still shown. */
  suppressUpperLabels?: string[];
}) {
  if (rows.length === 0) return null;
  const shell =
    variant === "plain"
      ? "space-y-0 divide-y divide-white/[0.06] rounded-lg bg-black/15"
      : "space-y-0 divide-y divide-white/[0.06] rounded-lg border border-white/[0.06] bg-black/20";
  const hideLabel = new Set((suppressUpperLabels ?? []).map((s) => s.replace(/\s+/g, " ").trim().toLowerCase()));
  return (
    <ul className={`${className} ${shell}`}>
      {rows.map((r, idx) => {
        const lk = r.label.replace(/\s+/g, " ").trim().toLowerCase();
        const showCaps = !hideLabel.has(lk);
        return (
          <li key={`${idx}-${r.label}`} className="px-3 py-2.5 first:rounded-t-lg last:rounded-b-lg sm:px-3.5">
            {showCaps ? (
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{r.label}</p>
            ) : null}
            <p className={`text-sm leading-relaxed text-zinc-100 ${showCaps ? "mt-1.5" : ""}`}>{r.value}</p>
          </li>
        );
      })}
    </ul>
  );
}

/** Left column for Activity cards (replaces circular “i” / avatar). */
function ActivityIdentityAside({
  caption,
  line,
  lineClassName,
}: {
  /** Omitted for counterparty rows — only the name line is shown. */
  caption?: string;
  line: string;
  lineClassName: string;
}) {
  return (
    <div className="flex w-[5.75rem] shrink-0 flex-col pr-4 sm:w-[7.25rem] sm:pr-5">
      {caption ? (
        <p className="text-[10px] font-semibold leading-tight tracking-wide text-zinc-500">{caption}</p>
      ) : null}
      <p
        className={`break-words text-sm font-semibold leading-snug ${caption ? "mt-2" : ""} ${lineClassName}`}
      >
        {line.trim() || "—"}
      </p>
    </div>
  );
}

/**
 * Activity card: optional left caption (only “You”); name line + message type + content.
 */
function DialogueLine({
  side,
  avatarCaption,
  avatarLine,
  avatarLineClassName,
  typeTag,
  text,
}: {
  side: "out" | "in";
  /** Set for outgoing only; incoming has no label above the name. */
  avatarCaption?: string;
  avatarLine: string;
  avatarLineClassName: string;
  typeTag?: string;
  text: string;
}) {
  const typeLabel = typeTag?.trim() || "—";

  return (
    <div
      className={`relative flex gap-3 rounded-xl px-3 py-3 sm:gap-4 sm:px-4 ${
        side === "out" ? "bg-[#c5ff4a]/[0.07] pr-14 sm:pr-16" : "bg-zinc-900/45"
      }`}
    >
      {side === "out" ? (
        <span
          className="pointer-events-none absolute right-3 top-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#c5ff4a] sm:right-4"
          aria-hidden
        >
          You
        </span>
      ) : null}
      <ActivityIdentityAside caption={avatarCaption} line={avatarLine} lineClassName={avatarLineClassName} />
      <div className="min-w-0 flex-1">
        <p
          className={`inline-flex rounded-md px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-wide ${
            side === "out"
              ? "bg-[#c5ff4a]/18 text-[#c5ff4a] ring-1 ring-[#c5ff4a]/35"
              : "bg-sky-500/18 text-sky-300 ring-1 ring-sky-400/35"
          }`}
        >
          {typeLabel}
        </p>
        <p className="mt-2.5 whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-100">{text}</p>
      </div>
    </div>
  );
}

function ActivitySystemLine({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full justify-center py-1">
      <div className="max-w-[min(100%,36rem)] rounded-full bg-emerald-950/25 px-4 py-2 text-center text-xs leading-snug text-emerald-100/90">
        {children}
      </div>
    </div>
  );
}

function ActivityThreadEntry({
  ev,
  counterpartyHint,
}: {
  ev: unknown;
  counterpartyHint: string | null;
}): ReactNode {
  if (typeof ev === "string") {
    const t = ev.trim();
    if (!t) return null;
    const label = counterpartyHint ?? "Timeline";
    return (
      <DialogueLine
        side="in"
        avatarLine={label}
        avatarLineClassName={displayNameAccentClass(label)}
        typeTag="Note"
        text={t}
      />
    );
  }
  if (ev == null) return null;
  if (typeof ev !== "object" || Array.isArray(ev)) {
    return (
      <div className="flex justify-center py-1">
        <p className="font-mono text-xs text-zinc-500">{String(ev)}</p>
      </div>
    );
  }
  const o = ev as Record<string, unknown>;
  const kind = normalizeTimelineKind(o);
  if (isActivityTimelineKindExcluded(kind)) return null;

  const peer = pickPeerName(o) ?? counterpartyHint ?? undefined;
  const body = timelineBodyText(o);
  const dialogueOut =
    kind === "message_sent" || kind === "proposal_sent" || kind === "review_written";
  const dialogueIn =
    kind === "message_received" || kind === "proposal_received" || kind === "review_received";
  const showDialogue =
    (dialogueOut || dialogueIn) && Boolean(body) && isPlainDialogueText(body!);
  const detailRows = collectTimelineDetailRows(o, { omitContent: showDialogue });
  const meta = TIMELINE_TYPE_META[kind] ?? {
    title: kind ? kind.replace(/_/g, " ") : "Event",
    subtitle: "Timeline entry",
  };

  if (showDialogue) {
    const asideName = pickActivityAsideDisplayName(o, detailRows, peer, counterpartyHint);
    const tag = timelineDialogueTypeTag(kind);
    if (dialogueOut) {
      return (
        <DialogueLine
          side="out"
          avatarCaption="You"
          avatarLine="You"
          avatarLineClassName="text-[#c5ff4a]"
          typeTag={tag}
          text={body!}
        />
      );
    }
    return (
      <DialogueLine
        side="in"
        avatarLine={asideName}
        avatarLineClassName={displayNameAccentClass(asideName)}
        typeTag={tag}
        text={body!}
      />
    );
  }

  if (kind === "trade_executed") {
    const pn = peer ?? counterpartyHint;
    const tradeDisplayRows = activityDetailRowsWithoutOtherName(detailRows);
    return (
      <div className="space-y-2">
        <ActivitySystemLine>
          <span className="text-emerald-200/90">Trade completed</span>
          {pn ? (
            <>
              {" "}
              <span className="text-emerald-600/80">·</span>{" "}
              <span className={`font-semibold ${displayNameAccentClass(pn)}`}>{pn}</span>
            </>
          ) : null}
        </ActivitySystemLine>
        {tradeDisplayRows.length > 0 ? (
          <div className="mx-auto max-w-[min(100%,42rem)] px-0.5">
            <TimelineDetailList
              className="mt-0"
              variant="plain"
              suppressUpperLabels={["content"]}
              rows={tradeDisplayRows}
            />
          </div>
        ) : null}
      </div>
    );
  }

  if (detailRows.length > 0) {
    const titleLabel = meta.title;
    const asideName = pickActivityAsideDisplayName(o, detailRows, peer, counterpartyHint);
    return (
      <div className="flex w-full gap-3 rounded-xl bg-zinc-900/45 px-3 py-3 sm:gap-4 sm:px-4">
        <ActivityIdentityAside line={asideName} lineClassName={displayNameAccentClass(asideName)} />
        <div className="min-w-0 flex-1 py-0.5">
          <p className="mb-2">
            <span className="inline-flex rounded-md bg-violet-500/15 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-violet-300 ring-1 ring-violet-400/30">
              {titleLabel}
            </span>
          </p>
          <TimelineDetailList
            className="mt-0"
            variant="plain"
            suppressUpperLabels={["content"]}
            rows={activityDetailRowsWithoutOtherName(detailRows)}
          />
        </div>
      </div>
    );
  }

  if (body && isPlainDialogueText(body)) {
    const asideName = pickActivityAsideDisplayName(o, [], peer, counterpartyHint);
    return (
      <DialogueLine
        side="in"
        avatarLine={asideName}
        avatarLineClassName={displayNameAccentClass(asideName)}
        typeTag={timelineDialogueTypeTag(kind)}
        text={body}
      />
    );
  }

  let debug = "";
  const cleaned = Object.fromEntries(
    Object.entries(o).filter(([k]) => !TIMELINE_DETAIL_NOISE_KEYS.has(k)),
  );
  try {
    debug = JSON.stringify(cleaned, null, 2);
  } catch {
    debug = String(ev);
  }
  const asideNameFallback = pickActivityAsideDisplayName(o, [], peer, counterpartyHint);
  return (
    <div className="flex w-full gap-3 rounded-xl bg-zinc-900/45 px-3 py-3 sm:gap-4 sm:px-4">
      <ActivityIdentityAside
        line={asideNameFallback}
        lineClassName={displayNameAccentClass(asideNameFallback)}
      />
      <pre className="max-h-56 min-w-0 flex-1 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-zinc-950/80 p-3 font-mono text-[11px] leading-relaxed text-zinc-400">
        {debug}
      </pre>
    </div>
  );
}

function findTradePartnerName(timeline: unknown[], summaryRow: TradeSummaryRound): string | null {
  for (const ev of timeline) {
    if (!ev || typeof ev !== "object") continue;
    const o = ev as Record<string, unknown>;
    const k = normalizeTimelineKind(o);
    if (k === "trade_executed") {
      const n = pickPeerName(o);
      if (n) return n;
    }
  }
  return summaryRow.partner?.name ?? null;
}

function RoundDetailTimelineView({
  summaryRow,
  detail,
}: {
  summaryRow: TradeSummaryRound;
  detail: AgentRoundDetailResponse;
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
  const timeline = useMemo(
    () => (Array.isArray(detail.timeline) ? detail.timeline : []),
    [detail.timeline],
  );
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
  const statusLabel = outcome.completed ? "COMPLETED" : snapshot.status?.toUpperCase() || "—";
  const tradePartnerName = findTradePartnerName(timeline, summaryRow);
  const visibleActivityTimeline = useMemo(() => {
    return timeline.filter((ev) => {
      if (ev == null || typeof ev !== "object" || Array.isArray(ev)) return true;
      const k = normalizeTimelineKind(ev as Record<string, unknown>);
      return !isActivityTimelineKindExcluded(k);
    });
  }, [timeline]);
  const receivedFruit =
    outcome.fruit_after ??
    (summaryRow.received
      ? { type: summaryRow.received.type, quality: summaryRow.received.quality }
      : null);

  function TimelineStep({
    step,
    children,
  }: {
    step: number;
    children: ReactNode;
  }) {
    return (
      <div className="relative pl-7">
        <span
          className="absolute left-0 top-1.5 flex size-5 items-center justify-center rounded-full border border-[#c5ff4a]/40 bg-[#c5ff4a]/15 font-mono text-[10px] font-bold text-[#c5ff4a]"
          aria-hidden
        >
          {step}
        </span>
        {children}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Round {detail.round}</p>
        <p className="mt-1 text-lg font-semibold text-white">
          Timeline
          <span className="ml-2 rounded border border-sky-500/40 bg-sky-500/15 px-2 py-0.5 font-mono text-xs font-medium uppercase text-sky-300">
            {statusLabel}
          </span>
        </p>
      </div>

      <div className="relative space-y-10 border-l border-white/[0.08] pl-6 sm:pl-8">
        <TimelineStep step={1}>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">This round&apos;s task</p>
          <div className="mt-2 rounded-xl border border-white/[0.1] bg-zinc-950/50 p-4 text-sm text-zinc-300">
            <p>
              <span className="text-zinc-500">Start with </span>
              <span className="font-semibold text-amber-200">{snapshot.held_fruit_type}</span>
              <span className="font-mono text-amber-200/80"> (q{snapshot.held_fruit_quality})</span>
              <span className="text-zinc-500"> · goal type </span>
              <span className="font-semibold text-sky-300">{snapshot.target_fruit_type}</span>
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              Action points: <span className="font-mono text-zinc-400">{snapshot.action_points}</span>
              <span className="text-zinc-600"> · </span>
              Cumulative score (snapshot):{" "}
              <span className="font-mono text-zinc-300">{snapshot.cumulative_score}</span>
            </p>
          </div>
        </TimelineStep>

        <TimelineStep step={2}>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">My market listing</p>
          {my_listing ? (
            <div className="mt-2 rounded-xl border border-amber-500/20 bg-amber-950/10 p-4 text-sm text-zinc-300">
              <p>
                Claims <span className="font-semibold text-white">{my_listing.claimed_type}</span>
                <span className="font-mono text-zinc-400"> q{my_listing.claimed_quality}</span>
                <span className="text-zinc-500"> · wants </span>
                <span className="font-semibold text-amber-200">{my_listing.wanted_type}</span>
              </p>
              {my_listing.description ? (
                <p className="mt-3 border-t border-white/[0.06] pt-3 text-xs leading-relaxed text-zinc-500">
                  {safeDisplayText(my_listing.description)}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-600">No listing posted this round.</p>
          )}
        </TimelineStep>

        <TimelineStep step={3}>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            Activity · conversation ({visibleActivityTimeline.length} events)
          </p>
          {timeline.length > visibleActivityTimeline.length ? (
            <p className="mt-1 text-xs text-zinc-600">
              {timeline.length - visibleActivityTimeline.length} listing event
              {timeline.length - visibleActivityTimeline.length === 1 ? "" : "s"} omitted — see My market
              listing above.
            </p>
          ) : null}
          <div className="mt-3 rounded-2xl bg-[#0d0d0d] px-3 py-5 sm:px-5 sm:py-6">
            {visibleActivityTimeline.length === 0 ? (
              <p className="text-sm text-zinc-600">No activity events after filtering.</p>
            ) : (
              <div className="mx-auto flex max-w-3xl flex-col gap-5 sm:gap-6">
                {visibleActivityTimeline.map((ev, i) => (
                  <ActivityThreadEntry key={i} ev={ev} counterpartyHint={tradePartnerName} />
                ))}
              </div>
            )}
          </div>
        </TimelineStep>

        <TimelineStep step={4}>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Post-trade summary (fraud)</p>
          {fraud.committed.length > 0 || (Array.isArray(fraud.suffered) && fraud.suffered.length > 0) ? (
            <ul className="mt-2 space-y-2 text-sm">
              {fraud.committed.map((c, i) => (
                <li
                  key={`c-${i}`}
                  className="rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-2 text-red-100/90"
                >
                  <span className="font-medium">You vs {c.victim}:</span> claimed {c.claimed}, delivered {c.actual}
                </li>
              ))}
              {Array.isArray(fraud.suffered)
                ? fraud.suffered.map((s, i) => {
                    const rows =
                      typeof s === "object" && s !== null && !Array.isArray(s)
                        ? collectTimelineDetailRows(s as Record<string, unknown>)
                        : [];
                    return (
                      <li
                        key={`s-${i}`}
                        className="rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-amber-100/90"
                      >
                        <span className="text-xs font-semibold uppercase tracking-wide text-amber-200/90">
                          Suffered
                        </span>
                        {rows.length > 0 ? (
                          <div className="mt-2 text-amber-50/95">
                            <TimelineDetailList className="mt-0" rows={rows} />
                          </div>
                        ) : (
                          <p className="mt-1 text-sm leading-relaxed">{formatTimelineValue(s)}</p>
                        )}
                      </li>
                    );
                  })
                : null}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-zinc-600">No fraud records for this round.</p>
          )}
        </TimelineStep>

        <TimelineStep step={5}>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Round results</p>
          <div className="mt-2 space-y-2 rounded-xl border border-white/[0.1] bg-zinc-950/50 p-4 text-sm text-zinc-300">
            <p>
              <span className="text-zinc-500">Originally held </span>
              <span className="font-semibold text-amber-200">{snapshot.held_fruit_type}</span>
              <span className="font-mono text-zinc-400"> q{snapshot.held_fruit_quality}</span>
            </p>
            <p>
              <span className="text-zinc-500">Target fruit </span>
              <span className="font-semibold text-sky-300">{snapshot.target_fruit_type}</span>
            </p>
            <p>
              <span className="text-zinc-500">Fruit after swap </span>
              {receivedFruit ? (
                <>
                  <span className="font-semibold text-white">{receivedFruit.type}</span>
                  <span className="font-mono text-[#c5ff4a]"> q{receivedFruit.quality}</span>
                </>
              ) : (
                <span className="text-zinc-600">—</span>
              )}
            </p>
            <p>
              <span className="text-zinc-500">Swap completed </span>
              <span className={summaryRow.traded ? "font-semibold text-emerald-300" : "text-zinc-500"}>
                {summaryRow.traded ? "Yes" : "No"}
              </span>
              <span className="text-zinc-600"> · </span>
              <span className="text-zinc-500">Round target met </span>
              <span className={summaryRow.got_target ? "font-semibold text-[#c5ff4a]" : "text-zinc-500"}>
                {summaryRow.got_target ? "Yes" : "No"}
              </span>
            </p>
            <p>
              <span className="text-zinc-500">Score this round </span>
              <span className="font-mono text-zinc-200">+{outcome.score_gained ?? 0}</span>
              <span className="text-zinc-600"> · </span>
              <span className="text-zinc-500">Cumulative </span>
              <span className="font-mono text-zinc-200">{snapshot.cumulative_score}</span>
            </p>
            <p>
              <span className="text-zinc-500">Eliminated </span>
              <span className={outcome.eliminated ? "font-semibold text-red-400" : "text-emerald-300/90"}>
                {outcome.eliminated ? "Yes" : "No"}
              </span>
            </p>
          </div>
        </TimelineStep>
      </div>
    </div>
  );
}

export function AgentTradeHistory({ agentId }: { agentId: string }) {
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
          Each row reflects <code className="rounded bg-zinc-950/80 px-1 font-mono text-[11px] text-zinc-400">trade-summary</code>:
          round task (held → target), whether a swap occurred, counterparty, fruit received, and target completion. Click a row for
          full detail.
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
            {rounds.map((row) => (
              <TradeSummaryListRow
                key={row.round}
                row={row}
                active={modalRound === row.round}
                onOpen={() => onRoundRowClick(row.round)}
              />
            ))}
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
            className={`relative z-[101] flex max-h-[min(94vh,1040px)] w-full max-w-[min(92vw,900px)] flex-col ${modalSurface}`}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/[0.08] px-5 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0">
                <h2 id={modalTitleId} className="text-lg font-semibold text-white sm:text-xl">
                  Round {modalRound}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">Vertical timeline: task, listing, activity, fraud, results</p>
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
                    <RoundDetailTimelineView summaryRow={summaryRow} detail={detail} />
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
