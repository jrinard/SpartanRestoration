import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  isFlipCardsPresetId,
  labelForFlipCardsPresetId,
  normalizeFlipCardsPresetLibrary,
  type FlipCardsPresetLibrary,
} from "@/lib/flip-cards-presets";
import {
  normalizeFlipCardsPreviewSettings,
  type FlipCardsPreviewSettings,
} from "@/lib/flip-cards-preview";

const libraryPath = () => path.join(process.cwd(), "lib", "flip-cards-preset-library.json");

export async function readFlipCardsPresetLibrary(): Promise<FlipCardsPresetLibrary> {
  try {
    const raw = await readFile(libraryPath(), "utf8");
    return normalizeFlipCardsPresetLibrary(JSON.parse(raw));
  } catch {
    return normalizeFlipCardsPresetLibrary(undefined);
  }
}

export async function writeFlipCardsPreset(input: {
  id: string;
  label?: string;
  settings: FlipCardsPreviewSettings;
}): Promise<FlipCardsPresetLibrary> {
  if (!isFlipCardsPresetId(input.id)) {
    throw new Error("Invalid preset id.");
  }

  const library = await readFlipCardsPresetLibrary();
  const settings = normalizeFlipCardsPreviewSettings(input.settings);
  const label =
    input.label?.trim() ||
    library.entries.find((entry) => entry.id === input.id)?.label ||
    labelForFlipCardsPresetId(input.id);
  const next: FlipCardsPresetLibrary = {
    entries: library.entries.some((entry) => entry.id === input.id)
      ? library.entries.map((entry) =>
          entry.id === input.id ? { ...entry, label, settings } : entry,
        )
      : [...library.entries, { id: input.id, label, settings }],
  };

  await writeFile(libraryPath(), `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return next;
}
