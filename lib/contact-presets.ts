import { siteConfig } from "@/config/site";
import bundledContactPresetLibrary from "@/lib/contact-preset-library.json";
import {
  normalizeContactPreviewSettings,
  type ContactPreviewSettings,
} from "@/lib/contact-preview-storage";
import { phoneTelHref } from "@/lib/phone";

export type ContactPresetId = string;

export type ContactPresetEntry = {
  id: ContactPresetId;
  label: string;
  settings: ContactPreviewSettings;
};

export type ContactPresetLibrary = {
  entries: ContactPresetEntry[];
};

export function slugifyContactPresetId(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function isContactPresetId(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim());
}

export function labelForContactPresetId(id: string): string {
  if (id === "lifespring") return "LifeSpring";
  if (id === "langham") return "Langham";
  return id
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function entryFromUnknown(value: unknown, fallbackId: string): ContactPresetEntry | null {
  if (!value || typeof value !== "object") return null;
  const record = value as { id?: unknown; label?: unknown; settings?: unknown };
  const id =
    typeof record.id === "string" && isContactPresetId(record.id) ? record.id : fallbackId;
  if (!isContactPresetId(id)) return null;
  const settingsSource =
    record.settings && typeof record.settings === "object" ? record.settings : value;
  return {
    id,
    label:
      typeof record.label === "string" && record.label.trim()
        ? record.label.trim()
        : labelForContactPresetId(id),
    settings: normalizeContactPreviewSettings(settingsSource as Partial<ContactPreviewSettings>),
  };
}

export function normalizeContactPresetLibrary(value: unknown): ContactPresetLibrary {
  const fallback = { entries: [] as ContactPresetEntry[] };
  if (!value || typeof value !== "object") {
    return normalizeContactPresetLibrary(bundledContactPresetLibrary);
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
  if (value !== bundledContactPresetLibrary) {
    return normalizeContactPresetLibrary(bundledContactPresetLibrary);
  }
  return fallback;
}

export const bundledContactPresets = normalizeContactPresetLibrary(bundledContactPresetLibrary);

export function listContactPresets(
  library: ContactPresetLibrary = bundledContactPresets,
): ContactPresetEntry[] {
  return library.entries;
}

export function getContactPreset(
  id: string,
  library: ContactPresetLibrary = bundledContactPresets,
): ContactPresetEntry | undefined {
  return library.entries.find((entry) => entry.id === id);
}

function cloneContactSettings(settings: ContactPreviewSettings): ContactPreviewSettings {
  return normalizeContactPreviewSettings(
    JSON.parse(JSON.stringify(settings)) as Partial<ContactPreviewSettings>,
  );
}

/** Replace this instance's contact form with a named starter. Does not persist a preset id. */
export function applyContactPreset(
  id: ContactPresetId,
  library: ContactPresetLibrary = bundledContactPresets,
): ContactPreviewSettings {
  const preset = getContactPreset(id, library)?.settings ?? library.entries[0]?.settings;
  if (!preset) return normalizeContactPreviewSettings({});

  const phone = siteConfig.phone.trim();
  return normalizeContactPreviewSettings({
    ...cloneContactSettings(preset),
    contentPhoneLabel: phone,
    contentPhoneHref: phone ? phoneTelHref(phone) : "",
  });
}
