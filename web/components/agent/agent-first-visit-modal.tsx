"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_PERSONALITY, hasPersonality, savePersonality } from "@/lib/agent-personality";
import {
  isSessionVerified,
  loadDisplayName,
  markFirstVisitDone,
  markSessionVerified,
  saveDisplayName,
} from "@/lib/agent-display-name";
import { btnPrimary, btnSecondary, inputDark, modalBackdrop, modalSurface } from "@/components/ui/agent-ui";

type Phase = "verify" | "name" | "behavior";

type Props = {
  open: boolean;
  agentId: string;
  onCompleted: () => void;
};

export function AgentFirstVisitModal({ open, agentId, onCompleted }: Props) {
  const router = useRouter();
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("verify");
  const [ack, setAck] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifiedFlash, setVerifiedFlash] = useState(false);

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (!isSessionVerified(agentId)) {
      setPhase("verify");
      setAck(false);
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

  function runVerification() {
    if (!ack || verifying) return;
    setVerifying(true);
    window.setTimeout(() => {
      markSessionVerified(agentId);
      setVerifying(false);
      setVerifiedFlash(true);
      window.setTimeout(() => {
        setVerifiedFlash(false);
        setPhase("name");
      }, 900);
    }, 1400);
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
      setError(err);
      return;
    }
    saveDisplayName(agentId, name.trim());
    setError(null);
    setPhase("behavior");
  }

  function finishWithDefaults() {
    savePersonality(agentId, DEFAULT_PERSONALITY);
    markFirstVisitDone(agentId);
    onCompleted();
  }

  function startGuided() {
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
            <button
              type="button"
              disabled={!ack || verifying || verifiedFlash}
              onClick={runVerification}
              className={`${btnPrimary} mt-8 w-full min-h-[44px]`}
            >
              {verifying ? "Verifying…" : verifiedFlash ? "Verified" : "Run verification"}
            </button>
          </>
        ) : null}

        {phase === "name" ? (
          <>
            <h2 id={titleId} className="mt-4 text-2xl font-semibold tracking-tight text-white">
              Name your agent
            </h2>
            <p className="mt-3 text-sm text-zinc-400">
              This label is yours only in this browser. Your internal stall id is{" "}
              <span className="font-mono text-zinc-300">{agentId}</span>.
            </p>
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
                setError(null);
              }}
              placeholder="How should we call your agent?"
              className={`${inputDark} mt-2`}
            />
            {error ? <p className="mt-2 text-xs text-red-400/90">{error}</p> : null}
            <button type="button" onClick={continueFromName} className={`${btnPrimary} mt-8 w-full min-h-[44px]`}>
              Continue
            </button>
          </>
        ) : null}

        {phase === "behavior" ? (
          <>
            <h2 id={titleId} className="mt-4 text-2xl font-semibold tracking-tight text-white">
              Set how your agent behaves
            </h2>
            <p className="mt-3 text-sm text-zinc-400">
              Reputation panels and chat use saved personality sliders. Pick guided Q&amp;A or neutral defaults—you can edit
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
