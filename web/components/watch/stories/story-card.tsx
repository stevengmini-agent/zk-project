import type { StoryCard as StoryCardModel } from "@/lib/mock-watch-feed";
import { STORY_TYPE_LABEL } from "@/lib/mock-watch-feed";
import { StoryCardFooter } from "./story-card-footer";

const typeStyles: Record<StoryCardModel["type"], string> = {
  fraud: "border-red-500/35 bg-red-500/10 text-red-300/95",
  pro: "border-[#c5ff4a]/35 bg-[#c5ff4a]/10 text-[#c5ff4a]/95",
  collapse: "border-amber-500/35 bg-amber-500/10 text-amber-200/95",
  alliance: "border-violet-500/35 bg-violet-500/10 text-violet-200/95",
};

export function StoryCard({
  item,
  onOpenDetail,
}: {
  item: StoryCardModel;
  onOpenDetail: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900/35 shadow-lg shadow-black/20">
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${typeStyles[item.type]}`}
          >
            {STORY_TYPE_LABEL[item.type]}
          </span>
          <span className="text-[11px] text-zinc-500">{item.timestamp}</span>
        </div>
        <h3 className="mt-3 text-lg font-semibold tracking-tight text-white">{item.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.summary}</p>
        <p className="mt-3 text-sm text-[#c5ff4a]/90">
          <span className="mr-1.5" aria-hidden>
            💡
          </span>
          {item.lesson}
        </p>
        {item.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.tags.map((t) => (
              <span key={t} className="rounded-md bg-black/40 px-2 py-0.5 text-[11px] text-zinc-500">
                #{t}
              </span>
            ))}
          </div>
        ) : null}
        {item.agents.length > 0 ? (
          <p className="mt-3 text-xs text-zinc-500">
            {item.agents.map((a) => a.displayName ?? a.id).join(" · ")}
          </p>
        ) : null}
      </div>
      <StoryCardFooter onOpenDetail={onOpenDetail} />
    </article>
  );
}
