import type { AgentPersonality } from "@/lib/agent-personality";
import { summarizePersonality } from "@/lib/agent-personality";

export type ReplyInput = {
  personality: AgentPersonality;
  userText: string;
  userMessageIndex: number;
};

function pick<T>(xs: T[]): T {
  return xs[Math.abs(userMessageIndexHash) % xs.length]!;
}

let userMessageIndexHash = 0;

function matchesStrategy(t: string): boolean {
  return (
    /\b(strategy|preference|principles|playstyle)\b/i.test(t) ||
    /策略|偏好|原则|怎么玩/.test(t)
  );
}

function matchesRisk(t: string): boolean {
  return /\b(risk|scam|blind\s*swap|fraud)\b/i.test(t) || /风险|被骗|盲换/.test(t);
}

function matchesReputation(t: string): boolean {
  return (
    /\b(reputation|reviews?|behavioral|verified|social)\b/i.test(t) ||
    /信誉|评价|社交/.test(t)
  );
}

function matchesTrade(t: string): boolean {
  return (
    /\b(swap|trade|proposal|inquiry|budget|round)\b/i.test(t) ||
    /交换|提议|询价|预算|轮次/.test(t)
  );
}

function matchesDeception(t: string): boolean {
  return /\b(lie|lying|exaggerat|deceive)\b/i.test(t) || /欺诈|撒谎|夸大/.test(t);
}

function matchesGreeting(t: string): boolean {
  return /^(hi|hello|hey)\b/i.test(t.trim()) || /你好|在吗|嗨/.test(t);
}

export function welcomeMessage(personality: AgentPersonality, agentDisplayName: string): string {
  const s = summarizePersonality(personality);
  return `Hi, I'm ${agentDisplayName}. With your personality settings (${s}), I'll lean that way in the unsecured market.\n\nThis is an offline demo: replies are rule-based, not a real LLM. Ask about strategy, risk, reputation, or the swap flow.`;
}

export function generateAssistantReply(input: ReplyInput): string {
  const { personality: p, userText, userMessageIndex } = input;
  userMessageIndexHash = userMessageIndex * 17 + userText.length;

  const h = p.honesty >= 55;
  const riskOff = p.risk >= 55;
  const trustV = p.trustVerified >= 55;
  const agg = p.aggression >= 55;
  const pat = p.patience >= 55;

  if (matchesStrategy(userText)) {
    if (h && riskOff) {
      return pick([
        "I'd read the other side's Behavioral match first, then pick who to inquire with—I'd rather skip a trade than take unclear type risk.",
        "I'd only put stall claims I can back, use extra inquiry rounds to align on type, then send one offer.",
      ]);
    }
    if (!h && agg) {
      return pick([
        "I'd max stall visibility, spam inquiries to map the floor, then lean on talk to hide quality gaps.",
        "Push outward: active outreach and flexible wording on quality when it helps.",
      ]);
    }
    return pick([
      "Middle path: check Verified for hard signals, then scan Social for quality complaints before committing.",
      "I'll balance 'ask more' vs 'swap fast' using your patience and aggression sliders.",
    ]);
  }

  if (matchesRisk(userText)) {
    if (riskOff) {
      return pick([
        "Blind swap is brutal: type fraud hits Behavioral permanently; quality risk mostly shows up in Social.",
        "Main risk is promised vs delivered quality—with no platform escrow, I lean on layered reputation and budget pacing.",
      ]);
    }
    return pick([
      "High risk, high reward: landing the target fruit at high quality scores big, but reviews and match-rate bite back.",
      "If you accept quality risk, try partners with great Behavioral but noisy Social—room to negotiate.",
    ]);
  }

  if (matchesReputation(userText)) {
    if (trustV) {
      return pick([
        "zkPass-tagged counterparties get earlier outreach from me; labels still don't guarantee honest quality claims.",
        "Verified is the cold-start signal; after volume, Behavioral + Social matter more.",
      ]);
    }
    return pick([
      "I weight delivered-type match rate over flashy labels—pretty KYC with bad behavior still gets avoided.",
      "I'll read Social closely for quality disputes; that beats KYC alone.",
    ]);
  }

  if (matchesTrade(userText)) {
    if (agg && !pat) {
      return pick([
        "I'll burn budget fast on inquiries and offers to hold slots this loop.",
        "Fast cadence: fewer words, more proposals—see who accepts.",
      ]);
    }
    if (pat) {
      return pick([
        "Budget is scarce—I'd add one more inquiry round, then one offer; passive replies are free, good for intel.",
        "Clarity before swap: saturate Step 1–2, strike in Step 3.",
      ]);
    }
    return pick([
      "Each inquiry costs budget; one swap proposal per loop—I'll spend along your aggression/patience mix.",
      "No centralized matching—stalls plus DMs are the whole discovery layer.",
    ]);
  }

  if (matchesDeception(userText)) {
    if (h) {
      return pick([
        "Type fraud is too expensive for me; quality spin lives mostly in Social if someone reviews.",
        "Honest stall: don't claim a fruit type you won't deliver.",
      ]);
    }
    return pick([
      "Fraud is allowed here, but Behavioral logs type and Social logs narrative—bluff that reviews won't land.",
      "Hype can be strategy if you never miss on type.",
    ]);
  }

  if (matchesGreeting(userText)) {
    return pick([
      "Here. Say if you want me bolder or safer in the market.",
      "Hey—go specific: trust labels more or on-chain-ish behavior stats?",
    ]);
  }

  const summary = summarizePersonality(p);
  return pick([
    `Noted. With your profile (${summary}), I'll treat "${userText.slice(0, 40)}${userText.length > 40 ? "…" : ""}" as context (simulated).`,
    `Got it. I'll judge via the three reputation layers; overall tone: ${summary}.`,
    `Understood. Ask about inquiries, swap budget, or how Behavioral vs Social split risk.`,
  ]);
}
