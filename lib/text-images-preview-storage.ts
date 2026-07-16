import { getCommittedHomepagePreviewSettings, shouldUsePlaygroundPreviewSettings } from "@/lib/homepage-settings";
import {
  isButtonPreviewSize,
  normalizeButtonBorderRadiusPx,
  type ButtonPreviewSize,
} from "@/lib/button-preview";
import { normalizeImageLibrarySrc } from "@/lib/image-library";
import {
  getTextImageColorsForTheme,
  normalizeTextImageHeadlineLines,
  textImageEntranceSpeedValues,
  textImagePhoneButtonMarginOptions,
  type TextImageSectionTheme,
} from "@/lib/text-image-preview";
import {
  defaultTextImagesPreviewSettings,
  isTextImagesCopyVerticalAlign,
  normalizeTextImagesAnchorId,
  snapTextImagesCopyPaddingTopPx,
  type TextImagesPreviewSettings,
} from "@/lib/text-images-preview";
import { headerV1TextImagesRowAnchorIds } from "@/lib/header-v1-nav";

export const textImagesPreviewStorageKey = "lifespring-text-images-preview";

function isTextImageSectionTheme(value: unknown): value is TextImageSectionTheme {
  return value === "light" || value === "dark";
}

function isTextImagesButtonPreviewSize(value: unknown): value is ButtonPreviewSize {
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

function normalizeContentOverrideString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") return undefined;
  return value.trim();
}

function normalizePhoneHref(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (!trimmed.startsWith("tel:")) return undefined;
  return trimmed;
}

