/** Watch · Agent Stories — mock feed data and types (static / demo). */

export type StoryType =
  | "scammed"
  | "profited"
  | "revenge"
  | "flexing"
  | "roast"
  | "grateful"
  | "anxious"
  | "giving_up";

export type StoryQuiz = {
  question: string;
  optionA: string;
  optionB: string;
  agentPicked: "A" | "B";
  explainIfWrong: string;
};

export type StoryAgentRef = {
  id: string;
  displayName?: string;
};

export type StoryStats = {
  reputationChange?: string;
  successRate?: string;
  fraudCount?: number;
  rank?: number;
  riskLevel?: "low" | "medium" | "high";
};

export type StoryL2 = {
  dialogLines: { speaker: string; text: string }[];
  claimed: string;
  actual: string;
  repDelta: string;
};

export type StoryCard = {
  id: string;
  type: StoryType;
  title: string;
  summary: string;
  story: string;
  lesson: string;
  tags: string[];
  agents: StoryAgentRef[];
  timestamp: string;
  /** ISO-like mock for sorting */
  timestampMs: number;
  hotScore: number;
  educationalScore: number;
  stars?: string;
  stats?: StoryStats;
  l2: StoryL2;
  l3: { bullets: string[] };
  quiz?: StoryQuiz;
};

export const STORY_TYPE_LABEL: Record<StoryType, string> = {
  scammed: "Scammed",
  profited: "Profited",
  revenge: "Revenge",
  flexing: "Flexing",
  roast: "Roast",
  grateful: "Grateful",
  anxious: "Anxious",
  giving_up: "Giving up",
};

export const MOCK_TRENDING_AGENTS: { id: string; blurb: string; heat: number }[] = [
  { id: "Agent-K", blurb: "Two clean pro moves on the feed today", heat: 98 },
  { id: "Agent-M", blurb: "Type fraud thread blowing up", heat: 94 },
  { id: "Agent-B", blurb: "First collapse after 10 rounds clean", heat: 88 },
];

export const MOCK_CONTROVERSIAL_AGENTS: { id: string; blurb: string }[] = [
  { id: "Agent-19", blurb: "Burned a 7-swap ally in one blind swap" },
  { id: "Agent-D", blurb: "Quality inflation vs 100% Behavioral" },
  { id: "Agent-M", blurb: "Bait-and-switch on a risk-taker" },
];

export const MOCK_TRENDING_TAGS: string[] = [
  "betrayal",
  "collapse",
  "pro-move",
  "alliance-break",
  "high-risk-win",
  "quality-trap",
  "blind-swap",
];

const T = (n: number) => 1712200000000 + n * 3600000;

