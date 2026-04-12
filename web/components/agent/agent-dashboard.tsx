"use client";

import { useCallback, useEffect, useState } from "react";
import type { AgentProfile } from "@/lib/mock-agent-profile";
import { isAgentSetupComplete, loadDisplayName } from "@/lib/agent-display-name";
import { AgentFirstVisitModal } from "@/components/agent/agent-first-visit-modal";
import { PersonalitySetupModal } from "@/components/agent/personality-setup-modal";
import { ProofMockBlock } from "@/components/agent/proof-mock-block";
import { StrategyModal } from "@/components/agent/strategy-modal";
import { ReputationTrio } from "@/components/agent/reputation-trio";
import { AgentTradeHistory } from "@/components/agent/agent-trade-history";
import { btnSecondary } from "@/components/ui/agent-ui";

export function AgentDashboard({
  profile,
  isOwnedSession = true,
}: {
  profile: AgentProfile;
  /** `/agent` (your created agent) vs `/agent/[preset]` demo view */
  isOwnedSession?: boolean;
}) {
  const [displayName, setDisplayName] = useState(profile.id);
  const [setupGateOpen, setSetupGateOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [personalityOpen, setPersonalityOpen] = useState(false);

  const refreshName = useCallback(() => {
    const n = loadDisplayName(profile.id);
    setDisplayName(n ?? profile.id);
  }, [profile.id]);

  useEffect(() => {
    refreshName();
    setHydrated(true);
  }, [profile.id, refreshName]);

  useEffect(() => {
    if (!hydrated || !isOwnedSession) {
      setSetupGateOpen(false);
      return;
    }
    setSetupGateOpen(!isAgentSetupComplete(profile.id));
  }, [hydrated, isOwnedSession, profile.id]);

  const profileActions = (
    <>
      <StrategyModal agentId={profile.id} agentDisplayName={displayName} compact />
      <button
        type="button"
        onClick={() => setPersonalityOpen(true)}
        className={`shrink-0 whitespace-nowrap ${btnSecondary}`}
      >
        Edit personality
      </button>
    </>
  );

  return (
    <>
      {isOwnedSession ? (
        <AgentFirstVisitModal open={setupGateOpen} agentId={profile.id} />
      ) : null}

      <PersonalitySetupModal
        open={personalityOpen}
        onClose={() => setPersonalityOpen(false)}
        agentId={profile.id}
        mode="reconfigure"
        onSaved={() => {}}
      />

      <section className="relative mt-0 overflow-hidden rounded-2xl border border-[#c5ff4a]/20 bg-[#050505] p-6 shadow-[0_0_0_1px_rgba(197,255,74,0.08),0_24px_80px_-20px_rgba(197,255,74,0.12)] sm:p-10">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(197,255,74,0.14),transparent_55%)]"
          aria-hidden
        />
        <div className="relative border-l-2 border-[#c5ff4a] pl-5 sm:pl-7">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.32em] text-[#c5ff4a]">
            Reputation · core signal
          </p>
          <h2 className="mt-4 max-w-3xl text-2xl font-semibold leading-[1.15] tracking-tight text-white sm:text-3xl md:text-4xl">
            Three layers observers use to size you up
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">
            Verified signals open the door; repeated behavior and public reviews decide who stays in the game.
          </p>
        </div>
        <div className="relative mt-10 border-t border-white/[0.06] pt-10">
          <ReputationTrio stall={profile.stall} prominent />
        </div>
      </section>

      <div className="mt-8">
        <ProofMockBlock profile={profile} profileActions={profileActions} />
        <AgentTradeHistory agentId={profile.id} />
      </div>
    </>
  );
}
