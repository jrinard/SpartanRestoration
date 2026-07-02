import {
  formatButtonBackgroundColor,
  isButtonPreviewSize,
  normalizeButtonBorderRadiusPx,
  parseButtonBackgroundColor,
} from "@/lib/button-preview";
import {
  defaultHeaderV3PreviewSettings,
  headerHeightOptions,
  headerV1NavTextSizeOptions,
  snapHeaderV1NavTextSizeEm,
  type HeaderLogoVerticalAlign,
  type HeaderV3LayoutWidth,
  type HeaderV3LogoVariant,
  type HeaderV3NavButtonSize,
  type HeaderV3PreviewSettings,
} from "@/lib/header-v3-gradient";

export const headerV3NavGradientStorageKey = "lifespring-header-v3-nav-gradient";

function isHeaderV3NavButtonSize(value: unknown): value is HeaderV3NavButtonSize {
  return isButtonPreviewSize(value);
}

function isHeaderV3LogoVariant(value: unknown): value is HeaderV3LogoVariant {
  return value === "white" || value === "black" || value === "color";
}

function isHeaderV3LayoutWidth(value: unknown): value is HeaderV3LayoutWidth {
  return value === "contained" || value === "full";
}

import type { PreviewGradientDirection, PreviewGradientMode } from "@/lib/preview-gradient";

