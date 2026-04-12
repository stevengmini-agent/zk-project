"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAppToast } from "@/components/providers/toast-provider";
import { apiFetchJson } from "@/lib/api-config";
import { parseCurrentRoundFromResponse, parseSeasonIdFromResponse } from "@/lib/season-api";
import { getGlobalSeasonId, setGlobalSeasonId, subscribeSeasonId } from "@/lib/season-store";

export type SeasonStatus = "idle" | "loading" | "ready" | "error";

type SeasonContextValue = {
  seasonId: string | null;
  /** From `GET /seasons/current` when present; otherwise null. */
  currentRound: number | null;
  status: SeasonStatus;
  error: Error | null;
  /** Re-fetches `GET /seasons/current` and updates the global `season_id`. */
  refreshSeason: () => Promise<void>;
};

const SeasonContext = createContext<SeasonContextValue | null>(null);

export function SeasonProvider({ children }: { children: ReactNode }) {
  const { showToast } = useAppToast();
  const [seasonId, setSeasonId] = useState<string | null>(() => getGlobalSeasonId());
  const [currentRound, setCurrentRound] = useState<number | null>(null);
  const [status, setStatus] = useState<SeasonStatus>("loading");
  const [error, setError] = useState<Error | null>(null);

  const refreshSeason = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const raw = await apiFetchJson<unknown>("/seasons/current");
      const id = parseSeasonIdFromResponse(raw);
      const round = parseCurrentRoundFromResponse(raw);
      setCurrentRound(round);
      setGlobalSeasonId(id);
      setSeasonId(id);
      setStatus(id ? "ready" : "error");
      if (!id) {
        const msg = "Current season response had no id";
        setError(new Error(msg));
        showToast(msg, "error");
      }
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setGlobalSeasonId(null);
      setSeasonId(null);
      setCurrentRound(null);
      setError(err);
      setStatus("error");
      showToast(err.message, "error");
    }
  }, [showToast]);

  useEffect(() => {
    void refreshSeason();
  }, [refreshSeason]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshSeason();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refreshSeason]);

  useEffect(() => {
    return subscribeSeasonId(() => {
      setSeasonId(getGlobalSeasonId());
    });
  }, []);

  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        void refreshSeason();
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [refreshSeason]);

  const value = useMemo<SeasonContextValue>(
    () => ({
      seasonId,
      currentRound,
      status,
      error,
      refreshSeason,
    }),
    [seasonId, currentRound, status, error, refreshSeason],
  );

  return <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>;
}

export function useSeason(): SeasonContextValue {
  const ctx = useContext(SeasonContext);
  if (!ctx) {
    throw new Error("useSeason must be used within SeasonProvider");
  }
  return ctx;
}
