import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  isHeroV4PresetId,
  labelForHeroV4PresetId,
  normalizeHeroV4PresetLibrary,
  type HeroV4PresetLibrary,
} from "@/lib/hero-v4-presets";
import { normalizeHeroV4PreviewSettings, type HeroV4PreviewSettings } from "@/lib/hero-v4-preview";

const libraryPath = () => path.join(process.cwd(), "lib", "hero-v4-preset-library.json");

export async function readHeroV4PresetLibrary(): Promise<HeroV4PresetLibrary> {
  try {
    const raw = await readFile(libraryPath(), "utf8");
    return normalizeHeroV4PresetLibrary(JSON.parse(raw));
  } catch {
    return normalizeHeroV4PresetLibrary(undefined);
  }
}

export async function writeHeroV4Preset(input: {
  id: string;
  label?: string;
  settings: HeroV4PreviewSettings;
}): Promise<HeroV4PresetLibrary> {
  if (!isHeroV4PresetId(input.id)) {
    throw new Error("Invalid preset id.");
  }

  const library = await readHeroV4PresetLibrary();
  const settings = normalizeHeroV4PreviewSettings(input.settings);
  const label =
    input.label?.trim() ||
    library.entries.find((entry) => entry.id === input.id)?.label ||
    labelForHeroV4PresetId(input.id);
  const next: HeroV4PresetLibrary = {
    entries: library.entries.some((entry) => entry.id === input.id)
      ? library.entries.map((entry) =>
          entry.id === input.id ? { ...entry, label, settings } : entry,
        )
      : [...library.entries, { id: input.id, label, settings }],
  };

  await writeFile(libraryPath(), `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return next;
}
