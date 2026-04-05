"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadChat, saveChat, type ChatMessage } from "@/lib/agent-chat-storage";
import { generateAssistantReply, welcomeMessage } from "@/lib/agent-chat-reply";
import { loadPersonality, normalizePersonality, DEFAULT_PERSONALITY } from "@/lib/agent-personality";

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function AgentChatBox({
  agentId,
  agentDisplayName,
  className = "",
}: {
  agentId: string;
  agentDisplayName: string;
  className?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    const thread = loadChat(agentId);
    if (thread.messages.length === 0) {
      const p = loadPersonality(agentId) ?? DEFAULT_PERSONALITY;
      const welcome: ChatMessage = {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: welcomeMessage(p, agentDisplayName),
        ts: Date.now(),
      };
      const seeded = { messages: [welcome] };
      saveChat(agentId, seeded);
      setMessages(seeded.messages);
    } else {
      setMessages(thread.messages);
    }
    scrollToBottom();
  }, [agentId, agentDisplayName, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  async function send() {
    const text = input.trim();
    if (!text || typing) return;
    setInput("");

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      ts: Date.now(),
    };
    const userIndex = messages.filter((m) => m.role === "user").length;
    const next = [...messages, userMsg];
    setMessages(next);
    saveChat(agentId, { messages: next });

    setTyping(true);
    const ms = 400 + Math.floor(Math.random() * 450);
    await delay(ms);

    const personality = normalizePersonality(loadPersonality(agentId) ?? DEFAULT_PERSONALITY);
    const replyText = generateAssistantReply({
      personality,
      userText: text,
      userMessageIndex: userIndex,
    });
    const asst: ChatMessage = {
      id: `a-${Date.now()}`,
      role: "assistant",
      content: `${replyText}\n\n(simulated reply)`,
      ts: Date.now(),
    };
    const final = [...next, asst];
    setMessages(final);
    saveChat(agentId, { messages: final });
    setTyping(false);
  }

  return (
    <div
      className={`flex min-h-[220px] flex-col rounded-xl border border-zinc-800 bg-zinc-950/80 ${className}`}
    >
      <div className="border-b border-zinc-800 px-3 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Chat</h3>
        <p className="text-[11px] text-zinc-600">Rule-based, offline. Not a real LLM.</p>
      </div>

      <div
        ref={listRef}
        className="min-h-0 flex-1 space-y-2 overflow-y-auto px-2 py-2"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-[#c5ff4a]/15 text-zinc-100"
                  : "bg-zinc-800/90 text-zinc-200"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {typing ? (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-zinc-800/60 px-3 py-2 text-xs text-zinc-500">Typing…</div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-zinc-800 p-2">
        <div className="flex gap-2">
          <textarea
            rows={2}
            aria-label="Message input"
            placeholder="e.g. How should we trade this round?"
            className="min-h-[40px] flex-1 resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-zinc-200 placeholder:text-zinc-600"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <button
            type="button"
            disabled={typing || !input.trim()}
            onClick={() => void send()}
            className="self-end rounded-md bg-[#c5ff4a] px-3 py-2 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
