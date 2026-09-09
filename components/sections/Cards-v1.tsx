"use client";

import { useState, type CSSProperties } from "react";
import { ImageOff, Images, Pencil } from "lucide-react";
import { ImageLibraryPicker } from "@/components/dev/ImageLibraryPicker";
import { TextImageTextEditor } from "@/components/dev/TextImageTextEditor";
import { useCardsV1Preview } from "@/components/dev/CardsV1PreviewContext";
import {
  defaultCardsV1PreviewSettings,
  getCardsV1BackgroundStyle,
  type CardsV1Card,
} from "@/lib/cards-v1-preview";
import { getSiteLayoutWidthClassName } from "@/lib/site-layout";
import {
  devEditButtonClassName,
  devEditIconSize,
} from "@/lib/dev-overlay-controls";
import { cn } from "@/lib/utils";

const cardOverlayButtonClassName = cn(
  devEditButtonClassName,
  "top-[1px] z-10",
);

function CardsV1BookEnd() {
  return (
    <div className="cards-v1-bookend" aria-hidden="true">
      <span className="cards-v1-bookend-block" />
      <span className="cards-v1-bookend-rule" />
    </div>
  );
}

function EditableHeading({
  editingEnabled,
  value,
  onSave,
}: {
  editingEnabled: boolean;
  value: string;
  onSave?: (value: string) => void;
}) {
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <div className="relative inline-flex max-w-full items-start pr-8">
      <h2 className="cards-v1-title">{value}</h2>
      {editingEnabled && onSave ? (
        <>
          <button
            type="button"
            onClick={() => setEditorOpen((open) => !open)}
            className={devEditButtonClassName}
            aria-label="Edit cards heading"
            aria-expanded={editorOpen}
          >
            <Pencil size={devEditIconSize} strokeWidth={2} />
          </button>
          {editorOpen ? (
            <div className="absolute top-full left-1/2 z-30 mt-2 -translate-x-1/2">
              <TextImageTextEditor
                value={value}
                dialogTitle="Cards heading"
                dialogAriaLabel="Cards heading"
                inputAriaLabel="Edit cards heading"
                onChange={onSave}
                onClose={() => setEditorOpen(false)}
              />
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function CardsV1CopyEditor({
  title,
  subtitle,
  onSave,
  onClose,
}: {
  title: string;
  subtitle: string;
  onSave: (patch: { title: string; subtitle: string }) => void;
  onClose: () => void;
}) {
  const [titleDraft, setTitleDraft] = useState(title);
  const [lineDraft, setLineDraft] = useState(subtitle);
  const fieldClassName =
    "w-full rounded border border-accent-purple/40 bg-background px-2 py-1.5 text-sm text-foreground focus:border-accent-purple focus:outline-none";

  return (
    <div
      className="z-40 w-72 rounded-md border border-accent-purple/50 bg-background/95 p-2 shadow-lg backdrop-blur-sm"
      role="dialog"
      aria-label="Edit card copy"
    >
      <p className="mb-2 px-1 font-mono text-[10px] tracking-wide text-accent-purple uppercase">
        Card title
      </p>
      <input
        type="text"
        value={titleDraft}
        autoFocus
        onChange={(event) => setTitleDraft(event.target.value)}
        className={fieldClassName}
        aria-label="Edit card title"
      />
      <p className="mb-2 mt-3 px-1 font-mono text-[10px] tracking-wide text-accent-purple uppercase">
        One-liner
      </p>
      <input
        type="text"
        value={lineDraft}
        onChange={(event) => setLineDraft(event.target.value)}
        className={fieldClassName}
        aria-label="Edit card one-liner"
      />
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-accent-purple/30 px-2 py-1 font-mono text-[10px] text-accent-purple/80"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            onSave({ title: titleDraft.trim(), subtitle: lineDraft.trim() });
            onClose();
          }}
          className="rounded border border-accent-purple/50 bg-accent-purple/10 px-2 py-1 font-mono text-[10px] text-accent-purple"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function CardsV1CardFace({
  card,
  editingEnabled,
  onCopySave,
  onImageSelect,
}: {
  card: CardsV1Card;
  editingEnabled: boolean;
  onCopySave?: (patch: { title?: string; subtitle?: string }) => void;
  onImageSelect?: (src: string) => void;
}) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const hasImage = Boolean(card.imageSrc.trim());
  const subtitle = card.subtitle.trim();

  return (
    <article
      className={cn("cards-v1-card", `cards-v1-card--${card.variant}`)}
      aria-label={card.title || "Card"}
    >
      <div
        className={cn("cards-v1-card-face", !hasImage && "cards-v1-card-face--empty")}
        style={hasImage ? { backgroundImage: `url(${card.imageSrc})` } : undefined}
        {...(hasImage ? { role: "img" as const, "aria-label": card.title || "Card image" } : {})}
      >
        <div className="cards-v1-card-copy">
          <span className="cards-v1-card-title">{card.title}</span>
          {subtitle ? <span className="cards-v1-card-line">{subtitle}</span> : null}
        </div>
        {editingEnabled && onCopySave ? (
          <>
            <button
              type="button"
              onClick={() => setEditorOpen((open) => !open)}
              className={cn(cardOverlayButtonClassName, "right-[1px]")}
              aria-label={`Edit copy for ${card.title || "card"}`}
              aria-expanded={editorOpen}
            >
              <Pencil size={devEditIconSize} strokeWidth={2} />
            </button>
            {editorOpen ? (
              <div className="absolute top-full right-0 z-[40] mt-2">
                <CardsV1CopyEditor
                  title={card.title}
                  subtitle={card.subtitle}
                  onSave={onCopySave}
                  onClose={() => setEditorOpen(false)}
                />
              </div>
            ) : null}
          </>
        ) : null}
        {editingEnabled && onImageSelect ? (
          <>
            <button
              type="button"
              onClick={() => setLibraryOpen((open) => !open)}
              className={cn(cardOverlayButtonClassName, "left-[1px] right-auto")}
              aria-label={`Choose image for ${card.title || "card"}`}
              aria-expanded={libraryOpen}
            >
              <Images size={devEditIconSize} strokeWidth={2} />
            </button>
            {hasImage ? (
              <button
                type="button"
                onClick={() => {
                  onImageSelect("");
                  setLibraryOpen(false);
                }}
                className={cn(cardOverlayButtonClassName, "left-[30px] right-auto")}
                aria-label={`Remove image from ${card.title || "card"}`}
              >
                <ImageOff size={devEditIconSize} strokeWidth={2} />
              </button>
            ) : null}
            {libraryOpen ? (
              <div className="absolute top-9 left-[1px] z-[40]">
                <ImageLibraryPicker
                  value={card.imageSrc}
                  onSelect={(entry) => {
                    onImageSelect(entry.src);
                    setLibraryOpen(false);
                  }}
                  onClose={() => setLibraryOpen(false)}
                />
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </article>
  );
}

/**
 * Static service cards — Flip Cards v1 size and spacing, no flip.
 */
export function CardsV1() {
  const preview = useCardsV1Preview();
  const settings = preview?.settings ?? defaultCardsV1PreviewSettings;
  const editingEnabled = preview?.contentEditingEnabled ?? false;
  const cards = settings.cards.length > 0 ? settings.cards : defaultCardsV1PreviewSettings.cards;
  const bookEndsEdgeToEdge =
    settings.showBookEnds && settings.layoutWidth === "full";
  const bookEndsFill = settings.showBookEnds && settings.bookEndWidthPx === "full";
  const sectionBackground = getCardsV1BackgroundStyle(settings);
  const outerBackgroundColor = settings.outerBackgroundColor?.trim();

  const section = (
    <section
      className={cn(
        "cards-v1",
        getSiteLayoutWidthClassName(settings.layoutWidth),
        settings.layoutWidth === "full" && "cards-v1--full",
        settings.layoutWidth === "contained" && "cards-v1--contained",
        bookEndsEdgeToEdge && "cards-v1--bookends-bleed",
        `cards-v1--style-${settings.labelFontStyle}`,
      )}
      style={
        {
          "--cards-v1-heading-color": settings.headingColor,
          "--cards-v1-line-color": settings.subtitleColor,
          "--cards-v1-card-radius": `${settings.cardBorderRadiusPx}px`,
          "--cards-v1-card-border-width": `${settings.cardBorderWidthPx}px`,
          ...(sectionBackground ? { background: sectionBackground } : {}),
          ...(settings.bookEndWidthPx !== "full"
            ? { "--cards-v1-bookend-width": `${settings.bookEndWidthPx}px` }
            : {}),
          ...(settings.cardBorderColor
            ? { "--cards-v1-card-border-color": settings.cardBorderColor }
            : {}),
        } as CSSProperties
      }
    >
      <EditableHeading
        editingEnabled={editingEnabled}
        value={settings.heading}
        onSave={
          preview
            ? (heading) => preview.setSettings({ ...settings, heading })
            : undefined
        }
      />
      <div
        className={cn(
          "cards-v1-stage",
          settings.showBookEnds && "cards-v1-stage--bookends",
          bookEndsFill && "cards-v1-stage--bookends-fill",
          bookEndsEdgeToEdge && "cards-v1-stage--bookends-full",
        )}
      >
        {settings.showBookEnds ? <CardsV1BookEnd /> : null}
        <div className="cards-v1-row">
          {cards.map((card) => (
            <CardsV1CardFace
              key={card.id}
              card={card}
              editingEnabled={editingEnabled}
              onCopySave={
                preview
                  ? (patch) => preview.updateCard(card.id, patch)
                  : undefined
              }
              onImageSelect={
                preview
                  ? (imageSrc) => preview.updateCard(card.id, { imageSrc })
                  : undefined
              }
            />
          ))}
        </div>
        {settings.showBookEnds ? <CardsV1BookEnd /> : null}
      </div>
    </section>
  );

  if (settings.layoutWidth === "contained" && outerBackgroundColor) {
    return (
      <div className="w-full" style={{ backgroundColor: outerBackgroundColor }}>
        {section}
      </div>
    );
  }

  return section;
}
