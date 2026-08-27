import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fallbackSiteConfig } from "@/config/site-data";
import { normalizeHomepageConfig, type HomepageConfig } from "@/lib/homepage-config";
import { defaultColorThemeId } from "@/lib/color-themes";
import { defaultFontThemeId } from "@/lib/creative-themes";
import type { AnalyticsPreviewSettings } from "@/lib/analytics-preview";
import { normalizeAnalyticsPreviewSettings } from "@/lib/analytics-preview";
import type { FaviconPreviewSettings } from "@/lib/favicon-preview";
import { normalizeFaviconPreviewSettings } from "@/lib/favicon-preview";
import { fillMissingSectionCopy } from "@/lib/org/migrate-section-copy";
import { normalizeHomepageConfigForSave, reconcileHomePageGlobalPreviewSettings } from "@/lib/home-preview-sync";
import { augmentHomepageConfigWithServiceAreaLocations } from "@/lib/service-area-location-pages";
import { ensureSeoRoutesForPages, rewriteLegacyAssetPathsInJson } from "@/lib/org/migrate-pillar";
import { isVisionRuntime } from "@/lib/org/vision-runtime";
import {
  currentOrgFile,
  isReservedOrgId,
  isSafeOrgId,
  orgDir,
  orgFile,
  orgHistoryDir,
  orgAssetsDir,
  orgSequenceFile,
  orgsRootDir,
} from "@/lib/org/paths";
import {
  orgSchemaVersion,
  type OrgContactFile,
  type OrgCurrentFile,
  type OrgListItem,
  type OrgMeta,
  type OrgPillar,
  type OrgSeoFile,
  type OrgThemeFile,
  type SiteConfigData,
} from "@/lib/org/types";
import { defaultOrgPolicies, normalizeOrgPolicies, type OrgPoliciesFile } from "@/lib/org/policies";

const defaultOrgId = "lsd";

/** 1×1 PNG so a new org’s `/org-assets/<id>/logo.png` does not 404. */
const PLACEHOLDER_LOGO_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

