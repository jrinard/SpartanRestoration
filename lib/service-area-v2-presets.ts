import bundledServiceAreaV2PresetLibrary from "@/lib/service-area-v2-preset-library.json";
import type { ServiceAreaV2PreviewSettings } from "@/lib/service-area-v2-preview";
import { normalizeServiceAreaV2PreviewSettings } from "@/lib/service-area-v2-preview-storage";

export type ServiceAreaV2PresetId = string;

export type ServiceAreaV2PresetEntry = {
  id: ServiceAreaV2PresetId;
  label: string;
  settings: ServiceAreaV2PreviewSettings;
};

export type ServiceAreaV2PresetLibrary = {
  entries: ServiceAreaV2PresetEntry[];
};

export function slugifyServiceAreaV2PresetId(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function isServiceAreaV2PresetId(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim());
}

export function labelForServiceAreaV2PresetId(id: string): string {
  if (id === "lifespring") return "LifeSpring";
  if (id === "spartan") return "Spartan";
  return id
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function entryFromUnknown(value: unknown, fallbackId: string): ServiceAreaV2PresetEntry | null {
  if (!value || typeof value !== "object") return null;
  const record = value as { id?: unknown; label?: unknown; settings?: unknown };
  const id =
    typeof record.id === "string" && isServiceAreaV2PresetId(record.id) ? record.id : fallbackId;
  if (!isServiceAreaV2PresetId(id)) return null;
  const settingsSource =
    record.settings && typeof record.settings === "object" ? record.settings : value;
  return {
    id,
    label:
      typeof record.label === "string" && record.label.trim()
        ? record.label.trim()
        : labelForServiceAreaV2PresetId(id),
    settings: normalizeServiceAreaV2PreviewSettings(
      settingsSource as Partial<ServiceAreaV2PreviewSettings>,
    ),
  };
}

export function normalizeServiceAreaV2PresetLibrary(value: unknown): ServiceAreaV2PresetLibrary {
  const fallback = { entries: [] as ServiceAreaV2PresetEntry[] };
  if (!value || typeof value !== "object") {
    return normalizeServiceAreaV2PresetLibrary(bundledServiceAreaV2PresetLibrary);
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
  if (value !== bundledServiceAreaV2PresetLibrary) {
    return normalizeServiceAreaV2PresetLibrary(bundledServiceAreaV2PresetLibrary);
  }
  return fallback;
}

export const bundledServiceAreaV2Presets = normalizeServiceAreaV2PresetLibrary(
  bundledServiceAreaV2PresetLibrary,
);

export const defaultServiceAreaV2PresetId: ServiceAreaV2PresetId = "lifespring";

export function listServiceAreaV2Presets(
  library: ServiceAreaV2PresetLibrary = bundledServiceAreaV2Presets,
): ServiceAreaV2PresetEntry[] {
  return library.entries;
}

export function getServiceAreaV2Preset(
  id: string,
  library: ServiceAreaV2PresetLibrary = bundledServiceAreaV2Presets,
): ServiceAreaV2PresetEntry | undefined {
  return library.entries.find((entry) => entry.id === id);
}

/** Replace this instance's service area section styling with a named starter. */
export function applyServiceAreaV2Preset(
  id: ServiceAreaV2PresetId,
  library: ServiceAreaV2PresetLibrary = bundledServiceAreaV2Presets,
): ServiceAreaV2PreviewSettings {
  const preset =
    getServiceAreaV2Preset(id, library)?.settings ??
    getServiceAreaV2Preset(defaultServiceAreaV2PresetId, library)?.settings ??
    library.entries[0]?.settings;
  if (!preset) return normalizeServiceAreaV2PreviewSettings({});
  return normalizeServiceAreaV2PreviewSettings(
    JSON.parse(JSON.stringify(preset)) as Partial<ServiceAreaV2PreviewSettings>,
  );
}
