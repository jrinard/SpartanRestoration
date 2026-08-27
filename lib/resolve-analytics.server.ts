import {
  getActiveGaMeasurementId,
  normalizeAnalyticsPreviewSettings,
  type AnalyticsPreviewSettings,
} from "@/lib/analytics-preview";
import { normalizeHomepageConfig, type HomepageConfig } from "@/lib/homepage-config";
import { readHomepageConfig } from "@/lib/homepage-config.server";
import { readFile } from "node:fs/promises";
import path from "node:path";

const stagingConfigPath = () =>
  path.join(process.cwd(), "lib", "homepage-staging-config.json");

function analyticsFromConfig(config: HomepageConfig): AnalyticsPreviewSettings | undefined {
  const analytics = config.previewSettings?.analytics;
  if (!analytics) return undefined;
  return normalizeAnalyticsPreviewSettings(analytics);
}

async function readStagingAnalyticsSettings(): Promise<AnalyticsPreviewSettings | undefined> {
  try {
    const raw = await readFile(stagingConfigPath(), "utf8");
    return analyticsFromConfig(normalizeHomepageConfig(JSON.parse(raw)));
  } catch {
    return undefined;
  }
}

export async function readPublishedAnalyticsSettings(): Promise<AnalyticsPreviewSettings | null> {
  const fromPublished = analyticsFromConfig(await readHomepageConfig());
  if (fromPublished) return fromPublished;

  return null;
}

export async function readEffectiveAnalyticsSettings(options?: {
  preferStaging?: boolean;
}): Promise<AnalyticsPreviewSettings | null> {
  if (options?.preferStaging) {
    const fromStaging = await readStagingAnalyticsSettings();
    if (fromStaging) return fromStaging;
  }

  return readPublishedAnalyticsSettings();
}

export async function readActiveGaMeasurementId(options?: {
  preferStaging?: boolean;
}): Promise<string | null> {
  const settings = await readEffectiveAnalyticsSettings(options);
  return getActiveGaMeasurementId(settings);
}
