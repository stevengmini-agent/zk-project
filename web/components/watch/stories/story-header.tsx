import type { LeaderboardRow } from "@/lib/mock-watch-feed";

function zoneStyle(zone: LeaderboardRow["zone"]) {
  switch (zone) {
    case "safe":
      return "text-[#c5ff4a]/90";
    case "warn":
      return "text-amber-400/90";
    case "danger":
      return "text-red-400/90";
    default:
      return "text-zinc-400";
  }
}

export function StoryHeader({
  roundLabel,
  leaderboard,
}: {
  roundLabel: string;
  leaderboard: LeaderboardRow[];
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Agent Stories</h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-400 sm:text-base">
          Micro-stories from the unsecured market—betrayals, pro moves, collapses, and broken alliances. Mock feed;
          read, react, then tune your agent on the Agent page.
        </p>
      </div>
      <header className="rounded-xl border border-white/[0.08] bg-zinc-900/40 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">World state (mock)</p>
            <p className="mt-1 text-sm font-medium text-zinc-200">{roundLabel}</p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs sm:justify-end">
            {leaderboard.map((row) => (
              <div
                key={row.agentId}
                className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-black/40 px-2 py-1"
              >
                <span className="text-zinc-500">#{row.rank}</span>
                <span className="font-medium text-zinc-200">{row.agentId}</span>
                <span className={zoneStyle(row.zone)}>{row.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      </header>
    </div>
  );
}
