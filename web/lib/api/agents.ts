import { apiFetchJson } from "@/lib/api-config";
import { normalizePersonality, type AgentPersonality, type PersonalityDimension } from "@/lib/agent-personality";

export type CreateAgentBody = {
  name: string;
  kyc_score: number;
  rich_score: number;
  kol_score: number;
  creator_score: number;
  veteran_score: number;
};

export type CreateAgentResponse = {
  agent_id: string;
  name: string;
  bio: string;
};

export type StrategyPatch = Partial<
  Record<PersonalityDimension | "freeText", number | string | undefined>
>;

export type AgentReview = {
  round: number;
  reviewer_name: string;
  content: string;
  reviewer_match_rate: number | null;
};

export type AgentComment = {
  round: number;
  content: string;
};

export type AgentStrategyDto = {
  id?: string;
  agentId?: string;
  trustTendency: number;
  deceptionWillingness: number;
  riskPreference: number;
  cooperationPriority: number;
  revengeTendency: number;
  reputationSensitivity: number;
  urgencyThreshold: number;
  socialActivity: number;
  freeText?: string;
  updatedAt?: string;
};

export type AgentDetail = {
  id: string;
  display_name: string;
  bio: string;
  status: string;
  created_at: string;
  cumulative_score: number;
  verified_scores: {
    kyc: number;
    rich: number;
    kol: number;
    creator: number;
    veteran: number;
  };
  strategy: AgentStrategyDto | null;
  behavioral: {
    total_trades: number;
    type_match_rate: number | null;
  };
  reviews: AgentReview[];
  memory?: unknown;
  comments?: AgentComment[];
};

export function createAgent(body: CreateAgentBody): Promise<CreateAgentResponse> {
  return apiFetchJson<CreateAgentResponse>("/agents/create", {
    method: "POST",
    json: body,
  });
}

export function updateAgentStrategy(agentId: string, patch: StrategyPatch): Promise<AgentStrategyDto> {
  return apiFetchJson<AgentStrategyDto>(`/agents/${encodeURIComponent(agentId)}/strategy`, {
    method: "PUT",
    json: patch,
  });
}

export function getAgent(agentId: string): Promise<AgentDetail> {
  return apiFetchJson<AgentDetail>(`/agents/${encodeURIComponent(agentId)}`);
}

export function personalityToStrategyPatch(p: AgentPersonality): StrategyPatch {
  const { freeText, ...dims } = p;
  const patch: StrategyPatch = { ...dims };
  if (freeText !== undefined) patch.freeText = freeText;
  return patch;
}

export function strategyDtoToPersonality(s: AgentStrategyDto): AgentPersonality {
  return normalizePersonality(s as Partial<Record<string, unknown>>);
}

/** `GET /agents/:id/trade-summary?season_id=…` */
export type TradeSummaryFruit = { type: string; quality: number };

/**
 * One row from `GET /agents/:id/trade-summary`.
 * The server may attach additional primitive or JSON-shaped keys; the list UI surfaces unknown keys.
 */
export type TradeSummaryRound = {
  round: number;
  held: TradeSummaryFruit;
  target: string;
  rounds_left: number;
  traded: boolean;
  got_target: boolean;
  received: TradeSummaryFruit | null;
  partner: { id: string; name: string } | null;
};

export type AgentTradeSummaryResponse = {
  agent_id: string;
  season_id: string;
  display_name: string;
  rounds: TradeSummaryRound[];
};

/** `GET /agents/:id/round?season_id=…&round=…` */
export type AgentRoundSnapshot = {
  held_fruit_type: string;
  held_fruit_quality: number;
  target_fruit_type: string;
  action_points: number;
  status: string;
  cumulative_score: number;
};

export type AgentRoundListing = {
  claimed_type: string;
  claimed_quality: number;
  wanted_type: string;
  description: string;
};

export type AgentRoundMarketListing = {
  agent_id: string;
  display_name: string;
  claimed_type: string;
  claimed_quality: number;
  wanted_type: string;
  description: string;
  reputation?: Record<string, unknown>;
};

export type AgentRoundOutcome = {
  completed: boolean;
  eliminated: boolean;
  score_gained: number;
  fruit_after: { type: string; quality: number } | null;
};

export type AgentRoundFraudItem = { victim: string; claimed: string; actual: string };

export type AgentRoundDetailResponse = {
  agent_id: string;
  season_id: string;
  round: number;
  snapshot: AgentRoundSnapshot;
  my_listing: AgentRoundListing | null;
  market_listings: AgentRoundMarketListing[];
  timeline: unknown[];
  outcome: AgentRoundOutcome;
  fraud: {
    committed: AgentRoundFraudItem[];
    suffered: unknown[];
  };
  /** May be a JSON string or a structured object from the API. */
  round_memory: unknown;
  comment: unknown;
};

export function getAgentTradeSummary(agentId: string): Promise<AgentTradeSummaryResponse> {
  return apiFetchJson<AgentTradeSummaryResponse>(`/agents/${encodeURIComponent(agentId)}/trade-summary`);
}

export function getAgentRoundDetail(agentId: string, round: number): Promise<AgentRoundDetailResponse> {
  return apiFetchJson<AgentRoundDetailResponse>(
    `/agents/${encodeURIComponent(agentId)}/round?round=${encodeURIComponent(String(round))}`,
  );
}

/** Strategy advisor chat — server agents only. */

export type StrategyChatHistoryItem = { role: "advisor" | "user"; content: string };

export type StrategyChatTurnResponse = {
  message: string | null;
  history: StrategyChatHistoryItem[];
};

export type StrategyChatGenerateResponse = {
  free_text: string;
};

export type StrategyChatDeleteResponse = {
  deleted: number;
};

export function startStrategyChat(agentId: string): Promise<StrategyChatTurnResponse> {
  return apiFetchJson<StrategyChatTurnResponse>(`/agents/${encodeURIComponent(agentId)}/strategy-chat/start`, {
    method: "POST",
    json: {},
  });
}

export function sendStrategyChatMessage(agentId: string, message: string): Promise<StrategyChatTurnResponse> {
  return apiFetchJson<StrategyChatTurnResponse>(`/agents/${encodeURIComponent(agentId)}/strategy-chat`, {
    method: "POST",
    json: { message },
  });
}

export function generateStrategyFreeTextFromChat(agentId: string): Promise<StrategyChatGenerateResponse> {
  return apiFetchJson<StrategyChatGenerateResponse>(
    `/agents/${encodeURIComponent(agentId)}/strategy-chat/generate`,
    { method: "POST", json: {} },
  );
}

export function deleteStrategyChat(agentId: string): Promise<StrategyChatDeleteResponse> {
  return apiFetchJson<StrategyChatDeleteResponse>(`/agents/${encodeURIComponent(agentId)}/strategy-chat`, {
    method: "DELETE",
  });
}
