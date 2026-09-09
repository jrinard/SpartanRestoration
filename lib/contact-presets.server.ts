import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  isContactPresetId,
  labelForContactPresetId,
  normalizeContactPresetLibrary,
  type ContactPresetLibrary,
} from "@/lib/contact-presets";
import {
  normalizeContactPreviewSettings,
  type ContactPreviewSettings,
} from "@/lib/contact-preview-storage";

const libraryPath = () => path.join(process.cwd(), "lib", "contact-preset-library.json");

export async function readContactPresetLibrary(): Promise<ContactPresetLibrary> {
  try {
    const raw = await readFile(libraryPath(), "utf8");
    return normalizeContactPresetLibrary(JSON.parse(raw));
  } catch {
    return normalizeContactPresetLibrary(undefined);
  }
}

export async function writeContactPreset(input: {
  id: string;
  label?: string;
  settings: ContactPreviewSettings;
}): Promise<ContactPresetLibrary> {
  if (!isContactPresetId(input.id)) {
    throw new Error("Invalid preset id.");
  }

  const library = await readContactPresetLibrary();
  const settings = normalizeContactPreviewSettings(input.settings);
  const label =
    input.label?.trim() ||
    library.entries.find((entry) => entry.id === input.id)?.label ||
    labelForContactPresetId(input.id);
  const next: ContactPresetLibrary = {
    entries: library.entries.some((entry) => entry.id === input.id)
      ? library.entries.map((entry) =>
          entry.id === input.id ? { ...entry, label, settings } : entry,
        )
      : [...library.entries, { id: input.id, label, settings }],
  };

  await writeFile(libraryPath(), `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return next;
}
