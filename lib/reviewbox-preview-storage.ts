import {
  defaultReviewboxPreviewSettings,
  getReviewboxTextColorsForTheme,
  type ReviewboxPreviewSettings,
  type ReviewboxSectionTheme,
} from "@/lib/reviewbox-preview";
import {
  defaultHeroV21BackgroundSettings,
  type HeroV21BackgroundSettings,
} from "@/lib/hero-v21-background-preview";

export const reviewboxPreviewStorageKey = "lifespring-reviewbox-preview-v2";

/** @deprecated — migrated on read. */
const legacyReviewboxPreviewStorageKey = "lifespring-reviewbox-preview";

function isReviewboxBackgroundSettings(
  value: unknown,
): value is Partial<HeroV21BackgroundSettings> {
  if (!value || typeof value !== "object") return false;

  const settings = value as Partial<HeroV21BackgroundSettings>;
  return (
    typeof settings.from === "string" &&
    typeof settings.to === "string" &&
    typeof settings.intensity === "number"
  );
}

function normalizeBackgroundSettings(
  value: Partial<HeroV21BackgroundSettings>,
): HeroV21BackgroundSettings {
  return {
    ...defaultHeroV21BackgroundSettings,
    ...value,
    intensity:
      typeof value.intensity === "number"
        ? Math.min(100, Math.max(0, value.intensity))
        : defaultHeroV21BackgroundSettings.intensity,
  };
}

function isReviewboxSectionTheme(value: unknown): value is ReviewboxSectionTheme {
  return value === "dark" || value === "light";
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function normalizeReviewboxPreviewSettings(
  value: Partial<ReviewboxPreviewSettings>,
): ReviewboxPreviewSettings {
  const theme = isReviewboxSectionTheme(value.theme)
    ? value.theme
    : defaultReviewboxPreviewSettings.theme;
  const themeTextDefaults = getReviewboxTextColorsForTheme(theme);

  return {
    theme,
    background: normalizeBackgroundSettings(value.background ?? {}),
    titleColor: isHexColor(value.titleColor) ? value.titleColor : themeTextDefaults.titleColor,
    bodyColor: isHexColor(value.bodyColor) ? value.bodyColor : themeTextDefaults.bodyColor,
  };
}

function isReviewboxPreviewSettings(value: unknown): value is Partial<ReviewboxPreviewSettings> {
  if (!value || typeof value !== "object") return false;

  const settings = value as Partial<ReviewboxPreviewSettings>;
  if (settings.theme !== undefined && !isReviewboxSectionTheme(settings.theme)) return false;
  if (settings.background !== undefined && !isReviewboxBackgroundSettings(settings.background)) {
    return false;
  }
  if (settings.titleColor !== undefined && !isHexColor(settings.titleColor)) return false;
  if (settings.bodyColor !== undefined && !isHexColor(settings.bodyColor)) return false;

  return true;
}

import { getCommittedHomepagePreviewSettings } from "@/lib/homepage-settings";

export function loadReviewboxPreviewSettings(): ReviewboxPreviewSettings {
  const committed = getCommittedHomepagePreviewSettings()?.reviewbox;
  if (committed) return committed;

  if (typeof window === "undefined") {
    return defaultReviewboxPreviewSettings;
  }

  try {
    const stored =
      localStorage.getItem(reviewboxPreviewStorageKey) ??
      localStorage.getItem(legacyReviewboxPreviewStorageKey);
    if (!stored) return defaultReviewboxPreviewSettings;

    const parsed: unknown = JSON.parse(stored);
    if (isReviewboxPreviewSettings(parsed)) {
      return normalizeReviewboxPreviewSettings(parsed);
    }
  } catch {
    // ignore invalid storage
  }

  return defaultReviewboxPreviewSettings;
}

export function saveReviewboxPreviewSettings(settings: ReviewboxPreviewSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(reviewboxPreviewStorageKey, JSON.stringify(settings));
}
