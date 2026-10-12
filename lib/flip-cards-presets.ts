import bundledFlipCardsPresetLibrary from "@/lib/flip-cards-preset-library.json";
import {
  cardsForFlipLayout,
  normalizeFlipCardsPreviewSettings,
  type FlipCardsPreviewSettings,
} from "@/lib/flip-cards-preview";

export type FlipCardsPresetId = string;

export type FlipCardsPresetEntry = {
  id: FlipCardsPresetId;
  label: string;
  settings: FlipCardsPreviewSettings;
};

export type FlipCardsPresetLibrary = {
  entries: FlipCardsPresetEntry[];
};

export const defaultFlipCardsPresetId = "ospressure";

export function defaultFlipCardsPresetIdForOrg(orgId: string | undefined): FlipCardsPresetId {
  if (orgId === "professional-turf-landscape") return "professional-turf-landscape";
  if (orgId === "ospressure") return "ospressure";
  return defaultFlipCardsPresetId;
}

export function slugifyFlipCardsPresetId(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function isFlipCardsPresetId(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim());
}

export function labelForFlipCardsPresetId(id: string): string {
  if (id === "ospressure") return "OS Pressure";
  if (id === "professional-turf-landscape") return "Professional Turf & Landscape";
  return id
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function entryFromUnknown(value: unknown, fallbackId: string): FlipCardsPresetEntry | null {
  if (!value || typeof value !== "object") return null;
  const record = value as { id?: unknown; label?: unknown; settings?: unknown };
  const id =
    typeof record.id === "string" && isFlipCardsPresetId(record.id) ? record.id : fallbackId;
  if (!isFlipCardsPresetId(id)) return null;
  const settingsSource =
    record.settings && typeof record.settings === "object" ? record.settings : value;
  return {
    id,
    label:
      typeof record.label === "string" && record.label.trim()
        ? record.label.trim()
        : labelForFlipCardsPresetId(id),
    settings: normalizeFlipCardsPreviewSettings(
      settingsSource as Partial<FlipCardsPreviewSettings>,
    ),
  };
}

export function normalizeFlipCardsPresetLibrary(value: unknown): FlipCardsPresetLibrary {
  const fallback = { entries: [] as FlipCardsPresetEntry[] };
  if (!value || typeof value !== "object") {
    return normalizeFlipCardsPresetLibrary(bundledFlipCardsPresetLibrary);
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
  if (value !== bundledFlipCardsPresetLibrary) {
    return normalizeFlipCardsPresetLibrary(bundledFlipCardsPresetLibrary);
  }
  return fallback;
}

export const bundledFlipCardsPresets = normalizeFlipCardsPresetLibrary(bundledFlipCardsPresetLibrary);

export function listFlipCardsPresets(
  library: FlipCardsPresetLibrary = bundledFlipCardsPresets,
): FlipCardsPresetEntry[] {
  return library.entries;
}

export function getFlipCardsPreset(
  id: string,
  library: FlipCardsPresetLibrary = bundledFlipCardsPresets,
): FlipCardsPresetEntry | undefined {
  return library.entries.find((entry) => entry.id === id);
}

export function applyFlipCardsPreset(
  id: FlipCardsPresetId,
  library: FlipCardsPresetLibrary = bundledFlipCardsPresets,
): FlipCardsPreviewSettings {
  const preset = getFlipCardsPreset(id, library)?.settings ?? library.entries[0]?.settings;
  if (!preset) return normalizeFlipCardsPreviewSettings({});
  return normalizeFlipCardsPreviewSettings(
    JSON.parse(JSON.stringify(preset)) as Partial<FlipCardsPreviewSettings>,
  );
}

export function defaultFlipCardsPreviewSettingsForOrg(
  orgId: string | undefined,
): FlipCardsPreviewSettings {
  return applyFlipCardsPreset(defaultFlipCardsPresetIdForOrg(orgId));
}

export function defaultFlipCardsPreviewSettingsForLayout(
  orgId: string | undefined,
  layout: "three" | "four",
): FlipCardsPreviewSettings {
  const base = defaultFlipCardsPreviewSettingsForOrg(orgId);
  return {
    ...base,
    cards: cardsForFlipLayout(base.cards, layout),
  };
}
