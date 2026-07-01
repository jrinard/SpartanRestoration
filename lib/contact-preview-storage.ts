import {
  defaultContactPreviewSettings,
  type ContactBackgroundMode,
  type ContactPreviewSettings,
} from "@/lib/contact-preview";

export const contactPreviewStorageKey = "lifespring-contact-preview-v1";

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function isBackgroundMode(value: unknown): value is ContactBackgroundMode {
  return value === "solid" || value === "gradient";
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function normalizeContactPreviewSettings(
  value: Partial<ContactPreviewSettings>,
): ContactPreviewSettings {
  return {
    backgroundMode: isBackgroundMode(value.backgroundMode)
      ? value.backgroundMode
      : defaultContactPreviewSettings.backgroundMode,
    solidColor: isHexColor(value.solidColor)
      ? value.solidColor
      : defaultContactPreviewSettings.solidColor,
    gradientFrom: isHexColor(value.gradientFrom)
      ? value.gradientFrom
      : defaultContactPreviewSettings.gradientFrom,
    gradientTo: isHexColor(value.gradientTo)
      ? value.gradientTo
      : defaultContactPreviewSettings.gradientTo,
    gradientAngle: clampNumber(
      value.gradientAngle,
      0,
      360,
      defaultContactPreviewSettings.gradientAngle,
    ),
    borderRadius: clampNumber(
      value.borderRadius,
      8,
      48,
      defaultContactPreviewSettings.borderRadius,
    ),
    titleColor: isHexColor(value.titleColor)
      ? value.titleColor
      : defaultContactPreviewSettings.titleColor,
    bodyColor: isHexColor(value.bodyColor)
      ? value.bodyColor
      : defaultContactPreviewSettings.bodyColor,
  };
}

function isContactPreviewSettings(value: unknown): value is Partial<ContactPreviewSettings> {
  if (!value || typeof value !== "object") return false;

  const settings = value as Partial<ContactPreviewSettings>;
  if (settings.backgroundMode !== undefined && !isBackgroundMode(settings.backgroundMode)) {
    return false;
  }
  if (settings.solidColor !== undefined && !isHexColor(settings.solidColor)) return false;
  if (settings.gradientFrom !== undefined && !isHexColor(settings.gradientFrom)) return false;
  if (settings.gradientTo !== undefined && !isHexColor(settings.gradientTo)) return false;
  if (settings.titleColor !== undefined && !isHexColor(settings.titleColor)) return false;
  if (settings.bodyColor !== undefined && !isHexColor(settings.bodyColor)) return false;

  return true;
}

import { getCommittedHomepagePreviewSettings } from "@/lib/homepage-settings";

export function loadContactPreviewSettings(): ContactPreviewSettings {
  const committed = getCommittedHomepagePreviewSettings()?.contact;
  if (committed) return committed;

  if (typeof window === "undefined") {
    return defaultContactPreviewSettings;
  }

  try {
    const stored = localStorage.getItem(contactPreviewStorageKey);
    if (!stored) return defaultContactPreviewSettings;

    const parsed: unknown = JSON.parse(stored);
    if (isContactPreviewSettings(parsed)) {
      return normalizeContactPreviewSettings(parsed);
    }
  } catch {
    // ignore invalid storage
  }

  return defaultContactPreviewSettings;
}

export function saveContactPreviewSettings(settings: ContactPreviewSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(contactPreviewStorageKey, JSON.stringify(settings));
}
