"use client";

import type { CSSProperties } from "react";
import { PreviewAwareLink } from "@/components/site/PreviewAwareLink";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { useServiceAreaV2Preview } from "@/components/dev/ServiceAreaV2PreviewContext";
import type { ServiceAreaV2Card } from "@/lib/service-area-v2-content";
import { getServiceAreaV2CardHref } from "@/lib/service-area-v2-content";
import {
  defaultServiceAreaV2PreviewSettings,
  getServiceAreaV2BackgroundStyle,
  getServiceAreaV2LayoutWidthClassName,
  type ServiceAreaV2PreviewSettings,
} from "@/lib/service-area-v2-preview";
import { buildServiceAreaLocationsItemListSchema } from "@/lib/seo-schema";
import { cn } from "@/lib/utils";

type ServiceAreaV2Props = {
  cards: ServiceAreaV2Card[];
  settings?: ServiceAreaV2PreviewSettings;
  className?: string;
};

const headingId = "service-area-v2-heading";

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
}: {
  card: ServiceAreaV2Card;
  settings: ServiceAreaV2PreviewSettings;
}) {
  return (
    <article
      className="service-area-v2-card group flex h-full flex-col p-6 sm:p-7"
      style={getServiceAreaV2CardStyle(settings)}
    >
      <h3 className="service-area-v2-card-title text-lg font-semibold leading-snug sm:text-[1.125rem]">
        {card.title}
      </h3>
      <p
        className="service-area-v2-card-description mt-3 flex-1 text-sm leading-relaxed sm:text-[0.9375rem]"
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

export function ServiceAreaV2({ cards, settings: settingsProp, className }: ServiceAreaV2Props) {
  const preview = useServiceAreaV2Preview();
  const settings = settingsProp ?? preview?.settings ?? defaultServiceAreaV2PreviewSettings;
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
          <p
            className="service-area-v2-eyebrow text-xs font-semibold tracking-[0.22em] uppercase sm:text-sm"
            style={{ color: settings.accentColor }}
          >
            {settings.eyebrow}
          </p>
          <h2
            id={headingId}
            className="service-area-v2-heading mt-3 font-serif text-3xl font-bold uppercase tracking-tight text-balance sm:text-4xl lg:text-[2.5rem]"
            style={{ color: settings.cardTextColor }}
          >
            {settings.heading}
          </h2>
          <p
            className="service-area-v2-intro mt-4 max-w-2xl text-base leading-relaxed sm:text-lg"
            style={{ color: settings.cardMutedColor }}
          >
            {settings.intro}
          </p>
        </header>

        <ul className="service-area-v2-grid mt-10 grid list-none gap-5 lg:mt-12 lg:grid-cols-3">
          {cards.map((card) => (
            <li key={card.id}>
              <LocationCard card={card} settings={settings} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
