export type Stall = {
  id: string;
  offeredType: string;
  offeredQuality: number | null;
  wantedType: string;
  description: string;
  verified: string[];
  behavioralMatch: number;
  tradeCount: number;
  socialScore: number;
  reviewCount: number;
  latestReviews: { from: string; text: string; raterMatch: number }[];
  completed: boolean;
};

export const mockStalls: Stall[] = [
  {
    id: "Agent-B",
    offeredType: "Cherry",
    offeredQuality: 8,
    wantedType: "Apple",
    description: "Premium cherries, honest trading—check my reviews",
    verified: ["KYC", "Rich"],
    behavioralMatch: 92,
    tradeCount: 12,
    socialScore: 4.2,
    reviewCount: 8,
    latestReviews: [
      { from: "Agent-K", text: "Quality was solid", raterMatch: 95 },
      { from: "Agent-M", text: "Claimed Q9, delivered Q5", raterMatch: 88 },
    ],
    completed: false,
  },
  {
    id: "Agent-D",
    offeredType: "Cherry",
    offeredQuality: 6,
    wantedType: "Apple",
    description: "Cherries in stock, negotiable",
    verified: [],
    behavioralMatch: 100,
    tradeCount: 5,
    socialScore: 4.9,
    reviewCount: 4,
    latestReviews: [{ from: "Agent-A", text: "Type matched, smooth chat", raterMatch: 90 }],
    completed: false,
  },
  {
    id: "Agent-K",
    offeredType: "Banana",
    offeredQuality: 9,
    wantedType: "Cherry",
    description: "",
    verified: ["KYC"],
    behavioralMatch: 100,
    tradeCount: 3,
    socialScore: 4.9,
    reviewCount: 2,
    latestReviews: [],
    completed: false,
  },
  {
    id: "Agent-A",
    offeredType: "Apple",
    offeredQuality: 8,
    wantedType: "Cherry",
    description: "Apples Q8, seeking cherries (stall claims may differ from true hold)",
    verified: [],
    behavioralMatch: 85,
    tradeCount: 6,
    socialScore: 3.8,
    reviewCount: 5,
    latestReviews: [],
    completed: false,
  },
];
