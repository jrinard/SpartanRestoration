"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ContactFormField } from "@/lib/contact-form-fields";
import { cn } from "@/lib/utils";

type ContactFormFieldEditorProps = {
  field: ContactFormField;
  fieldIndex: number;
  onSave: (field: ContactFormField) => void;
  onDelete: () => void;
  onClose: () => void;
};

const fieldClassName =
  "w-full rounded border border-accent-purple/40 bg-background px-2 py-1.5 text-sm text-foreground focus:border-accent-purple focus:outline-none";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

/** Playground popup for editing a contact form field label and placeholder. */
export function ContactFormFieldEditor({
  field,
  fieldIndex,
  onSave,
  onDelete,
  onClose,
}: ContactFormFieldEditorProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState({ label: field.label, placeholder: field.placeholder });

  useEffect(() => {
    setDraft({ label: field.label, placeholder: field.placeholder });
  }, [field]);

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
    onSave({
      ...field,
      label: draft.label.trim() || (field.type === "textarea" ? "Message" : `Field ${fieldIndex + 1}`),
      placeholder: draft.placeholder,
    });
    onClose();
  }

  const dialogTitle = field.type === "textarea" ? `Area ${fieldIndex + 1}` : `Field ${fieldIndex + 1}`;

  const dialog = (
    <div className="fixed inset-0 z-[200] flex items-start justify-center px-4 pt-24 sm:pt-28">
      <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
      <div
        ref={panelRef}
        className="relative z-[201] w-[min(92vw,22rem)] rounded-md border border-accent-purple/50 bg-background/95 p-3 shadow-xl backdrop-blur-sm"
        role="dialog"
        aria-label={`Edit ${dialogTitle.toLowerCase()}`}
      >
        <p className="mb-3 font-mono text-[10px] tracking-wide text-accent-purple uppercase">
          {dialogTitle}
        </p>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[10px] tracking-wide text-accent-purple/80 uppercase">
              Label
            </span>
            <input
              type="text"
              value={draft.label}
              autoFocus
              onChange={(event) => setDraft((current) => ({ ...current, label: event.target.value }))}
              className={fieldClassName}
              aria-label="Field label"
              placeholder={field.type === "textarea" ? "Your message" : "Full name"}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-mono text-[10px] tracking-wide text-accent-purple/80 uppercase">
              Placeholder
            </span>
            <input
              type="text"
              value={draft.placeholder}
              onChange={(event) =>
                setDraft((current) => ({ ...current, placeholder: event.target.value }))
              }
              className={fieldClassName}
              aria-label="Field placeholder"
              placeholder={field.type === "textarea" ? "Optional hint text" : "Optional placeholder"}
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={onDelete} className={cn(buttonClassName, "text-red-400")}>
            Delete
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className={buttonClassName}>
              Cancel
            </button>
            <button type="button" onClick={save} className={buttonClassName}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(dialog, document.body);
}
