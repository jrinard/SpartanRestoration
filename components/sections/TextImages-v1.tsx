"use client";

import { useEntranceFadeInView } from "@/lib/use-entrance-fade-in-view";
import { useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { Images, Pencil } from "lucide-react";
import { ImageLibraryPicker } from "@/components/dev/ImageLibraryPicker";
import { TextImagesRowAnchorEditor } from "@/components/dev/TextImagesRowAnchorEditor";
import {
  parseTextImagesHeadlineDraft,
  useTextImagesPreview,
} from "@/components/dev/TextImagesPreviewContext";
import { TextImageTextEditor } from "@/components/dev/TextImageTextEditor";
import { Container } from "@/components/ui/Container";
import {
  defaultTextImagesPreviewSettings,
  defaultTextImagesV1Theme,
  getTextImagesRowAlignClassName,
  getTextImagesRowAnchorId,
  pickTextImagesButtonSettings,
  type TextImagesContent,
  type TextImagesRow1Content,
  type TextImagesRow3Content,
  type TextImagesStandardRowContent,
} from "@/lib/text-images-preview";
import { shouldInvertTextImageForTheme } from "@/lib/text-image-preview";
import { getButtonPreviewStyleRecord } from "@/lib/button-preview";
import {
  devEditButtonClassName,
  devEditIconSize,
  devLibraryIconSize,
  devLibraryLabelClassName,
  devLibraryPillClassName,
} from "@/lib/dev-overlay-controls";
import { cn } from "@/lib/utils";

export type TextImagesV1Props = TextImagesContent & {
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

function TextImagesMediaBlock({
  imageSrc,
  imageAlt,
  imageInverted,
  animationEnabled,
  animationSpeedMs,
  editingEnabled,
  onImageSelect,
  overlapIndex,
}: {
  imageSrc: string;
  imageAlt: string;
  imageInverted: boolean;
  animationEnabled: boolean;
  animationSpeedMs: number;
  editingEnabled: boolean;
  onImageSelect?: (src: string, alt: string) => void;
  overlapIndex?: 1 | 2;
}) {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const { ref: imageWrapRef, wrapStyle: imageWrapStyle } = useEntranceFadeInView({
    enabled: animationEnabled,
    speedMs: animationSpeedMs,
    resetKey: imageSrc,
  });

  return (
    <div
      className={cn(
        "text-images-v1-media",
        overlapIndex === 1 && "text-images-v1-media--overlap-1",
        overlapIndex === 2 && "text-images-v1-media--overlap-2",
      )}
    >
      <div className="relative">
        <div
          ref={imageWrapRef}
          className="text-images-v1-image-wrap overflow-hidden rounded-lg"
          style={imageWrapStyle}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={960}
            height={720}
            className={cn(
              "text-images-v1-image h-auto w-full object-cover",
              imageInverted && "text-images-v1-image--inverted",
            )}
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        {editingEnabled && onImageSelect && (
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
                  value={imageSrc}
                  onSelect={(entry) => onImageSelect(entry.src, entry.alt)}
                  onClose={() => setLibraryOpen(false)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TextImagesRow1Block({
  row,
  rowAnchorId,
  editingEnabled,
  preview,
  settings,
  imageInverted,
}: {
  row: TextImagesRow1Content;
  rowAnchorId: string;
  editingEnabled: boolean;
  preview: ReturnType<typeof useTextImagesPreview>;
  settings: typeof defaultTextImagesPreviewSettings;
  imageInverted: boolean;
}) {
  const headlineDraft = row.headlineLines.join("\n");

  return (
    <div
      id={rowAnchorId}
      className={cn(
        "text-images-v1-row text-images-v1-row--stack-1 relative scroll-mt-24 grid gap-10 lg:grid-cols-2 lg:gap-14",
        getTextImagesRowAlignClassName(settings.row1CopyVerticalAlign),
      )}
    >
      {editingEnabled && preview && (
        <TextImagesRowAnchorEditor
          rowNumber={1}
          anchorId={rowAnchorId}
          onSave={(anchorId) => preview.setRowAnchorId(1, anchorId)}
        />
      )}
      <div className="text-images-v1-copy" style={{ paddingTop: settings.row1CopyPaddingTopPx }}>
        <EditableTextBlock
          editingEnabled={editingEnabled}
          ariaLabel="Edit row 1 eyebrow text"
          editorTitle="Edit eyebrow"
          value={row.eyebrow}
          onSave={preview ? (value) => preview.setRow1Eyebrow(value) : undefined}
        >
          {(row.eyebrow || editingEnabled) && (
            <p
              className="text-images-v1-eyebrow text-xs font-semibold uppercase tracking-[0.18em] sm:text-sm"
              style={{ color: settings.eyebrowColor }}
            >
              {row.eyebrow}
            </p>
          )}
        </EditableTextBlock>

        <EditableTextBlock
          editingEnabled={editingEnabled}
          ariaLabel="Edit row 1 headline text"
          editorTitle="Edit headline"
          value={headlineDraft}
          multiline
          rows={5}
          className="mt-4"
          onSave={
            preview
              ? (value) =>
                  preview.setRow1HeadlineLines(parseTextImagesHeadlineDraft(value))
              : undefined
          }
        >
          {(row.headlineLines.length > 0 || editingEnabled) && (
            <div className="space-y-2">
              {row.headlineLines.map((line, index) => (
                <h2
                  key={`${line}-${index}`}
                  className={cn(
                    "text-images-v1-headline font-serif text-3xl font-semibold uppercase leading-tight sm:text-4xl lg:text-[2.5rem]",
                    index === 0 && "italic",
                  )}
                  style={{ color: settings.headlineColor }}
                >
                  {line}
                </h2>
              ))}
            </div>
          )}
        </EditableTextBlock>

        <EditableTextBlock
          editingEnabled={editingEnabled}
          ariaLabel="Edit row 1 body text"
          editorTitle="Edit body"
          value={row.body}
          multiline
          rows={6}
          className="mt-6"
          onSave={preview ? (value) => preview.setRow1Body(value) : undefined}
        >
          {(row.body || editingEnabled) && (
            <p
              className="text-images-v1-body max-w-2xl text-base leading-relaxed sm:text-lg"
              style={{ color: settings.bodyColor }}
            >
              {row.body}
            </p>
          )}
        </EditableTextBlock>
      </div>

      <TextImagesMediaBlock
        imageSrc={row.imageSrc}
        imageAlt={row.imageAlt}
        imageInverted={imageInverted}
        animationEnabled={settings.entranceAnimationEnabled}
        animationSpeedMs={settings.entranceAnimationSpeedMs}
        editingEnabled={editingEnabled}
        onImageSelect={preview ? (src, alt) => preview.setRow1Image(src, alt) : undefined}
      />
    </div>
  );
}

function TextImagesStandardRowBlock({
  row,
  rowNumber,
  rowAnchorId,
  mediaFirst,
  editingEnabled,
  settings,
  imageInverted,
  onTitleSave,
  onBodySave,
  onImageSelect,
  onAnchorSave,
  overlapIndex,
}: {
  row: TextImagesStandardRowContent;
  rowNumber: 2 | 3;
  rowAnchorId: string;
  mediaFirst: boolean;
  editingEnabled: boolean;
  settings: typeof defaultTextImagesPreviewSettings;
  imageInverted: boolean;
  onTitleSave?: (value: string) => void;
  onBodySave?: (value: string) => void;
  onImageSelect?: (src: string, alt: string) => void;
  onAnchorSave?: (anchorId: string) => void;
  overlapIndex?: 1 | 2;
}) {
  return (
    <div
      id={rowAnchorId}
      className={cn(
        "text-images-v1-row relative scroll-mt-24 grid gap-10 lg:grid-cols-2 lg:gap-14",
        rowNumber === 2 && "text-images-v1-row--stack-2",
        rowNumber === 3 && "text-images-v1-row--stack-3",
        mediaFirst && "text-images-v1-row--media-first",
        getTextImagesRowAlignClassName(
          rowNumber === 2 ? settings.row2CopyVerticalAlign : settings.row3CopyVerticalAlign,
        ),
      )}
    >
      {editingEnabled && onAnchorSave && (
        <TextImagesRowAnchorEditor
          rowNumber={rowNumber}
          anchorId={rowAnchorId}
          onSave={onAnchorSave}
        />
      )}
      <div
        className="text-images-v1-copy"
        style={{
          paddingTop:
            rowNumber === 2 ? settings.row2CopyPaddingTopPx : settings.row3CopyPaddingTopPx,
        }}
      >
        <EditableTextBlock
          editingEnabled={editingEnabled}
          ariaLabel={`Edit row ${rowNumber} title`}
          editorTitle="Edit title"
          value={row.title}
          onSave={onTitleSave}
        >
          {(row.title || editingEnabled) && (
            <h3
              className="text-images-v1-title font-serif text-2xl font-semibold uppercase leading-tight sm:text-3xl lg:text-4xl"
              style={{ color: settings.headlineColor }}
            >
              {row.title}
            </h3>
          )}
        </EditableTextBlock>

        <EditableTextBlock
          editingEnabled={editingEnabled}
          ariaLabel={`Edit row ${rowNumber} body text`}
          editorTitle="Edit body"
          value={row.body}
          multiline
          rows={5}
          className="mt-4"
          onSave={onBodySave}
        >
          {(row.body || editingEnabled) && (
            <p
              className="text-images-v1-body max-w-2xl text-base leading-relaxed sm:text-lg"
              style={{ color: settings.bodyColor }}
            >
              {row.body}
            </p>
          )}
        </EditableTextBlock>
      </div>

      <TextImagesMediaBlock
        imageSrc={row.imageSrc}
        imageAlt={row.imageAlt}
        imageInverted={imageInverted}
        animationEnabled={settings.entranceAnimationEnabled}
        animationSpeedMs={settings.entranceAnimationSpeedMs}
        editingEnabled={editingEnabled}
        onImageSelect={onImageSelect}
        overlapIndex={overlapIndex}
      />
    </div>
  );
}

function TextImagesRow3Block({
  row,
  rowAnchorId,
  editingEnabled,
  preview,
  settings,
  buttonStyle,
  isCustom,
  imageInverted,
}: {
  row: TextImagesRow3Content;
  rowAnchorId: string;
  editingEnabled: boolean;
  preview: ReturnType<typeof useTextImagesPreview>;
  settings: typeof defaultTextImagesPreviewSettings;
  buttonStyle: CSSProperties | undefined;
  isCustom: boolean;
  imageInverted: boolean;
}) {
  return (
    <div
      id={rowAnchorId}
      className={cn(
        "text-images-v1-row text-images-v1-row--stack-3 relative scroll-mt-24 grid gap-10 lg:grid-cols-2 lg:gap-14",
        getTextImagesRowAlignClassName(settings.row3CopyVerticalAlign),
      )}
    >
      {editingEnabled && preview && (
        <TextImagesRowAnchorEditor
          rowNumber={3}
          anchorId={rowAnchorId}
          onSave={(anchorId) => preview.setRowAnchorId(3, anchorId)}
        />
      )}
      <div className="text-images-v1-copy" style={{ paddingTop: settings.row3CopyPaddingTopPx }}>
        <EditableTextBlock
          editingEnabled={editingEnabled}
          ariaLabel="Edit row 3 title"
          editorTitle="Edit title"
          value={row.title}
          onSave={preview ? (value) => preview.setRow3Title(value) : undefined}
        >
          {(row.title || editingEnabled) && (
            <h3
              className="text-images-v1-title font-serif text-2xl font-semibold uppercase leading-tight sm:text-3xl lg:text-4xl"
              style={{ color: settings.headlineColor }}
            >
              {row.title}
            </h3>
          )}
        </EditableTextBlock>

        <EditableTextBlock
          editingEnabled={editingEnabled}
          ariaLabel="Edit row 3 body text"
          editorTitle="Edit body"
          value={row.body}
          multiline
          rows={5}
          className="mt-4"
          onSave={preview ? (value) => preview.setRow3Body(value) : undefined}
        >
          {(row.body || editingEnabled) && (
            <p
              className="text-images-v1-body max-w-2xl text-base leading-relaxed sm:text-lg"
              style={{ color: settings.bodyColor }}
            >
              {row.body}
            </p>
          )}
        </EditableTextBlock>

        {(settings.phoneButtonVisible && (row.phoneLabel || editingEnabled)) && (
          <EditableTextBlock
            editingEnabled={editingEnabled}
            ariaLabel="Edit row 3 call button text"
            editorTitle="Edit button"
            value={row.phoneLabel}
            className="inline-block"
            style={{ marginTop: settings.phoneButtonMarginTopPx }}
            onSave={preview ? (value) => preview.setRow3Phone(value) : undefined}
          >
            {row.phoneLabel ? (
              <a
                href={row.phoneHref}
                className={cn(
                  "text-image-v1-phone-btn radial-hover-shine inline-flex items-center justify-center font-semibold no-underline transition-colors",
                  isCustom && "text-image-v1-phone-btn--custom",
                )}
                style={buttonStyle}
                data-nav-button-size={settings.navButtonSize}
              >
                <span className="relative z-[1]">{row.phoneLabel}</span>
              </a>
            ) : null}
          </EditableTextBlock>
        )}
      </div>

      <TextImagesMediaBlock
        imageSrc={row.imageSrc}
        imageAlt={row.imageAlt}
        imageInverted={imageInverted}
        animationEnabled={settings.entranceAnimationEnabled}
        animationSpeedMs={settings.entranceAnimationSpeedMs}
        editingEnabled={editingEnabled}
        onImageSelect={preview ? (src, alt) => preview.setRow3Image(src, alt) : undefined}
        overlapIndex={2}
      />
    </div>
  );
}

/** Three alternating text/image rows — Spartan multi-block content section. */
export function TextImagesV1({ row1, row2, row3, className }: TextImagesV1Props) {
  const preview = useTextImagesPreview();
  const settings = preview?.settings ?? defaultTextImagesPreviewSettings;
  const editingEnabled = preview?.contentEditingEnabled ?? false;
  const isCustom = Boolean(preview);
  const buttonSettings = pickTextImagesButtonSettings(settings);

  const defaultContent = useMemo<TextImagesContent>(
    () => ({ row1, row2, row3 }),
    [row1, row2, row3],
  );

  const content = preview?.getContent(defaultContent) ?? defaultContent;
  const imageInverted = shouldInvertTextImageForTheme(settings.theme, defaultTextImagesV1Theme);

  const sectionStyle: CSSProperties = {
    backgroundColor: settings.backgroundColor,
    paddingTop: settings.sectionPaddingTopPx,
    paddingBottom: settings.sectionPaddingBottomPx,
  };

  const buttonStyle: CSSProperties | undefined = isCustom
    ? getButtonPreviewStyleRecord(buttonSettings)
    : undefined;

  return (
    <section className={cn("text-images-v1", className)} style={sectionStyle}>
      <Container className="overflow-visible">
        <div className="text-images-v1-rows flex flex-col gap-10 lg:gap-0">
          <TextImagesRow1Block
            row={content.row1}
            rowAnchorId={getTextImagesRowAnchorId(settings, 1)}
            editingEnabled={editingEnabled}
            preview={preview}
            settings={settings}
            imageInverted={imageInverted}
          />
          <TextImagesStandardRowBlock
            row={content.row2}
            rowNumber={2}
            rowAnchorId={getTextImagesRowAnchorId(settings, 2)}
            mediaFirst
            editingEnabled={editingEnabled}
            settings={settings}
            imageInverted={imageInverted}
            onTitleSave={preview ? (value) => preview.setRow2Title(value) : undefined}
            onBodySave={preview ? (value) => preview.setRow2Body(value) : undefined}
            onImageSelect={preview ? (src, alt) => preview.setRow2Image(src, alt) : undefined}
            onAnchorSave={preview ? (anchorId) => preview.setRowAnchorId(2, anchorId) : undefined}
            overlapIndex={1}
          />
          <TextImagesRow3Block
            row={content.row3}
            rowAnchorId={getTextImagesRowAnchorId(settings, 3)}
            editingEnabled={editingEnabled}
            preview={preview}
            settings={settings}
            buttonStyle={buttonStyle}
            isCustom={isCustom}
            imageInverted={imageInverted}
          />
        </div>
      </Container>
    </section>
  );
}
