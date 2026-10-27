import { getCommittedHomepagePreviewSettings } from "@/lib/homepage-settings";
import type { PortfolioSectionTheme } from "@/lib/portfolio-preview";
import {
  clampPortfolioV3HoverScale,
  defaultPortfolioV3PreviewSettings,
  defaultPortfolioV3CardGapPx,
  defaultPortfolioV3CardBorderRadiusPx,
  defaultPortfolioV3ColumnCount,
  defaultPortfolioV3HoverScale,
  defaultPortfolioV3PhoneBarBackground,
  defaultPortfolioV3PhoneBarTextColor,
  type PortfolioV3Card,
  type PortfolioV3PreviewSettings,
  type PortfolioV3WallStyle,
} from "@/lib/portfolio-v3-preview";
import { dedupePortfolioV3CardIds as dedupeCards } from "@/lib/portfolio-v3-cards";
import { normalizePortfolioV3GalleryTabs } from "@/lib/portfolio-v3-gallery-tabs";
import type { PortfolioV2ModalImage } from "@/lib/portfolio-v2-preview";
import type { SiteLayoutWidth } from "@/lib/site-layout";
import { isButtonPreviewSize } from "@/lib/button-preview";
import { orgStorageGet, orgStorageSet } from "@/lib/org/browser-storage";

export const portfolioV3PreviewStorageKey = "lifespring-portfolio-v3-preview";

function isPortfolioSectionTheme(value: unknown): value is PortfolioSectionTheme {
  return value === "dark" || value === "light";
}

