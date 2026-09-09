import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  isServiceAreaV1PresetId,
  labelForServiceAreaV1PresetId,
  normalizeServiceAreaV1PresetLibrary,
  type ServiceAreaV1PresetLibrary,
} from "@/lib/service-area-v1-presets";
import type { ServiceAreaV1PreviewSettings } from "@/lib/service-area-preview";
import { normalizeServiceAreaV1PreviewSettings } from "@/lib/service-area-preview-storage";

const libraryPath = () => path.join(process.cwd(), "lib", "service-area-v1-preset-library.json");

export async function readServiceAreaV1PresetLibrary(): Promise<ServiceAreaV1PresetLibrary> {
  try {
    const raw = await readFile(libraryPath(), "utf8");
    return normalizeServiceAreaV1PresetLibrary(JSON.parse(raw));
  } catch {
    return normalizeServiceAreaV1PresetLibrary(undefined);
  }
}

export async function writeServiceAreaV1Preset(input: {
  id: string;
  label?: string;
  settings: ServiceAreaV1PreviewSettings;
}): Promise<ServiceAreaV1PresetLibrary> {
  if (!isServiceAreaV1PresetId(input.id)) {
    throw new Error("Invalid preset id.");
  }

  const library = await readServiceAreaV1PresetLibrary();
  const settings = normalizeServiceAreaV1PreviewSettings(input.settings);
  const label =
    input.label?.trim() ||
    library.entries.find((entry) => entry.id === input.id)?.label ||
    labelForServiceAreaV1PresetId(input.id);
  const next: ServiceAreaV1PresetLibrary = {
    entries: library.entries.some((entry) => entry.id === input.id)
      ? library.entries.map((entry) =>
          entry.id === input.id ? { ...entry, label, settings } : entry,
        )
      : [...library.entries, { id: input.id, label, settings }],
  };

  await writeFile(libraryPath(), `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return next;
}