export function normalizeTextImagesPreviewSettings(
  value: Partial<TextImagesPreviewSettings>,
): TextImagesPreviewSettings {
  const theme = isTextImageSectionTheme(value.theme)
    ? value.theme
    : defaultTextImagesPreviewSettings.theme;
  const themeDefaults = getTextImageColorsForTheme(theme);

  return {
    ...defaultTextImagesPreviewSettings,
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
    navButtonSize: isTextImagesButtonPreviewSize(value.navButtonSize)
      ? value.navButtonSize
      : defaultTextImagesPreviewSettings.navButtonSize,
    navButtonRadiusPx:
      typeof value.navButtonRadiusPx === "number"
        ? normalizeButtonBorderRadiusPx(Math.round(value.navButtonRadiusPx))
        : defaultTextImagesPreviewSettings.navButtonRadiusPx,
    entranceAnimationEnabled:
      typeof value.entranceAnimationEnabled === "boolean"
        ? value.entranceAnimationEnabled
        : defaultTextImagesPreviewSettings.entranceAnimationEnabled,
    entranceAnimationSpeedMs:
      typeof value.entranceAnimationSpeedMs === "number" &&
      textImageEntranceSpeedValues.includes(
        Math.round(value.entranceAnimationSpeedMs) as (typeof textImageEntranceSpeedValues)[number],
      )
        ? Math.round(value.entranceAnimationSpeedMs)
        : defaultTextImagesPreviewSettings.entranceAnimationSpeedMs,
    phoneButtonMarginTopPx:
      typeof value.phoneButtonMarginTopPx === "number" &&
      textImagePhoneButtonMarginOptions.includes(
        Math.round(value.phoneButtonMarginTopPx) as (typeof textImagePhoneButtonMarginOptions)[number],
      )
        ? Math.round(value.phoneButtonMarginTopPx)
        : defaultTextImagesPreviewSettings.phoneButtonMarginTopPx,
    phoneButtonVisible:
      typeof value.phoneButtonVisible === "boolean"
        ? value.phoneButtonVisible
        : defaultTextImagesPreviewSettings.phoneButtonVisible,
    row1CopyPaddingTopPx:
      typeof value.row1CopyPaddingTopPx === "number"
        ? snapTextImagesCopyPaddingTopPx(Math.round(value.row1CopyPaddingTopPx))
        : defaultTextImagesPreviewSettings.row1CopyPaddingTopPx,
    row2CopyPaddingTopPx:
      typeof value.row2CopyPaddingTopPx === "number"
        ? snapTextImagesCopyPaddingTopPx(Math.round(value.row2CopyPaddingTopPx))
        : defaultTextImagesPreviewSettings.row2CopyPaddingTopPx,
    row3CopyPaddingTopPx:
      typeof value.row3CopyPaddingTopPx === "number"
        ? snapTextImagesCopyPaddingTopPx(Math.round(value.row3CopyPaddingTopPx))
        : defaultTextImagesPreviewSettings.row3CopyPaddingTopPx,
    sectionPaddingTopPx:
      typeof value.sectionPaddingTopPx === "number"
        ? snapTextImagesCopyPaddingTopPx(Math.round(value.sectionPaddingTopPx))
        : defaultTextImagesPreviewSettings.sectionPaddingTopPx,
    sectionPaddingBottomPx:
      typeof value.sectionPaddingBottomPx === "number"
        ? snapTextImagesCopyPaddingTopPx(Math.round(value.sectionPaddingBottomPx))
        : defaultTextImagesPreviewSettings.sectionPaddingBottomPx,
    row1CopyVerticalAlign: isTextImagesCopyVerticalAlign(value.row1CopyVerticalAlign)
      ? value.row1CopyVerticalAlign
      : defaultTextImagesPreviewSettings.row1CopyVerticalAlign,
    row2CopyVerticalAlign: isTextImagesCopyVerticalAlign(value.row2CopyVerticalAlign)
      ? value.row2CopyVerticalAlign
      : defaultTextImagesPreviewSettings.row2CopyVerticalAlign,
    row3CopyVerticalAlign: isTextImagesCopyVerticalAlign(value.row3CopyVerticalAlign)
      ? value.row3CopyVerticalAlign
      : defaultTextImagesPreviewSettings.row3CopyVerticalAlign,
    contentRow1Eyebrow: normalizeContentOverrideString(value.contentRow1Eyebrow),
    contentRow1HeadlineLines: normalizeTextImageHeadlineLines(value.contentRow1HeadlineLines),
    contentRow1Body: normalizeContentOverrideString(value.contentRow1Body),
    contentRow1ImageSrc: normalizeImageLibrarySrc(value.contentRow1ImageSrc),
    contentRow1ImageAlt: normalizeContentOverrideString(value.contentRow1ImageAlt),
    contentRow2Title: normalizeContentOverrideString(value.contentRow2Title),
    contentRow2Body: normalizeContentOverrideString(value.contentRow2Body),
    contentRow2ImageSrc: normalizeImageLibrarySrc(value.contentRow2ImageSrc),
    contentRow2ImageAlt: normalizeContentOverrideString(value.contentRow2ImageAlt),
    contentRow3Title: normalizeContentOverrideString(value.contentRow3Title),
    contentRow3Body: normalizeContentOverrideString(value.contentRow3Body),
    contentRow3PhoneLabel: normalizeContentOverrideString(
      value.contentRow3PhoneLabel ?? value.contentRow1PhoneLabel,
    ),
    contentRow3PhoneHref: normalizePhoneHref(value.contentRow3PhoneHref ?? value.contentRow1PhoneHref),
    contentRow3ImageSrc: normalizeImageLibrarySrc(value.contentRow3ImageSrc),
    contentRow3ImageAlt: normalizeContentOverrideString(value.contentRow3ImageAlt),
    row1AnchorId: normalizeTextImagesAnchorId(
      value.row1AnchorId,
      headerV1TextImagesRowAnchorIds[0],
    ),
    row2AnchorId: normalizeTextImagesAnchorId(
      value.row2AnchorId,
      headerV1TextImagesRowAnchorIds[1],
    ),
    row3AnchorId: normalizeTextImagesAnchorId(
      value.row3AnchorId,
      headerV1TextImagesRowAnchorIds[2],
    ),
  };
}

function isTextImagesPreviewSettings(value: unknown): value is Partial<TextImagesPreviewSettings> {
  if (!value || typeof value !== "object") return false;

  const settings = value as Partial<TextImagesPreviewSettings>;
  return typeof settings.navBackground === "string";
}

export function loadTextImagesPreviewSettings(): TextImagesPreviewSettings {
  if (!shouldUsePlaygroundPreviewSettings()) {
    const committed = getCommittedHomepagePreviewSettings()?.textImages;
    if (committed) return normalizeTextImagesPreviewSettings(committed);
  }

  if (typeof window === "undefined") {
    return defaultTextImagesPreviewSettings;
  }

  try {
    const stored = localStorage.getItem(textImagesPreviewStorageKey);
    if (!stored) return defaultTextImagesPreviewSettings;

    const parsed: unknown = JSON.parse(stored);
    if (isTextImagesPreviewSettings(parsed)) {
      return normalizeTextImagesPreviewSettings(parsed);
    }
  } catch {
    // ignore invalid storage
  }

  return defaultTextImagesPreviewSettings;
}

export function saveTextImagesPreviewSettings(settings: TextImagesPreviewSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(textImagesPreviewStorageKey, JSON.stringify(settings));
}
