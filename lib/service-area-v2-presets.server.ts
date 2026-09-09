import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import {
  isServiceAreaV2PresetId,
  labelForServiceAreaV2PresetId,
  normalizeServiceAreaV2PresetLibrary,
  type ServiceAreaV2PresetLibrary,
} from "@/lib/service-area-v2-presets";
import { normalizeServiceAreaV2PreviewSettings } from "@/lib/service-area-v2-preview-storage";

const libraryPath = () => path.join(process.cwd(), "lib", "service-area-v2-preset-library.json");

export async function readServiceAreaV2PresetLibrary(): Promise<ServiceAreaV2PresetLibrary> {
  try {
    const raw = await readFile(libraryPath(), "utf8");
    return normalizeServiceAreaV2PresetLibrary(JSON.parse(raw));
  } catch {
    return normalizeServiceAreaV2PresetLibrary(undefined);
  }
}

export async function writeServiceAreaV2Preset(input: {
  id: string;
  label?: string;
  settings: ReturnType<typeof normalizeServiceAreaV2PreviewSettings>;
}): Promise<ServiceAreaV2PresetLibrary> {
  if (!isServiceAreaV2PresetId(input.id)) {
    throw new Error("Invalid preset id.");
  }

  const library = await readServiceAreaV2PresetLibrary();
  const label =
    input.label?.trim() ||
    library.entries.find((entry) => entry.id === input.id)?.label ||
    labelForServiceAreaV2PresetId(input.id);
  const next: ServiceAreaV2PresetLibrary = {
    entries: [
      ...library.entries.filter((entry) => entry.id !== input.id),
      {
        id: input.id,
        label,
        settings: normalizeServiceAreaV2PreviewSettings(input.settings),
      },
    ],
  };

  await mkdir(path.dirname(libraryPath()), { recursive: true });
  await writeFile(libraryPath(), `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return next;
}
