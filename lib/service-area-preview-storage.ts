import { getCommittedHomepagePreviewSettings, shouldUsePlaygroundPreviewSettings } from "@/lib/homepage-settings";
import {
  defaultServiceAreaV1PreviewSettings,
  isServiceAreaV1BackgroundMode,
  isServiceAreaV1Size,
  normalizeServiceAreaV1CardBorderRadiusPx,
  type ServiceAreaV1PreviewSettings,
} from "@/lib/service-area-preview";
import { normalizePublicImageSrc } from "@/lib/image-library";
import type { SiteLayoutWidth } from "@/lib/site-layout";

export const serviceAreaV1PreviewStorageKey = "lifespring-service-area-v1-preview";

function isSiteLayoutWidth(value: unknown): value is SiteLayoutWidth {
  return value === "contained" || value === "full";
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function normalizeLocationLabels(
  value: unknown,
): Partial<Record<string, string>> {
  if (!value || typeof value !== "object") return {};

  const labels: Partial<Record<string, string>> = {};
  for (const [key, label] of Object.entries(value as Record<string, unknown>)) {
    if (typeof label !== "string") continue;
    const trimmed = label.trim();
    if (trimmed) labels[key] = trimmed;
  }

  return labels;
}

function clampGradientAngle(value: number): number {
  if (!Number.isFinite(value)) return defaultServiceAreaV1PreviewSettings.backgroundGradientAngle;
  return Math.min(360, Math.max(0, Math.round(value)));
}

function normalizeGraphImageSrc(value: unknown): string | undefined {
  if (value === "") return "";
  return normalizePublicImageSrc(value);
}

export function normalizeServiceAreaV1PreviewSettings(
  value: Partial<ServiceAreaV1PreviewSettings>,
): ServiceAreaV1PreviewSettings {
  const defaults = defaultServiceAreaV1PreviewSettings;

  return {
    ...defaults,
    ...value,
    layoutWidth: isSiteLayoutWidth(value.layoutWidth) ? value.layoutWidth : defaults.layoutWidth,
    size: isServiceAreaV1Size(value.size) ? value.size : defaults.size,
    outerBackgroundColor: isHexColor(value.outerBackgroundColor)
      ? value.outerBackgroundColor
      : defaults.outerBackgroundColor,
    backgroundMode: isServiceAreaV1BackgroundMode(value.backgroundMode)
      ? value.backgroundMode
      : defaults.backgroundMode,
    backgroundColor: isHexColor(value.backgroundColor)
      ? value.backgroundColor
      : defaults.backgroundColor,
    backgroundGradientFrom: isHexColor(value.backgroundGradientFrom)
      ? value.backgroundGradientFrom
      : defaults.backgroundGradientFrom,
    backgroundGradientTo: isHexColor(value.backgroundGradientTo)
      ? value.backgroundGradientTo
      : defaults.backgroundGradientTo,
    backgroundGradientAngle: clampGradientAngle(
      typeof value.backgroundGradientAngle === "number"
        ? value.backgroundGradientAngle
        : defaults.backgroundGradientAngle,
    ),
    cardBorderRadiusPx: normalizeServiceAreaV1CardBorderRadiusPx(
      typeof value.cardBorderRadiusPx === "number"
        ? value.cardBorderRadiusPx
        : defaults.cardBorderRadiusPx,
    ),
    headingColor: isHexColor(value.headingColor) ? value.headingColor : defaults.headingColor,
    iconColor: isHexColor(value.iconColor) ? value.iconColor : defaults.iconColor,
    locationTextColor: isHexColor(value.locationTextColor)
      ? value.locationTextColor
      : defaults.locationTextColor,
    sectionHeading: normalizeOptionalString(value.sectionHeading),
    graphImageSrc: normalizeGraphImageSrc(value.graphImageSrc),
    locationLabels: normalizeLocationLabels(value.locationLabels),
  };
}

export function loadServiceAreaV1PreviewSettings(): ServiceAreaV1PreviewSettings {
  if (typeof window === "undefined") {
    return defaultServiceAreaV1PreviewSettings;
  }

  if (!shouldUsePlaygroundPreviewSettings()) {
    const committed = getCommittedHomepagePreviewSettings()?.serviceAreaV1;
    if (committed) {
      return normalizeServiceAreaV1PreviewSettings(committed);
    }
  }

  try {
    const stored = localStorage.getItem(serviceAreaV1PreviewStorageKey);
    if (!stored) return defaultServiceAreaV1PreviewSettings;
    return normalizeServiceAreaV1PreviewSettings(JSON.parse(stored) as Partial<ServiceAreaV1PreviewSettings>);
  } catch {
    return defaultServiceAreaV1PreviewSettings;
  }
}

export function saveServiceAreaV1PreviewSettings(settings: ServiceAreaV1PreviewSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    serviceAreaV1PreviewStorageKey,
    JSON.stringify(normalizeServiceAreaV1PreviewSettings(settings)),
  );
}
