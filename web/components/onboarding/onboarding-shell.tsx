import type { ReactNode } from "react";
import { OnboardingProgressBar } from "@/components/onboarding/progress-bar";

export function OnboardingShell({
  title,
  subtitle,
  children,
  footer,
  progress,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** `false` hides the bar; otherwise `current`/`total` are 1-based for display. */
  progress?: false | { current: number; total: number };
  /** Wider content column (e.g. personality results + sliders). */
  wide?: boolean;
}) {
  return (
    <div className={`mx-auto px-4 py-10 sm:px-6 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
      <div className="rounded-2xl border border-white/[0.1] bg-[#050506] p-6 shadow-[0_0_0_1px_rgba(197,255,74,0.06)] sm:p-8">
        {progress === false ? null : progress ? <OnboardingProgressBar current={progress.current} total={progress.total} /> : null}
        <div className="mt-8">
          <h1 className="font-sans text-2xl font-semibold tracking-tight text-white">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-zinc-400">{subtitle}</p> : null}
        </div>
        <div className="mt-8">{children}</div>
        {footer ? <div className="mt-8 border-t border-zinc-800/80 pt-6">{footer}</div> : null}
      </div>
    </div>
  );
}
