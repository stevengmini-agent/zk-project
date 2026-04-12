"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  DEFAULT_PERSONALITY,
  DIMENSIONS,
  type AgentPersonality,
  type PersonalityDimension,
  loadPersonality,
  normalizePersonality,
  savePersonality,
} from "@/lib/agent-personality";
import { useAppToast } from "@/components/providers/toast-provider";
import { personalityToStrategyPatch, updateAgentStrategy } from "@/lib/api/agents";
import { isServerAgentId } from "@/lib/agent-id";
import { btnPrimary, btnPrimarySpinner, btnSecondary, modalSurface } from "@/components/ui/agent-ui";

const spinNeutral =
  "inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-200";

type Props = {
  open: boolean;
  onClose: () => void;
  agentId: string;
  onSaved: () => void;
  mode: "initialBind" | "reconfigure";
};

export function PersonalitySetupModal({ open, onClose, agentId, onSaved, mode }: Props) {
  const { showToast } = useAppToast();
  const [values, setValues] = useState<AgentPersonality>(DEFAULT_PERSONALITY);
  const [saving, setSaving] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return;
    if (mode === "reconfigure") {
      const existing = loadPersonality(agentId);
      setValues(normalizePersonality(existing ?? DEFAULT_PERSONALITY));
      return;
    }
    setValues({ ...DEFAULT_PERSONALITY });
  }, [open, agentId, mode]);

  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close, mode]);

  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const root = dialogRef.current;
    const focusables = root.querySelectorAll<HTMLElement>(
      'button, input, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const list = [...focusables].filter((el) => !el.hasAttribute("disabled"));
    if (list.length === 0) return;
    const first = list[0];
    const last = list[list.length - 1];
    function onTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    root.addEventListener("keydown", onTab);
    const t = window.setTimeout(() => first?.focus(), 0);
    return () => {
      window.clearTimeout(t);
      root.removeEventListener("keydown", onTab);
    };
  }, [open]);

  function setDim(id: PersonalityDimension, n: number) {
    setValues((v) => ({ ...v, [id]: Math.max(0, Math.min(100, Math.round(n))) }));
  }

  async function commitAndFinish() {
    setSaving(true);
    try {
      if (isServerAgentId(agentId)) {
        await updateAgentStrategy(agentId, personalityToStrategyPatch(values));
      }
      savePersonality(agentId, values);
      onSaved();
      onClose();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not save personality", "error");
    } finally {
      setSaving(false);
    }
  }

  async function applyDefaultsAndFinish() {
    setSaving(true);
    try {
      if (isServerAgentId(agentId)) {
        await updateAgentStrategy(agentId, personalityToStrategyPatch(DEFAULT_PERSONALITY));
      }
      savePersonality(agentId, DEFAULT_PERSONALITY);
      onSaved();
      onClose();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not save personality", "error");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center p-4 sm:items-center" role="presentation">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/75"
        onClick={close}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={`relative z-[121] max-h-[90vh] w-full max-w-lg overflow-y-auto p-5 ${modalSurface}`}
      >
        <h2 id={titleId} className="text-lg font-semibold text-white">
          {mode === "reconfigure" ? "Edit personality" : "Initialize agent personality"}
        </h2>
        <p id={descId} className="mt-1 text-sm text-zinc-500">
          Eight behavior axes (0–100, default 50). Stored only in this browser for the offline demo and chat tone.
        </p>

        <div className="mt-6 space-y-6">
          {DIMENSIONS.map((d) => (
            <div key={d.id}>
              <div className="flex justify-between gap-2 text-xs text-zinc-400">
                <span className="max-w-[42%] text-left">{d.left}</span>
                <span className="max-w-[42%] text-right">{d.right}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={values[d.id]}
                aria-valuetext={`${d.left} to ${d.right}, value ${values[d.id]}`}
                aria-label={`${d.left} versus ${d.right}`}
                className="mt-2 w-full accent-[#c5ff4a]"
                value={values[d.id]}
                onChange={(e) => setDim(d.id, Number(e.target.value))}
              />
              <p className="mt-1 text-center font-mono text-xs text-zinc-500">{values[d.id]}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <button type="button" onClick={close} disabled={saving} className={btnSecondary}>
            Cancel
          </button>
          {mode === "initialBind" ? (
            <button
              type="button"
              onClick={() => void applyDefaultsAndFinish()}
              disabled={saving}
              className={`${btnSecondary} inline-flex items-center justify-center gap-2`}
            >
              {saving ? <span className={spinNeutral} aria-hidden /> : null}
              Use defaults &amp; bind
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void commitAndFinish()}
            disabled={saving}
            aria-busy={saving}
            className={`${btnPrimary} inline-flex items-center justify-center gap-2`}
          >
            {saving ? <span className={btnPrimarySpinner} aria-hidden /> : null}
            {mode === "reconfigure" ? "Save personality" : "Confirm &amp; bind"}
          </button>
        </div>
      </div>
    </div>
  );
}
