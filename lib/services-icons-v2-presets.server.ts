import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  isServicesIconsV2PresetId,
  labelForServicesIconsV2PresetId,
  normalizeServicesIconsV2PresetLibrary,
  type ServicesIconsV2PresetLibrary,
} from "@/lib/services-icons-v2-presets";
import {
  normalizeServicesIconsV2PreviewSettings,
  type ServicesIconsV2PreviewSettings,
} from "@/lib/services-icons-v2-preview-storage";

const libraryPath = () => path.join(process.cwd(), "lib", "services-icons-v2-preset-library.json");

export async function readServicesIconsV2PresetLibrary(): Promise<ServicesIconsV2PresetLibrary> {
  try {
    const raw = await readFile(libraryPath(), "utf8");
    return normalizeServicesIconsV2PresetLibrary(JSON.parse(raw));
  } catch {
    return normalizeServicesIconsV2PresetLibrary(undefined);
  }
}

export async function writeServicesIconsV2Preset(input: {
  id: string;
  label?: string;
  settings: ServicesIconsV2PreviewSettings;
}): Promise<ServicesIconsV2PresetLibrary> {
  if (!isServicesIconsV2PresetId(input.id)) {
    throw new Error("Invalid preset id.");
  }

  const library = await readServicesIconsV2PresetLibrary();
  const settings = normalizeServicesIconsV2PreviewSettings(input.settings);
  const label =
    input.label?.trim() ||
    library.entries.find((entry) => entry.id === input.id)?.label ||
    labelForServicesIconsV2PresetId(input.id);
  const next: ServicesIconsV2PresetLibrary = {
    entries: library.entries.some((entry) => entry.id === input.id)
      ? library.entries.map((entry) =>
          entry.id === input.id ? { ...entry, label, settings } : entry,
        )
      : [...library.entries, { id: input.id, label, settings }],
  };

  await writeFile(libraryPath(), `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return next;
}
