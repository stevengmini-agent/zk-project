"use client";

import { useCallback, useEffect, useState } from "react";
import { PageShell } from "@/components/ui";
import { AgentDashboard } from "@/components/agent/agent-dashboard";
import { useAppToast } from "@/components/providers/toast-provider";
import { getAgent, strategyDtoToPersonality } from "@/lib/api/agents";
import { isServerAgentId } from "@/lib/agent-id";
import { saveDisplayName } from "@/lib/agent-display-name";
import { mapServerAgentToProfile } from "@/lib/map-server-agent-profile";
import { buildUserAgentProfile, type AgentProfile } from "@/lib/mock-agent-profile";
import { savePersonality } from "@/lib/agent-personality";
import { getOrCreateUserAgentId } from "@/lib/user-agent";

export default function MyAgentPage() {
  const { showToast } = useAppToast();
  const [agentId, setAgentId] = useState("");
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(
    async (id: string) => {
      setLoading(true);
      setLoadFailed(false);
      try {
        if (isServerAgentId(id)) {
          const detail = await getAgent(id);
          setProfile(mapServerAgentToProfile(detail));
          saveDisplayName(id, detail.display_name);
          if (detail.strategy) {
            savePersonality(id, strategyDtoToPersonality(detail.strategy));
          }
        } else {
          setProfile(buildUserAgentProfile(id));
        }
      } catch (e) {
        if (isServerAgentId(id)) {
          const msg = e instanceof Error ? e.message : "Failed to load agent";
          showToast(msg, "error");
          setLoadFailed(true);
          setProfile(null);
        } else {
          setProfile(buildUserAgentProfile(id));
        }
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    const id = getOrCreateUserAgentId();
    setAgentId(id);
    void refreshProfile(id);
  }, [refreshProfile]);

  if (!agentId) {
    return (
      <PageShell>
        <p className="font-mono text-sm text-zinc-500">Preparing your agent…</p>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center gap-3 font-mono text-sm text-zinc-400">
          <span
            className="inline-block size-5 animate-spin rounded-full border-2 border-zinc-600 border-t-[#c5ff4a]"
            aria-hidden
          />
          Loading agent…
        </div>
      </PageShell>
    );
  }

  if (loadFailed && !profile) {
    return (
      <PageShell>
        <p className="font-mono text-sm text-zinc-400">Could not load this agent from the server.</p>
        <button
          type="button"
          className="mt-4 rounded-md border border-white/15 px-3 py-2 text-sm text-zinc-200 hover:bg-white/[0.06]"
          onClick={() => void refreshProfile(agentId)}
        >
          Retry
        </button>
      </PageShell>
    );
  }

  if (!profile) {
    return (
      <PageShell>
        <p className="font-mono text-sm text-zinc-500">No profile to show.</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <AgentDashboard profile={profile} isOwnedSession />
    </PageShell>
  );
}
