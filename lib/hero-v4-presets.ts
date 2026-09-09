import { siteConfig } from "@/config/site";
import bundledHeroV4PresetLibrary from "@/lib/hero-v4-preset-library.json";
import {
  normalizeHeroV4PreviewSettings,
  type HeroV4PreviewSettings,
} from "@/lib/hero-v4-preview";
import { phoneTelHref } from "@/lib/phone";

export type HeroV4PresetId = string;

export type HeroV4PresetEntry = {
  id: HeroV4PresetId;
  label: string;
  settings: HeroV4PreviewSettings;
};

export type HeroV4PresetLibrary = {
  entries: HeroV4PresetEntry[];
};

export function slugifyHeroV4PresetId(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function isHeroV4PresetId(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim());
}

export function labelForHeroV4PresetId(id: string): string {
  if (id === "lifespring") return "LifeSpring";
  if (id === "langham") return "Langham";
  return id
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function entryFromUnknown(value: unknown, fallbackId: string): HeroV4PresetEntry | null {
  if (!value || typeof value !== "object") return null;
  const record = value as { id?: unknown; label?: unknown; settings?: unknown };
  const id =
    typeof record.id === "string" && isHeroV4PresetId(record.id) ? record.id : fallbackId;
  if (!isHeroV4PresetId(id)) return null;
  const settingsSource =
    record.settings && typeof record.settings === "object" ? record.settings : value;
  return {
    id,
    label:
      typeof record.label === "string" && record.label.trim()
        ? record.label.trim()
        : labelForHeroV4PresetId(id),
    settings: normalizeHeroV4PreviewSettings(settingsSource as Partial<HeroV4PreviewSettings>),
  };
}

export function normalizeHeroV4PresetLibrary(value: unknown): HeroV4PresetLibrary {
  const fallback = { entries: [] as HeroV4PresetEntry[] };
  if (!value || typeof value !== "object") {
    return normalizeHeroV4PresetLibrary(bundledHeroV4PresetLibrary);
  }

  const raw = value as { entries?: unknown } & Record<string, unknown>;
  if (Array.isArray(raw.entries)) {
    const entries = raw.entries.flatMap((item, index) => {
      const entry = entryFromUnknown(item, `preset-${index + 1}`);
      return entry ? [entry] : [];
    });
    if (entries.length > 0) return { entries };
  }

  const entries = Object.entries(raw).flatMap(([id, settings]) => {
    if (id === "entries") return [];
    const entry = entryFromUnknown({ id, settings }, id);
    return entry ? [entry] : [];
  });

  if (entries.length > 0) return { entries };
  if (value !== bundledHeroV4PresetLibrary) {
    return normalizeHeroV4PresetLibrary(bundledHeroV4PresetLibrary);
  }
  return fallback;
}

export const bundledHeroV4Presets = normalizeHeroV4PresetLibrary(bundledHeroV4PresetLibrary);

export function listHeroV4Presets(
  library: HeroV4PresetLibrary = bundledHeroV4Presets,
): HeroV4PresetEntry[] {
  return library.entries;
}

export function getHeroV4Preset(
  id: string,
  library: HeroV4PresetLibrary = bundledHeroV4Presets,
): HeroV4PresetEntry | undefined {
  return library.entries.find((entry) => entry.id === id);
}

function cloneHeroV4Settings(settings: HeroV4PreviewSettings): HeroV4PreviewSettings {
  return normalizeHeroV4PreviewSettings(
    JSON.parse(JSON.stringify(settings)) as Partial<HeroV4PreviewSettings>,
  );
}

/** Replace this instance's hero with a named starter. Does not persist a preset id. */
export function applyHeroV4Preset(
  id: HeroV4PresetId,
  library: HeroV4PresetLibrary = bundledHeroV4Presets,
): HeroV4PreviewSettings {
  const preset = getHeroV4Preset(id, library)?.settings ?? library.entries[0]?.settings;
  if (!preset) return normalizeHeroV4PreviewSettings(undefined);

  return normalizeHeroV4PreviewSettings({
    ...cloneHeroV4Settings(preset),
    phoneLabel: siteConfig.phone,
    phoneHref: phoneTelHref(siteConfig.phone),
  });
}
