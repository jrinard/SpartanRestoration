import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  isHeaderV1PresetId,
  labelForHeaderV1PresetId,
  normalizeHeaderV1PresetLibrary,
  type HeaderV1PresetLibrary,
} from "@/lib/header-v1-presets";
import type { HeaderV3PreviewSettings } from "@/lib/header-v3-gradient";
import { normalizeHeaderV3PreviewSettings } from "@/lib/header-v3-storage";

const libraryPath = () => path.join(process.cwd(), "lib", "header-v1-preset-library.json");

export async function readHeaderV1PresetLibrary(): Promise<HeaderV1PresetLibrary> {
  try {
    const raw = await readFile(libraryPath(), "utf8");
    return normalizeHeaderV1PresetLibrary(JSON.parse(raw));
  } catch {
    return normalizeHeaderV1PresetLibrary(undefined);
  }
}

export async function writeHeaderV1Preset(input: {
  id: string;
  label?: string;
  settings: HeaderV3PreviewSettings;
}): Promise<HeaderV1PresetLibrary> {
  if (!isHeaderV1PresetId(input.id)) {
    throw new Error("Invalid preset id.");
  }

  const library = await readHeaderV1PresetLibrary();
  const settings = normalizeHeaderV3PreviewSettings(input.settings);
  const label =
    input.label?.trim() ||
    library.entries.find((entry) => entry.id === input.id)?.label ||
    labelForHeaderV1PresetId(input.id);
  const next: HeaderV1PresetLibrary = {
    entries: library.entries.some((entry) => entry.id === input.id)
      ? library.entries.map((entry) =>
          entry.id === input.id ? { ...entry, label, settings } : entry,
        )
      : [...library.entries, { id: input.id, label, settings }],
  };

  await writeFile(libraryPath(), `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return next;
}
