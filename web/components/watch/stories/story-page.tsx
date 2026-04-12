"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { WatchComment } from "@/lib/api/comments";
import { getWatchComments, sortCommentsByTimeDesc, watchCommentId } from "@/lib/api/comments";
import { useAppToast } from "@/components/providers/toast-provider";
import { useSeason } from "@/components/providers/season-provider";
import type { StoryType } from "@/lib/mock-watch-feed";
import { WatchCommentDrawer } from "./watch-comment-drawer";
import { StoryFeed } from "./story-feed";
import { StoryFilterBar } from "./story-filter-bar";
import { StoryHeader } from "./story-header";

const FALLBACK_ROUND = 1;

export function StoryPage() {
  const { showToast } = useAppToast();
  const { seasonId, status: seasonStatus, currentRound } = useSeason();
  const watchRound = currentRound ?? FALLBACK_ROUND;
  const [category, setCategory] = useState<StoryType | "all">("all");
  const [items, setItems] = useState<WatchComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    if (seasonStatus !== "ready" || !seasonId) {
      setItems([]);
      setLoading(seasonStatus === "loading" || seasonStatus === "idle");
      return;
    }
    setLoading(true);
    try {
      const raw = await getWatchComments({
        round: watchRound,
        tag: category === "all" ? undefined : category,
      });
      setItems(sortCommentsByTimeDesc(raw));
    } catch (e) {
      setItems([]);
      showToast(e instanceof Error ? e.message : "Failed to load comments", "error");
    } finally {
      setLoading(false);
    }
  }, [seasonId, seasonStatus, watchRound, category, showToast]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  const activeItem = useMemo(
    () => (activeId ? items.find((c) => watchCommentId(c) === activeId) ?? null : null),
    [activeId, items],
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
      <StoryHeader round={watchRound} />
      <StoryFilterBar category={category} onCategory={setCategory} />
      {seasonStatus === "error" || !seasonId ? (
        <p className="text-sm text-zinc-500">Comments load after a valid season is available.</p>
      ) : loading ? (
        <p className="text-sm text-zinc-500">Loading comments…</p>
      ) : (
        <StoryFeed items={items} onOpenDetail={openDetail} />
      )}
      <WatchCommentDrawer item={activeItem} open={drawerOpen} onClose={closeDrawer} />
    </div>
  );
}
