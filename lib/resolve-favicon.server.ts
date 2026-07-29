import {
  normalizeFaviconPreviewSettings,
  type FaviconPreviewSettings,
} from "@/lib/favicon-preview";
import { normalizeHomepageConfig, type HomepageConfig } from "@/lib/homepage-config";
import { readHomepageConfig } from "@/lib/homepage-config.server";
import { readFile } from "node:fs/promises";
import path from "node:path";

const stagingConfigPath = () =>
  path.join(process.cwd(), "lib", "homepage-staging-config.json");

function faviconFromConfig(config: HomepageConfig): FaviconPreviewSettings | undefined {
  const favicon = config.previewSettings?.favicon;
  if (!favicon) return undefined;
  return normalizeFaviconPreviewSettings(favicon);
}

async function readStagingFaviconSettings(): Promise<FaviconPreviewSettings | undefined> {
  try {
    const raw = await readFile(stagingConfigPath(), "utf8");
    return faviconFromConfig(normalizeHomepageConfig(JSON.parse(raw)));
  } catch {
    return undefined;
  }
}

export async function readPublishedFaviconSettings(): Promise<FaviconPreviewSettings> {
  const fromPublished = faviconFromConfig(await readHomepageConfig());
  if (fromPublished) return fromPublished;

  return normalizeFaviconPreviewSettings(undefined);
}

export async function readEffectiveFaviconSettings(options?: {
  preferStaging?: boolean;
}): Promise<FaviconPreviewSettings> {
  if (options?.preferStaging) {
    const fromStaging = await readStagingFaviconSettings();
    if (fromStaging) return fromStaging;
  }

  return readPublishedFaviconSettings();
}
