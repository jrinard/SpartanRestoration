import {
  defaultHeaderV3PreviewSettings,
  type HeaderV3LayoutWidth,
  type HeaderV3LogoVariant,
  type HeaderV3NavButtonSize,
  type HeaderV3PreviewSettings,
} from "@/lib/header-v3-gradient";

export const headerV3NavGradientStorageKey = "lifespring-header-v3-nav-gradient";

function isHeaderV3NavButtonSize(value: unknown): value is HeaderV3NavButtonSize {
  return value === "small" || value === "medium" || value === "large";
}

function isHeaderV3LogoVariant(value: unknown): value is HeaderV3LogoVariant {
  return value === "white" || value === "black" || value === "color";
}

function isHeaderV3LayoutWidth(value: unknown): value is HeaderV3LayoutWidth {
  return value === "contained" || value === "full";
}

function normalizeHeaderV3PreviewSettings(
  value: Partial<HeaderV3PreviewSettings>,
): HeaderV3PreviewSettings {
  return {
    ...defaultHeaderV3PreviewSettings,
    ...value,
    navButtonSize: isHeaderV3NavButtonSize(value.navButtonSize)
      ? value.navButtonSize
      : defaultHeaderV3PreviewSettings.navButtonSize,
    logoVariant: isHeaderV3LogoVariant(value.logoVariant)
      ? value.logoVariant
      : defaultHeaderV3PreviewSettings.logoVariant,
    layoutWidth: isHeaderV3LayoutWidth(value.layoutWidth)
      ? value.layoutWidth
      : defaultHeaderV3PreviewSettings.layoutWidth,
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
