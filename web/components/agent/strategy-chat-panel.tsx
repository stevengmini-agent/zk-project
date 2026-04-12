"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type StrategyChatHistoryItem,
  type StrategyChatTurnResponse,
  deleteStrategyChat,
  sendStrategyChatMessage,
  startStrategyChat,
} from "@/lib/api/agents";
import { useAppToast } from "@/components/providers/toast-provider";
import type { ChatMessage } from "@/lib/agent-chat-storage";

function historyToMessages(history: StrategyChatHistoryItem[]): ChatMessage[] {
  const ts = Date.now();
  return history.map((h, i) => ({
    id: `strat-${ts}-${i}-${h.role}`,
    role: h.role === "advisor" ? "assistant" : "user",
    content: h.content,
    ts: ts + i,
  }));
}

function messagesFromTurnResponse(data: StrategyChatTurnResponse): ChatMessage[] {
  if (data.history?.length) return historyToMessages(data.history);
  if (data.message) {
    return [{ id: `strat-advisor-${Date.now()}`, role: "assistant", content: data.message, ts: Date.now() }];
  }
  return [];
}

export function StrategyChatPanel({ agentId }: { agentId: string }) {
  const { showToast } = useAppToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [booting, setBooting] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showStartCta, setShowStartCta] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, busy, scrollToBottom]);

  const loadStart = useCallback(async () => {
    setBooting(true);
    setShowStartCta(false);
    try {
      const data = await startStrategyChat(agentId);
      const mapped = messagesFromTurnResponse(data);
      setMessages(mapped);
      setShowStartCta(mapped.length === 0);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not start strategy chat", "error");
      setMessages([]);
      setShowStartCta(true);
    } finally {
      setBooting(false);
    }
  }, [agentId, showToast]);

  useEffect(() => {
    void loadStart();
  }, [loadStart]);

  async function onDeleteChat() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await deleteStrategyChat(agentId);
      setMessages([]);
      setInput("");
      setShowStartCta(true);
      showToast(`Chat cleared (${res.deleted} messages).`, "info");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not delete chat", "error");
    } finally {
      setBusy(false);
    }
  }

  async function onSend() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setBusy(true);
    try {
      const data = await sendStrategyChatMessage(agentId, text);
      setMessages(messagesFromTurnResponse(data));
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not send message", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-[420px] flex-col rounded-xl border border-zinc-800 bg-zinc-950/80">
      <div className="flex shrink-0 items-start justify-between gap-2 border-b border-zinc-800 px-3 py-2">
        <div className="min-w-0">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Strategy chat</h3>
          <p className="text-[11px] text-zinc-600">AI advisor · English strategy text on save</p>
        </div>
        <button
          type="button"
          disabled={busy || booting}
          onClick={() => void onDeleteChat()}
          className="shrink-0 text-xs text-zinc-500 underline-offset-2 transition hover:text-red-400 hover:underline disabled:opacity-40"
        >
          Delete chat
        </button>
      </div>

      <div
        ref={listRef}
        className="min-h-0 flex-1 space-y-2 overflow-y-auto px-2 py-2"
        role="log"
        aria-label="Strategy chat messages"
        aria-live="polite"
      >
        {booting ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">Starting chat…</div>
        ) : showStartCta && messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
            <p className="text-sm text-zinc-500">No messages. Start a new advisor session.</p>
            <button
              type="button"
              disabled={busy}
              onClick={() => void loadStart()}
              className="rounded-md border border-[#c5ff4a]/35 bg-[#c5ff4a]/10 px-3 py-2 text-sm font-medium text-[#c5ff4a] hover:bg-[#c5ff4a]/15 disabled:opacity-40"
            >
              Start chat
            </button>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user" ? "bg-[#c5ff4a]/15 text-zinc-100" : "bg-zinc-800/90 text-zinc-200"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))
        )}
        {busy && !booting ? (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-zinc-800/60 px-3 py-2 text-xs text-zinc-500">Thinking…</div>
          </div>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-zinc-800 p-2">
        <div className="flex gap-2">
          <textarea
            rows={2}
            aria-label="Message input"
            placeholder="Describe how you want this agent to trade…"
            disabled={busy || booting || showStartCta}
            className="min-h-[40px] flex-1 resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 disabled:opacity-50"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void onSend();
              }
            }}
          />
          <button
            type="button"
            disabled={busy || booting || showStartCta || !input.trim()}
            onClick={() => void onSend()}
            className="self-end rounded-md bg-[#c5ff4a] px-3 py-2 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
