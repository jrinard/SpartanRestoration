import bundledServiceAreaV1PresetLibrary from "@/lib/service-area-v1-preset-library.json";
import type { ServiceAreaV1PreviewSettings } from "@/lib/service-area-preview";
import { normalizeServiceAreaV1PreviewSettings } from "@/lib/service-area-preview-storage";

export type ServiceAreaV1PresetId = string;

export type ServiceAreaV1PresetEntry = {
  id: ServiceAreaV1PresetId;
  label: string;
  settings: ServiceAreaV1PreviewSettings;
};

export type ServiceAreaV1PresetLibrary = {
  entries: ServiceAreaV1PresetEntry[];
};

export function slugifyServiceAreaV1PresetId(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function isServiceAreaV1PresetId(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim());
}

export function labelForServiceAreaV1PresetId(id: string): string {
  if (id === "spartan") return "Spartan";
  if (id === "langham") return "Langham";
  return id
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function entryFromUnknown(value: unknown, fallbackId: string): ServiceAreaV1PresetEntry | null {
  if (!value || typeof value !== "object") return null;
  const record = value as { id?: unknown; label?: unknown; settings?: unknown };
  const id =
    typeof record.id === "string" && isServiceAreaV1PresetId(record.id) ? record.id : fallbackId;
  if (!isServiceAreaV1PresetId(id)) return null;
  const settingsSource =
    record.settings && typeof record.settings === "object" ? record.settings : value;
  return {
    id,
    label:
      typeof record.label === "string" && record.label.trim()
        ? record.label.trim()
        : labelForServiceAreaV1PresetId(id),
    settings: normalizeServiceAreaV1PreviewSettings(
      settingsSource as Partial<ServiceAreaV1PreviewSettings>,
    ),
  };
}

export function normalizeServiceAreaV1PresetLibrary(value: unknown): ServiceAreaV1PresetLibrary {
  const fallback = { entries: [] as ServiceAreaV1PresetEntry[] };
  if (!value || typeof value !== "object") {
    return normalizeServiceAreaV1PresetLibrary(bundledServiceAreaV1PresetLibrary);
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
  if (value !== bundledServiceAreaV1PresetLibrary) {
    return normalizeServiceAreaV1PresetLibrary(bundledServiceAreaV1PresetLibrary);
  }
  return fallback;
}

export const bundledServiceAreaV1Presets = normalizeServiceAreaV1PresetLibrary(
  bundledServiceAreaV1PresetLibrary,
);

export function listServiceAreaV1Presets(
  library: ServiceAreaV1PresetLibrary = bundledServiceAreaV1Presets,
): ServiceAreaV1PresetEntry[] {
  return library.entries;
}

export function getServiceAreaV1Preset(
  id: string,
  library: ServiceAreaV1PresetLibrary = bundledServiceAreaV1Presets,
): ServiceAreaV1PresetEntry | undefined {
  return library.entries.find((entry) => entry.id === id);
}

/** Replace this instance's service area with a named starter. Does not persist a preset id. */
export function applyServiceAreaV1Preset(
  id: ServiceAreaV1PresetId,
  library: ServiceAreaV1PresetLibrary = bundledServiceAreaV1Presets,
): ServiceAreaV1PreviewSettings {
  const preset = getServiceAreaV1Preset(id, library)?.settings ?? library.entries[0]?.settings;
  if (!preset) return normalizeServiceAreaV1PreviewSettings({});
  return normalizeServiceAreaV1PreviewSettings(
    JSON.parse(JSON.stringify(preset)) as Partial<ServiceAreaV1PreviewSettings>,
  );
}
