import { getCommittedHomepagePreviewSettings } from "@/lib/homepage-settings";
import {
  defaultHeroV1PreviewSettings,
  type HeroV1PreviewSettings,
} from "@/lib/hero-v1-preview";

export const heroV1PreviewStorageKey = "lifespring-hero-v1-preview";

function isHeroV1PreviewSettings(value: unknown): value is Partial<HeroV1PreviewSettings> {
  if (!value || typeof value !== "object") return false;

  const settings = value as Partial<HeroV1PreviewSettings>;
  return (
    typeof settings.headline === "string" &&
    typeof settings.subtext === "string" &&
    typeof settings.ctaLabel === "string" &&
    typeof settings.buttonColor === "string"
  );
}

export function normalizeHeroV1PreviewSettings(
  value: Partial<HeroV1PreviewSettings>,
): HeroV1PreviewSettings {
  return {
    headline: value.headline ?? defaultHeroV1PreviewSettings.headline,
    subtext: value.subtext ?? defaultHeroV1PreviewSettings.subtext,
    ctaLabel: value.ctaLabel ?? defaultHeroV1PreviewSettings.ctaLabel,
    buttonColor: value.buttonColor ?? defaultHeroV1PreviewSettings.buttonColor,
  };
}

function parseStoredHeroV1Preview(raw: string): HeroV1PreviewSettings | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isHeroV1PreviewSettings(parsed)) {
      return normalizeHeroV1PreviewSettings(parsed);
    }
  } catch {
    // ignore invalid storage
  }

  return null;
}

export function loadHeroV1PreviewSettings(): HeroV1PreviewSettings {
  const committed = getCommittedHomepagePreviewSettings()?.heroV1;
  if (committed) return committed;

  if (typeof window === "undefined") {
    return defaultHeroV1PreviewSettings;
  }

  const stored = localStorage.getItem(heroV1PreviewStorageKey);
  if (!stored) return defaultHeroV1PreviewSettings;

  return parseStoredHeroV1Preview(stored) ?? defaultHeroV1PreviewSettings;
}

export function saveHeroV1PreviewSettings(settings: HeroV1PreviewSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(heroV1PreviewStorageKey, JSON.stringify(settings));
}
