import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/agent", label: "Agent" },
  { href: "/watch", label: "Watch" },
] as const;

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-black/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="font-semibold tracking-tight text-white transition hover:text-zinc-300"
        >
          AI Agent Reputation Lab
        </Link>
        <nav className="flex flex-wrap items-center gap-x-1 gap-y-2 text-sm" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-2.5 py-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-zinc-100"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
