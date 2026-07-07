import { getCommittedHomepagePreviewSettings, shouldUsePlaygroundPreviewSettings } from "@/lib/homepage-settings";
import {
  isButtonPreviewSize,
  normalizeButtonBorderRadiusPx,
  type ButtonPreviewSize,
} from "@/lib/button-preview";
import {
  defaultTextImagePreviewSettings,
  getTextImageColorsForTheme,
  normalizeTextImageHeadlineLines,
  textImageEntranceSpeedValues,
  textImagePhoneButtonMarginOptions,
  type TextImagePreviewSettings,
  type TextImageSectionTheme,
} from "@/lib/text-image-preview";
import { normalizeImageLibrarySrc } from "@/lib/image-library";

export const textImagePreviewStorageKey = "lifespring-text-image-preview";

function isTextImageSectionTheme(value: unknown): value is TextImageSectionTheme {
  return value === "light" || value === "dark";
}

function isTextImageButtonPreviewSize(value: unknown): value is ButtonPreviewSize {
  return isButtonPreviewSize(value);
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function isRgbaColor(value: unknown): value is string {
  return typeof value === "string" && /^rgba?\(.+\)$/i.test(value);
}

function isColor(value: unknown): value is string {
  return isHexColor(value) || isRgbaColor(value);
}

export function normalizeTextImagePreviewSettings(
  value: Partial<TextImagePreviewSettings>,
): TextImagePreviewSettings {
  const theme = isTextImageSectionTheme(value.theme)
    ? value.theme
    : defaultTextImagePreviewSettings.theme;
  const themeDefaults = getTextImageColorsForTheme(theme);

  return {
    ...defaultTextImagePreviewSettings,
    ...themeDefaults,
    ...value,
    theme,
    backgroundColor: isColor(value.backgroundColor)
      ? value.backgroundColor
      : themeDefaults.backgroundColor,
    eyebrowColor: isColor(value.eyebrowColor) ? value.eyebrowColor : themeDefaults.eyebrowColor,
    headlineColor: isColor(value.headlineColor)
      ? value.headlineColor
      : themeDefaults.headlineColor,
    bodyColor: isColor(value.bodyColor) ? value.bodyColor : themeDefaults.bodyColor,
    sidebarTextColor: isColor(value.sidebarTextColor)
      ? value.sidebarTextColor
      : themeDefaults.sidebarTextColor,
    navButtonSize: isTextImageButtonPreviewSize(value.navButtonSize)
      ? value.navButtonSize
      : defaultTextImagePreviewSettings.navButtonSize,
    navButtonRadiusPx:
      typeof value.navButtonRadiusPx === "number"
        ? normalizeButtonBorderRadiusPx(Math.round(value.navButtonRadiusPx))
        : defaultTextImagePreviewSettings.navButtonRadiusPx,
    entranceAnimationEnabled:
      typeof value.entranceAnimationEnabled === "boolean"
        ? value.entranceAnimationEnabled
        : defaultTextImagePreviewSettings.entranceAnimationEnabled,
    entranceAnimationSpeedMs:
      typeof value.entranceAnimationSpeedMs === "number" &&
      textImageEntranceSpeedValues.includes(
        Math.round(value.entranceAnimationSpeedMs) as (typeof textImageEntranceSpeedValues)[number],
      )
        ? Math.round(value.entranceAnimationSpeedMs)
        : defaultTextImagePreviewSettings.entranceAnimationSpeedMs,
    layoutInverted:
      typeof value.layoutInverted === "boolean"
        ? value.layoutInverted
        : defaultTextImagePreviewSettings.layoutInverted,
    phoneButtonMarginTopPx:
      typeof value.phoneButtonMarginTopPx === "number" &&
      textImagePhoneButtonMarginOptions.includes(
        Math.round(value.phoneButtonMarginTopPx) as (typeof textImagePhoneButtonMarginOptions)[number],
      )
        ? Math.round(value.phoneButtonMarginTopPx)
        : defaultTextImagePreviewSettings.phoneButtonMarginTopPx,
    phoneButtonVisible:
      typeof value.phoneButtonVisible === "boolean"
        ? value.phoneButtonVisible
        : defaultTextImagePreviewSettings.phoneButtonVisible,
    contentEyebrow: normalizeContentOverrideString(value.contentEyebrow),
    contentHeadlineLines: normalizeTextImageHeadlineLines(value.contentHeadlineLines),
    contentBody: normalizeContentOverrideString(value.contentBody),
    contentSidebarText: normalizeContentOverrideString(value.contentSidebarText),
    contentPhoneLabel: normalizeContentOverrideString(value.contentPhoneLabel),
    contentPhoneHref: normalizePhoneHref(value.contentPhoneHref),
    contentImageSrc: normalizeImageLibrarySrc(value.contentImageSrc),
    contentImageAlt: normalizeContentOverrideString(value.contentImageAlt),
  };
}

function normalizeContentOverrideString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") return undefined;
  return value.trim();
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function normalizePhoneHref(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (!trimmed.startsWith("tel:")) return undefined;
  return trimmed;
}

function isTextImagePreviewSettings(value: unknown): value is Partial<TextImagePreviewSettings> {
  if (!value || typeof value !== "object") return false;

  const settings = value as Partial<TextImagePreviewSettings>;
  return typeof settings.navBackground === "string";
}

export function loadTextImagePreviewSettings(): TextImagePreviewSettings {
  if (!shouldUsePlaygroundPreviewSettings()) {
    const committed = getCommittedHomepagePreviewSettings()?.textImage;
    if (committed) return normalizeTextImagePreviewSettings(committed);
  }

  if (typeof window === "undefined") {
    return defaultTextImagePreviewSettings;
  }

  try {
    const stored = localStorage.getItem(textImagePreviewStorageKey);
    if (!stored) return defaultTextImagePreviewSettings;

    const parsed: unknown = JSON.parse(stored);
    if (isTextImagePreviewSettings(parsed)) {
      return normalizeTextImagePreviewSettings(parsed);
    }
  } catch {
    // ignore invalid storage
  }

  return defaultTextImagePreviewSettings;
}

export function saveTextImagePreviewSettings(settings: TextImagePreviewSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(textImagePreviewStorageKey, JSON.stringify(settings));
}