function isPreviewGradientMode(value: unknown): value is PreviewGradientMode {
  return value === "linear" || value === "center-fade";
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

function isHeaderV3LogoVerticalAlign(value: unknown): value is HeaderLogoVerticalAlign {
  return value === "top" || value === "center" || value === "bottom";
}

function normalizeHeaderV1NavTextSizeEm(
  value: Partial<HeaderV3PreviewSettings> & { headerV1NavTextSizePx?: number },
): number {
  if (typeof value.headerV1NavTextSizeEm === "number") {
    return snapHeaderV1NavTextSizeEm(value.headerV1NavTextSizeEm);
  }

  if (typeof value.headerV1NavTextSizePx === "number") {
    const legacyMap: Record<number, (typeof headerV1NavTextSizeOptions)[number]> = {
      9: 0.65,
      10: 0.75,
      11: 0.85,
      12: 1,
      13: 1,
      14: 1.2,
      16: 1.2,
      18: 1.5,
    };
    const legacyPx = Math.round(value.headerV1NavTextSizePx);
    return legacyMap[legacyPx] ?? defaultHeaderV3PreviewSettings.headerV1NavTextSizeEm;
  }

  return defaultHeaderV3PreviewSettings.headerV1NavTextSizeEm;
}

export function normalizeHeaderV3PreviewSettings(
  value: Partial<HeaderV3PreviewSettings>,
): HeaderV3PreviewSettings {
  return {
    ...defaultHeaderV3PreviewSettings,
    ...value,
    backgroundMode: isPreviewGradientMode(value.backgroundMode)
      ? value.backgroundMode
      : defaultHeaderV3PreviewSettings.backgroundMode,
    backgroundDirection: isPreviewGradientDirection(value.backgroundDirection)
      ? value.backgroundDirection
      : defaultHeaderV3PreviewSettings.backgroundDirection,
    navButtonSize: isHeaderV3NavButtonSize(value.navButtonSize)
      ? value.navButtonSize
      : defaultHeaderV3PreviewSettings.navButtonSize,
    logoVariant: isHeaderV3LogoVariant(value.logoVariant)
      ? value.logoVariant
      : defaultHeaderV3PreviewSettings.logoVariant,
    layoutWidth: isHeaderV3LayoutWidth(value.layoutWidth)
      ? value.layoutWidth
      : defaultHeaderV3PreviewSettings.layoutWidth,
    headerHeightPx:
      typeof value.headerHeightPx === "number" &&
      headerHeightOptions.includes(
        Math.round(value.headerHeightPx) as (typeof headerHeightOptions)[number],
      )
        ? Math.round(value.headerHeightPx)
        : typeof value.headerHeightPx === "number" && value.headerHeightPx >= 48
          ? Math.min(240, Math.max(48, Math.round(value.headerHeightPx)))
          : defaultHeaderV3PreviewSettings.headerHeightPx,
    logoHeightPx:
      typeof value.logoHeightPx === "number" && value.logoHeightPx >= 0
        ? Math.round(value.logoHeightPx)
        : defaultHeaderV3PreviewSettings.logoHeightPx,
    logoSizePx:
      typeof value.logoSizePx === "number" && value.logoSizePx >= 0
        ? Math.round(value.logoSizePx)
        : defaultHeaderV3PreviewSettings.logoSizePx,
    logoBackgroundColor:
      typeof value.logoBackgroundColor === "string"
        ? formatButtonBackgroundColor(parseButtonBackgroundColor(value.logoBackgroundColor))
        : defaultHeaderV3PreviewSettings.logoBackgroundColor,
    logoMarginTopPx:
      typeof value.logoMarginTopPx === "number" && value.logoMarginTopPx >= 0
        ? Math.round(value.logoMarginTopPx)
        : defaultHeaderV3PreviewSettings.logoMarginTopPx,
    logoVerticalAlign: isHeaderV3LogoVerticalAlign(value.logoVerticalAlign)
      ? value.logoVerticalAlign
      : defaultHeaderV3PreviewSettings.logoVerticalAlign,
    navButtonRadiusPx:
      typeof value.navButtonRadiusPx === "number"
        ? normalizeButtonBorderRadiusPx(Math.round(value.navButtonRadiusPx))
        : defaultHeaderV3PreviewSettings.navButtonRadiusPx,
    headerV1NavTextSizeEm: normalizeHeaderV1NavTextSizeEm(value),
  };
}

function isHeaderV3PreviewSettings(value: unknown): value is Partial<HeaderV3PreviewSettings> {
  if (!value || typeof value !== "object") return false;

  const settings = value as Partial<HeaderV3PreviewSettings>;
  return (
    typeof settings.from === "string" &&
    typeof settings.to === "string" &&
    typeof settings.navBackground === "string" &&
    typeof settings.navTextColor === "string" &&
    typeof settings.navTextHoverColor === "string" &&
    typeof settings.navHoverBackground === "string"
  );
}

function isLegacyHeaderV3Gradient(value: unknown): value is { from: string; to: string } {
  if (!value || typeof value !== "object") return false;

  const gradient = value as { from: string; to: string };
  return typeof gradient.from === "string" && typeof gradient.to === "string";
}

function mergeLegacySettings(value: { from: string; to: string }): HeaderV3PreviewSettings {
  return normalizeHeaderV3PreviewSettings({
    from: value.from,
    to: value.to,
  });
}

import { getCommittedHomepagePreviewSettings } from "@/lib/homepage-settings";

export function loadHeaderV3PreviewSettings(): HeaderV3PreviewSettings {
  const committed = getCommittedHomepagePreviewSettings()?.headerV3;
  if (committed) return committed;

  if (typeof window === "undefined") {
    return defaultHeaderV3PreviewSettings;
  }

  try {
    const stored = localStorage.getItem(headerV3NavGradientStorageKey);
    if (!stored) return defaultHeaderV3PreviewSettings;

    const parsed: unknown = JSON.parse(stored);
    if (isHeaderV3PreviewSettings(parsed)) return normalizeHeaderV3PreviewSettings(parsed);
    if (isLegacyHeaderV3Gradient(parsed)) return mergeLegacySettings(parsed);
  } catch {
    // ignore invalid storage
  }

  return defaultHeaderV3PreviewSettings;
}

export function saveHeaderV3PreviewSettings(settings: HeaderV3PreviewSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(headerV3NavGradientStorageKey, JSON.stringify(settings));
}

/** @deprecated Use loadHeaderV3PreviewSettings */
export function loadHeaderV3NavGradient(): HeaderV3PreviewSettings {
  return loadHeaderV3PreviewSettings();
}

/** @deprecated Use saveHeaderV3PreviewSettings */
export function saveHeaderV3NavGradient(settings: HeaderV3PreviewSettings): void {
  saveHeaderV3PreviewSettings(settings);
}
