import {
  defaultHeroButtonPreviewSettings,
  isButtonPreviewSize,
  normalizeButtonBorderRadiusPx,
  type ButtonPreviewSettings,
  type ButtonPreviewSize,
} from "@/lib/button-preview";
import {
  defaultHeroV21BackgroundSettings,
  type HeroV21BackgroundSettings,
} from "@/lib/hero-v21-background-preview";
import {
  defaultHeroV21PreviewSettings,
  type HeroV21PreviewSettings,
} from "@/lib/hero-v21-preview";

export const heroV21PreviewStorageKey = "lifespring-hero-v21-preview";

/** @deprecated Legacy key — migrated on read. */
export const heroButtonPreviewStorageKey = "lifespring-hero-button-preview";

function isHeroButtonPreviewSize(value: unknown): value is ButtonPreviewSize {
  return isButtonPreviewSize(value);
}

function isHeroV21BackgroundSettings(value: unknown): value is Partial<HeroV21BackgroundSettings> {
  if (!value || typeof value !== "object") return false;

  const settings = value as Partial<HeroV21BackgroundSettings>;
  return (
    typeof settings.from === "string" &&
    typeof settings.to === "string" &&
    typeof settings.intensity === "number"
  );
}

function isButtonPreviewSettings(value: unknown): value is Partial<ButtonPreviewSettings> {
  if (!value || typeof value !== "object") return false;

  const settings = value as Partial<ButtonPreviewSettings>;
  return (
    typeof settings.navBackground === "string" &&
    typeof settings.navTextColor === "string" &&
    typeof settings.navTextHoverColor === "string" &&
    typeof settings.navHoverBackground === "string"
  );
}

function normalizeButtonSettings(value: Partial<ButtonPreviewSettings>): ButtonPreviewSettings {
  return {
    ...defaultHeroButtonPreviewSettings,
    ...value,
    navButtonSize: isHeroButtonPreviewSize(value.navButtonSize)
      ? value.navButtonSize
      : defaultHeroButtonPreviewSettings.navButtonSize,
    navButtonRadiusPx:
      typeof value.navButtonRadiusPx === "number"
        ? normalizeButtonBorderRadiusPx(Math.round(value.navButtonRadiusPx))
        : defaultHeroButtonPreviewSettings.navButtonRadiusPx,
  };
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

function normalizeHeroV21PreviewSettings(value: {
  button?: Partial<ButtonPreviewSettings>;
  background?: Partial<HeroV21BackgroundSettings>;
}): HeroV21PreviewSettings {
  return {
    button: normalizeButtonSettings(value.button ?? {}),
    background: normalizeBackgroundSettings(value.background ?? {}),
  };
}

function isHeroV21PreviewSettings(value: unknown): value is Partial<HeroV21PreviewSettings> {
  if (!value || typeof value !== "object") return false;

  const settings = value as Partial<HeroV21PreviewSettings>;
  if ("button" in settings || "background" in settings) {
    if (settings.button && !isButtonPreviewSettings(settings.button)) return false;
    if (settings.background && !isHeroV21BackgroundSettings(settings.background)) return false;
    return true;
  }

  return isButtonPreviewSettings(value);
}

function parseStoredHeroV21Preview(raw: string): HeroV21PreviewSettings | null {
  try {
    const parsed: unknown = JSON.parse(raw);

    if (isHeroV21PreviewSettings(parsed)) {
      if ("button" in (parsed as object) || "background" in (parsed as object)) {
        return normalizeHeroV21PreviewSettings(parsed as Partial<HeroV21PreviewSettings>);
      }

      return normalizeHeroV21PreviewSettings({ button: parsed as Partial<ButtonPreviewSettings> });
    }
  } catch {
    // ignore invalid storage
  }

  return null;
}

import { getCommittedHomepagePreviewSettings } from "@/lib/homepage-settings";

export function loadHeroV21PreviewSettings(): HeroV21PreviewSettings {
  const committed = getCommittedHomepagePreviewSettings()?.heroV21;
  if (committed) return committed;

  if (typeof window === "undefined") {
    return defaultHeroV21PreviewSettings;
  }

  const stored =
    localStorage.getItem(heroV21PreviewStorageKey) ??
    localStorage.getItem(heroButtonPreviewStorageKey);

  if (!stored) return defaultHeroV21PreviewSettings;

  return parseStoredHeroV21Preview(stored) ?? defaultHeroV21PreviewSettings;
}

export function saveHeroV21PreviewSettings(settings: HeroV21PreviewSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(heroV21PreviewStorageKey, JSON.stringify(settings));
}
