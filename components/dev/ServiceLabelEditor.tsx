"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ServiceLabelEditorProps = {
  value: string;
  onChange: (label: string) => void;
  onClose: () => void;
  className?: string;
  dialogTitle?: string;
  dialogAriaLabel?: string;
  inputAriaLabel?: string;
};

/** Playground-only inline editor for short text labels. */
export function ServiceLabelEditor({
  value,
  onChange,
  onClose,
  className,
  dialogTitle = "Edit label",
  dialogAriaLabel = "Edit label",
  inputAriaLabel = "Label",
}: ServiceLabelEditorProps) {
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
    if (trimmed) onChange(trimmed);
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
      aria-label={dialogAriaLabel}
    >
      <p className="mb-2 px-1 font-mono text-[10px] tracking-wide text-accent-purple uppercase">
        {dialogTitle}
      </p>
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            save();
          }
        }}
        className="w-full rounded border border-accent-purple/40 bg-background px-2 py-1.5 text-sm text-foreground focus:border-accent-purple focus:outline-none"
        aria-label={inputAriaLabel}
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
