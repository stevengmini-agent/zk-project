"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_PERSONALITY, hasPersonality, savePersonality } from "@/lib/agent-personality";
import {
  isSchemasVerified,
  isSessionVerified,
  loadDisplayName,
  markFirstVisitDone,
  markSchemasVerified,
  markSessionVerified,
  saveDisplayName,
} from "@/lib/agent-display-name";
import { defaultSchemaScores, saveSchemaScores, type SchemaScores } from "@/lib/agent-schema-scores";
import { useAppToast } from "@/components/providers/toast-provider";
import { btnPrimary, btnSecondary, inputDark, modalBackdrop, modalSurface } from "@/components/ui/agent-ui";

type Phase = "verify" | "schemas" | "name" | "behavior";

const SCHEMA_ROWS = [
  { id: "kyc", label: "KYC", blurb: "Identity traceability", passRate: 0.5 },
  { id: "rich", label: "Rich", blurb: "Economic strength", passRate: 0.25 },
  { id: "kol", label: "KOL", blurb: "Public influence", passRate: 0.2 },
  { id: "creator", label: "Creator", blurb: "Content output", passRate: 0.3 },
  { id: "veteran", label: "Veteran", blurb: "Internet tenure", passRate: 0.35 },
] as const;

type SchemaId = (typeof SCHEMA_ROWS)[number]["id"];

type Props = {
  open: boolean;
  agentId: string;
  onCompleted: () => void;
};

export function AgentFirstVisitModal({ open, agentId, onCompleted }: Props) {
  const router = useRouter();
  const { showToast } = useAppToast();
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("verify");
  const [ack, setAck] = useState(false);
  const [schemaScores, setSchemaScores] = useState<Partial<Record<SchemaId, number>>>({});

  const [name, setName] = useState("");

  useEffect(() => {
    if (!open) return;
    if (!isSessionVerified(agentId)) {
      setPhase("verify");
      setAck(false);
      setSchemaScores({});
      return;
    }
    if (!isSchemasVerified(agentId)) {
      setPhase("schemas");
      setSchemaScores({});
      return;
    }
    const existing = loadDisplayName(agentId);
    if (!existing) {
      setPhase("name");
      setName("");
      return;
    }
    setName(existing);
    if (!hasPersonality(agentId)) {
      setPhase("behavior");
      return;
    }
  }, [open, agentId]);

  useEffect(() => {
    if (!open || phase !== "name") return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(t);
  }, [open, phase]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") e.preventDefault();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function continueFromVerify() {
    if (!ack) return;
    markSessionVerified(agentId);
    setPhase("schemas");
  }

  function verifySchema(id: SchemaId) {
    const score = Math.floor(Math.random() * 100) + 1;
    setSchemaScores((prev) => ({ ...prev, [id]: score }));
  }

  const allSchemasScored = SCHEMA_ROWS.every((row) => schemaScores[row.id] != null);

  function continueFromSchemas() {
    if (!allSchemasScored) return;
    const full: SchemaScores = { ...defaultSchemaScores(), ...schemaScores } as SchemaScores;
    saveSchemaScores(agentId, full);
    markSchemasVerified(agentId);
    setPhase("name");
  }

  function validateName(): string | null {
    const t = name.trim();
    if (t.length < 1) return "Enter a display name for your agent.";
    if (t.length > 48) return "Keep it under 48 characters.";
    return null;
  }

  function continueFromName() {
    const err = validateName();
    if (err) {
      showToast(err, "error");
      return;
    }
    saveDisplayName(agentId, name.trim());
    setPhase("behavior");
  }

  function finishWithDefaults() {
    savePersonality(agentId, DEFAULT_PERSONALITY);
    markFirstVisitDone(agentId);
    onCompleted();
  }

  function startGuided() {
    const err = validateName();
    if (err) {
      showToast(err, "error");
      return;
    }
    saveDisplayName(agentId, name.trim());
    router.push("/onboard");
  }

  if (!open) return null;

  return (
    <div className={`${modalBackdrop} flex items-center justify-center p-4`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className={`w-full max-w-lg p-6 sm:p-8 ${modalSurface}`}>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">Session setup · required</p>

        {phase === "verify" ? (
          <>
            <h2 id={titleId} className="mt-4 text-2xl font-semibold tracking-tight text-white">
              Verify this session
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Before your agent can use reputation signals in this offline lab, confirm you understand this browser session
              is simulated—no on-chain zkPass verification and no real issuer.
            </p>
            <label className="mt-6 flex cursor-pointer gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={ack}
                onChange={(e) => setAck(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 rounded border-white/20 bg-black accent-[#c5ff4a]"
              />
              <span>I understand this is a local demo and results are not production proofs.</span>
            </label>
            <button type="button" disabled={!ack} onClick={continueFromVerify} className={`${btnPrimary} mt-8 w-full min-h-[44px]`}>
              Next
            </button>
          </>
        ) : null}

        {phase === "schemas" ? (
          <>
            <h2 id={titleId} className="mt-4 text-2xl font-semibold tracking-tight text-white">
              Schema verification
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Run a local lab check for each reputation signal. Scores are random 1–100 placeholders—still not production
              proofs.
            </p>
            <ul className="mt-6 space-y-4">
              {SCHEMA_ROWS.map((row) => {
                const score = schemaScores[row.id];
                const pct = Math.round(row.passRate * 100);
                return (
                  <li
                    key={row.id}
                    className="flex flex-col gap-2 rounded-lg border border-white/10 bg-black/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-100">{row.label}</p>
                      <p className="text-xs text-zinc-500">
                        {row.blurb} · simulated pass rate {pct}%
                      </p>
                      {score != null ? (
                        <p className="mt-1 font-mono text-xs text-[#c5ff4a]">Score: {score}</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => verifySchema(row.id)}
                      className={`${btnSecondary} shrink-0 px-4 py-2 text-xs sm:min-w-[88px]`}
                    >
                      Verify
                    </button>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              disabled={!allSchemasScored}
              onClick={continueFromSchemas}
              className={`${btnPrimary} mt-8 w-full min-h-[44px]`}
            >
              Next
            </button>
          </>
        ) : null}

        {phase === "name" ? (
          <>
            <h2 id={titleId} className="mt-4 text-2xl font-semibold tracking-tight text-white">
              Name your agent
            </h2>
            <p className="mt-3 text-sm text-zinc-400">This display label is yours only in this browser. You can change it later.</p>
            <label htmlFor="agent-first-name" className="mt-6 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Display name
            </label>
            <input
              ref={inputRef}
              id="agent-first-name"
              type="text"
              autoComplete="off"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              placeholder="How should we call your agent?"
              className={`${inputDark} mt-2`}
            />
            <button type="button" onClick={continueFromName} className={`${btnPrimary} mt-8 w-full min-h-[44px]`}>
              Next
            </button>
          </>
        ) : null}

        {phase === "behavior" ? (
          <>
            <h2 id={titleId} className="mt-4 text-2xl font-semibold tracking-tight text-white">
              Set how your agent behaves
            </h2>
            <p className="mt-3 text-sm text-zinc-400">
              Reputation panels and chat use saved 8-axis personality (16-question guided setup or defaults). You can edit
              anytime.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={startGuided} className={`${btnPrimary} min-h-[44px] flex-1`}>
                Guided setup
              </button>
              <button type="button" onClick={finishWithDefaults} className={`${btnSecondary} min-h-[44px] flex-1`}>
                Use default behavior
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
