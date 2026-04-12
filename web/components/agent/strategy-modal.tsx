"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AgentChatBox } from "@/components/agent/agent-chat-box";
import { StrategyChatPanel } from "@/components/agent/strategy-chat-panel";
import { useAppToast } from "@/components/providers/toast-provider";
import { generateStrategyFreeTextFromChat, updateAgentStrategy } from "@/lib/api/agents";
import { isServerAgentId } from "@/lib/agent-id";
import { btnPrimary, btnSecondary, modalSurface } from "@/components/ui/agent-ui";

const spinNeutral =
  "inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-200";

const strategyKey = (agentId: string) => `agent-strategy:${agentId}`;
const savedAtKey = (agentId: string) => `agent-strategy-saved-at:${agentId}`;

export function StrategyModal({
  agentId,
  agentDisplayName,
  /** Narrow trigger for toolbar / card header (default: full-width in flex rows). */
  compact = false,
}: {
  agentId: string;
  agentDisplayName: string;
  compact?: boolean;
}) {
  const { showToast } = useAppToast();
  const [open, setOpen] = useState(false);
  const [strategySaving, setStrategySaving] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

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

  async function saveStrategyFromChat() {
    if (!isServerAgentId(agentId)) {
      showToast("Strategy save from chat is only available for server agents.", "error");
      return;
    }
    setStrategySaving(true);
    try {
      const { free_text } = await generateStrategyFreeTextFromChat(agentId);
      await updateAgentStrategy(agentId, { freeText: free_text });
      try {
        localStorage.setItem(strategyKey(agentId), free_text);
        localStorage.setItem(savedAtKey(agentId), new Date().toISOString());
      } catch {
        /* ignore */
      }
      showToast("Strategy text saved from chat.", "info");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not save strategy", "error");
    } finally {
      setStrategySaving(false);
    }
  }

  const triggerWrap = compact ? "shrink-0" : "min-w-0 w-full sm:w-auto sm:flex-1";
  const triggerBtn = compact
    ? `${btnSecondary} border-[#c5ff4a]/25 text-[#c5ff4a] hover:border-[#c5ff4a]/40 hover:bg-[#c5ff4a]/10 whitespace-nowrap`
    : `w-full ${btnSecondary} border-[#c5ff4a]/25 text-[#c5ff4a] hover:border-[#c5ff4a]/40 hover:bg-[#c5ff4a]/10`;

  const server = isServerAgentId(agentId);

  return (
    <>
      <div className={triggerWrap}>
        <button type="button" onClick={() => setOpen(true)} className={triggerBtn}>
          Set strategy &amp; chat
        </button>
      </div>

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
            aria-describedby={server ? undefined : descId}
            className={`relative z-[101] flex max-h-[90vh] w-full max-w-3xl flex-col ${modalSurface}`}
          >
            <div className="shrink-0 border-b border-zinc-800 p-4 sm:p-5">
              <h2 id={titleId} className="text-lg font-semibold text-white">
                Strategy &amp; chat with {agentDisplayName}
              </h2>
              {!server ? (
                <p id={descId} className="mt-1 text-sm text-zinc-500">
                  Offline demo: rule-based chat in this browser only (not connected to the strategy API).
                </p>
              ) : null}
            </div>

            <div className="min-h-0 shrink-0 p-4 sm:p-5">
              {server ? (
                <StrategyChatPanel agentId={agentId} />
              ) : (
                <AgentChatBox
                  agentId={agentId}
                  agentDisplayName={agentDisplayName}
                  className="h-[420px] min-h-0"
                />
              )}
            </div>

            <div className="shrink-0 border-t border-zinc-800 p-4 sm:flex sm:justify-end sm:gap-2 sm:p-5">
              {server ? (
                <button
                  type="button"
                  disabled={strategySaving}
                  onClick={() => void saveStrategyFromChat()}
                  className={`w-full sm:w-auto ${btnSecondary} inline-flex items-center justify-center gap-2`}
                >
                  {strategySaving ? <span className={spinNeutral} aria-hidden /> : null}
                  Save strategy
                </button>
              ) : null}
              <button
                type="button"
                onClick={close}
                disabled={strategySaving}
                className={`w-full sm:w-auto ${btnPrimary}`}
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
