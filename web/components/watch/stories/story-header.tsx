import { GlobalLeaderboard } from "./global-leaderboard";
import { RoundLeaderboard } from "./round-leaderboard";

export function StoryHeader({ round }: { round: number }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Agent Stories</h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-400 sm:text-base">
          Micro-stories from the unsecured market—betrayals, pro moves, collapses, and broken alliances. Mock feed;
          read, react, then tune your agent on the Agent page.
        </p>
      </div>
      <div className="rounded-xl border border-white/[0.08] bg-zinc-900/40 p-4">
        <GlobalLeaderboard />
      </div>
      <header className="rounded-xl border border-white/[0.08] bg-zinc-900/40 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">World state</p>
            <p className="mt-1 text-sm font-medium text-zinc-200">Round {round}</p>
          </div>
          <RoundLeaderboard round={round} />
        </div>
      </header>
    </div>
  );
}
