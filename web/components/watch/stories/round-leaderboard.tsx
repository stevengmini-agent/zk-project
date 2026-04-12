"use client";

import { useCallback, useEffect, useState } from "react";
import type { RoundLeaderboardEntry } from "@/lib/api/leaderboard";
import { getRoundLeaderboard } from "@/lib/api/leaderboard";
import { useSeason } from "@/components/providers/season-provider";

const TOP = 5;

const tagBase =
  "inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-black/50 px-2.5 py-1 text-[11px] font-medium text-zinc-200 shadow-sm";

export function RoundLeaderboard({ round }: { round: number }) {
  const { status: seasonStatus } = useSeason();
  const [rows, setRows] = useState<RoundLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (seasonStatus !== "ready") {
      setRows([]);
      setLoading(seasonStatus === "loading" || seasonStatus === "idle");
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await getRoundLeaderboard(round);
      setRows(list.slice(0, TOP));
    } catch (e) {
      setRows([]);
      setError(e instanceof Error ? e.message : "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, [round, seasonStatus]);

  useEffect(() => {
    void load();
  }, [load]);

  if (seasonStatus === "error") {
    return <p className="text-xs text-zinc-500">Leaderboard needs a valid season.</p>;
  }

  if (loading) {
    return <p className="text-xs text-zinc-500">Loading round {round}…</p>;
  }

  if (error) {
    return <p className="text-xs text-red-400/90">{error}</p>;
  }

  if (rows.length === 0) {
    return <p className="text-xs text-zinc-500">No leaderboard data for round {round}.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2 sm:justify-end">
      {rows.map((row) => (
        <span key={`${row.rank}-${row.name}`} className={tagBase}>
          <span className="font-mono text-zinc-500">#{row.rank}</span>
          <span className="max-w-[140px] truncate text-zinc-100">{row.name}</span>
          <span className="text-[#c5ff4a]/90">{row.score}</span>
        </span>
      ))}
    </div>
  );
}
