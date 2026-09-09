import bundledHeaderV1PresetLibrary from "@/lib/header-v1-preset-library.json";
import type { HeaderV3PreviewSettings } from "@/lib/header-v3-gradient";
import { normalizeHeaderV3PreviewSettings } from "@/lib/header-v3-storage";

export type HeaderV1PresetId = string;

export type HeaderV1PresetEntry = {
  id: HeaderV1PresetId;
  label: string;
  settings: HeaderV3PreviewSettings;
};

export type HeaderV1PresetLibrary = {
  entries: HeaderV1PresetEntry[];
};

export function slugifyHeaderV1PresetId(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function isHeaderV1PresetId(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim());
}

export function labelForHeaderV1PresetId(id: string): string {
  if (id === "lifespring") return "LifeSpring";
  if (id === "langham") return "Langham";
  return id
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function entryFromUnknown(value: unknown, fallbackId: string): HeaderV1PresetEntry | null {
  if (!value || typeof value !== "object") return null;
  const record = value as { id?: unknown; label?: unknown; settings?: unknown };
  const id =
    typeof record.id === "string" && isHeaderV1PresetId(record.id) ? record.id : fallbackId;
  if (!isHeaderV1PresetId(id)) return null;
  const settingsSource =
    record.settings && typeof record.settings === "object" ? record.settings : value;
  return {
    id,
    label:
      typeof record.label === "string" && record.label.trim()
        ? record.label.trim()
        : labelForHeaderV1PresetId(id),
    settings: normalizeHeaderV3PreviewSettings(settingsSource as Partial<HeaderV3PreviewSettings>),
  };
}

export function normalizeHeaderV1PresetLibrary(value: unknown): HeaderV1PresetLibrary {
  const fallback = { entries: [] as HeaderV1PresetEntry[] };
  if (!value || typeof value !== "object") {
    return normalizeHeaderV1PresetLibrary(bundledHeaderV1PresetLibrary);
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
  if (value !== bundledHeaderV1PresetLibrary) {
    return normalizeHeaderV1PresetLibrary(bundledHeaderV1PresetLibrary);
  }
  return fallback;
}

export const bundledHeaderV1Presets = normalizeHeaderV1PresetLibrary(bundledHeaderV1PresetLibrary);

export function listHeaderV1Presets(
  library: HeaderV1PresetLibrary = bundledHeaderV1Presets,
): HeaderV1PresetEntry[] {
  return library.entries;
}

export function getHeaderV1Preset(
  id: string,
  library: HeaderV1PresetLibrary = bundledHeaderV1Presets,
): HeaderV1PresetEntry | undefined {
  return library.entries.find((entry) => entry.id === id);
}

/** Replace this instance's header with a named starter. Does not persist a preset id. */
export function applyHeaderV1Preset(
  id: HeaderV1PresetId,
  library: HeaderV1PresetLibrary = bundledHeaderV1Presets,
): HeaderV3PreviewSettings {
  const preset = getHeaderV1Preset(id, library)?.settings ?? library.entries[0]?.settings;
  if (!preset) return normalizeHeaderV3PreviewSettings({});
  return normalizeHeaderV3PreviewSettings(
    JSON.parse(JSON.stringify(preset)) as Partial<HeaderV3PreviewSettings>,
  );
}
