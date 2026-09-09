import bundledTextIconsV3PresetLibrary from "@/lib/text-icons-v3-preset-library.json";
import {
  normalizeTextIconsV3PreviewSettings,
  type TextIconsV3PreviewSettings,
} from "@/lib/text-icons-v3-preview-storage";

export type TextIconsV3PresetId = string;

export type TextIconsV3PresetEntry = {
  id: TextIconsV3PresetId;
  label: string;
  settings: TextIconsV3PreviewSettings;
};

export type TextIconsV3PresetLibrary = {
  entries: TextIconsV3PresetEntry[];
};

export function slugifyTextIconsV3PresetId(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function isTextIconsV3PresetId(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim());
}

export function labelForTextIconsV3PresetId(id: string): string {
  if (id === "langham") return "Langham";
  if (id === "stone-pillar") return "Stone Pillar";
  if (id === "spartan") return "Spartan";
  return id
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function entryFromUnknown(value: unknown, fallbackId: string): TextIconsV3PresetEntry | null {
  if (!value || typeof value !== "object") return null;
  const record = value as { id?: unknown; label?: unknown; settings?: unknown };
  const id =
    typeof record.id === "string" && isTextIconsV3PresetId(record.id)
      ? record.id
      : fallbackId;
  if (!isTextIconsV3PresetId(id)) return null;
  const settingsSource =
    record.settings && typeof record.settings === "object" ? record.settings : value;
  return {
    id,
    label:
      typeof record.label === "string" && record.label.trim()
        ? record.label.trim()
        : labelForTextIconsV3PresetId(id),
    settings: normalizeTextIconsV3PreviewSettings(
      settingsSource as Partial<TextIconsV3PreviewSettings>,
    ),
  };
}

export function normalizeTextIconsV3PresetLibrary(value: unknown): TextIconsV3PresetLibrary {
  const fallback = { entries: [] as TextIconsV3PresetEntry[] };
  if (!value || typeof value !== "object") {
    return normalizeTextIconsV3PresetLibrary(bundledTextIconsV3PresetLibrary);
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
  if (value !== bundledTextIconsV3PresetLibrary) {
    return normalizeTextIconsV3PresetLibrary(bundledTextIconsV3PresetLibrary);
  }
  return fallback;
}

export const bundledTextIconsV3Presets = normalizeTextIconsV3PresetLibrary(
  bundledTextIconsV3PresetLibrary,
);

export function listTextIconsV3Presets(
  library: TextIconsV3PresetLibrary = bundledTextIconsV3Presets,
): TextIconsV3PresetEntry[] {
  return library.entries;
}

export function getTextIconsV3Preset(
  id: string,
  library: TextIconsV3PresetLibrary = bundledTextIconsV3Presets,
): TextIconsV3PresetEntry | undefined {
  return library.entries.find((entry) => entry.id === id);
}

/** Replace this instance's text-icons with a named starter. Does not persist a preset id. */
export function applyTextIconsV3Preset(
  id: TextIconsV3PresetId,
  library: TextIconsV3PresetLibrary = bundledTextIconsV3Presets,
): TextIconsV3PreviewSettings {
  const preset = getTextIconsV3Preset(id, library)?.settings ?? library.entries[0]?.settings;
  if (!preset) return normalizeTextIconsV3PreviewSettings({});
  return normalizeTextIconsV3PreviewSettings(
    JSON.parse(JSON.stringify(preset)) as Partial<TextIconsV3PreviewSettings>,
  );
}
