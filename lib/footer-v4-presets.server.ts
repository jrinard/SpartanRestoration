import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  isFooterV4PresetId,
  labelForFooterV4PresetId,
  normalizeFooterV4PresetLibrary,
  type FooterV4PresetLibrary,
} from "@/lib/footer-v4-presets";
import {
  normalizeFooterV4PreviewSettings,
  type FooterV4PreviewSettings,
} from "@/lib/footer-v4-preview-storage";

const libraryPath = () => path.join(process.cwd(), "lib", "footer-v4-preset-library.json");

export async function readFooterV4PresetLibrary(): Promise<FooterV4PresetLibrary> {
  try {
    const raw = await readFile(libraryPath(), "utf8");
    return normalizeFooterV4PresetLibrary(JSON.parse(raw));
  } catch {
    return normalizeFooterV4PresetLibrary(undefined);
  }
}

export async function writeFooterV4Preset(input: {
  id: string;
  label?: string;
  settings: FooterV4PreviewSettings;
}): Promise<FooterV4PresetLibrary> {
  if (!isFooterV4PresetId(input.id)) {
    throw new Error("Invalid preset id.");
  }

  const library = await readFooterV4PresetLibrary();
  const settings = normalizeFooterV4PreviewSettings(input.settings);
  const label =
    input.label?.trim() ||
    library.entries.find((entry) => entry.id === input.id)?.label ||
    labelForFooterV4PresetId(input.id);
  const next: FooterV4PresetLibrary = {
    entries: library.entries.some((entry) => entry.id === input.id)
      ? library.entries.map((entry) =>
          entry.id === input.id ? { ...entry, label, settings } : entry,
        )
      : [...library.entries, { id: input.id, label, settings }],
  };

  await writeFile(libraryPath(), `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return next;
}
