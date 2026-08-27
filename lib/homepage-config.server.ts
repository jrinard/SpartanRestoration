import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  normalizeHomepageConfig,
  type HomepageConfig,
} from "@/lib/homepage-config";
import { readCurrentOrgId, readOrgHomepageConfig } from "@/lib/org/read-org.server";

const configPath = () => path.join(process.cwd(), "lib", "homepage-config.json");

async function readLegacyHomepageConfig(): Promise<HomepageConfig> {
  try {
    const raw = await readFile(configPath(), "utf8");
    return normalizeHomepageConfig(JSON.parse(raw));
  } catch {
    return normalizeHomepageConfig({});
  }
}

export async function readHomepageConfig(): Promise<HomepageConfig> {
  const orgId = await readCurrentOrgId();
  const orgConfig = await readOrgHomepageConfig(orgId);
  if (orgConfig.sections.length > 0) {
    return orgConfig;
  }
  return readLegacyHomepageConfig();
}
