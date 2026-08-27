import { getCommittedHomepagePreviewSettings } from "@/lib/homepage-settings";
import {
  defaultImagesV1Cards,
  defaultImagesV1PreviewSettings,
  type ImagesV1Card,
  type ImagesV1CardWidthMode,
  type ImagesV1PreviewSettings,
} from "@/lib/images-v1-preview";
import type { PreviewGradientDirection } from "@/lib/preview-gradient";
import type { SiteLayoutWidth } from "@/lib/site-layout";

import { orgStorageGet, orgStorageSet } from "@/lib/org/browser-storage";

export const imagesV1PreviewStorageKey = "lifespring-images-v1-preview";

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

function isPositiveNumber(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return fallback;
  return value;
}

function isCardWidthMode(value: unknown): value is ImagesV1CardWidthMode {
  return value === "natural" || value === "uniform";
}

function normalizeImagesV1Card(value: unknown, fallback: ImagesV1Card): ImagesV1Card {
  if (!value || typeof value !== "object") return fallback;
  const card = value as Partial<ImagesV1Card>;
  return {
    id: typeof card.id === "string" && card.id.trim() ? card.id.trim() : fallback.id,
    imageSrc: typeof card.imageSrc === "string" ? card.imageSrc.trim() : fallback.imageSrc,
    imageAlt: typeof card.imageAlt === "string" ? card.imageAlt.trim() : fallback.imageAlt,
    linkHref:
      typeof card.linkHref === "string" && card.linkHref.trim() ? card.linkHref.trim() : undefined,
    linkTarget:
      card.linkTarget === "_blank" || card.linkTarget === "_self" ? card.linkTarget : undefined,
  };
}

function normalizeImagesV1Cards(value: unknown): ImagesV1Card[] {
  if (!Array.isArray(value) || value.length === 0) return defaultImagesV1Cards;
  return value.map((entry, index) =>
    normalizeImagesV1Card(entry, defaultImagesV1Cards[index] ?? defaultImagesV1Cards[0]!),
  );
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

export function normalizeImagesV1PreviewSettings(
  value: Partial<ImagesV1PreviewSettings>,
): ImagesV1PreviewSettings {
  return {
    ...defaultImagesV1PreviewSettings,
    ...value,
    backgroundDirection: isPreviewGradientDirection(value.backgroundDirection)
      ? value.backgroundDirection
      : defaultImagesV1PreviewSettings.backgroundDirection,
    layoutWidth: isSiteLayoutWidth(value.layoutWidth)
      ? value.layoutWidth
      : defaultImagesV1PreviewSettings.layoutWidth,
    outerBackgroundColor: isHexColor(value.outerBackgroundColor)
      ? value.outerBackgroundColor
      : defaultImagesV1PreviewSettings.outerBackgroundColor,
    cardBorderColor: isHexColor(value.cardBorderColor)
      ? value.cardBorderColor
      : defaultImagesV1PreviewSettings.cardBorderColor,
    cardBorderWidthPx: isPositiveNumber(
      value.cardBorderWidthPx,
      defaultImagesV1PreviewSettings.cardBorderWidthPx,
    ),
    cardWidthMode: isCardWidthMode(value.cardWidthMode)
      ? value.cardWidthMode
      : defaultImagesV1PreviewSettings.cardWidthMode,
    cardUniformWidthPx: isPositiveNumber(
      value.cardUniformWidthPx,
      defaultImagesV1PreviewSettings.cardUniformWidthPx,
    ),
    cardUniformHeightPx: isPositiveNumber(
      value.cardUniformHeightPx,
      defaultImagesV1PreviewSettings.cardUniformHeightPx,
    ),
    cardGapPx: isPositiveNumber(value.cardGapPx, defaultImagesV1PreviewSettings.cardGapPx),
    topBorderColor: isHexColor(value.topBorderColor)
      ? value.topBorderColor
      : defaultImagesV1PreviewSettings.topBorderColor,
    topBorderHeightPx: isPositiveNumber(
      value.topBorderHeightPx,
      defaultImagesV1PreviewSettings.topBorderHeightPx,
    ),
    bottomBorderColor: isHexColor(value.bottomBorderColor)
      ? value.bottomBorderColor
      : defaultImagesV1PreviewSettings.bottomBorderColor,
    bottomBorderHeightPx: isPositiveNumber(
      value.bottomBorderHeightPx,
      defaultImagesV1PreviewSettings.bottomBorderHeightPx,
    ),
    sectionPaddingTopPx: isPositiveNumber(
      value.sectionPaddingTopPx,
      defaultImagesV1PreviewSettings.sectionPaddingTopPx,
    ),
    sectionPaddingBottomPx: isPositiveNumber(
      value.sectionPaddingBottomPx,
      defaultImagesV1PreviewSettings.sectionPaddingBottomPx,
    ),
    sectionHeightPx: isPositiveNumber(
      value.sectionHeightPx,
      defaultImagesV1PreviewSettings.sectionHeightPx,
    ),
    topBorderEnabled: value.topBorderEnabled === true,
    bottomBorderEnabled: value.bottomBorderEnabled === true,
    backgroundImageSrc:
      typeof value.backgroundImageSrc === "string" ? value.backgroundImageSrc.trim() : "",
    sectionHeading: normalizeOptionalString(value.sectionHeading),
    sectionSeoDescription: normalizeOptionalString(value.sectionSeoDescription),
    cards: normalizeImagesV1Cards(value.cards),
  };
}

function isImagesV1PreviewSettings(value: unknown): value is Partial<ImagesV1PreviewSettings> {
  if (!value || typeof value !== "object") return false;
  const settings = value as Partial<ImagesV1PreviewSettings>;
  return (
    typeof settings.backgroundFrom === "string" && typeof settings.backgroundTo === "string"
  );
}

export function loadImagesV1PreviewSettings(): ImagesV1PreviewSettings {
  const committed = getCommittedHomepagePreviewSettings()?.imagesV1;
  if (committed) return normalizeImagesV1PreviewSettings(committed);

  if (typeof window === "undefined") {
    return defaultImagesV1PreviewSettings;
  }

  try {
    const stored = orgStorageGet(imagesV1PreviewStorageKey);
    if (!stored) return defaultImagesV1PreviewSettings;

    const parsed: unknown = JSON.parse(stored);
    if (isImagesV1PreviewSettings(parsed)) {
      return normalizeImagesV1PreviewSettings(parsed);
    }
  } catch {
    // ignore invalid storage
  }

  return defaultImagesV1PreviewSettings;
}

export function saveImagesV1PreviewSettings(settings: ImagesV1PreviewSettings): void {
  if (typeof window === "undefined") return;
  orgStorageSet(imagesV1PreviewStorageKey, JSON.stringify(settings));
}
