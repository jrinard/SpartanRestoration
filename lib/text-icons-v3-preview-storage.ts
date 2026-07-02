import { getCommittedHomepagePreviewSettings } from "@/lib/homepage-settings";
import {
  defaultTextIconsV3PreviewSettings,
  type TextIconsV3PreviewSettings,
} from "@/lib/text-icons-v3-preview";
import type { PreviewGradientDirection } from "@/lib/preview-gradient";
import type { SiteLayoutWidth } from "@/lib/site-layout";

export const textIconsV3PreviewStorageKey = "lifespring-text-icons-v3-preview";

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

export function normalizeTextIconsV3PreviewSettings(
  value: Partial<TextIconsV3PreviewSettings>,
): TextIconsV3PreviewSettings {
  return {
    ...defaultTextIconsV3PreviewSettings,
    ...value,
    backgroundDirection: isPreviewGradientDirection(value.backgroundDirection)
      ? value.backgroundDirection
      : defaultTextIconsV3PreviewSettings.backgroundDirection,
    layoutWidth: isSiteLayoutWidth(value.layoutWidth)
      ? value.layoutWidth
      : defaultTextIconsV3PreviewSettings.layoutWidth,
    outerBackgroundColor: isHexColor(value.outerBackgroundColor)
      ? value.outerBackgroundColor
      : defaultTextIconsV3PreviewSettings.outerBackgroundColor,
    headingColor: isHexColor(value.headingColor)
      ? value.headingColor
      : defaultTextIconsV3PreviewSettings.headingColor,
    subheadingColor: isHexColor(value.subheadingColor)
      ? value.subheadingColor
      : defaultTextIconsV3PreviewSettings.subheadingColor,
  };
}

function isTextIconsV3PreviewSettings(
  value: unknown,
): value is Partial<TextIconsV3PreviewSettings> {
  if (!value || typeof value !== "object") return false;

  const settings = value as Partial<TextIconsV3PreviewSettings>;
  return (
    typeof settings.backgroundFrom === "string" &&
    typeof settings.backgroundTo === "string"
  );
}

export function loadTextIconsV3PreviewSettings(): TextIconsV3PreviewSettings {
  const committed = getCommittedHomepagePreviewSettings()?.textIconsV3;
  if (committed) return normalizeTextIconsV3PreviewSettings(committed);

  if (typeof window === "undefined") {
    return defaultTextIconsV3PreviewSettings;
  }

  try {
    const stored = localStorage.getItem(textIconsV3PreviewStorageKey);
    if (!stored) return defaultTextIconsV3PreviewSettings;

    const parsed: unknown = JSON.parse(stored);
    if (isTextIconsV3PreviewSettings(parsed)) {
      return normalizeTextIconsV3PreviewSettings(parsed);
    }
  } catch {
    // ignore invalid storage
  }

  return defaultTextIconsV3PreviewSettings;
}

export function saveTextIconsV3PreviewSettings(settings: TextIconsV3PreviewSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(textIconsV3PreviewStorageKey, JSON.stringify(settings));
}
