import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  normalizeHomepageConfig,
  type HomepageConfig,
} from "@/lib/homepage-config";
import { readHomepageConfig } from "@/lib/homepage-config.server";

export type StagingPreviewSource = "staging" | "published";

export type ResolvedStagingPreviewConfig = {
  config: HomepageConfig;
  source: StagingPreviewSource;
};

const stagingConfigPath = () =>
  path.join(process.cwd(), "lib", "homepage-staging-config.json");

async function readStagingConfigFile(): Promise<HomepageConfig | null> {
  try {
    const raw = await readFile(stagingConfigPath(), "utf8");
    const config = normalizeHomepageConfig(JSON.parse(raw));
    return config.sections.length > 0 ? config : null;
  } catch {
    return null;
  }
}

/** Config for `/preview` — staged draft first, then last published homepage. */
export async function resolveStagingPreviewConfig(): Promise<ResolvedStagingPreviewConfig | null> {
  return resolveStagingPreviewPageConfig();
}

/** Resolve staged layout for home (`/preview`) or a slug (`/preview/[slug]`). */
export async function resolveStagingPreviewPageConfig(
  slug?: string,
): Promise<ResolvedStagingPreviewConfig | null> {
  const staged = await readStagingConfigFile();
  const base = staged ?? (await readHomepageConfig());
  const source: StagingPreviewSource = staged ? "staging" : "published";

  if (!slug) {
    if (base.sections.length === 0) return null;
    return { config: base, source };
  }

  const page = base.pages?.find((entry) => entry.slug === slug);
  if (!page || page.sections.length === 0) return null;

  return {
    config: {
      ...base,
      sections: page.sections,
    },
    source,
  };
}
