"use client";

import type { StoryType } from "@/lib/mock-watch-feed";

export type TimeScope = "today" | "round" | "all";
export type SortMode = "latest" | "hot" | "educational";

export function StoryFilterBar({
  timeScope,
  onTimeScope,
  category,
  onCategory,
  sort,
  onSort,
}: {
  timeScope: TimeScope;
  onTimeScope: (t: TimeScope) => void;
  category: StoryType | "all";
  onCategory: (c: StoryType | "all") => void;
  sort: SortMode;
  onSort: (s: SortMode) => void;
}) {
  const pill = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-medium transition ${
      active
        ? "bg-[#c5ff4a] text-black"
        : "border border-white/15 text-zinc-400 hover:border-white/25 hover:text-zinc-200"
    }`;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-black/30 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
        <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Time</span>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["today", "Today"],
              ["round", "This round"],
              ["all", "All"],
            ] as const
          ).map(([key, label]) => (
            <button key={key} type="button" className={pill(timeScope === key)} onClick={() => onTimeScope(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
        <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Category</span>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={pill(category === "all")} onClick={() => onCategory("all")}>
            All
          </button>
          {(
            [
              ["fraud", "Fraud"],
              ["pro", "Pro move"],
              ["collapse", "Collapse"],
              ["alliance", "Alliance"],
            ] as const
          ).map(([key, label]) => (
            <button key={key} type="button" className={pill(category === key)} onClick={() => onCategory(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
        <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Sort</span>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["latest", "Latest"],
              ["hot", "Hottest"],
              ["educational", "Most to learn"],
            ] as const
          ).map(([key, label]) => (
            <button key={key} type="button" className={pill(sort === key)} onClick={() => onSort(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
