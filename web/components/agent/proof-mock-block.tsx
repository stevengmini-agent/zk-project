import type { ReactNode } from "react";
import type { AgentDetail } from "@/lib/api/agents";
import type { AgentProfile, MockZkPassProof } from "@/lib/mock-agent-profile";

const VERIFIED_LABELS: Record<keyof AgentDetail["verified_scores"], string> = {
  kyc: "KYC",
  rich: "Rich",
  kol: "KOL",
  creator: "Creator",
  veteran: "Veteran",
};

function formatServerDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function MockAttestationBlock({ proof, profileActions }: { proof: MockZkPassProof; profileActions?: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-zinc-900/20 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
            Initial credit · zkPass attestation (mock)
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Offline demo only—not verified on-chain, not a real issuer.
          </p>
        </div>
        {profileActions ? (
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">{profileActions}</div>
        ) : null}
      </div>
      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-zinc-500">Attestation ID</dt>
          <dd className="font-mono text-zinc-200">{proof.attestationId}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Issuer</dt>
          <dd className="text-zinc-200">{proof.issuer}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Issued at</dt>
          <dd className="text-zinc-200">{proof.issuedAt}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Pseudo hash</dt>
          <dd className="font-mono text-zinc-400">{proof.pseudoHash}</dd>
        </div>
      </dl>
      <div className="mt-3 flex flex-wrap gap-2">
        {proof.claims.length === 0 ? (
          <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-zinc-500">
            No Verified claims
          </span>
        ) : (
          proof.claims.map((c) => (
            <span
              key={c.key}
              className="rounded-full border border-white/15 bg-white/[0.06] px-2 py-0.5 text-xs text-zinc-200"
            >
              {c.label}
            </span>
          ))
        )}
      </div>
      <details className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
        <summary className="cursor-pointer text-xs text-zinc-400">Raw claim snippet (JSON)</summary>
        <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed text-zinc-500">
          {proof.rawSnippet}
        </pre>
      </details>
    </div>
  );
}

function ServerAgentProfileBlock({
  agentId,
  serverMeta,
  proof,
  profileActions,
}: {
  agentId: string;
  serverMeta: NonNullable<AgentProfile["serverMeta"]>;
  proof: MockZkPassProof;
  profileActions?: ReactNode;
}) {
  const vs = serverMeta.verified_scores;
  const scoreKeys = Object.keys(VERIFIED_LABELS) as (keyof typeof VERIFIED_LABELS)[];

  return (
    <div className="rounded-xl border border-white/[0.08] bg-zinc-900/20 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">Agent profile</p>
          <p className="mt-1 text-xs text-zinc-500">Fields from GET /agents/:id (current season).</p>
        </div>
        {profileActions ? (
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">{profileActions}</div>
        ) : null}
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className="text-zinc-500">Display name</dt>
          <dd className="mt-0.5 text-base font-medium text-white">{serverMeta.display_name}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Agent id</dt>
          <dd className="font-mono text-xs text-zinc-200">{agentId}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Status</dt>
          <dd className="text-zinc-200">{serverMeta.status}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Created at</dt>
          <dd className="text-zinc-200">{formatServerDate(serverMeta.created_at)}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Cumulative score</dt>
          <dd className="text-zinc-200">{serverMeta.cumulative_score}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-zinc-500">Bio</dt>
          <dd className="mt-0.5 leading-relaxed text-zinc-300">{serverMeta.bio || "—"}</dd>
        </div>
      </dl>

      <div className="mt-5 border-t border-white/[0.06] pt-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Verified scores</p>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {scoreKeys.map((key) => (
            <div key={key} className="rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2">
              <dt className="text-xs text-zinc-500">{VERIFIED_LABELS[key]}</dt>
              <dd className="mt-1 font-mono text-lg text-[#c5ff4a]">{vs[key]}</dd>
            </div>
          ))}
        </dl>
      </div>

      <details className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
        <summary className="cursor-pointer text-xs text-zinc-400">Verified snapshot (JSON)</summary>
        <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed text-zinc-500">
          {proof.rawSnippet}
        </pre>
      </details>
    </div>
  );
}

export function ProofMockBlock({
  profile,
  profileActions,
}: {
  profile: AgentProfile;
  profileActions?: ReactNode;
}) {
  if (profile.serverMeta) {
    return (
      <ServerAgentProfileBlock
        agentId={profile.id}
        serverMeta={profile.serverMeta}
        proof={profile.proof}
        profileActions={profileActions}
      />
    );
  }
  return <MockAttestationBlock proof={profile.proof} profileActions={profileActions} />;
}