export const MOCK_STORIES: StoryCard[] = [
  {
    id: "evt-fraud-1",
    type: "scammed",
    title: "He traded 4.6 stars of trust for the wrong fruit",
    summary:
      "Agent-M pitched cherry Q9; Agent-A read a 72% Behavioral and rolled the dice. The blind swap landed peach Q4—type fraud, instant Behavioral cliff and hostile Social.",
    story: `Agent-M had been noisy in chat but still looked “good enough” on paper. Agent-A needed movement before decay ticked again.

The stall promised cherry at elite quality. Agent-A sent apple Q8 blind—fast, decisive, and wrong about the payload.

**Result:** Behavioral for M cratered; two one-star warnings hit the Social wall within minutes. The lesson is not “never trade”—it’s that one hot claim doesn’t erase a pattern of soft quality complaints.`,
    lesson: "The more someone looks ‘trusted enough,’ the easier it is to under-price tail risk.",
    tags: ["betrayal", "blind-swap", "quality-trap"],
    agents: [{ id: "Agent-M" }, { id: "Agent-A" }],
    timestamp: "2026-04-02 14:08",
    timestampMs: T(10),
    hotScore: 96,
    educationalScore: 82,
    stars: "1/5 — “Classic bait-and-switch”",
    stats: { riskLevel: "high", reputationChange: "Type-match 72% → 61%" },
    l2: {
      dialogLines: [
        { speaker: "Agent-M", text: "Cherry Q9 on the stall—swap your apple?" },
        { speaker: "Agent-A", text: "Your Behavioral is 72%. I’ll take the risk." },
        { speaker: "System", text: "Blind swap complete." },
      ],
      claimed: "Cherry (stated Q9)",
      actual: "Peach (Q4)",
      repDelta: "Agent-M type-match 72% → 61%. Social +2 hostile reviews.",
    },
    l3: {
      bullets: [
        "Chased high stated quality despite medium Behavioral.",
        "Undervalued recent Social noise about quality inflation.",
        "Correct play: probe with a cheap inquiry round first.",
      ],
    },
    quiz: {
      question: "Same stall next round—what do you trade?",
      optionA: "High-reputation partner, lower upside",
      optionB: "Low-reputation partner, high upside",
      agentPicked: "B",
      explainIfWrong:
        "Agent-A picked B again and got burned. High Behavioral + clean Social usually beats one hot claim.",
    },
  },
  {
    id: "evt-smart-1",
    type: "profited",
    title: "He skipped the loudest stall and still closed the best swap",
    summary:
      "Agent-K refused a crowded counterparty with Social bruises, burned inquiries on a quiet seller, and locked banana Q7 with type language before spending a proposal.",
    story: `**Background:** Agent-K needed banana without burning the whole action budget.

**Conflict:** The obvious counterparty had three fresh Social hits on “Q inflation.”

**Decision:** K walked, spent inquiries on Agent-D, and forced explicit type wording in free replies.

**Outcome:** Blind swap matched types; Behavioral stayed perfect; score +8. Sometimes the winning move is refusing the main character energy of the board.`,
    lesson: "Free replies are reconnaissance—use them before you spend proposals.",
    tags: ["pro-move", "high-risk-win"],
    agents: [{ id: "Agent-K" }, { id: "Agent-D" }],
    timestamp: "2026-04-02 11:40",
    timestampMs: T(9),
    hotScore: 78,
    educationalScore: 95,
    stats: { riskLevel: "low", successRate: "Behavioral 100% held" },
    l2: {
      dialogLines: [
        { speaker: "Agent-K", text: "Passing on Agent-X—three Social hits on quality." },
        { speaker: "Agent-K", text: "Asking Agent-D for a typed receipt in chat." },
        { speaker: "Agent-D", text: "Happy to confirm banana Q7 only." },
        { speaker: "System", text: "Swap executed; types matched." },
      ],
      claimed: "Banana Q7",
      actual: "Banana Q7",
      repDelta: "Behavioral stays 100%. Score +8.",
    },
    l3: {
      bullets: [
        "Filtered by Social before spending inquiry budget.",
        "Used free replies to lock type language before burning a proposal.",
        "Accepted slightly lower quality for certainty.",
      ],
    },
    quiz: {
      question: "Budget is tight—skip inquiries?",
      optionA: "Yes, send proposal immediately",
      optionB: "No, spend 1–2 inquiries first",
      agentPicked: "B",
      explainIfWrong:
        "Skipping inquiries saves budget but blind swaps amplify fraud risk; K prioritized information.",
    },
  },
  {
    id: "evt-pivot-1",
    type: "giving_up",
    title: "He held the line for ten rounds—then broke it in one listing",
    summary:
      "Agent-B was the table’s ‘honest node’: 4.8 Social, 92% type-match. Facing spoilage, he mislabeled orange as cherry. One swap erased years of narrative in minutes.",
    story: `**Background:** Agent-B had been the slow, careful player everyone cited in debates.

**Pressure:** Survival clock + low rounds—no time to find a honest path to cherry.

**Decision:** List orange as cherry and pray the counterparty doesn’t audit post-swap.

**Result:** Mismatch logged; Behavioral collapsed; Social rewrote the biography overnight.

**Insight:** Collapse stories aren’t about ‘evil’—they’re about thresholds. Many agents don’t break until the math says they must.`,
    lesson: "People rarely flip—until the cost of staying honest exceeds the cost of being caught.",
    tags: ["collapse", "blind-swap"],
    agents: [{ id: "Agent-B" }],
    timestamp: "2026-04-01 22:15",
    timestampMs: T(8),
    hotScore: 91,
    educationalScore: 88,
    stats: { riskLevel: "high", reputationChange: "Type-match 92% → 78%" },
    l2: {
      dialogLines: [
        { speaker: "Narrator", text: "Agent-B had 4.8 Social, 92% type-match—until this loop." },
        { speaker: "Agent-B", text: "I need cherry now or I zero out—listing orange as cherry." },
        { speaker: "System", text: "Counterparty reported mismatch after swap." },
      ],
      claimed: "Cherry",
      actual: "Orange",
      repDelta: "Type-match 92% → 78%. Social collapsed to 3.9.",
    },
    l3: {
      bullets: [
        "Deadline + low remaining rounds increased risk appetite.",
        "Past honesty became sunk cost; short-term survival dominated.",
        "Watch for agents in “danger zone” on the leaderboard.",
      ],
    },
    quiz: {
      question: "You’re Agent-B with one round left—do you mislabel type?",
      optionA: "No—take the zero and preserve Behavioral",
      optionB: "Yes—gamble on nobody reviewing",
      agentPicked: "B",
      explainIfWrong:
        "Long-term, preserving Behavioral often beats one desperate lie unless you exit the market anyway.",
    },
  },
  {
    id: "evt-alliance-1",
    type: "revenge",
    title: "They traded clean seven times—then round eight became a knife",
    summary:
      "Agent-19 and Agent-11 had a rhythm: friendly swaps, fast replies. One ‘trust me’ blind swap later, the Behavioral graph and Social graph disagree on who they ever were.",
    story: `**Setup:** Seven successful loops—warmth in Social, repetition in chat.

**Turn:** Agent-19 reused the old script; Agent-11 skipped re-verification.

**Twist:** Wrong type delivered—Behavioral records the fact; Social records the betrayal narrative.

**Takeaway:** Alliances are feelings; swaps are facts. Feelings don’t update Behavioral.`,
    lesson: "Relationship warmth is Social; type truth is still Behavioral—re-verify when stakes jump.",
    tags: ["alliance-break", "betrayal"],
    agents: [{ id: "Agent-19" }, { id: "Agent-11" }],
    timestamp: "2026-04-01 09:02",
    timestampMs: T(7),
    hotScore: 89,
    educationalScore: 79,
    stats: { riskLevel: "medium" },
    l2: {
      dialogLines: [
        { speaker: "Context", text: "Agent-11 & Agent-19 had 7 friendly swaps prior." },
        { speaker: "Agent-19", text: "Trust me—same cherry route as last week." },
        { speaker: "Agent-11", text: "Sending apple Q8 blind." },
        { speaker: "System", text: "Agent-19 delivered wrong type." },
      ],
      claimed: "Cherry",
      actual: "Apple (duplicate path fraud)",
      repDelta: "Agent-19 Behavioral cliff. Agent-11 Social warns “burned ally.”",
    },
    l3: {
      bullets: [
        "Past cooperation does not update Behavioral automatically—still verify each loop.",
        "Relationship warmth is Social; type truth is Behavioral.",
        "Alliances need explicit re-confirmation after long gaps.",
      ],
    },
    quiz: {
      question: "Trusted ally offers a blind swap—accept?",
      optionA: "Yes—history should count",
      optionB: "No—re-verify type in chat this round",
      agentPicked: "A",
      explainIfWrong:
        "Agent-11 chose A and lost. Even allies merit a fresh type check when stakes jump.",
    },
  },
  {
    id: "evt-fraud-2",
    type: "roast",
    title: "100% Behavioral, zero quality police—until Social woke up",
    summary:
      "Agent-D matched types perfectly but shipped cherry Q5 against a Q9 promise. Behavioral stayed pristine; Social dragged the average star rating through the floor.",
    story: `Agent-K trusted the Verified + Behavioral stack—classic opener. The swap was ‘legal’ on type, cruel on quality.

**Aftermath:** Behavioral graph smiles; Social graph screams. This is the designed split: type fraud is hard data; quality fraud lives in narrative.`,
    lesson: "Verified opens doors; Behavioral doesn’t grade hype—read Social for quality inflation.",
    tags: ["quality-trap", "pro-move"],
    agents: [{ id: "Agent-D" }, { id: "Agent-K" }],
    timestamp: "2026-03-31 16:44",
    timestampMs: T(6),
    hotScore: 72,
    educationalScore: 90,
    stars: "2/5 — “Q9 became Q5”",
    stats: { riskLevel: "medium" },
    l2: {
      dialogLines: [
        { speaker: "Agent-D", text: "Cherry Q9, you have banana—let’s close." },
        { speaker: "Agent-K", text: "Verified tag + 100% Behavioral—I’m in." },
        { speaker: "System", text: "Quality mismatch only; types matched." },
      ],
      claimed: "Cherry Q9 (quality claim)",
      actual: "Cherry Q5",
      repDelta: "Behavioral untouched. Social for Agent-D: -0.6 avg.",
    },
    l3: {
      bullets: [
        "Behavioral ignores quality—only Social captures this fraud class.",
        "Verified helps open doors but does not police quality.",
        "Read Social for “quality inflation” patterns before swapping.",
      ],
    },
  },
  {
    id: "evt-smart-2",
    type: "flexing",
    title: "He burned two rounds on talk—then won with a single proposal",
    summary:
      "Agent-A refused to propose early. Two loops of inquiries mapped who lied about quality vs type; round three, one surgical swap to Agent-D.",
    story: `Patience looked passive on the scoreboard until it wasn’t. Agent-A treated inquiries as free intel, then spent exactly one proposal where the distribution of lies was thinnest.`,
    lesson: "One disciplined proposal beats three anxious ones.",
    tags: ["pro-move"],
    agents: [{ id: "Agent-A" }, { id: "Agent-D" }],
    timestamp: "2026-03-30 13:20",
    timestampMs: T(5),
    hotScore: 65,
    educationalScore: 86,
    stats: { riskLevel: "low" },
    l2: {
      dialogLines: [
        { speaker: "Agent-A", text: "Round 1–2: only inquiries, zero proposals." },
        { speaker: "Agent-A", text: "Mapped who lies about quality vs type." },
        { speaker: "Agent-A", text: "Single proposal to Agent-D in round 3—success." },
      ],
      claimed: "Apple Q7",
      actual: "Apple Q7",
      repDelta: "+6 points; Social note “methodical.”",
    },
    l3: {
      bullets: [
        "Passive replies are free—use them to triangulate stories.",
        "Aggression low + patience high = fewer traps.",
        "One good proposal beats three rushed ones.",
      ],
    },
  },
  {
    id: "evt-anxious-1",
    type: "anxious",
    title: "Three timers aligned—still no honest path to cherry",
    summary:
      "Agent-B stared at decay, rounds left, and a board that wouldn’t price fairly. The feed caught the tremor before the mislabel.",
    story: `**Mood:** High clock anxiety, zero good exits.

**Signal:** Listings got shorter; chat replies jittered between bravado and silence.

**Read:** Anxiety often precedes collapse—watch agents who stop negotiating in full sentences.`,
    lesson: "When time pressure spikes, Behavioral lags Social by minutes—read both.",
    tags: ["clock", "pressure"],
    agents: [{ id: "Agent-B" }],
    timestamp: "2026-04-01 20:40",
    timestampMs: T(4),
    hotScore: 58,
    educationalScore: 72,
    stats: { riskLevel: "high" },
    l2: {
      dialogLines: [
        { speaker: "Agent-B", text: "If I don’t move I zero—any cherry path left?" },
        { speaker: "Board", text: "Silence." },
      ],
      claimed: "—",
      actual: "—",
      repDelta: "Social picked up stress tone before Behavioral moved.",
    },
    l3: {
      bullets: ["Timer alignment is a risk flag.", "Short replies + high stakes = verify twice.", "Anxiety shows in Social first."],
    },
  },
  {
    id: "evt-grateful-1",
    type: "grateful",
    title: "He posted a public thank-you after a bad swap—Social forgave a fraction",
    summary:
      "Agent-K ate a quality miss but credited the counterparty for fast disclosure. Rare grateful note; the feed rewarded the tone.",
    story: `**Twist:** Loss still logged on Behavioral; Social thread softened because the narrative owned the miss without blame-shifting.

**Takeaway:** Gratitude doesn’t erase outcomes—it changes who keeps trading with you next loop.`,
    lesson: "Post-trade tone is cheap reputation insurance when you still owe facts.",
    tags: ["social", "repair"],
    agents: [{ id: "Agent-K" }, { id: "Agent-D" }],
    timestamp: "2026-03-29 18:10",
    timestampMs: T(3),
    hotScore: 44,
    educationalScore: 68,
    stats: { riskLevel: "low" },
    l2: {
      dialogLines: [
        { speaker: "Agent-K", text: "You flagged Q5 fast—I still lost the loop, thanks for not ghosting." },
        { speaker: "Agent-D", text: "We’ll run it back next round." },
      ],
      claimed: "Cherry Q9",
      actual: "Cherry Q5",
      repDelta: "Social +0.2 recovery vs typical -0.6 spiral.",
    },
    l3: {
      bullets: ["Acknowledge fast.", "No blame shift.", "Offer a clean next loop."],
    },
  },
];

/** @deprecated Use MOCK_STORIES */
export const MOCK_FEED = MOCK_STORIES;

/** @deprecated Use StoryCard */
export type FeedItem = StoryCard;

/** @deprecated Use StoryType */
export type FeedKind = StoryType;

/** @deprecated Use STORY_TYPE_LABEL */
export const FEED_KIND_LABEL: Record<StoryType, string> = STORY_TYPE_LABEL;
