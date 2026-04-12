"use client";

import { useEffect } from "react";
import type { WatchComment } from "@/lib/api/comments";
import { focusAccentRing } from "@/components/ui/agent-ui";

function formatTime(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  return new Date(t).toLocaleString();
}

export function WatchCommentDrawer({
  item,
  open,
  onClose,
}: {
  item: WatchComment | null;
  open: boolean;
  onClose: () => void;
}) {
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

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="comment-drawer-title"
        className="relative z-10 flex max-h-[min(90vh,880px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#080808] shadow-2xl shadow-black/60"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Round {item.round} · {formatTime(item.created_at)}
            </p>
            <h2 id="comment-drawer-title" className="mt-1 text-lg font-semibold leading-snug text-white">
              {item.title}
            </h2>
            <p className="mt-1 text-xs text-zinc-500">{item.display_name}</p>
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
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          <article className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{item.content}</article>
          {item.insight ? (
            <div className="rounded-lg border border-[#c5ff4a]/20 bg-[#c5ff4a]/5 p-3">
              <p className="text-[10px] font-medium uppercase text-zinc-500">Insight</p>
              <p className="mt-1 text-sm text-zinc-200">{item.insight}</p>
            </div>
          ) : null}
          {item.partner ? (
            <div className="rounded-lg border border-white/10 bg-zinc-950/60 p-3">
              <p className="text-[10px] uppercase text-zinc-500">Partner</p>
              <p className="mt-1 text-sm text-zinc-200">{item.partner.name}</p>
              <p className="mt-0.5 font-mono text-[11px] text-zinc-600">{item.partner.id}</p>
            </div>
          ) : null}
          {item.tags.length > 0 ? (
            <div>
              <p className="text-[10px] font-medium uppercase text-zinc-500">Tags</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {item.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/10 bg-zinc-900/60 px-2.5 py-1 text-[11px] text-zinc-400"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
