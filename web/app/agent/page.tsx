"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/ui";
import { AgentDashboard } from "@/components/agent/agent-dashboard";
import { buildUserAgentProfile } from "@/lib/mock-agent-profile";
import { getOrCreateUserAgentId } from "@/lib/user-agent";

export default function MyAgentPage() {
  const [agentId, setAgentId] = useState("");
  useEffect(() => {
    setAgentId(getOrCreateUserAgentId());
  }, []);

  const profile = useMemo(() => (agentId ? buildUserAgentProfile(agentId) : null), [agentId]);

  if (!agentId || !profile) {
    return (
      <PageShell>
        <p className="font-mono text-sm text-zinc-500">Preparing your agent…</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <AgentDashboard profile={profile} isOwnedSession />
    </PageShell>
  );
}
