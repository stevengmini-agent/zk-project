export type StrategyPrefId = "safe_trade" | "high_risk_yield" | "build_alliance" | "finish_fast";

export type StrategyPrefs = Record<StrategyPrefId, boolean>;

export const STRATEGY_PREF_OPTIONS: { id: StrategyPrefId; label: string }[] = [
  { id: "safe_trade", label: "Prioritize safe trades" },
  { id: "high_risk_yield", label: "Chase high upside / risk" },
  { id: "build_alliance", label: "Build alliances" },
  { id: "finish_fast", label: "Finish the task quickly" },
];

export const DEFAULT_STRATEGY_PREFS: StrategyPrefs = {
  safe_trade: false,
  high_risk_yield: false,
  build_alliance: false,
  finish_fast: false,
};

const PREFIX = "watch-strategy-prefs:v1:";

export function strategyPrefsKey(agentId: string): string {
  return `${PREFIX}${agentId}`;
}

export function loadStrategyPrefs(agentId: string): StrategyPrefs {
  if (typeof window === "undefined") return { ...DEFAULT_STRATEGY_PREFS };
  try {
    const raw = localStorage.getItem(strategyPrefsKey(agentId));
    if (!raw) return { ...DEFAULT_STRATEGY_PREFS };
    const o = JSON.parse(raw) as Partial<StrategyPrefs>;
    return {
      safe_trade: Boolean(o.safe_trade),
      high_risk_yield: Boolean(o.high_risk_yield),
      build_alliance: Boolean(o.build_alliance),
      finish_fast: Boolean(o.finish_fast),
    };
  } catch {
    return { ...DEFAULT_STRATEGY_PREFS };
  }
}

export function saveStrategyPrefs(agentId: string, prefs: StrategyPrefs): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(strategyPrefsKey(agentId), JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}
