import type { MockZkPassProof } from "@/lib/mock-agent-profile";

export function ProofMockBlock({ proof }: { proof: MockZkPassProof }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-zinc-900/20 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
        Initial credit · zkPass attestation (mock)
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        Offline demo only—not verified on-chain, not a real issuer.
      </p>
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
