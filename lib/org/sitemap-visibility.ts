import type { HomepageConfig } from "@/lib/homepage-config";
import { isOrgPolicyPublished, type OrgPoliciesFile } from "@/lib/org/policies";
import { findOrgSeoRouteBySlug, findOrgSeoRouteKeyBySlug } from "@/lib/org/seo-route";
import type { OrgSeoFile, SiteConfigData } from "@/lib/org/types";

export type LaunchMode = "live" | "under-construction";

export type SitemapIndexTarget =
  | { kind: "seo"; routeKey: string }
  | { kind: "policy"; policyKind: "privacy" | "terms" };

export type SitemapRouteRow = {
  path: string;
  label: string;
  inSitemap: boolean;
  indexable: boolean;
  noIndex: boolean;
  indexTarget: SitemapIndexTarget | null;
  note: string;
};

export type SitemapVisibilityReport = {
  launchMode: LaunchMode;
  underConstruction: boolean;
  siteUrl: string;
  sitemapUrl: string;
  liveRoutes: SitemapRouteRow[];
  summary: string;
};

type BuildSitemapVisibilityInput = {
  site: SiteConfigData;
  seo: OrgSeoFile;
  homepageConfig: HomepageConfig;
  policies: OrgPoliciesFile;
};

function homeRow(seo: OrgSeoFile, underConstruction: boolean): SitemapRouteRow {
  const homeNoIndex = seo.routes.home?.noIndex === true;
  const inSitemap = true;
  const indexable = !underConstruction && !homeNoIndex;

  let note = "Homepage";
  if (underConstruction) {
    note = "Under construction — listed alone in sitemap until you publish live";
  } else if (homeNoIndex) {
    note = "Hidden from search and sitemap";
  }

  return {
    path: "/",
    label: seo.routes.home?.title?.split("|")[0]?.trim() || "Home",
    inSitemap,
    indexable,
    noIndex: homeNoIndex,
    indexTarget: { kind: "seo", routeKey: "home" },
    note,
  };
}

function pageRow(
  slug: string,
  name: string,
  seo: OrgSeoFile,
  underConstruction: boolean,
): SitemapRouteRow {
  const route = findOrgSeoRouteBySlug(seo, slug);
  const routeKey = findOrgSeoRouteKeyBySlug(seo, slug);
  const routeNoIndex = route?.noIndex === true;
  const indexTarget: SitemapIndexTarget = { kind: "seo", routeKey };

  if (underConstruction) {
    return {
      path: `/${slug}`,
      label: name || route?.title || slug,
      inSitemap: false,
      indexable: false,
      noIndex: routeNoIndex,
      indexTarget,
      note: routeNoIndex
        ? "Hidden when live — under construction until launch.mode is live"
        : "Under construction — will enter sitemap when live unless hidden",
    };
  }

  if (routeNoIndex) {
    return {
      path: `/${slug}`,
      label: name || route?.title || slug,
      inSitemap: false,
      indexable: false,
      noIndex: true,
      indexTarget,
      note: "Hidden from search and sitemap",
    };
  }

  return {
    path: `/${slug}`,
    label: name || route?.title || slug,
    inSitemap: true,
    indexable: true,
    noIndex: false,
    indexTarget,
    note: "Published inner page",
  };
}

function policyRow(
  kind: "privacy" | "terms",
  policies: OrgPoliciesFile,
  underConstruction: boolean,
): SitemapRouteRow | null {
  const policy = policies[kind];
  const path = kind === "privacy" ? "/privacy" : "/terms";
  const label = policy.title || (kind === "privacy" ? "Privacy Policy" : "Terms & Conditions");
  const published = isOrgPolicyPublished(policy);

  const indexTarget: SitemapIndexTarget = { kind: "policy", policyKind: kind };

  if (!published) {
    return {
      path,
      label,
      inSitemap: false,
      indexable: false,
      noIndex: policy.noIndex,
      indexTarget,
      note: policy.noIndex
        ? "Policy off or empty — hidden if published"
        : "Policy off or empty (Edit Policies in Forge)",
    };
  }

  if (underConstruction) {
    return {
      path,
      label,
      inSitemap: false,
      indexable: false,
      noIndex: policy.noIndex,
      indexTarget,
      note: policy.noIndex
        ? "Hidden when live — under construction until launch.mode is live"
        : "Under construction — will enter sitemap when live unless hidden",
    };
  }

  if (policy.noIndex) {
    return {
      path,
      label,
      inSitemap: false,
      indexable: false,
      noIndex: true,
      indexTarget,
      note: "Hidden from search and sitemap",
    };
  }

  return {
    path,
    label,
    inSitemap: true,
    indexable: true,
    noIndex: false,
    indexTarget,
    note: "Published policy page",
  };
}

/** Client-safe mirror of `app/sitemap.ts` rules for Org Settings. */
export function buildSitemapVisibilityReport({
  site,
  seo,
  homepageConfig,
  policies,
}: BuildSitemapVisibilityInput): SitemapVisibilityReport {
  const launchMode = site.launch.mode;
  const underConstruction = launchMode === "under-construction";
  const siteUrl = site.url.replace(/\/$/, "");
  const sitemapUrl = `${siteUrl}/sitemap.xml`;

  const liveRoutes: SitemapRouteRow[] = [
    homeRow(seo, underConstruction),
    ...(homepageConfig.pages ?? []).map((page) =>
      pageRow(page.slug, page.name, seo, underConstruction),
    ),
  ];

  for (const kind of ["privacy", "terms"] as const) {
    const row = policyRow(kind, policies, underConstruction);
    if (row) liveRoutes.push(row);
  }

  const inSitemapCount = liveRoutes.filter((row) => row.inSitemap).length;
  const summary = underConstruction
    ? `Under construction — sitemap lists / only (${inSitemapCount} URL). Switch to Live to expose inner pages.`
    : `${inSitemapCount} URL${inSitemapCount === 1 ? "" : "s"} in sitemap.xml`;

  return {
    launchMode,
    underConstruction,
    siteUrl,
    sitemapUrl,
    liveRoutes,
    summary,
  };
}
