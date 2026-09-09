"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { Pencil } from "lucide-react";
import { PreviewAwareLink } from "@/components/site/PreviewAwareLink";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { ServiceAreaV2CardEditor } from "@/components/dev/ServiceAreaV2CardEditor";
import { ServiceLabelEditor } from "@/components/dev/ServiceLabelEditor";
import { useServiceAreaV2Preview } from "@/components/dev/ServiceAreaV2PreviewContext";
import {
  devEditButtonClassName,
  devEditIconSize,
} from "@/lib/dev-overlay-controls";
import { cn } from "@/lib/utils";
import type { ServiceAreaV2Card } from "@/lib/service-area-v2-content";
import { getServiceAreaV2CardHref } from "@/lib/service-area-v2-content";
import {
  defaultServiceAreaV2PreviewSettings,
  getServiceAreaV2BackgroundStyle,
  getServiceAreaV2LayoutWidthClassName,
  type ServiceAreaV2PreviewSettings,
} from "@/lib/service-area-v2-preview";
import { buildServiceAreaLocationsItemListSchema } from "@/lib/seo-schema";

type ServiceAreaV2Props = {
  cards: ServiceAreaV2Card[];
  settings?: ServiceAreaV2PreviewSettings;
  className?: string;
  onUpdateCard?: (cardId: string, card: ServiceAreaV2Card) => void;
};

const headingId = "service-area-v2-heading";

