import { getCommittedHomepagePreviewSettings, shouldUsePlaygroundPreviewSettings } from "@/lib/homepage-settings";
import {
  clampServicesIconsV2CardMinHeightPx,
  clampServicesIconsV2CardPaddingPx,
  clampServicesIconsV2FontSizePx,
  clampServicesIconsV2IconSizePx,
  defaultServicesIconsV2PreviewSettings,
  normalizeServicesIconsV2BorderRadiusPx,
  type ServicesIconsV2PreviewSettings,
} from "@/lib/services-icons-v2-preview";
import type { PreviewGradientDirection } from "@/lib/preview-gradient";
import type { SiteLayoutWidth } from "@/lib/site-layout";
import { normalizeServiceIconsMap, normalizeServiceLabelsMap } from "@/lib/site-icons";

export const servicesIconsV2PreviewStorageKey = "lifespring-services-icons-v2-preview";

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

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function normalizeCtaHref(value: unknown): string | undefined {
  const href = normalizeOptionalString(value);
  if (!href?.startsWith("tel:")) return undefined;
  return href;
}
function isServicesIconsV2PreviewSettings(
  value: unknown,
): value is Partial<ServicesIconsV2PreviewSettings> {
  if (!value || typeof value !== "object") return false;

  const settings = value as Partial<ServicesIconsV2PreviewSettings>;
  return (
    typeof settings.backgroundFrom === "string" && typeof settings.backgroundTo === "string"
  );
}

export function normalizeServicesIconsV2PreviewSettings(
  value: Partial<ServicesIconsV2PreviewSettings>,
): ServicesIconsV2PreviewSettings {
  const defaults = defaultServicesIconsV2PreviewSettings;

  return {
    ...defaults,
    ...value,
    backgroundDirection: isPreviewGradientDirection(value.backgroundDirection)
      ? value.backgroundDirection
      : defaults.backgroundDirection,
    layoutWidth: isSiteLayoutWidth(value.layoutWidth) ? value.layoutWidth : defaults.layoutWidth,
    outerBackgroundColor: isHexColor(value.outerBackgroundColor)
      ? value.outerBackgroundColor
      : defaults.outerBackgroundColor,
    cardBackgroundColor: isHexColor(value.cardBackgroundColor)
      ? value.cardBackgroundColor
      : defaults.cardBackgroundColor,
    circleColor: isHexColor(value.circleColor) ? value.circleColor : defaults.circleColor,
    iconColor: isHexColor(value.iconColor) ? value.iconColor : defaults.iconColor,
    cardTextColor: isHexColor(value.cardTextColor) ? value.cardTextColor : defaults.cardTextColor,
    headingColor: isHexColor(value.headingColor) ? value.headingColor : defaults.headingColor,
    ctaBackgroundColor: isHexColor(value.ctaBackgroundColor)
      ? value.ctaBackgroundColor
      : isHexColor(value.circleColor)
        ? value.circleColor
        : defaults.ctaBackgroundColor,
    ctaTextColor: isHexColor(value.ctaTextColor) ? value.ctaTextColor : defaults.ctaTextColor,
    cardFontSizePx: clampServicesIconsV2FontSizePx(
      value.cardFontSizePx ?? defaults.cardFontSizePx,
      defaults.cardFontSizePx,
      16,
      36,
    ),
    headingFontSizePx: clampServicesIconsV2FontSizePx(
      value.headingFontSizePx ?? defaults.headingFontSizePx,
      defaults.headingFontSizePx,
      28,
      72,
    ),
    cardBorderRadiusPx: normalizeServicesIconsV2BorderRadiusPx(
      value.cardBorderRadiusPx ?? defaults.cardBorderRadiusPx,
    ),
    cardPaddingPx: clampServicesIconsV2CardPaddingPx(value.cardPaddingPx ?? defaults.cardPaddingPx),
    cardMinHeightPx: clampServicesIconsV2CardMinHeightPx(
      value.cardMinHeightPx ?? defaults.cardMinHeightPx,
    ),
    iconSizePx: clampServicesIconsV2IconSizePx(value.iconSizePx ?? defaults.iconSizePx),
    serviceIcons: normalizeServiceIconsMap(value.serviceIcons),
    serviceLabels: normalizeServiceLabelsMap(value.serviceLabels),
    ctaLabel: normalizeOptionalString(value.ctaLabel),
    ctaHref: normalizeCtaHref(value.ctaHref),
    sectionHeading: normalizeOptionalString(value.sectionHeading),
  };
}

export function loadServicesIconsV2PreviewSettings(): ServicesIconsV2PreviewSettings {
  if (!shouldUsePlaygroundPreviewSettings()) {
    const committed = getCommittedHomepagePreviewSettings()?.servicesIconsV2;
    if (committed) return normalizeServicesIconsV2PreviewSettings(committed);
  }

  if (typeof window === "undefined") {
    return defaultServicesIconsV2PreviewSettings;
  }

  try {
    const stored = localStorage.getItem(servicesIconsV2PreviewStorageKey);
    if (!stored) return defaultServicesIconsV2PreviewSettings;

    const parsed: unknown = JSON.parse(stored);
    if (isServicesIconsV2PreviewSettings(parsed)) {
      return normalizeServicesIconsV2PreviewSettings(parsed);
    }
  } catch {
    // ignore invalid storage
  }

  return defaultServicesIconsV2PreviewSettings;
}

export function saveServicesIconsV2PreviewSettings(settings: ServicesIconsV2PreviewSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    servicesIconsV2PreviewStorageKey,
    JSON.stringify(normalizeServicesIconsV2PreviewSettings(settings)),
  );
}
