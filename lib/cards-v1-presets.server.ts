import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  isCardsV1PresetId,
  labelForCardsV1PresetId,
  normalizeCardsV1PresetLibrary,
  type CardsV1PresetLibrary,
} from "@/lib/cards-v1-presets";
import {
  normalizeCardsV1PreviewSettings,
  type CardsV1PreviewSettings,
} from "@/lib/cards-v1-preview-storage";

const libraryPath = () => path.join(process.cwd(), "lib", "cards-v1-preset-library.json");

export async function readCardsV1PresetLibrary(): Promise<CardsV1PresetLibrary> {
  try {
    const raw = await readFile(libraryPath(), "utf8");
    return normalizeCardsV1PresetLibrary(JSON.parse(raw));
  } catch {
    return normalizeCardsV1PresetLibrary(undefined);
  }
}

export async function writeCardsV1Preset(input: {
  id: string;
  label?: string;
  settings: CardsV1PreviewSettings;
}): Promise<CardsV1PresetLibrary> {
  if (!isCardsV1PresetId(input.id)) {
    throw new Error("Invalid preset id.");
  }

  const library = await readCardsV1PresetLibrary();
  const settings = normalizeCardsV1PreviewSettings(input.settings);
  const label =
    input.label?.trim() ||
    library.entries.find((entry) => entry.id === input.id)?.label ||
    labelForCardsV1PresetId(input.id);
  const next: CardsV1PresetLibrary = {
    entries: library.entries.some((entry) => entry.id === input.id)
      ? library.entries.map((entry) =>
          entry.id === input.id ? { ...entry, label, settings } : entry,
        )
      : [...library.entries, { id: input.id, label, settings }],
  };

  await writeFile(libraryPath(), `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return next;
}
