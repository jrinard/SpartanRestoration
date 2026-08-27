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
  defaultHeroV21Copy,
  defaultHeroV21PreviewSettings,
  type HeroV21Highlight,
  type HeroV21PreviewSettings,
} from "@/lib/hero-v21-preview";

import { getCommittedHomepagePreviewSettings, shouldUsePlaygroundPreviewSettings } from "@/lib/homepage-settings";
import { orgStorageGet, orgStorageSet } from "@/lib/org/browser-storage";

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

function normalizeHighlights(value: unknown): HeroV21Highlight[] {
  if (!Array.isArray(value)) return defaultHeroV21Copy.highlights.map((item) => ({ ...item }));
  const highlights = value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Partial<HeroV21Highlight>;
    if (typeof item.title !== "string" || typeof item.description !== "string") return [];
    return [
      {
        title: item.title,
        description: item.description,
        href: typeof item.href === "string" ? item.href : undefined,
      },
    ];
  });
  return highlights.length > 0
    ? highlights
    : defaultHeroV21Copy.highlights.map((item) => ({ ...item }));
}

function normalizeStringList(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return [...fallback];
  const lines = value.filter((line): line is string => typeof line === "string" && line.length > 0);
  return lines.length > 0 ? lines : [...fallback];
}

export function normalizeHeroV21PreviewSettings(value: {
  button?: Partial<ButtonPreviewSettings>;
  background?: Partial<HeroV21BackgroundSettings>;
  headlineLines?: unknown;
  subtextLines?: unknown;
  highlights?: unknown;
  ctaLabel?: unknown;
  ctaHref?: unknown;
}): HeroV21PreviewSettings {
  return {
    button: normalizeButtonSettings(value.button ?? {}),
    background: normalizeBackgroundSettings(value.background ?? {}),
    headlineLines: normalizeStringList(value.headlineLines, defaultHeroV21Copy.headlineLines),
    subtextLines: normalizeStringList(value.subtextLines, defaultHeroV21Copy.subtextLines),
    highlights: normalizeHighlights(value.highlights),
    ctaLabel: typeof value.ctaLabel === "string" ? value.ctaLabel : defaultHeroV21Copy.ctaLabel,
    ctaHref: typeof value.ctaHref === "string" ? value.ctaHref : defaultHeroV21Copy.ctaHref,
  };
}

function isHeroV21PreviewSettings(value: unknown): value is Partial<HeroV21PreviewSettings> {
  if (!value || typeof value !== "object") return false;

  const settings = value as Partial<HeroV21PreviewSettings>;
  if ("button" in settings || "background" in settings || "headlineLines" in settings) {
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

export function loadHeroV21PreviewSettings(): HeroV21PreviewSettings {
  if (!shouldUsePlaygroundPreviewSettings()) {
    const committed = getCommittedHomepagePreviewSettings()?.heroV21;
    if (committed) return committed;
  }

  if (typeof window === "undefined") {
    return defaultHeroV21PreviewSettings;
  }

  const stored =
    orgStorageGet(heroV21PreviewStorageKey) ??
    orgStorageGet(heroButtonPreviewStorageKey);

  if (!stored) return defaultHeroV21PreviewSettings;

  return parseStoredHeroV21Preview(stored) ?? defaultHeroV21PreviewSettings;
}

export function saveHeroV21PreviewSettings(settings: HeroV21PreviewSettings): void {
  if (typeof window === "undefined") return;
  orgStorageSet(heroV21PreviewStorageKey, JSON.stringify(settings));
}
