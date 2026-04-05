"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AgentChatBox } from "@/components/agent/agent-chat-box";
import { btnPrimary, btnSecondary, modalSurface } from "@/components/ui/agent-ui";

const strategyKey = (agentId: string) => `agent-strategy:${agentId}`;
const savedAtKey = (agentId: string) => `agent-strategy-saved-at:${agentId}`;

export function StrategyModal({
  agentId,
  agentDisplayName,
}: {
  agentId: string;
  agentDisplayName: string;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    try {
      setText(localStorage.getItem(strategyKey(agentId)) ?? "");
      setSavedAt(localStorage.getItem(savedAtKey(agentId)));
    } catch {
      setText("");
      setSavedAt(null);
    }
  }, [agentId]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    lastFocusRef.current = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => {
      dialogRef.current
        ?.querySelector<HTMLElement>('[aria-label="Message input"]')
        ?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const root = dialogRef.current;
    const focusables = root.querySelectorAll<HTMLElement>(
      'button, [href], textarea, select, input, [tabindex]:not([tabindex="-1"])',
    );
    const list = [...focusables].filter((el) => !el.hasAttribute("disabled"));
    if (list.length === 0) return;
    const first = list[0];
    const last = list[list.length - 1];
    function onTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    root.addEventListener("keydown", onTab);
    return () => root.removeEventListener("keydown", onTab);
  }, [open]);

  useEffect(() => {
    if (!open) {
      lastFocusRef.current?.focus?.();
    }
  }, [open]);

  function saveStrategy() {
    const iso = new Date().toISOString();
    try {
      localStorage.setItem(strategyKey(agentId), text);
      localStorage.setItem(savedAtKey(agentId), iso);
      setSavedAt(iso);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${btnSecondary} border-[#c5ff4a]/25 text-[#c5ff4a] hover:border-[#c5ff4a]/40 hover:bg-[#c5ff4a]/10`}
      >
        Set strategy &amp; chat
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center p-3 sm:items-center sm:p-4"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-black/70"
            onClick={close}
          />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className={`relative z-[101] flex max-h-[90vh] w-full max-w-3xl flex-col ${modalSurface}`}
          >
            <div className="shrink-0 border-b border-zinc-800 p-4 sm:p-5">
              <h2 id={titleId} className="text-lg font-semibold text-white">
                Strategy &amp; chat with {agentDisplayName}
              </h2>
              <p id={descId} className="mt-1 text-sm text-zinc-500">
                Offline demo: strategy text and chat are stored in this browser only. Replies are
                rule-based, not a real model.
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
              <details className="rounded-xl border border-zinc-800 bg-zinc-950/50 open:pb-3">
                <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium text-zinc-300">
                  Written strategy preset (optional)
                </summary>
                <div className="px-3 pt-1">
                  <textarea
                    className="mt-2 h-28 w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600"
                    placeholder="e.g. Prefer high Behavioral match partners; avoid type fraud…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  {savedAt ? (
                    <p className="mt-1 text-xs text-zinc-500">
                      Last saved: {new Date(savedAt).toLocaleString()}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={saveStrategy}
                      className={btnSecondary}
                    >
                      Save strategy
                    </button>
                  </div>
                </div>
              </details>

              <div className="mt-4 flex min-h-[280px] flex-1 flex-col">
                <AgentChatBox
                  agentId={agentId}
                  agentDisplayName={agentDisplayName}
                  className="min-h-[280px] flex-1"
                />
              </div>
            </div>

            <div className="shrink-0 border-t border-zinc-800 p-4 sm:flex sm:justify-end sm:gap-2 sm:p-5">
              <button
                type="button"
                onClick={() => {
                  saveStrategy();
                  close();
                }}
                className={`w-full sm:w-auto ${btnSecondary}`}
              >
                Save strategy &amp; close
              </button>
              <button
                type="button"
                onClick={close}
                className={`mt-2 w-full sm:mt-0 sm:w-auto ${btnPrimary}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
