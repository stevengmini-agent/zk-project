import { notFound } from "next/navigation";
import { PageShell } from "@/components/ui";
import { AgentDashboard } from "@/components/agent/agent-dashboard";
import { getAgentProfile, listAgentParamIds } from "@/lib/mock-agent-profile";

export function generateStaticParams() {
  return listAgentParamIds().map((id) => ({ id }));
}

export const dynamicParams = false;

export default async function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = getAgentProfile(id);
  if (!profile) notFound();

  return (
    <PageShell>
      <AgentDashboard profile={profile} isOwnedSession={false} />
    </PageShell>
  );
}
