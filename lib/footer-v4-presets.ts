import { siteConfig } from "@/config/site";
import bundledFooterV4PresetLibrary from "@/lib/footer-v4-preset-library.json";
import {
  normalizeFooterV4PreviewSettings,
  type FooterV4PreviewSettings,
} from "@/lib/footer-v4-preview-storage";

export type FooterV4PresetId = string;

export type FooterV4PresetEntry = {
  id: FooterV4PresetId;
  label: string;
  settings: FooterV4PreviewSettings;
};

export type FooterV4PresetLibrary = {
  entries: FooterV4PresetEntry[];
};

export function slugifyFooterV4PresetId(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function isFooterV4PresetId(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim());
}

export function labelForFooterV4PresetId(id: string): string {
  if (id === "ospressure") return "OS Pressure";
  if (id === "langham") return "Langham";
  return id
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function entryFromUnknown(value: unknown, fallbackId: string): FooterV4PresetEntry | null {
  if (!value || typeof value !== "object") return null;
  const record = value as { id?: unknown; label?: unknown; settings?: unknown };
  const id =
    typeof record.id === "string" && isFooterV4PresetId(record.id) ? record.id : fallbackId;
  if (!isFooterV4PresetId(id)) return null;
  const settingsSource =
    record.settings && typeof record.settings === "object" ? record.settings : value;
  return {
    id,
    label:
      typeof record.label === "string" && record.label.trim()
        ? record.label.trim()
        : labelForFooterV4PresetId(id),
    settings: normalizeFooterV4PreviewSettings(settingsSource as Partial<FooterV4PreviewSettings>),
  };
}

export function normalizeFooterV4PresetLibrary(value: unknown): FooterV4PresetLibrary {
  const fallback = { entries: [] as FooterV4PresetEntry[] };
  if (!value || typeof value !== "object") {
    return normalizeFooterV4PresetLibrary(bundledFooterV4PresetLibrary);
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
  if (value !== bundledFooterV4PresetLibrary) {
    return normalizeFooterV4PresetLibrary(bundledFooterV4PresetLibrary);
  }
  return fallback;
}

export const bundledFooterV4Presets = normalizeFooterV4PresetLibrary(bundledFooterV4PresetLibrary);

export function listFooterV4Presets(
  library: FooterV4PresetLibrary = bundledFooterV4Presets,
): FooterV4PresetEntry[] {
  return library.entries;
}

export function getFooterV4Preset(
  id: string,
  library: FooterV4PresetLibrary = bundledFooterV4Presets,
): FooterV4PresetEntry | undefined {
  return library.entries.find((entry) => entry.id === id);
}

function cloneFooterV4Settings(settings: FooterV4PreviewSettings): FooterV4PreviewSettings {
  return normalizeFooterV4PreviewSettings(
    JSON.parse(JSON.stringify(settings)) as Partial<FooterV4PreviewSettings>,
  );
}

/** Replace this instance's footer with a named starter. Does not persist a preset id. */
export function applyFooterV4Preset(
  id: FooterV4PresetId,
  library: FooterV4PresetLibrary = bundledFooterV4Presets,
): FooterV4PreviewSettings {
  const preset = getFooterV4Preset(id, library)?.settings ?? library.entries[0]?.settings;
  if (!preset) return normalizeFooterV4PreviewSettings({});

  return normalizeFooterV4PreviewSettings({
    ...cloneFooterV4Settings(preset),
    contentPhone: siteConfig.phone,
    contentEmail: siteConfig.email,
  });
}
