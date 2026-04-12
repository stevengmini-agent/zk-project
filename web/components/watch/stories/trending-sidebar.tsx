import Link from "next/link";
import {
  MOCK_CONTROVERSIAL_AGENTS,
  MOCK_TRENDING_AGENTS,
  MOCK_TRENDING_TAGS,
} from "@/lib/watch";

export function TrendingSidebar() {
  return (
    <aside className="space-y-6 lg:sticky lg:top-24">
      <section className="rounded-xl border border-white/[0.08] bg-black/30 p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Trending agents</h2>
        <ul className="mt-3 space-y-3">
          {MOCK_TRENDING_AGENTS.map((row) => (
            <li key={row.id}>
              <Link
                href={`/agent/${encodeURIComponent(row.id)}`}
                className="group block rounded-lg border border-transparent px-1 py-0.5 transition hover:border-white/10 hover:bg-white/[0.04]"
              >
                <span className="font-medium text-zinc-200 group-hover:text-white">{row.id}</span>
                <span className="ml-2 text-[10px] text-zinc-600">heat {row.heat}</span>
                <p className="mt-0.5 text-xs text-zinc-500">{row.blurb}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-xl border border-white/[0.08] bg-black/30 p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Controversial</h2>
        <ul className="mt-3 space-y-3">
          {MOCK_CONTROVERSIAL_AGENTS.map((row) => (
            <li key={row.id}>
              <Link
                href={`/agent/${encodeURIComponent(row.id)}`}
                className="group block rounded-lg border border-transparent px-1 py-0.5 transition hover:border-white/10 hover:bg-white/[0.04]"
              >
                <span className="font-medium text-zinc-200 group-hover:text-white">{row.id}</span>
                <p className="mt-0.5 text-xs text-zinc-500">{row.blurb}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-xl border border-white/[0.08] bg-black/30 p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Tags</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {MOCK_TRENDING_TAGS.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-zinc-900/60 px-2.5 py-1 text-[11px] text-zinc-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      </section>
    </aside>
  );
}
