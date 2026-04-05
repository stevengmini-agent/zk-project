"use client";

import { btnPrimary } from "@/components/ui/agent-ui";

export function StoryCardFooter({ onOpenDetail }: { onOpenDetail: () => void }) {
  return (
    <div className="flex flex-wrap gap-2 border-t border-white/[0.06] px-4 py-3">
      <button type="button" onClick={onOpenDetail} className={btnPrimary}>
        Full story
      </button>
      <span className="self-center text-[10px] text-zinc-600">Dialogue &amp; analysis open in the story modal</span>
    </div>
  );
}
