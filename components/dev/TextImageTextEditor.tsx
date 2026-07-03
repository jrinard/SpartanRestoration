"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type TextImageTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  dialogTitle: string;
  dialogAriaLabel: string;
  inputAriaLabel: string;
  multiline?: boolean;
  rows?: number;
  className?: string;
};

/** Playground-only editor for Text and Image copy blocks. */
export function TextImageTextEditor({
  value,
  onChange,
  onClose,
  dialogTitle,
  dialogAriaLabel,
  inputAriaLabel,
  multiline = false,
  rows = 4,
  className,
}: TextImageTextEditorProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState(value);

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
    onChange(draft.trim());
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
      aria-label={dialogAriaLabel}
    >
      <p className="mb-2 px-1 font-mono text-[10px] tracking-wide text-accent-purple uppercase">
        {dialogTitle}
      </p>
      {multiline ? (
        <textarea
          value={draft}
          rows={rows}
          autoFocus
          onChange={(event) => setDraft(event.target.value)}
          className={cn(fieldClassName, "resize-y")}
          aria-label={inputAriaLabel}
        />
      ) : (
        <input
          type="text"
          value={draft}
          autoFocus
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              save();
            }
          }}
          className={fieldClassName}
          aria-label={inputAriaLabel}
        />
      )}
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