function isSiteLayoutWidth(value: unknown): value is SiteLayoutWidth {
  return value === "contained" || value === "full";
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function isWallStyle(value: unknown): value is PortfolioV3WallStyle {
  return value === "cube" || value === "masonry";
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function isNonNegativeNumber(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return fallback;
  return value;
}

function normalizeModalImage(value: unknown, fallback: PortfolioV2ModalImage): PortfolioV2ModalImage {
  if (!value || typeof value !== "object") return fallback;
  const image = value as Partial<PortfolioV2ModalImage>;
  return {
    id: typeof image.id === "string" && image.id.trim() ? image.id.trim() : fallback.id,
    imageSrc: typeof image.imageSrc === "string" ? image.imageSrc.trim() : fallback.imageSrc,
    imageAlt: typeof image.imageAlt === "string" ? image.imageAlt.trim() : fallback.imageAlt,
  };
}

function normalizeCard(value: unknown, fallback: PortfolioV3Card): PortfolioV3Card {
  if (!value || typeof value !== "object") return fallback;
  const card = value as Partial<PortfolioV3Card>;
  const id = typeof card.id === "string" && card.id.trim() ? card.id.trim() : fallback.id;
  const modalImages = Array.isArray(card.modalImages)
    ? card.modalImages.map((entry, index) =>
        normalizeModalImage(entry, {
          id: `${id}-modal-${index + 1}`,
          imageSrc: "",
          imageAlt: "",
        }),
      )
    : undefined;

  return {
    id,
    imageSrc: typeof card.imageSrc === "string" ? card.imageSrc.trim() : fallback.imageSrc,
    imageAlt: typeof card.imageAlt === "string" ? card.imageAlt.trim() : fallback.imageAlt,
    title: normalizeOptionalString(card.title),
    caption: normalizeOptionalString(card.caption),
    modalImages: modalImages && modalImages.length > 0 ? modalImages : undefined,
  };
}

function normalizeCards(value: unknown): PortfolioV3Card[] {
  if (!Array.isArray(value) || value.length === 0) {
    return defaultPortfolioV3PreviewSettings.cards;
  }
  const cards = value.map((entry, index) =>
    normalizeCard(entry, defaultPortfolioV3PreviewSettings.cards[index % defaultPortfolioV3PreviewSettings.cards.length]),
  );
  return dedupeCards(cards);
}

export function normalizePortfolioV3PreviewSettings(
  value: Partial<PortfolioV3PreviewSettings>,
): PortfolioV3PreviewSettings {
  return {
    theme: isPortfolioSectionTheme(value.theme) ? value.theme : defaultPortfolioV3PreviewSettings.theme,
    layoutWidth: isSiteLayoutWidth(value.layoutWidth)
      ? value.layoutWidth
      : defaultPortfolioV3PreviewSettings.layoutWidth,
    wallStyle: isWallStyle(value.wallStyle) ? value.wallStyle : defaultPortfolioV3PreviewSettings.wallStyle,
    cardGapPx: isNonNegativeNumber(value.cardGapPx, defaultPortfolioV3CardGapPx),
    cardBorderRadiusPx: isNonNegativeNumber(
      value.cardBorderRadiusPx,
      defaultPortfolioV3CardBorderRadiusPx,
    ),
    columnCount: Math.min(
      6,
      Math.max(1, Math.round(isNonNegativeNumber(value.columnCount, defaultPortfolioV3ColumnCount) || 1)),
    ),
    sectionPaddingTopPx: isNonNegativeNumber(
      value.sectionPaddingTopPx,
      defaultPortfolioV3PreviewSettings.sectionPaddingTopPx,
    ),
    sectionPaddingBottomPx: isNonNegativeNumber(
      value.sectionPaddingBottomPx,
      defaultPortfolioV3PreviewSettings.sectionPaddingBottomPx,
    ),
    cardHoverScale: clampPortfolioV3HoverScale(
      typeof value.cardHoverScale === "number" && Number.isFinite(value.cardHoverScale)
        ? value.cardHoverScale
        : defaultPortfolioV3HoverScale,
    ),
    sectionHeading: normalizeOptionalString(value.sectionHeading),
    sectionDescription: normalizeOptionalString(value.sectionDescription),
    sectionDescriptionColor: normalizeOptionalString(value.sectionDescriptionColor),
    copyOnLeft:
      typeof value.copyOnLeft === "boolean"
        ? value.copyOnLeft
        : defaultPortfolioV3PreviewSettings.copyOnLeft,
    phoneBarVisible:
      typeof value.phoneBarVisible === "boolean"
        ? value.phoneBarVisible
        : defaultPortfolioV3PreviewSettings.phoneBarVisible,
    phoneBarBackgroundColor: isHexColor(value.phoneBarBackgroundColor)
      ? value.phoneBarBackgroundColor
      : defaultPortfolioV3PhoneBarBackground,
    phoneBarTextColor: isHexColor(value.phoneBarTextColor)
      ? value.phoneBarTextColor
      : defaultPortfolioV3PhoneBarTextColor,
    contentPhoneLabel: normalizeOptionalString(value.contentPhoneLabel),
    contentPhoneHref: normalizeOptionalString(value.contentPhoneHref),
    introButtonRadiusPx:
      typeof value.introButtonRadiusPx === "number" &&
      Number.isFinite(value.introButtonRadiusPx) &&
      value.introButtonRadiusPx >= 0
        ? Math.min(48, value.introButtonRadiusPx)
        : undefined,
    introButtonSize: isButtonPreviewSize(value.introButtonSize) ? value.introButtonSize : undefined,
    phoneBarHoverBackgroundColor: isHexColor(value.phoneBarHoverBackgroundColor)
      ? value.phoneBarHoverBackgroundColor
      : undefined,
    phoneBarTextHoverColor: isHexColor(value.phoneBarTextHoverColor)
      ? value.phoneBarTextHoverColor
      : undefined,
    captionsVisible:
      typeof value.captionsVisible === "boolean"
        ? value.captionsVisible
        : defaultPortfolioV3PreviewSettings.captionsVisible,
    cards: normalizeCards(value.cards),
    ...((): Record<string, never> | { galleryTabs: NonNullable<ReturnType<typeof normalizePortfolioV3GalleryTabs>> } => {
      const galleryTabs = normalizePortfolioV3GalleryTabs(value.galleryTabs, normalizeCards);
      return galleryTabs ? { galleryTabs } : {};
    })(),
  };
}

function isPortfolioV3PreviewSettings(value: unknown): value is Partial<PortfolioV3PreviewSettings> {
  if (!value || typeof value !== "object") return false;
  return Array.isArray((value as PortfolioV3PreviewSettings).cards);
}

export function loadPortfolioV3PreviewSettings(): PortfolioV3PreviewSettings {
  const committed = getCommittedHomepagePreviewSettings()?.portfolioV3;
  if (committed) return normalizePortfolioV3PreviewSettings(committed);

  if (typeof window === "undefined") {
    return defaultPortfolioV3PreviewSettings;
  }

  try {
    const stored = orgStorageGet(portfolioV3PreviewStorageKey);
    if (!stored) return defaultPortfolioV3PreviewSettings;
    const parsed: unknown = JSON.parse(stored);
    if (isPortfolioV3PreviewSettings(parsed)) {
      return normalizePortfolioV3PreviewSettings(parsed);
    }
  } catch {
    // ignore
  }

  return defaultPortfolioV3PreviewSettings;
}

export function savePortfolioV3PreviewSettings(settings: PortfolioV3PreviewSettings): void {
  if (typeof window === "undefined") return;
  orgStorageSet(portfolioV3PreviewStorageKey, JSON.stringify(normalizePortfolioV3PreviewSettings(settings)));
}
