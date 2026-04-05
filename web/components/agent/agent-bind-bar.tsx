"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hasPersonality } from "@/lib/agent-personality";
import { PersonalitySetupModal } from "@/components/agent/personality-setup-modal";
import { btnPrimary, btnSecondary } from "@/components/ui/agent-ui";

const STORAGE_KEY = "agent-reputation-bound-agent-id";

export function AgentBindBar({
  currentId,
  displayLabel,
  isOwnedSession = true,
}: {
  currentId: string;
  displayLabel?: string;
  isOwnedSession?: boolean;
}) {
  const [boundId, setBoundId] = useState<string | null>(null);
  const [personalityOpen, setPersonalityOpen] = useState(false);
  const [personalityMode, setPersonalityMode] = useState<"initialBind" | "reconfigure">("initialBind");
  const [setupChoiceOpen, setSetupChoiceOpen] = useState(false);

  useEffect(() => {
    try {
      setBoundId(localStorage.getItem(STORAGE_KEY));
    } catch {
      setBoundId(null);
    }
  }, []);

  useEffect(() => {
    if (!isOwnedSession) return;
    try {
      localStorage.setItem(STORAGE_KEY, currentId);
      setBoundId(currentId);
    } catch {
      /* ignore */
    }
  }, [currentId, isOwnedSession]);

  function finishBind() {
    try {
      localStorage.setItem(STORAGE_KEY, currentId);
      setBoundId(currentId);
    } catch {
      /* ignore */
    }
  }

  function bindCurrent() {
    if (typeof window === "undefined") return;
    if (!hasPersonality(currentId)) {
      setSetupChoiceOpen(true);
      return;
    }
    finishBind();
  }

  function unbind() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setBoundId(null);
    } catch {
      /* ignore */
    }
  }

  const isBoundHere = boundId === currentId;
  const label = displayLabel?.trim() || currentId;

  return (
    <>
      <PersonalitySetupModal
        open={personalityOpen}
        onClose={() => setPersonalityOpen(false)}
        agentId={currentId}
        mode={personalityMode}
        onSaved={() => {
          if (personalityMode === "initialBind") {
            finishBind();
          }
        }}
      />

      {setupChoiceOpen ? (
        <div className="mb-4 rounded-xl border border-white/10 bg-black/50 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Personality</p>
          <p className="mt-2 text-sm text-zinc-300">
            Set behavior for <span className="font-semibold text-white">{label}</span>
            <span className="text-zinc-500"> ({currentId})</span>.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/onboard"
              onClick={() => setSetupChoiceOpen(false)}
              className={btnPrimary}
            >
              Start guided setup
            </Link>
            <button
              type="button"
              onClick={() => {
                setSetupChoiceOpen(false);
                setPersonalityMode("initialBind");
                setPersonalityOpen(true);
              }}
              className={btnSecondary}
            >
              Use sliders instead
            </button>
            <button
              type="button"
              onClick={() => setSetupChoiceOpen(false)}
              className="rounded-md px-3 py-2 text-sm text-zinc-500 hover:text-zinc-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-zinc-900/20 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            {isOwnedSession ? "Your session" : "Simulated bind"}
          </p>
          <p className="mt-1 text-sm text-zinc-300">
            {isOwnedSession ? (
              <>
                Agent: <span className="font-semibold text-white">{label}</span>
                {label !== currentId ? (
                  <span className="ml-1 font-mono text-xs text-zinc-500">· {currentId}</span>
                ) : null}
                <span className="ml-2 rounded-full border border-[#c5ff4a]/25 bg-[#c5ff4a]/10 px-2 py-0.5 text-xs text-[#c5ff4a]">
                  Active
                </span>
              </>
            ) : (
              <>
                Viewing: <span className="font-semibold text-white">{currentId}</span>
                {isBoundHere ? (
                  <span className="ml-2 rounded-full border border-[#c5ff4a]/25 bg-[#c5ff4a]/10 px-2 py-0.5 text-xs text-[#c5ff4a]">
                    Bound here
                  </span>
                ) : boundId ? (
                  <span className="ml-2 text-xs text-zinc-500">(bound to {boundId})</span>
                ) : null}
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isOwnedSession ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setPersonalityMode("reconfigure");
                  setPersonalityOpen(true);
                }}
                className={btnSecondary}
              >
                Edit personality
              </button>
              <Link href="/#stalls" className={btnSecondary}>
                Sample stalls
              </Link>
            </>
          ) : (
            <>
              {isBoundHere ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setPersonalityMode("reconfigure");
                      setPersonalityOpen(true);
                    }}
                    className={btnSecondary}
                  >
                    Edit personality
                  </button>
                  <button type="button" onClick={unbind} className={btnSecondary}>
                    Unbind
                  </button>
                </>
              ) : (
                <button type="button" onClick={bindCurrent} className={btnPrimary}>
                  Set as my agent
                </button>
              )}
              <Link href="/agent" className={btnSecondary}>
                My agent
              </Link>
              <Link href="/#stalls" className={btnSecondary}>
                Sample stalls
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
