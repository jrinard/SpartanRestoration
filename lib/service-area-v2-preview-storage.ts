import {
  defaultServiceAreaV2BackgroundSettings,
  defaultServiceAreaV2PreviewSettings,
  getServiceAreaV2ThemeDefaults,
  type ServiceAreaV2BackgroundMode,
  type ServiceAreaV2PreviewSettings,
  type ServiceAreaV2SectionTheme,
} from "@/lib/service-area-v2-preview";
import type { SiteLayoutWidth } from "@/lib/site-layout";
import type { PreviewGradientDirection } from "@/lib/preview-gradient";
import { previewGradientDirections } from "@/lib/preview-gradient";
import { getCommittedHomepagePreviewSettings, shouldUsePlaygroundPreviewSettings } from "@/lib/homepage-settings";

import { orgStorageGet, orgStorageSet } from "@/lib/org/browser-storage";

export const serviceAreaV2PreviewStorageKey = "lifespring-service-area-v2-preview";

const gradientDirectionValues = new Set<PreviewGradientDirection>(
  previewGradientDirections.map((option) => option.value),
);

function isSiteLayoutWidth(value: unknown): value is SiteLayoutWidth {
  return value === "contained" || value === "full";
}

function isServiceAreaV2SectionTheme(value: unknown): value is ServiceAreaV2SectionTheme {
  return value === "light" || value === "dark";
}

function isServiceAreaV2BackgroundMode(value: unknown): value is ServiceAreaV2BackgroundMode {
  return value === "solid" || value === "gradient";
}

function isGradientDirection(value: unknown): value is PreviewGradientDirection {
  return typeof value === "string" && gradientDirectionValues.has(value as PreviewGradientDirection);
}

function normalizeCardBorderRadiusPx(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(48, Math.max(0, Math.round(value)));
}

export function normalizeServiceAreaV2PreviewSettings(
  value: Partial<ServiceAreaV2PreviewSettings>,
): ServiceAreaV2PreviewSettings {
  const defaults = defaultServiceAreaV2PreviewSettings;
  const theme = isServiceAreaV2SectionTheme(value.theme) ? value.theme : defaults.theme;
  const themeDefaults = getServiceAreaV2ThemeDefaults(theme);
  const background = value.background ?? defaults.background;

  return {
    theme,
    eyebrow: typeof value.eyebrow === "string" ? value.eyebrow : defaults.eyebrow,
    heading: typeof value.heading === "string" ? value.heading : defaults.heading,
    intro: typeof value.intro === "string" ? value.intro : defaults.intro,
    accentColor: typeof value.accentColor === "string" ? value.accentColor : defaults.accentColor,
    layoutWidth: isSiteLayoutWidth(value.layoutWidth) ? value.layoutWidth : defaults.layoutWidth,
    solidBackground:
      typeof value.solidBackground === "string"
        ? value.solidBackground
        : themeDefaults.solidBackground,
    backgroundMode: isServiceAreaV2BackgroundMode(value.backgroundMode)
      ? value.backgroundMode
      : defaults.backgroundMode,
    background: {
      from: typeof background.from === "string" ? background.from : defaultServiceAreaV2BackgroundSettings.from,
      to: typeof background.to === "string" ? background.to : defaultServiceAreaV2BackgroundSettings.to,
      direction: isGradientDirection(background.direction)
        ? background.direction
        : defaultServiceAreaV2BackgroundSettings.direction,
      intensity:
        typeof background.intensity === "number"
          ? Math.min(100, Math.max(0, background.intensity))
          : defaultServiceAreaV2BackgroundSettings.intensity,
    },
    cardBackgroundColor:
      typeof value.cardBackgroundColor === "string"
        ? value.cardBackgroundColor
        : themeDefaults.cardBackgroundColor,
    cardHoverBackgroundColor:
      typeof value.cardHoverBackgroundColor === "string"
        ? value.cardHoverBackgroundColor
        : themeDefaults.cardHoverBackgroundColor,
    cardTextColor:
      typeof value.cardTextColor === "string" ? value.cardTextColor : themeDefaults.cardTextColor,
    cardMutedColor:
      typeof value.cardMutedColor === "string" ? value.cardMutedColor : themeDefaults.cardMutedColor,
    linkColor: typeof value.linkColor === "string" ? value.linkColor : themeDefaults.linkColor,
    cardBorderRadiusPx: normalizeCardBorderRadiusPx(
      value.cardBorderRadiusPx,
      defaults.cardBorderRadiusPx,
    ),
  };
}

export function loadServiceAreaV2PreviewSettings(): ServiceAreaV2PreviewSettings {
  if (typeof window === "undefined") {
    return defaultServiceAreaV2PreviewSettings;
  }

  if (!shouldUsePlaygroundPreviewSettings()) {
    const committed = getCommittedHomepagePreviewSettings()?.serviceAreaV2;
    if (committed) {
      return normalizeServiceAreaV2PreviewSettings(committed);
    }
  }

  try {
    const stored = orgStorageGet(serviceAreaV2PreviewStorageKey);
    if (!stored) return defaultServiceAreaV2PreviewSettings;
    return normalizeServiceAreaV2PreviewSettings(
      JSON.parse(stored) as Partial<ServiceAreaV2PreviewSettings>,
    );
  } catch {
    return defaultServiceAreaV2PreviewSettings;
  }
}

export function saveServiceAreaV2PreviewSettings(settings: ServiceAreaV2PreviewSettings): void {
  if (typeof window === "undefined") return;
  orgStorageSet(
    serviceAreaV2PreviewStorageKey,
    JSON.stringify(normalizeServiceAreaV2PreviewSettings(settings)),
  );
}
