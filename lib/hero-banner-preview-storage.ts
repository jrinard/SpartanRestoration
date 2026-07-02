import { getCommittedHomepagePreviewSettings } from "@/lib/homepage-settings";
import {
  defaultHeroBannerPreviewSettings,
  defaultHeroBannerSlides,
  type HeroBannerPreviewSettings,
  type HeroBannerSlide,
  type HeroBannerTransition,
} from "@/lib/hero-banner-preview";
import {
  defaultHeroV21BackgroundSettings,
  type HeroV21BackgroundSettings,
} from "@/lib/hero-v21-background-preview";

export const heroBannerPreviewStorageKey = "lifespring-hero-banner-preview";

function isHeroBannerTransition(value: unknown): value is HeroBannerTransition {
  return value === "fade" || value === "slide";
}

function isHeroBannerSlide(value: unknown): value is HeroBannerSlide {
  if (!value || typeof value !== "object") return false;
  const slide = value as Partial<HeroBannerSlide>;
  return (
    (slide.type === "image" || slide.type === "color") && typeof slide.value === "string"
  );
}

function normalizeBackgroundSettings(
  value: Partial<HeroV21BackgroundSettings> | undefined,
): HeroV21BackgroundSettings {
  return {
    ...defaultHeroV21BackgroundSettings,
    ...value,
    intensity:
      typeof value?.intensity === "number"
        ? Math.min(100, Math.max(0, value.intensity))
        : defaultHeroV21BackgroundSettings.intensity,
  };
}

function normalizeSlides(value: unknown): HeroBannerSlide[] {
  if (!Array.isArray(value)) return defaultHeroBannerSlides;

  const slides = value.filter(isHeroBannerSlide);
  return slides.length > 0 ? slides : defaultHeroBannerSlides;
}

export function normalizeHeroBannerPreviewSettings(
  value: Partial<HeroBannerPreviewSettings>,
): HeroBannerPreviewSettings {
  return {
    background: normalizeBackgroundSettings(value.background),
    intervalMs:
      typeof value.intervalMs === "number"
        ? Math.min(60000, Math.max(2000, value.intervalMs))
        : defaultHeroBannerPreviewSettings.intervalMs,
    transition: isHeroBannerTransition(value.transition)
      ? value.transition
      : defaultHeroBannerPreviewSettings.transition,
    slides: normalizeSlides(value.slides),
    heightPx:
      typeof value.heightPx === "number"
        ? Math.min(800, Math.max(240, Math.round(value.heightPx)))
        : defaultHeroBannerPreviewSettings.heightPx,
  };
}

function parseStoredHeroBannerPreview(raw: string): HeroBannerPreviewSettings | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return normalizeHeroBannerPreviewSettings(parsed as Partial<HeroBannerPreviewSettings>);
    }
  } catch {
    // ignore invalid storage
  }

  return null;
}

export function loadHeroBannerPreviewSettings(): HeroBannerPreviewSettings {
  const committed = getCommittedHomepagePreviewSettings()?.heroBanner;
  if (committed) return committed;

  if (typeof window === "undefined") {
    return defaultHeroBannerPreviewSettings;
  }

  const stored = localStorage.getItem(heroBannerPreviewStorageKey);
  if (!stored) return defaultHeroBannerPreviewSettings;

  return parseStoredHeroBannerPreview(stored) ?? defaultHeroBannerPreviewSettings;
}

export function saveHeroBannerPreviewSettings(settings: HeroBannerPreviewSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(heroBannerPreviewStorageKey, JSON.stringify(settings));
}
