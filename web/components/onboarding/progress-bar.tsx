export function OnboardingProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total <= 0 ? 0 : Math.min(100, (current / total) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-zinc-500">
        <span>Progress</span>
        <span>
          {current} / {total}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-zinc-900 ring-1 ring-zinc-800">
        <div
          className="h-full rounded-full bg-[#c5ff4a] transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
