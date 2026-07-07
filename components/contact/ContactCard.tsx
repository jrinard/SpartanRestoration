"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Pencil } from "lucide-react";
import { ContactForm } from "@/components/forms/ContactForm";
import { ContactPhoneLineEditor } from "@/components/dev/ContactPhoneLineEditor";
import { TextImageTextEditor } from "@/components/dev/TextImageTextEditor";
import { useContactV1Preview } from "@/components/dev/ContactV1PreviewContext";
import {
  defaultContactPreviewSettings,
  getContactCardStyle,
  type ContactContent,
  type ContactPreviewSettings,
} from "@/lib/contact-preview";
import { devEditButtonClassName, devEditIconSize } from "@/lib/dev-overlay-controls";
import { phoneTelHref } from "@/lib/phone";
import { cn } from "@/lib/utils";

type ContactCardProps = {
  title: string;
  subtext?: string;
  phonePrefix?: string;
  phone?: string;
  formDivider?: string;
  formIntro?: string;
  settings?: ContactPreviewSettings;
  className?: string;
  titleId?: string;
  onClose?: () => void;
  headerExtra?: ReactNode;
};

function EditableTextBlock({
  editingEnabled,
  ariaLabel,
  editorTitle,
  value,
  multiline,
  rows,
  className,
  onSave,
  children,
}: {
  editingEnabled: boolean;
  ariaLabel: string;
  editorTitle: string;
  value: string;
  multiline?: boolean;
  rows?: number;
  className?: string;
  onSave?: (value: string) => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  if (!editingEnabled || !onSave) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("group relative", className)}>
      {children}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          devEditButtonClassName,
          "absolute -right-2 -top-2 z-10 opacity-0 group-hover:opacity-100",
        )}
        aria-label={ariaLabel}
      >
        <Pencil size={devEditIconSize} strokeWidth={2} />
      </button>
      {open && (
        <TextImageTextEditor
          value={value}
          multiline={multiline}
          rows={rows}
          className="absolute left-0 top-full z-50 mt-2"
          dialogTitle={editorTitle}
          dialogAriaLabel={editorTitle}
          inputAriaLabel={ariaLabel}
          onChange={onSave}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function EditablePhoneLine({
  editingEnabled,
  phonePrefix,
  phoneLabel,
  phoneHref,
  onSave,
}: {
  editingEnabled: boolean;
  phonePrefix: string;
  phoneLabel: string;
  phoneHref: string;
  onSave?: (phonePrefix: string, phoneLabel: string) => void;
}) {
  const [open, setOpen] = useState(false);

  if (!phonePrefix && !phoneLabel && !editingEnabled) return null;

  if (!editingEnabled || !onSave) {
    if (!phonePrefix || !phoneLabel) return null;

    return (
      <p className="contact-card-body mt-2 text-sm leading-relaxed sm:text-base">
        {phonePrefix}{" "}
        <a
          href={phoneHref}
          className="contact-card-phone font-bold text-accent-blue underline decoration-accent-blue/40 underline-offset-4 transition-colors hover:text-accent-blue-dark hover:decoration-accent-blue/70"
        >
          {phoneLabel}
        </a>
      </p>
    );
  }

  return (
    <div className="group relative mt-2">
      {(phonePrefix || phoneLabel) && (
        <p className="contact-card-body text-sm leading-relaxed sm:text-base">
          {phonePrefix}
          {phonePrefix && phoneLabel ? " " : null}
          {phoneLabel ? (
            <a
              href={phoneHref || phoneTelHref(phoneLabel)}
              className="contact-card-phone font-bold text-accent-blue underline decoration-accent-blue/40 underline-offset-4 transition-colors hover:text-accent-blue-dark hover:decoration-accent-blue/70"
            >
              {phoneLabel}
            </a>
          ) : null}
        </p>
      )}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          devEditButtonClassName,
          "absolute -right-2 -top-2 z-10 opacity-0 group-hover:opacity-100",
        )}
        aria-label="Edit phone line"
      >
        <Pencil size={devEditIconSize} strokeWidth={2} />
      </button>
      {open && (
        <ContactPhoneLineEditor
          phonePrefix={phonePrefix}
          phoneLabel={phoneLabel}
          className="absolute left-0 top-full z-50 mt-2"
          onSave={onSave}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

export function ContactCard({
  title,
  subtext,
  phonePrefix,
  phone,
  formDivider,
  formIntro,
  settings = defaultContactPreviewSettings,
  className,
  titleId,
  onClose,
  headerExtra,
}: ContactCardProps) {
  const preview = useContactV1Preview();
  const editingEnabled = preview?.contentEditingEnabled ?? false;
  const cardStyle = getContactCardStyle(settings);

  const defaultContent = useMemo<ContactContent>(
    () => ({
      title,
      subtext: subtext ?? "",
      phonePrefix: phonePrefix ?? "",
      phoneLabel: phone ?? "",
      phoneHref: phone ? phoneTelHref(phone) : "",
    }),
    [phone, phonePrefix, subtext, title],
  );

  const content = preview?.getContent(defaultContent) ?? defaultContent;

  return (
    <div
      className={cn("contact-card relative overflow-hidden p-8 sm:p-10", className)}
      style={cardStyle}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <EditableTextBlock
            editingEnabled={editingEnabled}
            ariaLabel="Edit contact title"
            editorTitle="Edit title"
            value={content.title}
            onSave={preview ? (value) => preview.setContentTitle(value) : undefined}
          >
            <h2
              id={titleId}
              className="contact-card-title font-serif text-2xl font-light tracking-tight sm:text-3xl"
            >
              {content.title}
            </h2>
          </EditableTextBlock>

          {(content.subtext || editingEnabled) && (
            <EditableTextBlock
              editingEnabled={editingEnabled}
              ariaLabel="Edit contact subtext"
              editorTitle="Edit subtext"
              value={content.subtext}
              multiline
              rows={3}
              className="mt-2"
              onSave={preview ? (value) => preview.setContentSubtext(value) : undefined}
            >
              {content.subtext ? (
                <p className="contact-card-body text-sm leading-relaxed sm:text-base">{content.subtext}</p>
              ) : null}
            </EditableTextBlock>
          )}

          <EditablePhoneLine
            editingEnabled={editingEnabled}
            phonePrefix={content.phonePrefix}
            phoneLabel={content.phoneLabel}
            phoneHref={content.phoneHref}
            onSave={
              preview
                ? (nextPrefix, nextPhone) => preview.setContentPhoneLine(nextPrefix, nextPhone)
                : undefined
            }
          />
        </div>

        {(onClose || headerExtra) && (
          <div className="flex shrink-0 items-center gap-2">
            {headerExtra}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="contact-card-close flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
                aria-label="Close contact form"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4l-6.29 6.31-1.42-1.42L9.17 12 2.88 5.71 4.3 4.29l6.29 6.3 6.29-6.3z"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {(formDivider || formIntro) && (
        <div className="relative mt-8">
          {formDivider && (
            <p className="contact-card-body text-sm uppercase tracking-widest">{formDivider}</p>
          )}
          {formIntro && (
            <p className="contact-card-body mt-2 text-sm font-medium sm:text-base">{formIntro}</p>
          )}
        </div>
      )}

      <ContactForm className="contact-card-form relative mt-6" settings={settings} />
    </div>
  );
}
