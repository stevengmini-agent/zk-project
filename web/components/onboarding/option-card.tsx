"use client";

export function OptionCard({
  prefix = ">",
  label,
  description,
  selected,
  onSelect,
}: {
  prefix?: string;
  label: string;
  description?: string;
  selected?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
        selected
          ? "border-[#c5ff4a]/45 bg-[#c5ff4a]/10"
          : "border-zinc-800 bg-zinc-950/80 hover:border-zinc-600 hover:bg-zinc-900/90"
      }`}
    >
      <div className="flex gap-2 font-mono text-sm text-zinc-100">
        <span className="shrink-0 text-[#c5ff4a]/85">{prefix}</span>
        <span>{label}</span>
      </div>
      {description ? (
        <p className="mt-1.5 pl-6 font-sans text-xs leading-relaxed text-zinc-500">{description}</p>
      ) : null}
    </button>
  );
}
