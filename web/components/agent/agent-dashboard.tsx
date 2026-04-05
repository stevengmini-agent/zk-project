"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { AgentProfile } from "@/lib/mock-agent-profile";
import { isAgentSetupComplete, loadDisplayName } from "@/lib/agent-display-name";
import { AgentBindBar } from "@/components/agent/agent-bind-bar";
import { AgentEditNameModal } from "@/components/agent/agent-edit-name-modal";
import { AgentFirstVisitModal } from "@/components/agent/agent-first-visit-modal";
import { AgentPanel } from "@/components/agent/agent-panel";
import { ProofMockBlock } from "@/components/agent/proof-mock-block";
import { ReputationTrio } from "@/components/agent/reputation-trio";
import { StrategyModal } from "@/components/agent/strategy-modal";
import { Badge } from "@/components/ui";
import { btnPrimary } from "@/components/ui/agent-ui";

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
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

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

  function handleSetupCompleted() {
    refreshName();
    setSetupGateOpen(false);
  }

  return (
    <>
      {isOwnedSession ? (
        <AgentFirstVisitModal open={setupGateOpen} agentId={profile.id} onCompleted={handleSetupCompleted} />
      ) : null}

      <AgentEditNameModal
        open={editNameOpen}
        agentId={profile.id}
        onClose={() => setEditNameOpen(false)}
        onSaved={(n) => setDisplayName(n)}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {isOwnedSession ? (
            <Badge>Your agent · offline demo</Badge>
          ) : (
            <Badge>Demo stall view</Badge>
          )}
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{displayName}</h1>
          <p className="mt-1 font-mono text-xs text-zinc-500">Stall id · {profile.id}</p>
          <p className="mt-2 max-w-xl text-sm text-zinc-400">
            Proof-backed claims meet behavioral and social reputation—how others decide whether to trade with this agent.
          </p>
          {isOwnedSession ? (
            <button type="button" onClick={() => setEditNameOpen(true)} className="mt-3 text-sm text-[#c5ff4a] underline-offset-4 hover:underline">
              Edit display name
            </button>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {isOwnedSession && hydrated && !isAgentSetupComplete(profile.id) ? (
            <Link href="/onboard" className={btnPrimary}>
              Guided setup
            </Link>
          ) : null}
          <StrategyModal agentId={profile.id} agentDisplayName={displayName} />
        </div>
      </div>

      <section className="relative mt-12 overflow-hidden rounded-2xl border border-[#c5ff4a]/20 bg-[#050505] p-6 shadow-[0_0_0_1px_rgba(197,255,74,0.08),0_24px_80px_-20px_rgba(197,255,74,0.12)] sm:mt-14 sm:p-10">
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

      <div className="mt-8 space-y-8">
        <AgentBindBar currentId={profile.id} displayLabel={displayName} isOwnedSession={isOwnedSession} />
        <ProofMockBlock proof={profile.proof} />
        <AgentPanel profile={profile} />
      </div>
    </>
  );
}
