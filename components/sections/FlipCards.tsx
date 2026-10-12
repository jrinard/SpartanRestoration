"use client";

import { useState, type CSSProperties } from "react";
import { Pencil } from "lucide-react";
import { TextImageTextEditor } from "@/components/dev/TextImageTextEditor";
import { useFlipCardsPreview } from "@/components/dev/FlipCardsPreviewContext";
import {
  cardsForFlipLayout,
  resolveFlipCardsSectionBackground,
  type FlipCardsPreviewCard,
} from "@/lib/flip-cards-preview";
import { defaultFlipCardsPreviewSettingsForLayout } from "@/lib/flip-cards-presets";
import { getClientOrgId } from "@/lib/org/browser-storage";
import { devEditButtonClassName, devEditIconSize } from "@/lib/dev-overlay-controls";
import { cn } from "@/lib/utils";

export type FlipCard = FlipCardsPreviewCard;

type FlipCardsProps = {
  heading?: string;
  cards?: FlipCardsPreviewCard[];
  layout?: "three" | "four";
};

function FlipCardTile({ card }: { card: FlipCardsPreviewCard }) {
  const backColor = card.backColor?.trim();
  const accentStyle: CSSProperties | undefined = backColor
    ? { borderColor: backColor, borderWidth: 4, borderStyle: "solid" }
    : undefined;
  const backStyle: CSSProperties | undefined = backColor
    ? { background: backColor }
    : undefined;
  const hasImage = Boolean(card.frontImage?.trim());

  return (
    <div
      className={cn("flip-card", `flip-card-${card.variant}`)}
      tabIndex={0}
      role="group"
      aria-label={card.frontLabel || card.title}
    >
      <div className="flip-card-inner">
        <div
          className="flip-card-front"
          style={{
            ...(hasImage ? { backgroundImage: `url(${card.frontImage})` } : undefined),
            ...accentStyle,
          }}
          {...(hasImage ? { role: "img" as const, "aria-label": card.title } : {})}
        >
          <span>
            {card.frontLines?.length
              ? card.frontLines.map((line, index) => (
                  <span key={`${line}-${index}`}>
                    {line}
                    {index < card.frontLines!.length - 1 && <br />}
                  </span>
                ))
              : card.frontLabel}
          </span>
        </div>
        <div className="flip-card-back" style={backStyle}>
          <h3>{card.title}</h3>
          {card.paragraph ? (
            <p>{card.paragraph}</p>
          ) : (
            <ul>
              {card.bullets?.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
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
      <h2 className="area-4-title">{value}</h2>
      {editingEnabled && onSave ? (
        <>
          <button
            type="button"
            onClick={() => setEditorOpen((open) => !open)}
            className={devEditButtonClassName}
            aria-label="Edit services heading"
            aria-expanded={editorOpen}
          >
            <Pencil size={devEditIconSize} strokeWidth={2} />
          </button>
          {editorOpen ? (
            <div className="absolute top-full left-1/2 z-30 mt-2 -translate-x-1/2">
              <TextImageTextEditor
                value={value}
                dialogTitle="Section heading"
                dialogAriaLabel="Section heading"
                inputAriaLabel="Edit section heading"
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

/**
 * Hover flip cards — OSP-style service boxes with optional 3- or 4-card layout.
 */
export function FlipCards({ heading, cards: cardsProp, layout = "three" }: FlipCardsProps) {
  const preview = useFlipCardsPreview();
  const settings =
    preview?.settings ??
    defaultFlipCardsPreviewSettingsForLayout(getClientOrgId(), layout);
  const editingEnabled = preview?.contentEditingEnabled ?? false;
  const activeLayout = preview?.layout ?? layout;
  const resolvedHeading = heading ?? settings.heading;
  const cards = cardsForFlipLayout(cardsProp ?? settings.cards, activeLayout);
  const isFour = activeLayout === "four" || cards.length === 4;
  const setSettings = preview?.setSettings;
  const sectionBackground = resolveFlipCardsSectionBackground(settings);
  const sectionBandStyle: CSSProperties | undefined = sectionBackground
    ? { backgroundColor: sectionBackground }
    : undefined;

  return (
    <div className="flip-cards-v2-band w-full" style={sectionBandStyle}>
      <section className="area-4">
        <EditableHeading
          editingEnabled={editingEnabled}
          value={resolvedHeading}
          onSave={
            setSettings
              ? (value) => setSettings({ ...settings, heading: value })
              : undefined
          }
        />
        <div className={cn("area-4-boxes tri-box-section", isFour && "flip-cards-4")}>
          {cards.map((card) => (
            <FlipCardTile key={card.id} card={card} />
          ))}
        </div>
      </section>
      {settings.showTornDivider ? (
        <div className="torn-divider" aria-hidden="true" />
      ) : null}
    </div>
  );
}
