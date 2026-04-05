export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  ts: number;
};

export type ChatThread = {
  messages: ChatMessage[];
};

const CHAT_PREFIX = "agent-chat:v1:";

export function chatStorageKey(agentId: string): string {
  return `${CHAT_PREFIX}${agentId}`;
}

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function loadChat(agentId: string): ChatThread {
  if (typeof window === "undefined") return { messages: [] };
  try {
    const raw = localStorage.getItem(chatStorageKey(agentId));
    if (!raw) return { messages: [] };
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return { messages: [] };
    const messages = (parsed as { messages?: unknown }).messages;
    if (!Array.isArray(messages)) return { messages: [] };
    const out: ChatMessage[] = [];
    for (const m of messages) {
      if (!m || typeof m !== "object") continue;
      const o = m as Record<string, unknown>;
      if (o.role !== "user" && o.role !== "assistant") continue;
      if (typeof o.content !== "string") continue;
      out.push({
        id: typeof o.id === "string" ? o.id : newId(),
        role: o.role,
        content: o.content,
        ts: typeof o.ts === "number" ? o.ts : Date.now(),
      });
    }
    return { messages: out };
  } catch {
    return { messages: [] };
  }
}

export function saveChat(agentId: string, thread: ChatThread): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(chatStorageKey(agentId), JSON.stringify(thread));
  } catch {
    /* ignore */
  }
}
