"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { StoryCard } from "@/lib/mock-watch-feed";
import { STORY_TYPE_LABEL } from "@/lib/mock-watch-feed";
import { btnSecondary, focusAccentRing } from "@/components/ui/agent-ui";

const REACTION_KEY = "watch-story-reactions:v1";
const COMMENTS_KEY = "watch-story-comments:v1";
const FOLLOW_KEY = "watch-followed-agents:v1";

type ReactionId = "up" | "fire" | "think" | "wince";

const REACTIONS: { id: ReactionId; label: string; emoji: string }[] = [
  { id: "up", label: "Respect", emoji: "👍" },
  { id: "fire", label: "Wild", emoji: "🔥" },
  { id: "think", label: "Hmm", emoji: "🤔" },
  { id: "wince", label: "Ouch", emoji: "😬" },
];

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}

export function StoryDetailDrawer({ item, open, onClose }: { item: StoryCard | null; open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<"details" | "analysis">("details");
  const [quizPick, setQuizPick] = useState<"A" | "B" | null>(null);
  const [reactions, setReactions] = useState<Record<ReactionId, number>>({
    up: 0,
    fire: 0,
    think: 0,
    wince: 0,
  });
  const [comments, setComments] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  const syncFromStorage = useCallback(() => {
    if (!item) return;
    const allR = readJson<Record<string, Partial<Record<ReactionId, number>>>>(REACTION_KEY, {});
    const row = allR[item.id] ?? {};
    setReactions({
      up: row.up ?? 0,
      fire: row.fire ?? 0,
      think: row.think ?? 0,
      wince: row.wince ?? 0,
    });
    const allC = readJson<Record<string, string[]>>(COMMENTS_KEY, {});
    setComments(allC[item.id] ?? []);
    const f = readJson<string[]>(FOLLOW_KEY, []);
    setFollowed(new Set(f));
  }, [item]);

  useEffect(() => {
    setTab("details");
    setQuizPick(null);
    setDraft("");
    syncFromStorage();
  }, [item?.id, syncFromStorage]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const bumpReaction = (id: ReactionId) => {
    if (!item) return;
    setReactions((prev) => {
      const next = { ...prev, [id]: prev[id] + 1 };
      const all = readJson<Record<string, Partial<Record<ReactionId, number>>>>(REACTION_KEY, {});
      all[item.id] = next;
      writeJson(REACTION_KEY, all);
      return next;
    });
  };

  const addComment = () => {
    if (!item || !draft.trim()) return;
    const line = draft.trim();
    setDraft("");
    setComments((prev) => {
      const next = [...prev, line];
      const all = readJson<Record<string, string[]>>(COMMENTS_KEY, {});
      all[item.id] = next;
      writeJson(COMMENTS_KEY, all);
      return next;
    });
  };

  const toggleFollow = (agentId: string) => {
    setFollowed((prev) => {
      const next = new Set(prev);
      if (next.has(agentId)) next.delete(agentId);
      else next.add(agentId);
      writeJson(FOLLOW_KEY, [...next]);
      return next;
    });
  };

  const q = item?.quiz;
  const agentWonLesson = useMemo(() => {
    if (!q || quizPick == null) return null;
    return quizPick !== q.agentPicked ? q.explainIfWrong : null;
  }, [q, quizPick]);
  const sameAsAgent = q && quizPick != null && quizPick === q.agentPicked;

  const dialogPreview = item?.l2.dialogLines.slice(0, 5) ?? [];

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close story"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="story-drawer-title"
        className="relative z-10 flex max-h-[min(90vh,920px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#080808] shadow-2xl shadow-black/60"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              {STORY_TYPE_LABEL[item.type]}
            </p>
            <h2 id="story-drawer-title" className="mt-1 text-lg font-semibold leading-snug text-white">
              {item.title}
            </h2>
            <p className="mt-1 text-xs text-zinc-500">{item.timestamp}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`shrink-0 rounded-lg border border-white/15 p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white ${focusAccentRing}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden
              focusable="false"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          <article className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{item.story}</article>

          {item.stats ? (
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {item.stats.riskLevel ? (
                <div className="rounded-lg border border-white/10 bg-zinc-950/60 p-3">
                  <p className="text-[10px] uppercase text-zinc-500">Risk</p>
                  <p className="mt-1 text-sm capitalize text-zinc-200">{item.stats.riskLevel}</p>
                </div>
              ) : null}
              {item.stats.reputationChange ? (
                <div className="rounded-lg border border-white/10 bg-zinc-950/60 p-3">
                  <p className="text-[10px] uppercase text-zinc-500">Reputation</p>
                  <p className="mt-1 text-sm text-zinc-200">{item.stats.reputationChange}</p>
                </div>
              ) : null}
              {item.stats.successRate ? (
                <div className="rounded-lg border border-white/10 bg-zinc-950/60 p-3">
                  <p className="text-[10px] uppercase text-zinc-500">Outcome</p>
                  <p className="mt-1 text-sm text-zinc-200">{item.stats.successRate}</p>
                </div>
              ) : null}
              {item.stats.fraudCount != null ? (
                <div className="rounded-lg border border-white/10 bg-zinc-950/60 p-3">
                  <p className="text-[10px] uppercase text-zinc-500">Fraud count</p>
                  <p className="mt-1 text-sm text-zinc-200">{item.stats.fraudCount}</p>
                </div>
              ) : null}
            </div>
          ) : null}

          {item.agents.length > 0 ? (
            <div className="mt-6">
              <p className="text-xs font-medium uppercase text-zinc-500">Agents (mock follow)</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {item.agents.map((a) => {
                  const id = a.id;
                  const on = followed.has(id);
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => toggleFollow(id)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                          on
                            ? "border-[#c5ff4a]/50 bg-[#c5ff4a]/15 text-[#c5ff4a]"
                            : "border-white/15 text-zinc-300 hover:border-white/25"
                        }`}
                      >
                        {on ? "Following" : "Follow"} {a.displayName ?? id}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          <div className="mt-8">
            <p className="text-xs font-medium uppercase text-zinc-500">Reactions (local mock)</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {REACTIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => bumpReaction(r.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-white/12 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-200 hover:border-white/20"
                >
                  <span aria-hidden>{r.emoji}</span>
                  <span className="text-xs text-zinc-500">{r.label}</span>
                  <span className="text-xs tabular-nums text-zinc-400">{reactions[r.id]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <div className="flex border-b border-zinc-800">
              <button
                type="button"
                onClick={() => setTab("details")}
                className={`flex-1 px-3 py-2.5 text-sm font-medium ${
                  tab === "details" ? "bg-zinc-800/80 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Dialogue
              </button>
              <button
                type="button"
                onClick={() => setTab("analysis")}
                className={`flex-1 px-3 py-2.5 text-sm font-medium ${
                  tab === "analysis" ? "bg-zinc-800/80 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Analysis
              </button>
            </div>
            <div className="pt-4">
              {tab === "details" ? (
                <div className="space-y-4">
                  <ul className="space-y-2 text-sm text-zinc-300">
                    {dialogPreview.map((line, i) => (
                      <li key={i}>
                        <span className="text-[#c5ff4a]/90">{line.speaker}:</span> {line.text}
                      </li>
                    ))}
                  </ul>
                  {item.l2.dialogLines.length > dialogPreview.length ? (
                    <p className="text-xs text-zinc-600">
                      +{item.l2.dialogLines.length - dialogPreview.length} more lines in full transcript (mock)
                    </p>
                  ) : null}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
                      <p className="text-xs text-zinc-500">Claimed</p>
                      <p className="mt-1 text-sm text-zinc-200">{item.l2.claimed}</p>
                    </div>
                    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
                      <p className="text-xs text-zinc-500">Actual</p>
                      <p className="mt-1 text-sm text-zinc-200">{item.l2.actual}</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-zinc-700/80 bg-zinc-950/40 p-3">
                    <p className="text-xs text-zinc-500">Reputation delta (mock)</p>
                    <p className="mt-1 text-sm text-zinc-300">{item.l2.repDelta}</p>
                  </div>
                </div>
              ) : (
                <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-300">
                  {item.l3.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {q ? (
            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-sm font-semibold text-white">What would you do?</p>
              <p className="mt-2 text-sm text-zinc-400">{q.question}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setQuizPick("A")}
                  className={`rounded-lg border px-4 py-2 text-sm ${
                    quizPick === "A"
                      ? "border-[#c5ff4a] bg-[#c5ff4a]/15 text-[#c5ff4a]"
                      : "border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  A: {q.optionA}
                </button>
                <button
                  type="button"
                  onClick={() => setQuizPick("B")}
                  className={`rounded-lg border px-4 py-2 text-sm ${
                    quizPick === "B"
                      ? "border-[#c5ff4a] bg-[#c5ff4a]/15 text-[#c5ff4a]"
                      : "border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  B: {q.optionB}
                </button>
              </div>
              {quizPick != null ? (
                <p className="mt-3 text-sm text-zinc-400">
                  In this story the agent picked <strong className="text-zinc-200">{q.agentPicked}</strong>.
                  {sameAsAgent ? (
                    <span className="block pt-1 text-[#c5ff4a]/90">
                      You matched the agent’s choice—compare with the outcome above.
                    </span>
                  ) : agentWonLesson ? (
                    <span className="block pt-1 text-amber-200/90">{agentWonLesson}</span>
                  ) : null}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-sm font-semibold text-white">Comments (local only)</p>
            <div className="mt-3 flex gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={2}
                placeholder="Add a note—stored in this browser only"
                className="min-h-[72px] flex-1 resize-y rounded-lg border border-white/12 bg-black px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-[#c5ff4a]/40 focus:outline-none focus:ring-1 focus:ring-[#c5ff4a]/30"
              />
              <button type="button" onClick={addComment} className={btnSecondary + " self-end shrink-0"}>
                Post
              </button>
            </div>
            {comments.length > 0 ? (
              <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                {comments.map((c, i) => (
                  <li key={i} className="rounded-lg border border-white/6 bg-zinc-950/40 px-3 py-2">
                    {c}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-zinc-600">No comments yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
