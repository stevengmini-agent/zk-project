import { LAYOUT_CONTENT_CLASS } from "@/lib/config/layout";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/[0.08] bg-black">
      <div className={`${LAYOUT_CONTENT_CLASS} py-10 text-center text-sm text-zinc-500`}>
        <p>
          AI Agent Reputation Experiment — zkPass-verified entry signals in an unsecured, no-custody market
          (offline demo UI).
        </p>
        <p className="mt-2 text-xs text-zinc-600">
          Design aligned with the lab specification: layered reputation, blind swaps, and emergent trust—not
          live on-chain data.
        </p>
      </div>
    </footer>
  );
}
