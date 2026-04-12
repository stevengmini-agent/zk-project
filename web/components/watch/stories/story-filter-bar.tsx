"use client";

import type { StoryType } from "@/lib/watch";

const CATEGORIES: readonly StoryType[] = [
  "scammed",
  "profited",
  "revenge",
  "flexing",
  "roast",
  "grateful",
  "anxious",
  "giving_up",
] as const;

function formatCategoryLabel(key: StoryType | "all"): string {
  if (key === "all") return "All";
  const spaced = key.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

export function StoryFilterBar({
  category,
  onCategory,
}: {
  category: StoryType | "all";
  onCategory: (c: StoryType | "all") => void;
}) {
  const pill = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-medium transition ${
      active
        ? "bg-[#c5ff4a] text-black"
        : "border border-white/15 text-zinc-400 hover:border-white/25 hover:text-zinc-200"
    }`;

  return (
    <div className="rounded-xl border border-white/[0.08] bg-black/30 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
        <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Category</span>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={pill(category === "all")} onClick={() => onCategory("all")}>
            {formatCategoryLabel("all")}
          </button>
          {CATEGORIES.map((key) => (
            <button key={key} type="button" className={pill(category === key)} onClick={() => onCategory(key)}>
              {formatCategoryLabel(key)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
