import { getContactLeadTo } from "@/lib/email-config";
import { isValidLeadToEmail } from "@/lib/contact-preview";
import { normalizeHomepageConfig, type HomepageConfig } from "@/lib/homepage-config";
import { readHomepageConfig } from "@/lib/homepage-config.server";
import { readFile } from "node:fs/promises";
import path from "node:path";

const stagingConfigPath = () =>
  path.join(process.cwd(), "lib", "homepage-staging-config.json");

function leadToFromConfig(config: HomepageConfig): string | undefined {
  const email = config.previewSettings?.contact?.leadToEmail?.trim();
  if (!email || !isValidLeadToEmail(email)) return undefined;
  return email;
}

async function readStagingLeadToEmail(): Promise<string | undefined> {
  try {
    const raw = await readFile(stagingConfigPath(), "utf8");
    return leadToFromConfig(normalizeHomepageConfig(JSON.parse(raw)));
  } catch {
    return undefined;
  }
}

/** Resolve lead inbox — published config, env/site, then staging (dev only). */
export async function resolveContactLeadTo(clientOverride?: string): Promise<string> {
  const fromPublished = leadToFromConfig(await readHomepageConfig());
  if (fromPublished) return fromPublished;

  if (process.env.NODE_ENV === "development") {
    const fromStaging = await readStagingLeadToEmail();
    if (fromStaging) return fromStaging;

    const client = clientOverride?.trim();
    if (client && isValidLeadToEmail(client)) return client;
  }

  return getContactLeadTo();
}
