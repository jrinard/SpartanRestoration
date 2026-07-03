"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { Images, Pencil } from "lucide-react";
import { ImageLibraryPicker } from "@/components/dev/ImageLibraryPicker";
import {
  parseTextImageHeadlineDraft,
  useTextImagePreview,
} from "@/components/dev/TextImagePreviewContext";
import { TextImageTextEditor } from "@/components/dev/TextImageTextEditor";
import { Container } from "@/components/ui/Container";
import {
  defaultTextImagePreviewSettings,
  pickTextImageButtonSettings,
  type TextImageContent,
} from "@/lib/text-image-preview";
import { getButtonPreviewStyleRecord } from "@/lib/button-preview";
import { cn } from "@/lib/utils";

export type TextImageV1Props = {
  eyebrow: string;
  headlineLines: string[];
  body: string;
  phoneLabel: string;
  phoneHref: string;
  imageSrc: string;
  imageAlt: string;
  sidebarText: string;
  className?: string;
};

const editButtonClassName =
  "absolute -top-1 -right-1 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-accent-purple/50 bg-background/95 text-accent-purple shadow-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

function EditableTextBlock({
  editingEnabled,
  ariaLabel,
  editorTitle,
  value,
  multiline,
  rows,
  onSave,
  className,
  children,
}: {
  editingEnabled: boolean;
  ariaLabel: string;
  editorTitle: string;
  value: string;
  multiline?: boolean;
  rows?: number;
  onSave?: (value: string) => void;
  className?: string;
  children: ReactNode;
}) {
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <div className={cn("relative", className)}>
      {children}
      {editingEnabled && onSave && (
        <>
          <button
            type="button"
            onClick={() => setEditorOpen((open) => !open)}
            className={editButtonClassName}
            aria-label={ariaLabel}
            aria-expanded={editorOpen}
          >
            <Pencil size={12} strokeWidth={2} />
          </button>
          {editorOpen && (
            <div className="absolute top-full right-0 z-30 mt-2">
              <TextImageTextEditor
                value={value}
                onChange={onSave}
                onClose={() => setEditorOpen(false)}
                dialogTitle={editorTitle}
                dialogAriaLabel={ariaLabel}
                inputAriaLabel={editorTitle}
                multiline={multiline}
                rows={rows}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** 50/50 text and image content block with phone CTA. */
export function TextImageV1({
  eyebrow,
  headlineLines,
  body,
  phoneLabel,
  phoneHref,
  imageSrc,
  imageAlt,
  sidebarText,
  className,
}: TextImageV1Props) {
  const preview = useTextImagePreview();
  const settings = preview?.settings ?? defaultTextImagePreviewSettings;
  const editingEnabled = preview?.contentEditingEnabled ?? false;
  const isCustom = Boolean(preview);
  const buttonSettings = pickTextImageButtonSettings(settings);
  const [imageVisible, setImageVisible] = useState(
    () => !settings.entranceAnimationEnabled,
  );

  const defaultContent = useMemo<TextImageContent>(
    () => ({
      eyebrow,
      headlineLines,
      body,
      sidebarText,
      phoneLabel,
      phoneHref,
      imageSrc,
      imageAlt,
    }),
    [body, eyebrow, headlineLines, imageAlt, imageSrc, phoneHref, phoneLabel, sidebarText],
  );

  const content = preview?.getContent(defaultContent) ?? defaultContent;
  const headlineDraft = content.headlineLines.join("\n");
  const [libraryOpen, setLibraryOpen] = useState(false);

  const sectionStyle: CSSProperties = {
    backgroundColor: settings.backgroundColor,
  };

  const buttonStyle: CSSProperties | undefined = isCustom
    ? getButtonPreviewStyleRecord(buttonSettings)
    : undefined;

  useEffect(() => {
    if (!settings.entranceAnimationEnabled) {
      setImageVisible(true);
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setImageVisible(true);
      return;
    }

    setImageVisible(false);
    const timer = window.setTimeout(() => setImageVisible(true), 100);
    return () => window.clearTimeout(timer);
  }, [settings.entranceAnimationEnabled, settings.entranceAnimationSpeedMs]);

  const imageWrapStyle: CSSProperties | undefined = settings.entranceAnimationEnabled
    ? {
        opacity: imageVisible ? 1 : 0,
        transition: `opacity ${settings.entranceAnimationSpeedMs}ms ease-out`,
      }
    : undefined;

  return (
    <section className={cn("text-image-v1 py-14 lg:py-20", className)} style={sectionStyle}>
      <Container>
        <div
          className={cn(
            "text-image-v1-grid grid items-start gap-10 lg:grid-cols-2 lg:gap-14",
            settings.layoutInverted && "text-image-v1-grid--inverted",
          )}
        >
          <div className="text-image-v1-copy">
            <EditableTextBlock
              editingEnabled={editingEnabled}
              ariaLabel="Edit eyebrow text"
              editorTitle="Edit eyebrow"
              value={content.eyebrow}
              onSave={preview ? (value) => preview.setContentEyebrow(value) : undefined}
            >
              <p
                className="text-image-v1-eyebrow text-xs font-semibold uppercase tracking-[0.18em] sm:text-sm"
                style={{ color: settings.eyebrowColor }}
              >
                {content.eyebrow}
              </p>
            </EditableTextBlock>

            <EditableTextBlock
              editingEnabled={editingEnabled}
              ariaLabel="Edit headline text"
              editorTitle="Edit headline"
              value={headlineDraft}
              multiline
              rows={5}
              className="mt-4"
              onSave={
                preview
                  ? (value) =>
                      preview.setContentHeadlineLines(parseTextImageHeadlineDraft(value))
                  : undefined
              }
            >
              <div className="space-y-2">
                {content.headlineLines.map((line, index) => (
                  <h2
                    key={`${line}-${index}`}
                    className={cn(
                      "text-image-v1-headline font-serif text-3xl font-semibold uppercase leading-tight sm:text-4xl lg:text-[2.5rem]",
                      index === 0 && "italic",
                    )}
                    style={{ color: settings.headlineColor }}
                  >
                    {line}
                  </h2>
                ))}
              </div>
            </EditableTextBlock>

            <EditableTextBlock
              editingEnabled={editingEnabled}
              ariaLabel="Edit body text"
              editorTitle="Edit body"
              value={content.body}
              multiline
              rows={6}
              className="mt-6"
              onSave={preview ? (value) => preview.setContentBody(value) : undefined}
            >
              <p
                className="text-image-v1-body max-w-xl text-base leading-relaxed sm:text-lg"
                style={{ color: settings.bodyColor }}
              >
                {content.body}
              </p>
            </EditableTextBlock>

            <EditableTextBlock
              editingEnabled={editingEnabled}
              ariaLabel="Edit call button text"
              editorTitle="Edit button"
              value={content.phoneLabel}
              className="mt-8 inline-block"
              onSave={preview ? (value) => preview.setContentPhone(value) : undefined}
            >
              <a
                href={content.phoneHref}
                className={cn(
                  "text-image-v1-phone-btn radial-hover-shine inline-flex items-center justify-center font-semibold no-underline transition-colors",
                  isCustom && "text-image-v1-phone-btn--custom",
                )}
                style={buttonStyle}
                data-nav-button-size={buttonSettings.navButtonSize}
              >
                <span className="relative z-[1]">{content.phoneLabel}</span>
              </a>
            </EditableTextBlock>
          </div>

          <div className="text-image-v1-media">
            <div className="relative">
              <div
                className="text-image-v1-image-wrap overflow-hidden rounded-lg"
                style={imageWrapStyle}
              >
                <Image
                  src={content.imageSrc}
                  alt={content.imageAlt}
                  width={960}
                  height={720}
                  className="h-auto w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {editingEnabled && preview && (
                <>
                  <button
                    type="button"
                    onClick={() => setLibraryOpen((open) => !open)}
                    className="absolute top-2 right-2 z-20 flex h-7 items-center gap-1.5 rounded-full border border-accent-purple/50 bg-background/95 px-2.5 text-accent-purple shadow-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10"
                    aria-label="Choose image from library"
                    aria-expanded={libraryOpen}
                  >
                    <Images size={14} strokeWidth={2} />
                    <span className="font-mono text-[10px] tracking-wide uppercase">Library</span>
                  </button>
                  {libraryOpen && (
                    <div className="absolute top-full right-0 z-40 mt-2">
                      <ImageLibraryPicker
                        value={content.imageSrc}
                        onSelect={(entry) => preview.setContentImage(entry.src, entry.alt)}
                        onClose={() => setLibraryOpen(false)}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
            <EditableTextBlock
              editingEnabled={editingEnabled}
              ariaLabel="Edit sidebar text"
              editorTitle="Edit sidebar"
              value={content.sidebarText}
              multiline
              rows={4}
              className="mt-6"
              onSave={preview ? (value) => preview.setContentSidebarText(value) : undefined}
            >
              <p
                className="text-image-v1-sidebar text-base leading-relaxed sm:text-lg"
                style={{ color: settings.sidebarTextColor }}
              >
                {content.sidebarText}
              </p>
            </EditableTextBlock>
          </div>
        </div>
      </Container>
    </section>
  );
}
