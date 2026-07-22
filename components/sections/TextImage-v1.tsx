"use client";

import { useMemo, useState } from "react";
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
  defaultTextImageV1Theme,
  pickTextImageButtonSettings,
  shouldInvertTextImageForTheme,
  type TextImageContent,
} from "@/lib/text-image-preview";
import { getButtonPreviewStyleRecord } from "@/lib/button-preview";
import {
  devEditButtonClassName,
  devEditIconSize,
  devLibraryIconSize,
  devLibraryLabelClassName,
  devLibraryPillClassName,
} from "@/lib/dev-overlay-controls";
import { useEntranceFadeInView } from "@/lib/use-entrance-fade-in-view";
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

function EditableTextBlock({
  editingEnabled,
  ariaLabel,
  editorTitle,
  value,
  multiline,
  rows,
  onSave,
  className,
  style,
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
  style?: CSSProperties;
  children: ReactNode;
}) {
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <div className={cn("relative", className)} style={style}>
      {children}
      {editingEnabled && onSave && (
        <>
          <button
            type="button"
            onClick={() => setEditorOpen((open) => !open)}
            className={devEditButtonClassName}
            aria-label={ariaLabel}
            aria-expanded={editorOpen}
          >
            <Pencil size={devEditIconSize} strokeWidth={2} />
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
  const { ref: imageWrapRef, wrapStyle: imageWrapStyle } = useEntranceFadeInView({
    enabled: settings.entranceAnimationEnabled,
    speedMs: settings.entranceAnimationSpeedMs,
    resetKey: content.imageSrc,
  });
  const headlineDraft = content.headlineLines.join("\n");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const imageInverted = shouldInvertTextImageForTheme(settings.theme, defaultTextImageV1Theme);

  const sectionStyle: CSSProperties = {
    backgroundColor: settings.backgroundColor,
  };

  const buttonStyle: CSSProperties | undefined = isCustom
    ? getButtonPreviewStyleRecord(buttonSettings)
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
              {(content.eyebrow || editingEnabled) && (
                <p
                  className="text-image-v1-eyebrow text-xs font-semibold uppercase tracking-[0.18em] sm:text-sm"
                  style={{ color: settings.eyebrowColor }}
                >
                  {content.eyebrow}
                </p>
              )}
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
              {(content.headlineLines.length > 0 || editingEnabled) && (
                <div className="space-y-2">
                  {content.headlineLines.map((line, index) => {
                    const HeadlineTag =
                      settings.headlineLevel === "h1" && index === 0 ? "h1" : "h2";

                    return (
                      <HeadlineTag
                        key={`${line}-${index}`}
                        className={cn(
                          "text-image-v1-headline font-serif text-3xl font-semibold uppercase leading-tight sm:text-4xl lg:text-[2.5rem]",
                          index === 0 && "italic",
                        )}
                        style={{ color: settings.headlineColor }}
                      >
                        {line}
                      </HeadlineTag>
                    );
                  })}
                </div>
              )}
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
              {(content.body || editingEnabled) && (
                <p
                  className="text-image-v1-body max-w-xl text-base leading-relaxed sm:text-lg"
                  style={{ color: settings.bodyColor }}
                >
                  {content.body}
                </p>
              )}
            </EditableTextBlock>

            {settings.phoneButtonVisible && (content.phoneLabel || editingEnabled) && (
              <EditableTextBlock
                editingEnabled={editingEnabled}
                ariaLabel="Edit call button text"
                editorTitle="Edit button"
                value={content.phoneLabel}
                className="inline-block"
                style={{ marginTop: settings.phoneButtonMarginTopPx }}
                onSave={preview ? (value) => preview.setContentPhone(value) : undefined}
              >
                {content.phoneLabel ? (
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
                ) : null}
              </EditableTextBlock>
            )}
          </div>

          <div className="text-image-v1-media">
            <div className="relative">
              <div
                ref={imageWrapRef}
                className="text-image-v1-image-wrap overflow-hidden rounded-lg"
                style={imageWrapStyle}
              >
                <Image
                  src={content.imageSrc}
                  alt={content.imageAlt}
                  width={960}
                  height={720}
                  className={cn(
                    "text-image-v1-image h-auto w-full object-cover",
                    imageInverted && "text-image-v1-image--inverted",
                  )}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {editingEnabled && preview && (
                <>
                  <button
                    type="button"
                    onClick={() => setLibraryOpen((open) => !open)}
                    className={devLibraryPillClassName}
                    aria-label="Choose image from library"
                    aria-expanded={libraryOpen}
                  >
                    <Images size={devLibraryIconSize} strokeWidth={2} />
                    <span className={devLibraryLabelClassName}>Library</span>
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
              {(content.sidebarText || editingEnabled) && (
                <p
                  className="text-image-v1-sidebar text-base leading-relaxed sm:text-lg"
                  style={{ color: settings.sidebarTextColor }}
                >
                  {content.sidebarText}
                </p>
              )}
            </EditableTextBlock>
          </div>
        </div>
      </Container>
    </section>
  );
}
