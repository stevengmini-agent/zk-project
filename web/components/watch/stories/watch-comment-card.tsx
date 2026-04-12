"use client";

import type { WatchComment } from "@/lib/api/comments";
import type { StoryType } from "@/lib/mock-watch-feed";
import { STORY_TYPE_LABEL } from "@/lib/mock-watch-feed";
import { btnPrimary } from "@/components/ui/agent-ui";

const STORY_TAG_KEYS = new Set<string>([
  "scammed",
  "profited",
  "revenge",
  "flexing",
  "roast",
  "grateful",
  "anxious",
  "giving_up",
]);

const typeStyles: Record<StoryType, string> = {
  scammed: "border-red-500/35 bg-red-500/10 text-red-300/95",
  profited: "border-[#c5ff4a]/35 bg-[#c5ff4a]/10 text-[#c5ff4a]/95",
  revenge: "border-violet-500/35 bg-violet-500/10 text-violet-200/95",
  flexing: "border-cyan-500/35 bg-cyan-500/10 text-cyan-200/95",
  roast: "border-orange-500/35 bg-orange-500/10 text-orange-200/95",
  grateful: "border-emerald-500/35 bg-emerald-500/10 text-emerald-200/95",
  anxious: "border-amber-500/35 bg-amber-500/10 text-amber-200/95",
  giving_up: "border-zinc-500/35 bg-zinc-600/15 text-zinc-200/95",
};

function primaryStoryTag(tags: string[]): StoryType | null {
  for (const t of tags) {
    if (STORY_TAG_KEYS.has(t)) return t as StoryType;
  }
  return null;
}

function formatTime(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  return new Date(t).toLocaleString();
}

function tagLabel(raw: string): string {
  const spaced = raw.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

export function WatchCommentCard({
  item,
  onOpenDetail,
}: {
  item: WatchComment;
  onOpenDetail: () => void;
}) {
  const primary = primaryStoryTag(item.tags);
  const badgeText = primary ? STORY_TYPE_LABEL[primary] : item.tags[0] ? tagLabel(item.tags[0]) : "Comment";
  const badgeClass = primary ? typeStyles[primary] : "border-zinc-600/40 bg-zinc-900/60 text-zinc-300";

  return (
    <article className="overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900/35 shadow-lg shadow-black/20">
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${badgeClass}`}
          >
            {badgeText}
          </span>
          <span className="text-[11px] text-zinc-500">
            Round {item.round} · {formatTime(item.created_at)}
          </span>
        </div>
        <h3 className="mt-3 text-lg font-semibold tracking-tight text-white">{item.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.content}</p>
        {item.insight ? (
          <p className="mt-3 text-sm text-[#c5ff4a]/90">
            <span className="mr-1.5" aria-hidden>
              💡
            </span>
            {item.insight}
          </p>
        ) : null}
        {item.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.tags.map((t) => (
              <span key={t} className="rounded-md bg-black/40 px-2 py-0.5 text-[11px] text-zinc-500">
                #{t}
              </span>
            ))}
          </div>
        ) : null}
        <p className="mt-3 text-xs text-zinc-500">
          {item.display_name}
          {item.partner ? (
            <>
              {" "}
              · vs {item.partner.name}
            </>
          ) : null}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-white/[0.06] px-4 py-3">
        <button type="button" onClick={onOpenDetail} className={btnPrimary}>
          Details
        </button>
      </div>
    </article>
  );
}
