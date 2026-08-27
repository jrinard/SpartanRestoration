import type { HomepageConfig } from "@/lib/homepage-config";
import type { OrgSeoFile, SiteConfigData } from "@/lib/org/types";

function rewriteLegacyAssetPath(value: string, orgId: string): string {
  if (value.startsWith("/org-assets/")) return value;

  const orgPrefix = `/${orgId}/`;
  if (value.startsWith(orgPrefix)) {
    return `/org-assets/${orgId}/${value.slice(orgPrefix.length)}`;
  }

  if (orgId === "lsd" && value.startsWith("/lsd/")) {
    return `/org-assets/lsd/${value.slice("/lsd/".length)}`;
  }

  if (orgId === "sandbox" && value.startsWith("/sandbox/")) {
    return `/org-assets/sandbox/${value.slice("/sandbox/".length)}`;
  }

  if (orgId === "spartan" && value.startsWith("/spartan/")) {
    return `/org-assets/spartan/${value.slice("/spartan/".length)}`;
  }

  if (orgId === "stonepillar" && value.startsWith("/stone/")) {
    return `/org-assets/stonepillar/${value.slice("/stone/".length)}`;
  }

  if (orgId === "langham" && value.startsWith("/langham/")) {
    return `/org-assets/langham/${value.slice("/langham/".length)}`;
  }

  return value;
}

export function rewriteLegacyAssetPathsInJson(value: unknown, orgId: string): unknown {
  if (typeof value === "string") return rewriteLegacyAssetPath(value, orgId);
  if (Array.isArray(value)) return value.map((entry) => rewriteLegacyAssetPathsInJson(entry, orgId));
  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      next[key] = rewriteLegacyAssetPathsInJson(nested, orgId);
    }
    return next;
  }
  return value;
}

/** Keep unknown keys. Stamp schemaVersion. Do not drop extras. */
export function migrateJsonRecord<T extends { schemaVersion?: number }>(
  stored: unknown,
  defaults: T,
  schemaVersion: number,
): T {
  const raw =
    stored && typeof stored === "object" && !Array.isArray(stored)
      ? (stored as Record<string, unknown>)
      : {};
  return {
    ...defaults,
    ...raw,
    schemaVersion,
  } as T;
}

export function ensureSeoRoutesForPages(
  seo: OrgSeoFile,
  config: HomepageConfig,
  site: SiteConfigData,
): { seo: OrgSeoFile; changed: boolean } {
  const routes = { ...seo.routes };
  let changed = false;

  for (const page of config.pages ?? []) {
    const path = `/${page.slug}`;
    const existing = Object.values(routes).find((route) => route.path === path);
    if (existing) continue;
    if (routes[page.slug]) continue;

    routes[page.slug] = {
      title: page.name,
      description: site.description,
      path,
      noIndex: true,
    };
    changed = true;
  }

  return changed ? { seo: { ...seo, routes }, changed } : { seo, changed: false };
}
