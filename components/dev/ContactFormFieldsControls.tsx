"use client";

import { useState } from "react";
import { ContactFormFieldEditor } from "@/components/dev/ContactFormFieldEditor";
import { useContactV1Preview } from "@/components/dev/ContactV1PreviewContext";
import {
  addContactFormField,
  deleteContactFormField,
  getContactFormFieldPillLabel,
  reorderContactFormFields,
  updateContactFormField,
  type ContactFormField,
} from "@/lib/contact-form-fields";
import {
  getEffectiveContactFormFields,
  hasSavedContactFormFields,
} from "@/lib/contact-preview";
import { cn } from "@/lib/utils";

function GripIcon() {
  return (
    <svg viewBox="0 0 8 14" className="h-3.5 w-2 shrink-0" aria-hidden="true">
      <circle cx="2" cy="2" r="1.1" fill="currentColor" />
      <circle cx="6" cy="2" r="1.1" fill="currentColor" />
      <circle cx="2" cy="7" r="1.1" fill="currentColor" />
      <circle cx="6" cy="7" r="1.1" fill="currentColor" />
      <circle cx="2" cy="12" r="1.1" fill="currentColor" />
      <circle cx="6" cy="12" r="1.1" fill="currentColor" />
    </svg>
  );
}

const pillClassName =
  "rounded-full border border-accent-purple/40 bg-background/90 px-3 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

const addButtonClassName =
  "rounded border border-dashed border-accent-purple/40 bg-background/90 px-3 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

/** Contact form field list — reorder, add, edit, remove. */
export function ContactFormFieldsControls() {
  const contact = useContactV1Preview();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  if (!contact?.contentEditingEnabled) return null;

  const fields = getEffectiveContactFormFields(contact.settings);
  const editingIndex = fields.findIndex((field) => field.id === editingFieldId);
  const editingField = editingIndex >= 0 ? fields[editingIndex] : null;

  const persistFields = (nextFields: ContactFormField[]) => {
    contact.setSettings({
      ...contact.settings,
      formFields: nextFields,
    });
  };

  const ensureSavedFields = (): ContactFormField[] => {
    if (hasSavedContactFormFields(contact.settings)) {
      return contact.settings.formFields ?? fields;
    }
    return fields.map((field) => ({ ...field }));
  };

  const updateFields = (nextFields: ContactFormField[]) => {
    persistFields(nextFields);
  };

  return (
    <div className="flex w-full basis-full flex-col gap-2 border-t border-accent-purple/20 pt-2">
      <p className="max-w-3xl font-mono text-[11px] leading-relaxed text-white/45">
        Lead emails go to{" "}
        <span className="text-white/60">CONTACT_LEAD_TO</span> (Vercel / .env.local), or{" "}
        <span className="text-white/60">config/site.ts</span> → email if unset.
      </p>

      <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Form fields</span>

      <ul className="flex flex-wrap items-center gap-1.5">
        {fields.map((field, index) => {
          const isDragging = dragIndex === index;
          const isDropTarget = overIndex === index && dragIndex !== null && dragIndex !== index;

          return (
            <li
              key={field.id}
              className={cn(
                "flex items-center gap-1 rounded border border-accent-purple/30 bg-background/90 px-1.5 py-1 transition-shadow",
                isDragging && "opacity-50",
                isDropTarget && "ring-2 ring-accent-purple/50",
              )}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setOverIndex(index);
              }}
              onDrop={(event) => {
                event.preventDefault();
                const fromIndex = Number(event.dataTransfer.getData("text/plain"));
                if (Number.isNaN(fromIndex)) return;
                updateFields(reorderContactFormFields(ensureSavedFields(), fromIndex, index));
                setDragIndex(null);
                setOverIndex(null);
              }}
            >
              <button
                type="button"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", String(index));
                  setDragIndex(index);
                }}
                onDragEnd={() => {
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                className="flex cursor-grab items-center justify-center px-0.5 text-accent-purple/70 active:cursor-grabbing"
                aria-label={`Drag to reorder ${field.label}`}
              >
                <GripIcon />
              </button>
              <button
                type="button"
                onClick={() => setEditingFieldId(field.id)}
                className={pillClassName}
                aria-expanded={editingFieldId === field.id}
              >
                {getContactFormFieldPillLabel(field, index)}
              </button>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={() => {
              const nextFields = addContactFormField(ensureSavedFields(), "text");
              updateFields(nextFields);
              setEditingFieldId(nextFields[nextFields.length - 1]?.id ?? null);
            }}
            className={addButtonClassName}
          >
            + Add field
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => {
              const nextFields = addContactFormField(ensureSavedFields(), "textarea");
              updateFields(nextFields);
              setEditingFieldId(nextFields[nextFields.length - 1]?.id ?? null);
            }}
            className={addButtonClassName}
          >
            + Add area
          </button>
        </li>
      </ul>

      {editingField && editingIndex >= 0 && (
        <ContactFormFieldEditor
          field={editingField}
          fieldIndex={editingIndex}
          onSave={(savedField) => {
            updateFields(updateContactFormField(ensureSavedFields(), savedField.id, savedField));
          }}
          onDelete={() => {
            updateFields(deleteContactFormField(ensureSavedFields(), editingField.id));
            setEditingFieldId(null);
          }}
          onClose={() => setEditingFieldId(null)}
        />
      )}
    </div>
  );
}