function EditableHeaderLine({
  value,
  editingEnabled,
  onChange,
  dialogTitle,
  inputAriaLabel,
  multiline = false,
  rows = 3,
  children,
  className,
}: {
  value: string;
  editingEnabled: boolean;
  onChange?: (value: string) => void;
  dialogTitle: string;
  inputAriaLabel: string;
  multiline?: boolean;
  rows?: number;
  children: ReactNode;
  className?: string;
}) {
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <div className={cn("relative max-w-full", className)}>
      {children}
      {editingEnabled && onChange && (
        <>
          <button
            type="button"
            onClick={() => setEditorOpen((open) => !open)}
            className={cn(devEditButtonClassName, "-right-8 top-0")}
            aria-label={dialogTitle}
            aria-expanded={editorOpen}
          >
            <Pencil size={devEditIconSize} strokeWidth={2} />
          </button>
          {editorOpen && (
            <div className="absolute top-full left-0 z-30 mt-2">
              <ServiceLabelEditor
                value={value}
                onChange={onChange}
                onClose={() => setEditorOpen(false)}
                dialogTitle={dialogTitle}
                dialogAriaLabel={dialogTitle}
                inputAriaLabel={inputAriaLabel}
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

function getServiceAreaV2CardStyle(settings: ServiceAreaV2PreviewSettings): CSSProperties {
  return {
    backgroundColor: settings.cardBackgroundColor,
    borderRadius: `${settings.cardBorderRadiusPx}px`,
    color: settings.cardTextColor,
    ["--service-area-v2-card-hover-bg" as string]: settings.cardHoverBackgroundColor,
    ["--service-area-v2-link-color" as string]: settings.linkColor,
  };
}

function LocationCard({
  card,
  settings,
  editingEnabled,
  onUpdateCard,
}: {
  card: ServiceAreaV2Card;
  settings: ServiceAreaV2PreviewSettings;
  editingEnabled: boolean;
  onUpdateCard?: (cardId: string, card: ServiceAreaV2Card) => void;
}) {
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <article
      className="service-area-v2-card group relative flex h-full flex-col p-6 sm:p-7"
      style={getServiceAreaV2CardStyle(settings)}
    >
      {editingEnabled && onUpdateCard && (
        <button
          type="button"
          onClick={() => setEditorOpen(true)}
          className={cn(devEditButtonClassName, "top-3 right-3")}
          aria-label={`Edit ${card.title} card`}
          aria-expanded={editorOpen}
        >
          <Pencil size={devEditIconSize} strokeWidth={2} />
        </button>
      )}
      {editorOpen && onUpdateCard ? (
        <ServiceAreaV2CardEditor
          card={card}
          onSave={(nextCard) => onUpdateCard(card.id, nextCard)}
          onClose={() => setEditorOpen(false)}
        />
      ) : null}
      <h3 className="service-area-v2-card-title text-lg font-semibold leading-snug sm:text-[1.125rem]">
        {card.title}
      </h3>
      <p
        className="service-area-v2-card-description mt-3 flex-1 whitespace-pre-line text-sm leading-relaxed sm:text-[0.9375rem]"
        style={{ color: settings.cardMutedColor }}
      >
        {card.description}
      </p>
      <PreviewAwareLink href={getServiceAreaV2CardHref(card)} className="service-area-v2-card-link mt-5">
        {card.ctaLabel}
        <span aria-hidden="true">→</span>
      </PreviewAwareLink>
    </article>
  );
}

export function ServiceAreaV2({
  cards,
  settings: settingsProp,
  className,
  onUpdateCard,
}: ServiceAreaV2Props) {
  const preview = useServiceAreaV2Preview();
  const settings = settingsProp ?? preview?.settings ?? defaultServiceAreaV2PreviewSettings;
  const editingEnabled = Boolean(preview?.contentEditingEnabled);
  const locationSchema = buildServiceAreaLocationsItemListSchema(
    cards.map((card) => ({
      name: card.title,
      path: getServiceAreaV2CardHref(card),
      description: card.description,
      headlineArea: card.title.replace(/,\s*WA$/i, "").trim(),
    })),
    settings.intro,
  );

  return (
    <section
      className={cn("service-area-v2 py-16 lg:py-24", className)}
      id="service-areas"
      style={getServiceAreaV2BackgroundStyle(settings)}
      aria-labelledby={headingId}
    >
      <JsonLd data={locationSchema} />
      <Container className={getServiceAreaV2LayoutWidthClassName(settings.layoutWidth)}>
        <header className="service-area-v2-header max-w-3xl text-left">
          <EditableHeaderLine
            value={settings.eyebrow}
            editingEnabled={editingEnabled}
            onChange={preview?.setEyebrow}
            dialogTitle="Edit eyebrow"
            inputAriaLabel="Section eyebrow"
          >
            <p
              className="service-area-v2-eyebrow text-xs font-semibold tracking-[0.22em] uppercase sm:text-sm"
              style={{ color: settings.accentColor }}
            >
              {settings.eyebrow}
            </p>
          </EditableHeaderLine>
          <EditableHeaderLine
            value={settings.heading}
            editingEnabled={editingEnabled}
            onChange={preview?.setHeading}
            dialogTitle="Edit heading"
            inputAriaLabel="Section heading"
            className="mt-3"
          >
            <h2
              id={headingId}
              className="service-area-v2-heading font-serif text-3xl font-bold uppercase tracking-tight text-balance sm:text-4xl lg:text-[2.5rem]"
              style={{ color: settings.cardTextColor }}
            >
              {settings.heading}
            </h2>
          </EditableHeaderLine>
          <EditableHeaderLine
            value={settings.intro}
            editingEnabled={editingEnabled}
            onChange={preview?.setIntro}
            dialogTitle="Edit intro"
            inputAriaLabel="Section intro"
            multiline
            rows={4}
            className="mt-4 max-w-2xl"
          >
            <p
              className="service-area-v2-intro text-base leading-relaxed sm:text-lg"
              style={{ color: settings.cardMutedColor }}
            >
              {settings.intro}
            </p>
          </EditableHeaderLine>
        </header>

        <ul className="service-area-v2-grid mt-10 grid list-none gap-5 lg:mt-12 lg:grid-cols-3">
          {cards.map((card) => (
            <li key={card.id}>
              <LocationCard
                card={card}
                settings={settings}
                editingEnabled={editingEnabled}
                onUpdateCard={onUpdateCard}
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
