"use client";

import { useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Pencil } from "lucide-react";
import { useCtaV1Preview } from "@/components/dev/CtaV1PreviewContext";
import { TextImageTextEditor } from "@/components/dev/TextImageTextEditor";
import {
  defaultCtaV1PreviewSettings,
  getCtaV1CardStyle,
  getCtaV1LayoutWidthClassName,
  getCtaV1SectionStyle,
  parseCtaV1HeadlineDraft,
  pickCtaV1ButtonSettings,
  type CtaV1Content,
} from "@/lib/cta-v1-preview";
import { getButtonPreviewStyleRecord } from "@/lib/button-preview";
import { devEditButtonClassName, devEditIconSize } from "@/lib/dev-overlay-controls";
import { cn } from "@/lib/utils";

type CTAV1Props = {
  headlineLines: string[];
  phoneLabel: string;
  phoneHref: string;
  className?: string;
};

function EditableTextBlock({
  editingEnabled,
  ariaLabel,
  editorTitle,
  value,
  multiline,
  rows,
  className,
  editorPlacement = "below",
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
  editorPlacement?: "above" | "below";
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
        className={cn(devEditButtonClassName, "absolute -right-2 -top-2 z-10 opacity-0 group-hover:opacity-100")}
        aria-label={ariaLabel}
      >
        <Pencil size={devEditIconSize} strokeWidth={2} />
      </button>
      {open && (
        <TextImageTextEditor
          value={value}
          multiline={multiline}
          rows={rows}
          className={cn(
            "absolute left-1/2 z-50 -translate-x-1/2",
            editorPlacement === "above" ? "bottom-full mb-2" : "top-full mt-2",
          )}
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

export function CTAV1({ headlineLines, phoneLabel, phoneHref, className }: CTAV1Props) {
  const preview = useCtaV1Preview();
  const settings = preview?.settings ?? defaultCtaV1PreviewSettings;
  const editingEnabled = preview?.contentEditingEnabled ?? false;

  const defaultContent = useMemo<CtaV1Content>(
    () => ({ headlineLines, phoneLabel, phoneHref }),
    [headlineLines, phoneHref, phoneLabel],
  );

  const content = preview?.getContent(defaultContent) ?? defaultContent;
  const isContained = settings.layoutWidth === "contained";
  const buttonSettings = pickCtaV1ButtonSettings(settings);
  const buttonStyle = getButtonPreviewStyleRecord(buttonSettings);
  const headlineDraft = content.headlineLines.join("\n");

  const sectionStyle: CSSProperties = getCtaV1SectionStyle(settings, isContained);
  const cardStyle: CSSProperties = getCtaV1CardStyle(settings);

  const inner = (
    <div className="cta-v1-inner flex w-full flex-col items-center px-8 py-16 text-center sm:px-16 sm:py-20">
      <EditableTextBlock
        editingEnabled={editingEnabled}
        ariaLabel="Edit CTA headline"
        editorTitle="Edit headline"
        editorPlacement="above"
        value={headlineDraft}
        multiline
        rows={5}
        onSave={
          preview
            ? (value) => preview.setContentHeadlineLines(parseCtaV1HeadlineDraft(value))
            : undefined
        }
      >
        {(content.headlineLines.length > 0 || editingEnabled) && (
          <div className="cta-v1-headlines space-y-2">
            {content.headlineLines.map((line, index) => (
              <p
                key={`${line}-${index}`}
                className="cta-v1-headline font-serif text-2xl font-light leading-snug sm:text-3xl lg:text-4xl xl:text-[2.75rem]"
                style={{ color: settings.headlineColor }}
              >
                {line}
              </p>
            ))}
          </div>
        )}
      </EditableTextBlock>

      {settings.buttonVisible && (content.phoneLabel || editingEnabled) && (
        <EditableTextBlock
          editingEnabled={editingEnabled}
          ariaLabel="Edit phone button text"
          editorTitle="Edit button"
          editorPlacement="above"
          value={content.phoneLabel}
          className="mt-10"
          onSave={preview ? (value) => preview.setContentPhone(value) : undefined}
        >
          {content.phoneLabel ? (
            <a
              href={content.phoneHref}
              className="cta-v1-phone-btn text-image-v1-phone-btn text-image-v1-phone-btn--custom radial-hover-shine inline-flex items-center justify-center font-semibold no-underline transition-colors"
              style={buttonStyle}
              data-nav-button-size={buttonSettings.navButtonSize}
            >
              <span className="relative z-[1]">{content.phoneLabel}</span>
            </a>
          ) : null}
        </EditableTextBlock>
      )}
    </div>
  );

  return (
    <section
      className={cn("cta-v1", isContained && "py-12 lg:py-16", className)}
      style={sectionStyle}
    >
      <div className={getCtaV1LayoutWidthClassName(settings.layoutWidth)}>
        {isContained ? (
          <div className="cta-v1-card" style={cardStyle}>
            {inner}
          </div>
        ) : (
          <div className="cta-v1-inner-wrap">{inner}</div>
        )}
      </div>
    </section>
  );
}
