"use client";

import { useEffect, useRef, useState } from "react";
import { Hash } from "lucide-react";
import { devEditButtonClassName, devEditIconSize } from "@/lib/dev-overlay-controls";
import { cn } from "@/lib/utils";

type TextImagesRowAnchorEditorProps = {
  rowNumber: 1 | 2 | 3;
  anchorId: string;
  onSave: (anchorId: string) => void;
  className?: string;
};

const fieldClassName =
  "w-full rounded border border-accent-purple/40 bg-background px-2 py-1.5 font-mono text-xs text-foreground focus:border-accent-purple focus:outline-none";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

/** Playground control for a Text and Images row scroll anchor id. */
export function TextImagesRowAnchorEditor({
  rowNumber,
  anchorId,
  onSave,
  className,
}: TextImagesRowAnchorEditorProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(anchorId);

  useEffect(() => {
    setDraft(anchorId);
  }, [anchorId]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function save() {
    onSave(draft.trim().replace(/^#/, ""));
    setOpen(false);
  }

  return (
    <div ref={panelRef} className={cn("absolute top-0 left-0 z-30", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={devEditButtonClassName}
        aria-label={`Edit row ${rowNumber} scroll anchor`}
        aria-expanded={open}
        title={`Row ${rowNumber} anchor: #${anchorId}`}
      >
        <Hash size={devEditIconSize} strokeWidth={2} />
      </button>

      {open && (
        <div
          className="absolute top-8 left-0 w-[min(92vw,18rem)] rounded-md border border-accent-purple/50 bg-background/95 p-3 shadow-xl backdrop-blur-sm"
          role="dialog"
          aria-label={`Row ${rowNumber} anchor editor`}
        >
          <p className="font-mono text-[10px] tracking-wide text-accent-purple uppercase">
            Row {rowNumber} anchor
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Use this id in Header v1 nav link Anchor (e.g.{" "}
            <span className="font-mono text-foreground">/{`#${anchorId || "storm"}`}</span>).
          </p>
          <label className="mt-3 flex flex-col gap-1">
            <span className="font-mono text-[10px] tracking-wide text-accent-purple/80 uppercase">
              Anchor id
            </span>
            <input
              type="text"
              value={draft}
              autoFocus
              onChange={(event) => setDraft(event.target.value)}
              className={fieldClassName}
              aria-label={`Row ${rowNumber} anchor id`}
              placeholder="storm"
            />
          </label>
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className={buttonClassName}>
              Cancel
            </button>
            <button type="button" onClick={save} className={buttonClassName}>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
