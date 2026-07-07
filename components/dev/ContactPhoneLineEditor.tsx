"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ContactPhoneLineEditorProps = {
  phonePrefix: string;
  phoneLabel: string;
  onSave: (phonePrefix: string, phoneLabel: string) => void;
  onClose: () => void;
  className?: string;
};

/** Playground editor for the contact card phone line prefix and number. */
export function ContactPhoneLineEditor({
  phonePrefix,
  phoneLabel,
  onSave,
  onClose,
  className,
}: ContactPhoneLineEditorProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState({ phonePrefix, phoneLabel });

  useEffect(() => {
    setDraft({ phonePrefix, phoneLabel });
  }, [phoneLabel, phonePrefix]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function save() {
    onSave(draft.phonePrefix.trim(), draft.phoneLabel.trim());
    onClose();
  }

  const fieldClassName =
    "w-full rounded border border-accent-purple/40 bg-background px-2 py-1.5 text-sm text-foreground focus:border-accent-purple focus:outline-none";

  return (
    <div
      ref={panelRef}
      className={cn(
        "z-30 w-72 rounded-md border border-accent-purple/50 bg-background/95 p-2 shadow-lg backdrop-blur-sm",
        className,
      )}
      role="dialog"
      aria-label="Edit phone line"
    >
      <p className="mb-2 px-1 font-mono text-[10px] tracking-wide text-accent-purple uppercase">
        Edit phone line
      </p>

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] tracking-wide text-accent-purple/80 uppercase">
            Prefix
          </span>
          <input
            type="text"
            value={draft.phonePrefix}
            autoFocus
            onChange={(event) =>
              setDraft((current) => ({ ...current, phonePrefix: event.target.value }))
            }
            className={fieldClassName}
            aria-label="Phone line prefix"
            placeholder="Call us at"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] tracking-wide text-accent-purple/80 uppercase">
            Phone
          </span>
          <input
            type="text"
            value={draft.phoneLabel}
            onChange={(event) =>
              setDraft((current) => ({ ...current, phoneLabel: event.target.value }))
            }
            className={fieldClassName}
            aria-label="Phone number"
            placeholder="503-555-0100"
          />
        </label>
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-accent-purple/30 px-2 py-1 font-mono text-[10px] text-accent-purple/80 transition-colors hover:border-accent-purple/50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          className="rounded border border-accent-purple/50 bg-accent-purple/10 px-2 py-1 font-mono text-[10px] text-accent-purple transition-colors hover:bg-accent-purple/20"
        >
          Save
        </button>
      </div>
    </div>
  );
}
