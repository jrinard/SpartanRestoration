import bundledServicesIconsV2PresetLibrary from "@/lib/services-icons-v2-preset-library.json";
import type { ServicesIconsV2PreviewSettings } from "@/lib/services-icons-v2-preview";
import { normalizeServicesIconsV2PreviewSettings } from "@/lib/services-icons-v2-preview-storage";

export type ServicesIconsV2PresetId = string;

export type ServicesIconsV2PresetEntry = {
  id: ServicesIconsV2PresetId;
  label: string;
  settings: ServicesIconsV2PreviewSettings;
};

export type ServicesIconsV2PresetLibrary = {
  entries: ServicesIconsV2PresetEntry[];
};

export function slugifyServicesIconsV2PresetId(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function isServicesIconsV2PresetId(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim());
}

export function labelForServicesIconsV2PresetId(id: string): string {
  if (id === "stone-pillar") return "Stone Pillar";
  if (id === "spartan") return "Spartan";
  return id
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function entryFromUnknown(value: unknown, fallbackId: string): ServicesIconsV2PresetEntry | null {
  if (!value || typeof value !== "object") return null;
  const record = value as { id?: unknown; label?: unknown; settings?: unknown };
  const id =
    typeof record.id === "string" && isServicesIconsV2PresetId(record.id)
      ? record.id
      : fallbackId;
  if (!isServicesIconsV2PresetId(id)) return null;
  const settingsSource =
    record.settings && typeof record.settings === "object" ? record.settings : value;
  return {
    id,
    label:
      typeof record.label === "string" && record.label.trim()
        ? record.label.trim()
        : labelForServicesIconsV2PresetId(id),
    settings: normalizeServicesIconsV2PreviewSettings(
      settingsSource as Partial<ServicesIconsV2PreviewSettings>,
    ),
  };
}

export function normalizeServicesIconsV2PresetLibrary(
  value: unknown,
): ServicesIconsV2PresetLibrary {
  const fallback = { entries: [] as ServicesIconsV2PresetEntry[] };
  if (!value || typeof value !== "object") {
    return normalizeServicesIconsV2PresetLibrary(bundledServicesIconsV2PresetLibrary);
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
  if (value !== bundledServicesIconsV2PresetLibrary) {
    return normalizeServicesIconsV2PresetLibrary(bundledServicesIconsV2PresetLibrary);
  }
  return fallback;
}

export const bundledServicesIconsV2Presets = normalizeServicesIconsV2PresetLibrary(
  bundledServicesIconsV2PresetLibrary,
);

export function listServicesIconsV2Presets(
  library: ServicesIconsV2PresetLibrary = bundledServicesIconsV2Presets,
): ServicesIconsV2PresetEntry[] {
  return library.entries;
}

export function getServicesIconsV2Preset(
  id: string,
  library: ServicesIconsV2PresetLibrary = bundledServicesIconsV2Presets,
): ServicesIconsV2PresetEntry | undefined {
  return library.entries.find((entry) => entry.id === id);
}

/** Replace this instance's service cards with a named starter. Does not persist a preset id. */
export function applyServicesIconsV2Preset(
  id: ServicesIconsV2PresetId,
  library: ServicesIconsV2PresetLibrary = bundledServicesIconsV2Presets,
): ServicesIconsV2PreviewSettings {
  const preset = getServicesIconsV2Preset(id, library)?.settings ?? library.entries[0]?.settings;
  if (!preset) return normalizeServicesIconsV2PreviewSettings({});
  return normalizeServicesIconsV2PreviewSettings(
    JSON.parse(JSON.stringify(preset)) as Partial<ServicesIconsV2PreviewSettings>,
  );
}
