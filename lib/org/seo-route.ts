import type { OrgSeoFile, OrgSeoRoute } from "@/lib/org/types";
import { citySlugFromServiceAreaSlug } from "@/lib/service-area-pages";

/** Match a live path to an entry in `seo.json`. */
export function findOrgSeoRoute(seo: OrgSeoFile, path: string): OrgSeoRoute | undefined {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const routes = Object.values(seo.routes);
  return (
    routes.find((route) => route.path === normalized) ??
    routes.find((route) => route.path === `/service-areas${normalized}`) ??
    routes.find((route) => route.path.endsWith(normalized))
  );
}

export function findOrgSeoRouteBySlug(seo: OrgSeoFile, slug: string): OrgSeoRoute | undefined {
  if (!slug) return seo.routes.home;
  const city = citySlugFromServiceAreaSlug(slug);
  return seo.routes[slug] ?? seo.routes[city] ?? findOrgSeoRoute(seo, `/${slug}`);
}

/** Key in `seo.routes` for a live page slug (falls back to slug). */
export function findOrgSeoRouteKeyBySlug(seo: OrgSeoFile, slug: string): string {
  if (!slug) return "home";
  if (seo.routes[slug]) return slug;
  const city = citySlugFromServiceAreaSlug(slug);
  if (city && seo.routes[city]) return city;
  const route = findOrgSeoRoute(seo, `/${slug}`);
  if (route) {
    const match = Object.entries(seo.routes).find(([, entry]) => entry === route);
    if (match) return match[0];
  }
  return slug;
}
