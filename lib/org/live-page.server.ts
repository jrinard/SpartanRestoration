import type { Metadata } from "next";
import { getHomepagePageSnapshot, withHomepagePageSections, type HomepageConfig } from "@/lib/homepage-config";
import { withServiceAreaLocationPageConfig } from "@/lib/service-area-location-pages";
import { findHomepagePageByLocationSlug } from "@/lib/service-area-pages";
import { readHomepageConfig } from "@/lib/homepage-config.server";
import { isUnderConstruction, readLaunchMode } from "@/lib/launch-mode.server";
import { readCurrentOrgId, readOrgPolicies, readOrgSeo, readOrgSite } from "@/lib/org/read-org.server";
import { findOrgSeoRoute, findOrgSeoRouteBySlug } from "@/lib/org/seo-route";
import { setRuntimeSite } from "@/lib/org/runtime-site";
import { setRuntimePolicies } from "@/lib/org/runtime-policies";
import {
  getPublishedOrgPolicy,
  type OrgPolicyKind,
} from "@/lib/org/policies";
import { createMetadata } from "@/lib/seo";
import { pageSeo } from "@/lib/seo-content";
import { readPublishedFaviconSettings } from "@/lib/resolve-favicon.server";
import type { SiteConfigData, OrgSeoFile, OrgSeoRoute } from "@/lib/org/types";

export type LiveOrgPageModel = {
  orgId: string;
  slug?: string;
  pageName: string;
  config: HomepageConfig;
  site: SiteConfigData;
  seo: OrgSeoFile;
  underConstruction: boolean;
};

export async function loadLiveOrgPage(slug?: string): Promise<LiveOrgPageModel | null> {
  const orgId = await readCurrentOrgId();
  const [launchMode, config, site, seo, policies] = await Promise.all([
    readLaunchMode(),
    readHomepageConfig(),
    readOrgSite(orgId),
    readOrgSeo(orgId),
    readOrgPolicies(orgId),
  ]);
  setRuntimeSite(site);
  setRuntimePolicies(policies);

  if (slug) {
    const locationConfig = withServiceAreaLocationPageConfig(config, slug);
    const pageConfig = locationConfig ?? withHomepagePageSections(config, slug);
    const page =
      findHomepagePageByLocationSlug(config, slug) ?? getHomepagePageSnapshot(config, slug);
    if (!pageConfig || !page) return null;
    return {
      orgId,
      slug,
      pageName: page.name,
      config: pageConfig,
      site,
      seo,
      underConstruction: isUnderConstruction(launchMode),
    };
  }

  return {
    orgId,
    pageName: "Home",
    config,
    site,
    seo,
    underConstruction: isUnderConstruction(launchMode),
  };
}

export async function liveOrgPageMetadata(slug?: string): Promise<Metadata> {
  const orgId = await readCurrentOrgId();
  const [launchMode, favicon, site, seo, config] = await Promise.all([
    readLaunchMode(),
    readPublishedFaviconSettings(),
    readOrgSite(orgId),
    readOrgSeo(orgId),
    readHomepageConfig(),
  ]);
  setRuntimeSite(site);

  if (!slug) {
    const home = seo.routes.home;
    return createMetadata({
      title: home?.title ?? pageSeo.home.title,
      browserTitle: favicon.browserTitle || site.name,
      description: home?.description ?? pageSeo.home.description,
      path: home?.path ?? pageSeo.home.path,
      noIndex: isUnderConstruction(launchMode) ? true : home?.noIndex,
      ogImage: site.assets.logo,
      ogImageAlt: home?.ogImageAlt ?? pageSeo.home.ogImageAlt,
      keywords: home?.keywords,
      favicon,
    });
  }

  const page = findHomepagePageByLocationSlug(config, slug) ?? getHomepagePageSnapshot(config, slug);
  const route: OrgSeoRoute | undefined = findOrgSeoRouteBySlug(seo, slug);
  const path = route?.path ?? `/${slug}`;

  return createMetadata({
    title: route?.title ?? page?.name ?? slug,
    description: route?.description ?? site.description,
    path,
    noIndex: route?.noIndex,
    ogImage: site.assets.logo,
    ogImageAlt: route?.ogImageAlt,
    keywords: route?.keywords,
    favicon,
  });
}

/** Metadata for `/privacy` and `/terms` when that policy is published. */
export async function livePolicyMetadata(kind: OrgPolicyKind): Promise<Metadata> {
  const orgId = await readCurrentOrgId();
  const path = kind === "privacy" ? "/privacy" : "/terms";
  const [favicon, site, seo, policies] = await Promise.all([
    readPublishedFaviconSettings(),
    readOrgSite(orgId),
    readOrgSeo(orgId),
    readOrgPolicies(orgId),
  ]);
  setRuntimeSite(site);
  setRuntimePolicies(policies);

  const policy = getPublishedOrgPolicy(policies, kind);
  if (!policy) return {};

  const route = findOrgSeoRoute(seo, path);
  const fallback = kind === "privacy" ? pageSeo.privacy : pageSeo.terms;
  const description =
    route?.description ??
    policy.body.trim().split(/\n{2,}/)[0]?.trim().slice(0, 160) ??
    fallback.description ??
    site.description;

  return createMetadata({
    title: route?.title ?? policy.title ?? fallback.title,
    description,
    path: route?.path ?? fallback.path ?? path,
    noIndex: policy.noIndex,
    ogImage: site.assets.logo,
    ogImageAlt: route?.ogImageAlt,
    keywords: route?.keywords,
    favicon,
  });
}
