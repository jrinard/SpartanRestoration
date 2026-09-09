import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  isTextIconsV3PresetId,
  labelForTextIconsV3PresetId,
  normalizeTextIconsV3PresetLibrary,
  type TextIconsV3PresetLibrary,
} from "@/lib/text-icons-v3-presets";
import {
  normalizeTextIconsV3PreviewSettings,
  type TextIconsV3PreviewSettings,
} from "@/lib/text-icons-v3-preview-storage";

const libraryPath = () => path.join(process.cwd(), "lib", "text-icons-v3-preset-library.json");

export async function readTextIconsV3PresetLibrary(): Promise<TextIconsV3PresetLibrary> {
  try {
    const raw = await readFile(libraryPath(), "utf8");
    return normalizeTextIconsV3PresetLibrary(JSON.parse(raw));
  } catch {
    return normalizeTextIconsV3PresetLibrary(undefined);
  }
}

export async function writeTextIconsV3Preset(input: {
  id: string;
  label?: string;
  settings: TextIconsV3PreviewSettings;
}): Promise<TextIconsV3PresetLibrary> {
  if (!isTextIconsV3PresetId(input.id)) {
    throw new Error("Invalid preset id.");
  }

  const library = await readTextIconsV3PresetLibrary();
  const settings = normalizeTextIconsV3PreviewSettings(input.settings);
  const label =
    input.label?.trim() ||
    library.entries.find((entry) => entry.id === input.id)?.label ||
    labelForTextIconsV3PresetId(input.id);
  const next: TextIconsV3PresetLibrary = {
    entries: library.entries.some((entry) => entry.id === input.id)
      ? library.entries.map((entry) =>
          entry.id === input.id ? { ...entry, label, settings } : entry,
        )
      : [...library.entries, { id: input.id, label, settings }],
  };

  await writeFile(libraryPath(), `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return next;
}
