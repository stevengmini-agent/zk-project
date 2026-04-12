"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { loadDisplayName, saveDisplayName } from "@/lib/agent-display-name";
import { useAppToast } from "@/components/providers/toast-provider";
import { btnPrimary, btnSecondary, inputDark, modalBackdrop, modalSurface } from "@/components/ui/agent-ui";

export function AgentEditNameModal({
  open,
  agentId,
  onClose,
  onSaved,
}: {
  open: boolean;
  agentId: string;
  onClose: () => void;
  onSaved: (name: string) => void;
}) {
  const { showToast } = useAppToast();
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!open) return;
    setValue(loadDisplayName(agentId) ?? "");
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open, agentId]);

  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  function save() {
    const t = value.trim();
    if (t.length < 1) {
      showToast("Name cannot be empty.", "error");
      return;
    }
    if (t.length > 48) {
      showToast("Max 48 characters.", "error");
      return;
    }
    saveDisplayName(agentId, t);
    onSaved(t);
    close();
  }

  if (!open) return null;

  return (
    <div className={`${modalBackdrop} z-[120] flex items-center justify-center p-4`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button type="button" aria-label="Close" className="absolute inset-0 cursor-default" onClick={close} />
      <div className={`relative z-[121] w-full max-w-md p-5 ${modalSurface}`}>
        <h2 id={titleId} className="text-lg font-semibold text-white">
          Edit display name
        </h2>
        <p className="mt-1 text-sm text-zinc-500">Shown in the header and chat. Stall id stays {agentId}.</p>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          className={`${inputDark} mt-4`}
        />
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={close} className={btnSecondary}>
            Cancel
          </button>
          <button type="button" onClick={save} className={btnPrimary}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
