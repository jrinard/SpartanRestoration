import type { HomepageConfig } from "@/lib/homepage-config";
import { readCurrentOrgId, readOrgStagingConfig } from "@/lib/org/read-org.server";
import { withServiceAreaLocationPageConfig } from "@/lib/service-area-location-pages";
import { findHomepagePageByLocationSlug } from "@/lib/service-area-pages";

export type StagingPreviewSource = "staging";

export type ResolvedStagingPreviewConfig = {
  config: HomepageConfig;
  source: StagingPreviewSource;
};

/** Staged draft only — no published or legacy fallback. */
async function readStagingConfigFile(): Promise<HomepageConfig | null> {
  const orgId = await readCurrentOrgId();
  return readOrgStagingConfig(orgId);
}

/** Config for `/preview` — staged sections only. */
export async function resolveStagingPreviewConfig(): Promise<ResolvedStagingPreviewConfig | null> {
  return resolveStagingPreviewPageConfig();
}

/** Resolve staged layout for home (`/preview`) or a path (`/preview/[...slug]`). */
export async function resolveStagingPreviewPageConfig(
  slug?: string,
): Promise<ResolvedStagingPreviewConfig | null> {
  const staged = await readStagingConfigFile();
  if (!staged) return null;

  if (!slug) {
    if (staged.sections.length === 0) return null;
    return { config: staged, source: "staging" };
  }

  const locationConfig = withServiceAreaLocationPageConfig(staged, slug);
  if (locationConfig) {
    return { config: locationConfig, source: "staging" };
  }

  const page =
    findHomepagePageByLocationSlug(staged, slug) ??
    staged.pages?.find((entry) => entry.slug === slug);
  if (!page || page.sections.length === 0) return null;

  return {
    config: {
      ...staged,
      sections: page.sections,
    },
    source: "staging",
  };
}
