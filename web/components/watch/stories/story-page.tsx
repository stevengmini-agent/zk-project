"use client";

import { useMemo, useState } from "react";
import type { StoryCard, StoryType } from "@/lib/mock-watch-feed";
import { MOCK_LEADERBOARD, MOCK_ROUND_LABEL, MOCK_STORIES } from "@/lib/mock-watch-feed";
import { StoryDetailDrawer } from "./story-detail-drawer";
import { StoryFeed } from "./story-feed";
import type { SortMode, TimeScope } from "./story-filter-bar";
import { StoryFilterBar } from "./story-filter-bar";
import { StoryHeader } from "./story-header";
import { TrendingSidebar } from "./trending-sidebar";

const BASE_MS = 1712200000000;
const HOUR_MS = 3600000;
function storyTime(n: number) {
  return BASE_MS + n * HOUR_MS;
}

function filterByTime(items: StoryCard[], scope: TimeScope): StoryCard[] {
  if (scope === "all") return items;
  if (scope === "today") return items.filter((s) => s.timestampMs >= storyTime(8));
  return items.filter((s) => s.timestampMs >= storyTime(6));
}

function filterByCategory(items: StoryCard[], category: StoryType | "all"): StoryCard[] {
  if (category === "all") return items;
  return items.filter((s) => s.type === category);
}

function sortStories(items: StoryCard[], sort: SortMode): StoryCard[] {
  const copy = [...items];
  if (sort === "latest") copy.sort((a, b) => b.timestampMs - a.timestampMs);
  else if (sort === "hot") copy.sort((a, b) => b.hotScore - a.hotScore);
  else copy.sort((a, b) => b.educationalScore - a.educationalScore);
  return copy;
}

export function StoryPage() {
  const [timeScope, setTimeScope] = useState<TimeScope>("all");
  const [category, setCategory] = useState<StoryType | "all">("all");
  const [sort, setSort] = useState<SortMode>("latest");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = filterByTime(MOCK_STORIES, timeScope);
    list = filterByCategory(list, category);
    return sortStories(list, sort);
  }, [timeScope, category, sort]);

  const activeItem = useMemo(
    () => (activeId ? MOCK_STORIES.find((s) => s.id === activeId) ?? null : null),
    [activeId],
  );

  const openDetail = (id: string) => {
    setActiveId(id);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <StoryHeader roundLabel={MOCK_ROUND_LABEL} leaderboard={MOCK_LEADERBOARD} />
      <StoryFilterBar
        timeScope={timeScope}
        onTimeScope={setTimeScope}
        category={category}
        onCategory={setCategory}
        sort={sort}
        onSort={setSort}
      />
      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <StoryFeed items={filtered} onOpenDetail={openDetail} />
        <TrendingSidebar />
      </div>
      <StoryDetailDrawer item={activeItem} open={drawerOpen} onClose={closeDrawer} />
    </div>
  );
}
