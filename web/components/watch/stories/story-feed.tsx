import type { StoryCard as StoryCardModel } from "@/lib/mock-watch-feed";
import { StoryCard } from "./story-card";

export function StoryFeed({
  items,
  onOpenDetail,
}: {
  items: StoryCardModel[];
  onOpenDetail: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-10 text-center text-sm text-zinc-500">
        No stories match these filters (mock data). Try &quot;All&quot; time or another category.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <StoryCard key={item.id} item={item} onOpenDetail={() => onOpenDetail(item.id)} />
      ))}
    </div>
  );
}
