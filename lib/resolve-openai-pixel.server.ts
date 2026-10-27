import {
  getActiveOpenAiPixelId,
  normalizeOpenAiPixelPreviewSettings,
  type OpenAiPixelPreviewSettings,
} from "@/lib/openai-pixel-preview";
import { normalizeHomepageConfig, type HomepageConfig } from "@/lib/homepage-config";
import { readHomepageConfig } from "@/lib/homepage-config.server";
import { readFile } from "node:fs/promises";
import path from "node:path";

const stagingConfigPath = () =>
  path.join(process.cwd(), "lib", "homepage-staging-config.json");

function openAiPixelFromConfig(config: HomepageConfig): OpenAiPixelPreviewSettings | undefined {
  const openaiPixel = config.previewSettings?.openaiPixel;
  if (!openaiPixel) return undefined;
  return normalizeOpenAiPixelPreviewSettings(openaiPixel);
}

async function readStagingOpenAiPixelSettings(): Promise<
  OpenAiPixelPreviewSettings | undefined
> {
  try {
    const raw = await readFile(stagingConfigPath(), "utf8");
    return openAiPixelFromConfig(normalizeHomepageConfig(JSON.parse(raw)));
  } catch {
    return undefined;
  }
}

export async function readPublishedOpenAiPixelSettings(): Promise<OpenAiPixelPreviewSettings | null> {
  const fromPublished = openAiPixelFromConfig(await readHomepageConfig());
  if (fromPublished) return fromPublished;
  return null;
}

export async function readEffectiveOpenAiPixelSettings(options?: {
  preferStaging?: boolean;
}): Promise<OpenAiPixelPreviewSettings | null> {
  if (options?.preferStaging) {
    const fromStaging = await readStagingOpenAiPixelSettings();
    if (fromStaging) return fromStaging;
  }
  return readPublishedOpenAiPixelSettings();
}

export async function readActiveOpenAiPixelId(options?: {
  preferStaging?: boolean;
}): Promise<string | null> {
  const settings = await readEffectiveOpenAiPixelSettings(options);
  return getActiveOpenAiPixelId(settings);
}
