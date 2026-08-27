import {
  defaultHeroV4PreviewSettings,
  normalizeHeroV4PreviewSettings,
  type HeroV4PreviewSettings,
} from "@/lib/hero-v4-preview";
import { getCommittedHomepagePreviewSettings, shouldUsePlaygroundPreviewSettings } from "@/lib/homepage-settings";

import { orgStorageGet, orgStorageSet } from "@/lib/org/browser-storage";

export const heroV4PreviewStorageKey = "lifespring-hero-v4-preview";

export function loadHeroV4PreviewSettings(): HeroV4PreviewSettings {
  if (typeof window === "undefined") {
    return defaultHeroV4PreviewSettings;
  }

  if (!shouldUsePlaygroundPreviewSettings()) {
    const committed = getCommittedHomepagePreviewSettings()?.heroV4;
    if (committed) return normalizeHeroV4PreviewSettings(committed);
  }

  try {
    const raw = orgStorageGet(heroV4PreviewStorageKey);
    if (!raw) return defaultHeroV4PreviewSettings;
    return normalizeHeroV4PreviewSettings(JSON.parse(raw));
  } catch {
    return defaultHeroV4PreviewSettings;
  }
}

export function saveHeroV4PreviewSettings(settings: HeroV4PreviewSettings): void {
  if (typeof window === "undefined") return;
  orgStorageSet(heroV4PreviewStorageKey, JSON.stringify(normalizeHeroV4PreviewSettings(settings)));
}
