import type { WatchComment } from "@/lib/api/comments";
import { watchCommentId } from "@/lib/api/comments";
import { WatchCommentCard } from "./watch-comment-card";

export function StoryFeed({
  items,
  onOpenDetail,
}: {
  items: WatchComment[];
  onOpenDetail: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-10 text-center text-sm text-zinc-500">
        No comments for this filter. Try another category or check back later.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <WatchCommentCard
          key={watchCommentId(item)}
          item={item}
          onOpenDetail={() => onOpenDetail(watchCommentId(item))}
        />
      ))}
    </div>
  );
}
