import { getCommittedHomepagePreviewSettings, shouldUsePlaygroundPreviewSettings } from "@/lib/homepage-settings";
import {
  isButtonPreviewSize,
  normalizeButtonBorderRadiusPx,
  type ButtonPreviewSize,
} from "@/lib/button-preview";
import {
  ctaV1CardBackgroundModes,
  ctaV1LayoutWidths,
  defaultCtaV1PreviewSettings,
  normalizeCtaV1CardBorderRadiusPx,
  type CtaV1CardBackgroundMode,
  type CtaV1LayoutWidth,
  type CtaV1PreviewSettings,
} from "@/lib/cta-v1-preview";

export const ctaV1PreviewStorageKey = "lifespring-cta-v1-preview";

function isCtaV1LayoutWidth(value: unknown): value is CtaV1LayoutWidth {
  return ctaV1LayoutWidths.some((option) => option.value === value);
}

function isCtaV1CardBackgroundMode(value: unknown): value is CtaV1CardBackgroundMode {
  return ctaV1CardBackgroundModes.some((option) => option.value === value);
}

function normalizeGradientAngle(value: unknown, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  const rounded = Math.round(value);
  return ((rounded % 360) + 360) % 360;
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function isRgbaColor(value: unknown): value is string {
  return typeof value === "string" && /^rgba?\(.+\)$/i.test(value);
}

function isColor(value: unknown): value is string {
  return isHexColor(value) || isRgbaColor(value) || value === "transparent";
}

function normalizeContentOverrideString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") return undefined;
  return value;
}

function normalizeContentHeadlineLines(value: unknown): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) return undefined;
  return value.filter((line): line is string => typeof line === "string");
}

function normalizePhoneHref(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (!trimmed.startsWith("tel:")) return undefined;
  return trimmed;
}

export function normalizeCtaV1PreviewSettings(
  value: Partial<CtaV1PreviewSettings>,
): CtaV1PreviewSettings {
  return {
    ...defaultCtaV1PreviewSettings,
    ...value,
    layoutWidth: isCtaV1LayoutWidth(value.layoutWidth)
      ? value.layoutWidth
      : defaultCtaV1PreviewSettings.layoutWidth,
    outerBackgroundColor: isColor(value.outerBackgroundColor)
      ? value.outerBackgroundColor
      : defaultCtaV1PreviewSettings.outerBackgroundColor,
    cardBackgroundMode: isCtaV1CardBackgroundMode(value.cardBackgroundMode)
      ? value.cardBackgroundMode
      : defaultCtaV1PreviewSettings.cardBackgroundMode,
    cardBackgroundColor: isColor(value.cardBackgroundColor)
      ? value.cardBackgroundColor
      : defaultCtaV1PreviewSettings.cardBackgroundColor,
    cardGradientFrom: isColor(value.cardGradientFrom)
      ? value.cardGradientFrom
      : defaultCtaV1PreviewSettings.cardGradientFrom,
    cardGradientTo: isColor(value.cardGradientTo)
      ? value.cardGradientTo
      : defaultCtaV1PreviewSettings.cardGradientTo,
    cardGradientAngle: normalizeGradientAngle(
      value.cardGradientAngle,
      defaultCtaV1PreviewSettings.cardGradientAngle,
    ),
    cardBorderRadiusPx:
      typeof value.cardBorderRadiusPx === "number"
        ? normalizeCtaV1CardBorderRadiusPx(Math.round(value.cardBorderRadiusPx))
        : defaultCtaV1PreviewSettings.cardBorderRadiusPx,
    headlineColor: isColor(value.headlineColor)
      ? value.headlineColor
      : defaultCtaV1PreviewSettings.headlineColor,
    buttonVisible:
      typeof value.buttonVisible === "boolean"
        ? value.buttonVisible
        : defaultCtaV1PreviewSettings.buttonVisible,
    navButtonSize: isButtonPreviewSize(value.navButtonSize)
      ? value.navButtonSize
      : defaultCtaV1PreviewSettings.navButtonSize,
    navBackground: isColor(value.navBackground)
      ? value.navBackground
      : defaultCtaV1PreviewSettings.navBackground,
    navTextColor: isColor(value.navTextColor)
      ? value.navTextColor
      : defaultCtaV1PreviewSettings.navTextColor,
    navTextHoverColor: isColor(value.navTextHoverColor)
      ? value.navTextHoverColor
      : defaultCtaV1PreviewSettings.navTextHoverColor,
    navHoverBackground: isColor(value.navHoverBackground)
      ? value.navHoverBackground
      : defaultCtaV1PreviewSettings.navHoverBackground,
    navButtonRadiusPx:
      typeof value.navButtonRadiusPx === "number"
        ? normalizeButtonBorderRadiusPx(Math.round(value.navButtonRadiusPx))
        : defaultCtaV1PreviewSettings.navButtonRadiusPx,
    contentHeadline: normalizeContentOverrideString(value.contentHeadline),
    contentHeadlineLines: normalizeContentHeadlineLines(value.contentHeadlineLines),
    contentPhoneLabel: normalizeContentOverrideString(value.contentPhoneLabel),
    contentPhoneHref: normalizePhoneHref(value.contentPhoneHref),
  };
}

function isCtaV1PreviewSettings(value: unknown): value is Partial<CtaV1PreviewSettings> {
  if (!value || typeof value !== "object") return false;
  const settings = value as Partial<CtaV1PreviewSettings>;
  return typeof settings.navBackground === "string";
}

export function loadCtaV1PreviewSettings(): CtaV1PreviewSettings {
  if (!shouldUsePlaygroundPreviewSettings()) {
    const committed = getCommittedHomepagePreviewSettings()?.ctaV1;
    if (committed) return normalizeCtaV1PreviewSettings(committed);
  }

  if (typeof window === "undefined") {
    return defaultCtaV1PreviewSettings;
  }

  try {
    const stored = localStorage.getItem(ctaV1PreviewStorageKey);
    if (!stored) return defaultCtaV1PreviewSettings;

    const parsed: unknown = JSON.parse(stored);
    if (isCtaV1PreviewSettings(parsed)) {
      return normalizeCtaV1PreviewSettings(parsed);
    }
  } catch {
    // ignore invalid storage
  }

  return defaultCtaV1PreviewSettings;
}

export function saveCtaV1PreviewSettings(settings: CtaV1PreviewSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ctaV1PreviewStorageKey, JSON.stringify(settings));
}
