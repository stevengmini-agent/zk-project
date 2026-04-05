import type { ReactNode } from "react";
import { OnboardingProgressBar } from "@/components/onboarding/progress-bar";

export function OnboardingShell({
  stepIndex,
  stepCount,
  title,
  subtitle,
  children,
  footer,
}: {
  stepIndex: number;
  stepCount: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-white/[0.1] bg-[#050506] p-6 shadow-[0_0_0_1px_rgba(197,255,74,0.06)] sm:p-8">
        <OnboardingProgressBar step={stepIndex} total={stepCount} />
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
