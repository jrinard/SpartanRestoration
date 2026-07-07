"use client";

import { useEffect, useRef, useState } from "react";
import { phoneTelHref } from "@/lib/phone";
import { cn } from "@/lib/utils";

type ServiceCtaEditorProps = {
  value: string;
  onChange: (phone: string, telHref: string) => void;
  onClose: () => void;
  className?: string;
};

/** Playground-only editor for the services CTA phone number. */
export function ServiceCtaEditor({ value, onChange, onClose, className }: ServiceCtaEditorProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

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
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange(trimmed, phoneTelHref(trimmed));
    onClose();
  }

  return (
    <div
      ref={panelRef}
      className={cn(
        "z-30 w-64 rounded-md border border-accent-purple/50 bg-background/95 p-2 shadow-lg backdrop-blur-sm",
        className,
      )}
      role="dialog"
      aria-label="Edit call-to-action phone number"
    >
      <p className="mb-2 px-1 font-mono text-[10px] tracking-wide text-accent-purple uppercase">
        Edit phone
      </p>
      <input
        ref={inputRef}
        type="tel"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            save();
          }
        }}
        className="w-full rounded border border-accent-purple/40 bg-background px-2 py-1.5 text-sm text-foreground focus:border-accent-purple focus:outline-none"
        aria-label="Phone number"
        autoComplete="tel"
      />
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
