import {
  normalizeFaviconPreviewSettings,
  type FaviconPreviewSettings,
} from "@/lib/favicon-preview";
import { normalizeHomepageConfig, type HomepageConfig } from "@/lib/homepage-config";
import { readHomepageConfig } from "@/lib/homepage-config.server";
import {
  readCurrentOrgId,
  readOrgHomepageConfig,
  readOrgSite,
  readOrgStagingConfig,
} from "@/lib/org/read-org.server";
import type { SiteConfigData } from "@/lib/org/types";
import { readFile } from "node:fs/promises";
import path from "node:path";

const stagingConfigPath = () =>
  path.join(process.cwd(), "lib", "homepage-staging-config.json");

function faviconFromConfig(config: HomepageConfig): FaviconPreviewSettings | undefined {
  const favicon = config.previewSettings?.favicon;
  if (!favicon) return undefined;
  return normalizeFaviconPreviewSettings(favicon);
}

function faviconFromSite(site: SiteConfigData): FaviconPreviewSettings {
  return normalizeFaviconPreviewSettings({
    browserTitle: site.name,
    favicon32: site.assets.favicon,
    favicon180: site.assets.appleTouchIcon,
  });
}

async function readLegacyStagingFaviconSettings(): Promise<FaviconPreviewSettings | undefined> {
  try {
    const raw = await readFile(stagingConfigPath(), "utf8");
    return faviconFromConfig(normalizeHomepageConfig(JSON.parse(raw)));
  } catch {
    return undefined;
  }
}

/** Published favicon for the current org — works even when homepage sections are empty. */
export async function readPublishedFaviconSettings(): Promise<FaviconPreviewSettings> {
  const orgId = await readCurrentOrgId();
  const [orgHomepage, site] = await Promise.all([
    readOrgHomepageConfig(orgId),
    readOrgSite(orgId),
  ]);

  const fromOrgHomepage = faviconFromConfig(orgHomepage);
  if (fromOrgHomepage) return fromOrgHomepage;

  if (site.assets.favicon.trim() || site.assets.appleTouchIcon.trim()) {
    return faviconFromSite(site);
  }

  const fromPublished = faviconFromConfig(await readHomepageConfig());
  if (fromPublished) return fromPublished;

  return faviconFromSite(site);
}

export async function readEffectiveFaviconSettings(options?: {
  preferStaging?: boolean;
}): Promise<FaviconPreviewSettings> {
  if (options?.preferStaging) {
    const orgId = await readCurrentOrgId();
    const staged = await readOrgStagingConfig(orgId);
    const fromOrgStaging = staged ? faviconFromConfig(staged) : undefined;
    if (fromOrgStaging) return fromOrgStaging;

    const fromLegacyStaging = await readLegacyStagingFaviconSettings();
    if (fromLegacyStaging) return fromLegacyStaging;
  }

  return readPublishedFaviconSettings();
}