function isPositiveInt(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

/** Fresh org site defaults — asset paths always scoped to this org id (never LSD fallback paths). */
export function defaultSiteForOrg(orgId: string, name?: string): SiteConfigData {
  const trimmedName = name?.trim() || orgId;
  return {
    ...fallbackSiteConfig,
    name: trimmedName,
    domain: `${orgId}.example.com`,
    url: `https://${orgId}.example.com`,
    tagline: trimmedName,
    description: `${trimmedName} website.`,
    phone: "",
    email: "",
    assets: {
      logo: `/org-assets/${orgId}/logo.png`,
      logoWhite: `/org-assets/${orgId}/logo.png`,
      logoBlack: `/org-assets/${orgId}/logo.png`,
      logoColor: `/org-assets/${orgId}/logo.png`,
      ogImage: `/org-assets/${orgId}/logo.png`,
      favicon: `/org-assets/${orgId}/logo.png`,
      appleTouchIcon: `/org-assets/${orgId}/logo.png`,
      themeFolder: orgId,
    },
  };
}

function defaultOrgMeta(id: string, name: string, number: number): OrgMeta {
  return {
    schemaVersion: orgSchemaVersion,
    id,
    number,
    name,
    publish: {
      remoteUrl: "",
      remoteName: id,
      branch: "main",
      localPath: "",
    },
  };
}

function normalizeOrgMeta(id: string, stored: OrgMeta | null, fallbackNumber = 0): OrgMeta {
  const base = defaultOrgMeta(id, stored?.name || id, fallbackNumber);
  if (!stored) return base;

  return {
    ...base,
    ...stored,
    schemaVersion: orgSchemaVersion,
    id,
    number: isPositiveInt(stored.number) ? stored.number : fallbackNumber,
    name: stored.name?.trim() || id,
    publish: {
      remoteUrl: stored.publish?.remoteUrl ?? "",
      remoteName: stored.publish?.remoteName || id,
      branch: stored.publish?.branch || "main",
      localPath: stored.publish?.localPath?.trim() ?? "",
    },
  };
}

async function highestAssignedOrgNumber(): Promise<number> {
  try {
    const entries = await readdir(orgsRootDir(), { withFileTypes: true });
    let highest = 0;

    for (const entry of entries) {
      if (!entry.isDirectory() || !isSafeOrgId(entry.name)) continue;
      const meta = await readJsonFile<OrgMeta>(orgFile(entry.name, "org.json"));
      if (isPositiveInt(meta?.number) && meta.number > highest) {
        highest = meta.number;
      }
    }

    return highest;
  } catch {
    return 0;
  }
}

async function bumpOrgSequenceAfterAssign(assignedNumber: number): Promise<void> {
  const sequence = await readJsonFile<{ nextNumber?: unknown }>(orgSequenceFile());
  const fromSequence = isPositiveInt(sequence?.nextNumber) ? sequence.nextNumber : 1;
  const next = Math.max(fromSequence, assignedNumber + 1, (await highestAssignedOrgNumber()) + 1);
  await writeJsonFile(orgSequenceFile(), { nextNumber: next });
}

async function allocateOrgNumber(): Promise<number> {
  const sequence = await readJsonFile<{ nextNumber?: unknown }>(orgSequenceFile());
  const fromSequence = isPositiveInt(sequence?.nextNumber) ? sequence.nextNumber : 1;
  const next = Math.max(fromSequence, (await highestAssignedOrgNumber()) + 1);
  await bumpOrgSequenceAfterAssign(next);
  return next;
}

async function resolveOrgNumber(
  existing: OrgListItem[],
  requestedNumber?: number,
): Promise<number> {
  if (requestedNumber === undefined) {
    return allocateOrgNumber();
  }
  if (!isPositiveInt(requestedNumber)) {
    throw new Error("Organization number must be a positive integer.");
  }
  if (existing.some((org) => org.number === requestedNumber)) {
    throw new Error(`Organization number ${requestedNumber} is already assigned.`);
  }
  await bumpOrgSequenceAfterAssign(requestedNumber);
  return requestedNumber;
}

function defaultSeo(site: SiteConfigData): OrgSeoFile {
  return {
    schemaVersion: orgSchemaVersion,
    routes: {
      home: {
        title: site.name,
        description: site.description,
        path: "/",
        noIndex: true,
        ogImageAlt: `${site.name} logo`,
      },
    },
  };
}

function defaultTheme(): OrgThemeFile {
  return {
    schemaVersion: orgSchemaVersion,
    colorThemeId: defaultColorThemeId,
    fontThemeId: defaultFontThemeId,
  };
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function readCurrentOrgId(): Promise<string> {
  if (isVisionRuntime()) {
    const meta = await readJsonFile<OrgMeta>(orgFile("site", "org.json"));
    if (meta?.id) return meta.id;
    return defaultOrgId;
  }

  const current = await readJsonFile<OrgCurrentFile>(currentOrgFile());
  if (current?.orgId && isSafeOrgId(current.orgId)) {
    return current.orgId;
  }
  return defaultOrgId;
}

export async function writeCurrentOrgId(orgId: string): Promise<void> {
  if (!isSafeOrgId(orgId)) {
    throw new Error("Invalid organization id.");
  }
  await writeJsonFile(currentOrgFile(), { orgId } satisfies OrgCurrentFile);
}

export async function listOrgs(): Promise<OrgListItem[]> {
  if (isVisionRuntime()) {
    const meta = await readOrgMeta("site");
    return [{ id: meta.id, number: meta.number, name: meta.name }];
  }

  try {
    const entries = await readdir(orgsRootDir(), { withFileTypes: true });
    const orgs: OrgListItem[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory() || !isSafeOrgId(entry.name)) continue;
      const meta = await readJsonFile<OrgMeta>(orgFile(entry.name, "org.json"));
      orgs.push({
        id: entry.name,
        number: isPositiveInt(meta?.number) ? meta.number : 0,
        name: meta?.name || entry.name,
      });
    }

    return orgs.sort((a, b) => {
      if (a.number !== b.number) {
        if (a.number === 0) return 1;
        if (b.number === 0) return -1;
        return a.number - b.number;
      }
      return a.name.localeCompare(b.name);
    });
  } catch {
    return [];
  }
}

export async function readOrgMeta(orgId: string): Promise<OrgMeta> {
  const stored = await readJsonFile<OrgMeta>(orgFile(orgId, "org.json"));
  return normalizeOrgMeta(orgId, stored);
}

export async function readOrgSite(orgId: string): Promise<SiteConfigData> {
  const stored = await readJsonFile<SiteConfigData>(orgFile(orgId, "site.json"));
  if (stored) return stored;
  const meta = await readJsonFile<OrgMeta>(orgFile(orgId, "org.json"));
  return defaultSiteForOrg(orgId, meta?.name);
}

export async function readOrgSeo(orgId: string): Promise<OrgSeoFile> {
  const site = await readOrgSite(orgId);
  const stored = await readJsonFile<OrgSeoFile>(orgFile(orgId, "seo.json"));
  const seo = stored ?? defaultSeo(site);
  const config = await readOrgHomepageConfig(orgId);
  const { seo: next, changed } = ensureSeoRoutesForPages(seo, config, site);
  if (changed) {
    await writeOrgSeo(orgId, next);
  }
  return next;
}

export async function readOrgTheme(orgId: string): Promise<OrgThemeFile> {
  const stored = await readJsonFile<OrgThemeFile>(orgFile(orgId, "theme.json"));
  return stored ?? defaultTheme();
}

export async function readOrgHomepageConfig(orgId: string): Promise<HomepageConfig> {
  const [stored, site] = await Promise.all([
    readJsonFile<unknown>(orgFile(orgId, "homepage-config.json")),
    readOrgSite(orgId),
  ]);
  const rewritten = stored ? rewriteLegacyAssetPathsInJson(stored, orgId) : stored;
  const normalized = normalizeHomepageConfig(rewritten ?? {});
  const { config: filled, changed } = fillMissingSectionCopy(normalized, orgId, {
    sitePhone: site.phone,
  });
  const augmented =
    orgId === "lsd" ? augmentHomepageConfigWithServiceAreaLocations(filled) : filled;
  const config = reconcileHomePageGlobalPreviewSettings(augmented);
  const pathChanged = JSON.stringify(stored ?? null) !== JSON.stringify(rewritten ?? null);
  const reconciled = JSON.stringify(augmented) !== JSON.stringify(config);
  if (changed || pathChanged || reconciled) {
    await writeJsonFile(orgFile(orgId, "homepage-config.json"), config);
  }
  return config;
}

export async function readOrgStagingConfig(orgId: string): Promise<HomepageConfig | null> {
  const [stored, site] = await Promise.all([
    readJsonFile<unknown>(orgFile(orgId, "staging.json")),
    readOrgSite(orgId),
  ]);
  if (!stored) return null;
  const rewritten = rewriteLegacyAssetPathsInJson(stored, orgId);
  const normalized = normalizeHomepageConfig(rewritten);
  if (normalized.sections.length === 0) return null;
  const { config: filled, changed } = fillMissingSectionCopy(normalized, orgId, {
    sitePhone: site.phone,
  });
  const augmented =
    orgId === "lsd" ? augmentHomepageConfigWithServiceAreaLocations(filled) : filled;
  const config = reconcileHomePageGlobalPreviewSettings(augmented);
  const pathChanged = JSON.stringify(stored) !== JSON.stringify(rewritten);
  const reconciled = JSON.stringify(augmented) !== JSON.stringify(config);
  if (changed || pathChanged || reconciled) {
    await writeJsonFile(orgFile(orgId, "staging.json"), config);
  }
  return config;
}

export async function readOrgWorkshopConfig(orgId: string): Promise<HomepageConfig> {
  return (await readOrgStagingConfig(orgId)) ?? (await readOrgHomepageConfig(orgId));
}

export async function readOrgPillar(orgId: string): Promise<OrgPillar> {
  const [org, site, seo, theme, homepageConfig, workshopConfig, contact, policies] = await Promise.all([
    readOrgMeta(orgId),
    readOrgSite(orgId),
    readOrgSeo(orgId),
    readOrgTheme(orgId),
    readOrgHomepageConfig(orgId),
    readOrgWorkshopConfig(orgId),
    readOrgContact(orgId),
    readOrgPolicies(orgId),
  ]);

  return { org, site, seo, theme, homepageConfig, workshopConfig, contact, policies };
}

export async function writeOrgMeta(orgId: string, org: OrgMeta): Promise<void> {
  const current = await readJsonFile<OrgMeta>(orgFile(orgId, "org.json"));
  const number = isPositiveInt(current?.number)
    ? current.number
    : isPositiveInt(org.number)
      ? org.number
      : await allocateOrgNumber();

  await writeJsonFile(orgFile(orgId, "org.json"), {
    ...org,
    id: orgId,
    number,
    schemaVersion: orgSchemaVersion,
  });
}

export async function writeOrgSite(orgId: string, site: SiteConfigData): Promise<void> {
  await writeJsonFile(orgFile(orgId, "site.json"), site);
}

export async function writeOrgSeo(orgId: string, seo: OrgSeoFile): Promise<void> {
  await writeJsonFile(orgFile(orgId, "seo.json"), { ...seo, schemaVersion: orgSchemaVersion });
}

export async function writeOrgTheme(orgId: string, theme: OrgThemeFile): Promise<void> {
  await writeJsonFile(orgFile(orgId, "theme.json"), { ...theme, schemaVersion: orgSchemaVersion });
}

export async function writeOrgHomepageConfig(orgId: string, config: HomepageConfig): Promise<void> {
  await writeJsonFile(orgFile(orgId, "homepage-config.json"), normalizeHomepageConfigForSave(config));
}

export async function writeOrgStagingConfig(orgId: string, config: HomepageConfig): Promise<void> {
  await writeJsonFile(orgFile(orgId, "staging.json"), normalizeHomepageConfigForSave(config));
}

function defaultContact(site: SiteConfigData): OrgContactFile {
  return {
    schemaVersion: orgSchemaVersion,
    leadToEmail: site.email?.trim() || "",
  };
}

function normalizeOrgContact(stored: OrgContactFile | null, site: SiteConfigData): OrgContactFile {
  const base = defaultContact(site);
  if (!stored) return base;
  return {
    schemaVersion: orgSchemaVersion,
    leadToEmail: typeof stored.leadToEmail === "string" ? stored.leadToEmail.trim() : base.leadToEmail,
    formFields: Array.isArray(stored.formFields) ? stored.formFields : undefined,
  };
}

export async function readOrgContact(orgId: string): Promise<OrgContactFile> {
  const site = await readOrgSite(orgId);
  const stored = await readJsonFile<OrgContactFile>(orgFile(orgId, "contact.json"));
  const contact = normalizeOrgContact(stored, site);
  if (!stored) {
    await writeOrgContact(orgId, contact);
  }
  return contact;
}

export async function writeOrgContact(orgId: string, contact: OrgContactFile): Promise<void> {
  await writeJsonFile(orgFile(orgId, "contact.json"), {
    ...contact,
    schemaVersion: orgSchemaVersion,
  });
}

export async function readOrgPolicies(orgId: string): Promise<OrgPoliciesFile> {
  const stored = await readJsonFile<OrgPoliciesFile>(orgFile(orgId, "policies.json"));
  return normalizeOrgPolicies(stored);
}

export async function writeOrgPolicies(orgId: string, policies: OrgPoliciesFile): Promise<void> {
  await writeJsonFile(orgFile(orgId, "policies.json"), normalizeOrgPolicies(policies));
}

export async function createOrg(
  id: string,
  name: string,
  requestedNumber?: number,
): Promise<OrgPillar> {
  if (isVisionRuntime()) {
    throw new Error("Cannot create an organization in Vision.");
  }
  if (!isSafeOrgId(id)) {
    throw new Error("Organization folder must be lowercase letters, numbers, and hyphens.");
  }
  if (isReservedOrgId(id)) {
    throw new Error(`"${id}" is reserved and cannot be used as an organization folder.`);
  }

  const existing = await listOrgs();
  if (existing.some((org) => org.id === id)) {
    throw new Error(`Organization folder "${id}" already exists.`);
  }

  const trimmedName = name.trim() || id;
  const number = await resolveOrgNumber(existing, requestedNumber);
  const site = defaultSiteForOrg(id, trimmedName);

  const pillar: OrgPillar = {
    org: defaultOrgMeta(id, trimmedName, number),
    site,
    seo: defaultSeo(site),
    theme: defaultTheme(),
    homepageConfig: normalizeHomepageConfig({
      sections: [{ group: "header", variant: "header-v1" }],
      colorThemeId: defaultColorThemeId,
      fontThemeId: defaultFontThemeId,
    }),
    workshopConfig: normalizeHomepageConfig({
      sections: [{ group: "header", variant: "header-v1" }],
      colorThemeId: defaultColorThemeId,
      fontThemeId: defaultFontThemeId,
    }),
    contact: defaultContact(site),
    policies: defaultOrgPolicies(),
  };

  await mkdir(orgDir(id), { recursive: true });
  await mkdir(orgHistoryDir(id), { recursive: true });
  await mkdir(path.join(orgAssetsDir(id), "images"), { recursive: true });
  await writeFile(path.join(orgAssetsDir(id), "logo.png"), PLACEHOLDER_LOGO_PNG);
  await writeFile(path.join(orgAssetsDir(id), "images", "logo.png"), PLACEHOLDER_LOGO_PNG);
  await writeOrgMeta(id, pillar.org);
  await writeOrgSite(id, pillar.site);
  await writeOrgSeo(id, pillar.seo);
  await writeOrgTheme(id, pillar.theme);
  await writeOrgHomepageConfig(id, pillar.homepageConfig);
  await writeOrgContact(id, defaultContact(site));
  await writeOrgPolicies(id, defaultOrgPolicies());

  return pillar;
}

export async function writeOrgLaunchMode(
  orgId: string,
  mode: SiteConfigData["launch"]["mode"],
): Promise<void> {
  const site = await readOrgSite(orgId);
  await writeOrgSite(orgId, {
    ...site,
    launch: { ...site.launch, mode },
  });
}

export async function writeOrgSettings(
  orgId: string,
  patch: {
    org?: OrgMeta;
    site?: SiteConfigData;
    seo?: OrgSeoFile;
    theme?: OrgThemeFile;
    favicon?: FaviconPreviewSettings;
    analytics?: AnalyticsPreviewSettings;
    contact?: OrgContactFile;
    policies?: OrgPoliciesFile;
  },
): Promise<OrgPillar> {
  if (patch.org) {
    await writeOrgMeta(orgId, patch.org);
  }
  if (patch.site) {
    await writeOrgSite(orgId, patch.site);
  }
  if (patch.seo) {
    await writeOrgSeo(orgId, patch.seo);
  }
  if (patch.theme) {
    await writeOrgTheme(orgId, patch.theme);
  }
  if (patch.contact) {
    await writeOrgContact(orgId, patch.contact);
  }
  if (patch.policies) {
    await writeOrgPolicies(orgId, patch.policies);
  }
  if (patch.favicon || patch.analytics) {
    await mergeOrgPreviewSettings(orgId, {
      favicon: patch.favicon,
      analytics: patch.analytics,
    });
  }
  return readOrgPillar(orgId);
}

async function mergeOrgPreviewSettings(
  orgId: string,
  patch: {
    favicon?: FaviconPreviewSettings;
    analytics?: AnalyticsPreviewSettings;
  },
): Promise<void> {
  const favicon = patch.favicon ? normalizeFaviconPreviewSettings(patch.favicon) : undefined;
  const analytics = patch.analytics
    ? normalizeAnalyticsPreviewSettings(patch.analytics)
    : undefined;

  const live = await readOrgHomepageConfig(orgId);
  await writeOrgHomepageConfig(orgId, {
    ...live,
    previewSettings: {
      ...live.previewSettings,
      ...(favicon ? { favicon } : {}),
      ...(analytics ? { analytics } : {}),
    },
  });

  const staging = await readOrgStagingConfig(orgId);
  const stagingRaw = await readJsonFile<unknown>(orgFile(orgId, "staging.json"));
  const stagingBase = staging
    ? staging
    : stagingRaw
      ? normalizeHomepageConfig(rewriteLegacyAssetPathsInJson(stagingRaw, orgId) ?? {})
      : null;

  if (stagingBase) {
    await writeOrgStagingConfig(orgId, {
      ...stagingBase,
      previewSettings: {
        ...stagingBase.previewSettings,
        ...(favicon ? { favicon } : {}),
        ...(analytics ? { analytics } : {}),
      },
    });
  }
}

const protectedOrgIds = ["lsd"] as const;

export async function deleteOrg(
  orgId: string,
  confirmName: string,
): Promise<{ nextOrgId: string; orgs: OrgListItem[] }> {
  if (isVisionRuntime()) {
    throw new Error("Cannot delete an organization in Vision.");
  }
  if (!isSafeOrgId(orgId)) {
    throw new Error("Invalid organization id.");
  }
  if ((protectedOrgIds as readonly string[]).includes(orgId)) {
    throw new Error(`"${orgId}" cannot be deleted.`);
  }

  const meta = await readOrgMeta(orgId);
  if (meta.name.trim() !== confirmName.trim()) {
    throw new Error("Organization name does not match.");
  }

  const orgs = await listOrgs();
  if (!orgs.some((org) => org.id === orgId)) {
    throw new Error(`Organization "${orgId}" was not found.`);
  }
  if (orgs.length <= 1) {
    throw new Error("Cannot delete the last organization.");
  }

  await rm(orgDir(orgId), { recursive: true, force: true });

  const visionOutDir = path.join(process.cwd(), "vision-out", orgId);
  await rm(visionOutDir, { recursive: true, force: true }).catch(() => undefined);

  const remaining = orgs.filter((org) => org.id !== orgId);
  const current = await readCurrentOrgId();
  let nextOrgId = current;
  if (current === orgId) {
    nextOrgId = remaining.find((org) => org.id === defaultOrgId)?.id ?? remaining[0]!.id;
    await writeCurrentOrgId(nextOrgId);
  }

  return { nextOrgId, orgs: remaining };
}
