import bundledCardsV1PresetLibrary from "@/lib/cards-v1-preset-library.json";
import {
  normalizeCardsV1PreviewSettings,
  type CardsV1PreviewSettings,
} from "@/lib/cards-v1-preview-storage";

export type CardsV1PresetId = string;

export type CardsV1PresetEntry = {
  id: CardsV1PresetId;
  label: string;
  settings: CardsV1PreviewSettings;
};

export type CardsV1PresetLibrary = {
  entries: CardsV1PresetEntry[];
};

export function slugifyCardsV1PresetId(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function isCardsV1PresetId(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim());
}

export function labelForCardsV1PresetId(id: string): string {
  if (id === "langham") return "Langham";
  if (id === "ospressure") return "OS Pressure";
  return id
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function entryFromUnknown(value: unknown, fallbackId: string): CardsV1PresetEntry | null {
  if (!value || typeof value !== "object") return null;
  const record = value as { id?: unknown; label?: unknown; settings?: unknown };
  const id =
    typeof record.id === "string" && isCardsV1PresetId(record.id) ? record.id : fallbackId;
  if (!isCardsV1PresetId(id)) return null;
  const settingsSource =
    record.settings && typeof record.settings === "object" ? record.settings : value;
  return {
    id,
    label:
      typeof record.label === "string" && record.label.trim()
        ? record.label.trim()
        : labelForCardsV1PresetId(id),
    settings: normalizeCardsV1PreviewSettings(settingsSource as Partial<CardsV1PreviewSettings>),
  };
}

export function normalizeCardsV1PresetLibrary(value: unknown): CardsV1PresetLibrary {
  const fallback = { entries: [] as CardsV1PresetEntry[] };
  if (!value || typeof value !== "object") {
    return normalizeCardsV1PresetLibrary(bundledCardsV1PresetLibrary);
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
  if (value !== bundledCardsV1PresetLibrary) {
    return normalizeCardsV1PresetLibrary(bundledCardsV1PresetLibrary);
  }
  return fallback;
}

export const bundledCardsV1Presets = normalizeCardsV1PresetLibrary(bundledCardsV1PresetLibrary);

export function listCardsV1Presets(
  library: CardsV1PresetLibrary = bundledCardsV1Presets,
): CardsV1PresetEntry[] {
  return library.entries;
}

export function getCardsV1Preset(
  id: string,
  library: CardsV1PresetLibrary = bundledCardsV1Presets,
): CardsV1PresetEntry | undefined {
  return library.entries.find((entry) => entry.id === id);
}

/** Replace this instance's cards with a named starter. Does not persist a preset id. */
export function applyCardsV1Preset(
  id: CardsV1PresetId,
  library: CardsV1PresetLibrary = bundledCardsV1Presets,
): CardsV1PreviewSettings {
  const preset = getCardsV1Preset(id, library)?.settings ?? library.entries[0]?.settings;
  if (!preset) return normalizeCardsV1PreviewSettings({});
  return normalizeCardsV1PreviewSettings(
    JSON.parse(JSON.stringify(preset)) as Partial<CardsV1PreviewSettings>,
  );
}
