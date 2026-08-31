"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { Pencil } from "lucide-react";
import { ContactForm } from "@/components/forms/ContactForm";
import { TextImageTextEditor } from "@/components/dev/TextImageTextEditor";
import { useHeroV4Preview } from "@/components/dev/HeroV4PreviewContext";
import type { ContactPreviewSettings } from "@/lib/contact-preview";
import {
  formatHeroV4Bullets,
  normalizeHeroV4PreviewSettings,
  parseHeroV4Bullets,
  type HeroV4PreviewSettings,
} from "@/lib/hero-v4-preview";
import { devEditButtonClassName, devEditIconSize } from "@/lib/dev-overlay-controls";
import { cn } from "@/lib/utils";

function EditableTextBlock({
  editingEnabled,
  ariaLabel,
  editorTitle,
  value,
  multiline,
  rows,
  onSave,
  children,
}: {
  editingEnabled: boolean;
  ariaLabel: string;
  editorTitle: string;
  value: string;
  multiline?: boolean;
  rows?: number;
  onSave?: (value: string) => void;
  children: ReactNode;
}) {
  const [editorOpen, setEditorOpen] = useState(false);

  if (!editingEnabled || !onSave) {
    return <>{children}</>;
  }

  return (
    <div className="relative max-w-full pr-8">
      {children}
      <button
        type="button"
        onClick={() => setEditorOpen((open) => !open)}
        className={devEditButtonClassName}
        aria-label={ariaLabel}
        aria-expanded={editorOpen}
      >
        <Pencil size={devEditIconSize} strokeWidth={2} />
      </button>
      {editorOpen ? (
        <div className="absolute top-full right-0 z-30 mt-2">
          <TextImageTextEditor
            value={value}
            multiline={multiline}
            rows={rows}
            dialogTitle={editorTitle}
            dialogAriaLabel={editorTitle}
            inputAriaLabel={ariaLabel}
            onChange={onSave}
            onClose={() => setEditorOpen(false)}
          />
        </div>
      ) : null}
    </div>
  );
}

type HeroV4FormProps = {
  title: string;
  subtext?: string;
  trustNotes?: string[];
  settings: ContactPreviewSettings;
  className?: string;
};

export function HeroV4Form({ title, subtext, trustNotes, settings, className }: HeroV4FormProps) {
  const preview = useHeroV4Preview();
  const editingEnabled = preview?.contentEditingEnabled ?? false;

  const update = (patch: Partial<HeroV4PreviewSettings>) => {
    if (!preview) return;
    preview.setSettings(normalizeHeroV4PreviewSettings({ ...preview.settings, ...patch }));
  };

  return (
    <div
      id="hero-v4-form"
      className={cn("hero-v4-form-card", className)}
      style={
        {
          "--contact-title-color": settings.titleColor,
          "--contact-body-color": settings.bodyColor,
          "--contact-field-bg-color": "#ffffff",
          "--contact-field-text-color": "#12121c",
          "--contact-field-border-color": "#d1d5db",
          "--contact-field-placeholder-color": "#6b7280",
        } as CSSProperties
      }
    >
      <EditableTextBlock
        editingEnabled={editingEnabled}
        ariaLabel="Edit form title"
        editorTitle="Form title"
        value={title}
        onSave={(value) => update({ formTitle: value })}
      >
        <h2 className="hero-v4-form-title font-serif text-2xl font-light tracking-tight sm:text-3xl">
          {title}
        </h2>
      </EditableTextBlock>

      {subtext || editingEnabled ? (
        <EditableTextBlock
          editingEnabled={editingEnabled}
          ariaLabel="Edit form subtext"
          editorTitle="Form subtext"
          value={subtext ?? ""}
          onSave={(value) => update({ formSubtext: value })}
        >
          {subtext ? (
            <p className="hero-v4-form-subtext mt-1 text-sm">{subtext}</p>
          ) : (
            <p className="hero-v4-form-subtext mt-1 text-sm text-muted/70">Add subtext</p>
          )}
        </EditableTextBlock>
      ) : null}

      <ContactForm className="hero-v4-form contact-card-form mt-4" settings={settings} />

      {trustNotes && trustNotes.length > 0 ? (
        <EditableTextBlock
          editingEnabled={editingEnabled}
          ariaLabel="Edit form trust notes"
          editorTitle="Form trust notes"
          value={formatHeroV4Bullets(trustNotes)}
          multiline
          rows={3}
          onSave={(value) => update({ formTrustNotes: parseHeroV4Bullets(value) })}
        >
          <ul className="hero-v4-form-trust mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {trustNotes.map((note) => (
              <li key={note} className="flex items-center gap-2">
                <span className="hero-v4-form-trust-dot" aria-hidden="true" />
                {note}
              </li>
            ))}
          </ul>
        </EditableTextBlock>
      ) : editingEnabled ? (
        <EditableTextBlock
          editingEnabled
          ariaLabel="Edit form trust notes"
          editorTitle="Form trust notes"
          value=""
          multiline
          rows={3}
          onSave={(value) => update({ formTrustNotes: parseHeroV4Bullets(value) })}
        >
          <p className="mt-3 text-xs text-muted/70">Add trust notes</p>
        </EditableTextBlock>
      ) : null}
    </div>
  );
}
