import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { readHomepageConfig } from "@/lib/homepage-config.server";
import { readLaunchMode, isUnderConstruction } from "@/lib/launch-mode.server";
import { readCurrentOrgId, readOrgPolicies, readOrgSeo, readOrgSite } from "@/lib/org/read-org.server";
import { findOrgSeoRouteBySlug } from "@/lib/org/seo-route";
import { setRuntimeSite } from "@/lib/org/runtime-site";
import { isOrgPolicyPublished } from "@/lib/org/policies";

function getSitemapPriority(route: string): number {
  if (route === "") return 1;
  if (route === "/service-areas") return 0.9;
  if (route.startsWith("/service-areas/")) return 0.75;
  return 0.8;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const orgId = await readCurrentOrgId();
  const [config, launchMode, seo, site, policies] = await Promise.all([
    readHomepageConfig(),
    readLaunchMode(),
    readOrgSeo(orgId),
    readOrgSite(orgId),
    readOrgPolicies(orgId),
  ]);
  setRuntimeSite(site);

  if (isUnderConstruction(launchMode) || seo.routes.home?.noIndex) {
    return [
      {
        url: siteConfig.url,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
      },
    ];
  }

  const routes = [
    "",
    ...(config.pages ?? [])
      .filter((page) => findOrgSeoRouteBySlug(seo, page.slug)?.noIndex !== true)
      .map((page) => `/${page.slug}`),
    ...(isOrgPolicyPublished(policies.privacy) && !policies.privacy.noIndex ? ["/privacy"] : []),
    ...(isOrgPolicyPublished(policies.terms) && !policies.terms.noIndex ? ["/terms"] : []),
  ];

  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: getSitemapPriority(route),
  }));
}
