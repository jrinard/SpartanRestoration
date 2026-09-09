import { getCommittedHomepagePreviewSettings } from "@/lib/homepage-settings";
import {
  defaultCardsV1Cards,
  defaultCardsV1HeadingColor,
  defaultCardsV1SubtitleColor,
  defaultCardsV1PreviewSettings,
  isCardsV1LabelFontStyle,
  normalizeCardsV1BookEndWidth,
  normalizeCardsV1CardBorderRadiusPx,
  normalizeCardsV1CardBorderWidthPx,
  type CardsV1Card,
  type CardsV1PreviewSettings,
} from "@/lib/cards-v1-preview";

export type { CardsV1PreviewSettings };
import { isCardsV1Variant } from "@/lib/cards-v1-cards";
import type { PreviewGradientDirection } from "@/lib/preview-gradient";
import type { SiteLayoutWidth } from "@/lib/site-layout";
import { orgStorageGet, orgStorageSet } from "@/lib/org/browser-storage";

function isSiteLayoutWidth(value: unknown): value is SiteLayoutWidth {
  return value === "contained" || value === "full";
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function isPreviewGradientDirection(value: unknown): value is PreviewGradientDirection {
  return (
    value === "none" ||
    value === "to bottom" ||
    value === "to top" ||
    value === "to right" ||
    value === "to left" ||
    value === "to bottom right" ||
    value === "to bottom left" ||
    value === "to top right" ||
    value === "to top left"
  );
}

export const cardsV1PreviewStorageKey = "lifespring-cards-v1-preview";

function normalizeCardsV1Card(value: unknown, fallback: CardsV1Card): CardsV1Card {
  if (!value || typeof value !== "object") return fallback;
  const card = value as Partial<CardsV1Card>;
  return {
    id: typeof card.id === "string" && card.id.trim() ? card.id.trim() : fallback.id,
    title: typeof card.title === "string" ? card.title : fallback.title,
    subtitle: typeof card.subtitle === "string" ? card.subtitle : "",
    imageSrc: typeof card.imageSrc === "string" ? card.imageSrc.trim() : fallback.imageSrc,
    variant: isCardsV1Variant(card.variant) ? card.variant : fallback.variant,
  };
}

function normalizeCardsV1Cards(value: unknown): CardsV1Card[] {
  if (!Array.isArray(value) || value.length === 0) return defaultCardsV1Cards;
  return value.map((entry, index) =>
    normalizeCardsV1Card(entry, defaultCardsV1Cards[index] ?? defaultCardsV1Cards[0]!),
  );
}

export function normalizeCardsV1PreviewSettings(
  value: Partial<CardsV1PreviewSettings>,
): CardsV1PreviewSettings {
  return {
    heading:
      typeof value.heading === "string" ? value.heading : defaultCardsV1PreviewSettings.heading,
    headingColor: isHexColor(value.headingColor) ? value.headingColor : defaultCardsV1HeadingColor,
    showDivider: false,
    cardBorderRadiusPx: normalizeCardsV1CardBorderRadiusPx(
      typeof value.cardBorderRadiusPx === "number"
        ? value.cardBorderRadiusPx
        : defaultCardsV1PreviewSettings.cardBorderRadiusPx,
    ),
    cardBorderWidthPx: normalizeCardsV1CardBorderWidthPx(
      typeof value.cardBorderWidthPx === "number"
        ? value.cardBorderWidthPx
        : defaultCardsV1PreviewSettings.cardBorderWidthPx,
    ),
    cardBorderColor: isHexColor(value.cardBorderColor) ? value.cardBorderColor : "",
    showBookEnds:
      typeof value.showBookEnds === "boolean"
        ? value.showBookEnds
        : defaultCardsV1PreviewSettings.showBookEnds,
    bookEndWidthPx: normalizeCardsV1BookEndWidth(value.bookEndWidthPx),
    layoutWidth: isSiteLayoutWidth(value.layoutWidth)
      ? value.layoutWidth
      : defaultCardsV1PreviewSettings.layoutWidth,
    labelFontStyle: isCardsV1LabelFontStyle(value.labelFontStyle)
      ? value.labelFontStyle
      : defaultCardsV1PreviewSettings.labelFontStyle,
    subtitleColor: isHexColor(value.subtitleColor) ? value.subtitleColor : defaultCardsV1SubtitleColor,
    backgroundFrom: isHexColor(value.backgroundFrom) ? value.backgroundFrom : "",
    backgroundTo: isHexColor(value.backgroundTo) ? value.backgroundTo : "",
    backgroundDirection: isPreviewGradientDirection(value.backgroundDirection)
      ? value.backgroundDirection
      : "none",
    outerBackgroundColor: isHexColor(value.outerBackgroundColor) ? value.outerBackgroundColor : "",
    cards: normalizeCardsV1Cards(value.cards),
  };
}

export function loadCardsV1PreviewSettings(): CardsV1PreviewSettings {
  const committed = getCommittedHomepagePreviewSettings()?.cardsV1;
  if (committed) return normalizeCardsV1PreviewSettings(committed);

  if (typeof window === "undefined") return defaultCardsV1PreviewSettings;

  try {
    const stored = orgStorageGet(cardsV1PreviewStorageKey);
    if (!stored) return defaultCardsV1PreviewSettings;
    const parsed: unknown = JSON.parse(stored);
    if (parsed && typeof parsed === "object") {
      return normalizeCardsV1PreviewSettings(parsed as Partial<CardsV1PreviewSettings>);
    }
  } catch {
    // ignore invalid storage
  }

  return defaultCardsV1PreviewSettings;
}

export function saveCardsV1PreviewSettings(settings: CardsV1PreviewSettings): void {
  if (typeof window === "undefined") return;
  orgStorageSet(cardsV1PreviewStorageKey, JSON.stringify(normalizeCardsV1PreviewSettings(settings)));
}
