import type { ReactNode } from "react";
import { LAYOUT_CONTENT_CLASS } from "@/lib/config/layout";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className={`${LAYOUT_CONTENT_CLASS} min-h-[60vh] py-10`}>{children}</div>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-zinc-300 [&_h2]:mt-10 [&_h2]:scroll-mt-24 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-zinc-100 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-zinc-100 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:marker:text-zinc-600 [&_strong]:text-zinc-100 [&_a]:text-zinc-100 [&_a]:underline-offset-2 hover:[&_a]:text-white">
      {children}
    </div>
  );
}

export function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-white/[0.08] bg-zinc-900/30 p-5 shadow-sm shadow-black/30 ${className}`}
    >
      {title ? (
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-200">{title}</h3>
      ) : null}
      <div className="text-sm leading-relaxed text-zinc-300">{children}</div>
    </div>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#c5ff4a]/25 bg-[#c5ff4a]/10 px-2 py-0.5 text-xs font-medium tracking-wide text-[#c5ff4a]">
      {children}
    </span>
  );
}
