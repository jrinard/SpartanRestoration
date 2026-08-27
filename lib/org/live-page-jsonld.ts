import { SERVICE_AREAS_PATH } from "@/lib/service-area-pages";
import {
  getServiceAreaV2CardBySlug,
  getServiceAreaV2CardHref,
  serviceAreaV2Cards,
} from "@/lib/service-area-v2-content";
import type { OrgSeoFile } from "@/lib/org/types";
import { findOrgSeoRouteBySlug } from "@/lib/org/seo-route";
import {
  buildBreadcrumbListSchema,
  buildServiceAreaLocationWebPageSchema,
  buildServiceAreaLocationsItemListSchema,
} from "@/lib/seo-schema";
import { pageSeo } from "@/lib/seo-content";

function headlineAreaFromName(name: string): string {
  return name.replace(/,\s*WA$/i, "").trim();
}

function locationSchemaItems(seo: OrgSeoFile) {
  return serviceAreaV2Cards.map((card) => {
    const route = findOrgSeoRouteBySlug(seo, card.slug);
    return {
      name: card.title,
      path: route?.path ?? getServiceAreaV2CardHref(card),
      description: route?.description ?? card.description,
      headlineArea: headlineAreaFromName(card.title),
    };
  });
}

/** Location JSON-LD from the Official LSD local-SEO overhaul, keyed off org pages. */
export function buildLiveSlugSeoSchemas(slug: string, seo: OrgSeoFile): Record<string, unknown>[] {
  if (slug === "service-areas") {
    return [
      buildBreadcrumbListSchema([
        { name: "Home", path: "/" },
        { name: "Service Areas", path: SERVICE_AREAS_PATH },
      ]),
      buildServiceAreaLocationsItemListSchema(
        locationSchemaItems(seo),
        findOrgSeoRouteBySlug(seo, "service-areas")?.description ?? pageSeo.serviceAreas.description,
      ),
    ];
  }

  const card = getServiceAreaV2CardBySlug(slug);
  if (!card) return [];

  const route = findOrgSeoRouteBySlug(seo, slug);
  const path = route?.path ?? getServiceAreaV2CardHref(card);
  const description = route?.description ?? card.description;
  const location = {
    name: card.title,
    path,
    description,
    headlineArea: headlineAreaFromName(card.title),
  };

  return [
    buildBreadcrumbListSchema([
      { name: "Home", path: "/" },
      { name: "Service Areas", path: SERVICE_AREAS_PATH },
      { name: card.title, path },
    ]),
    buildServiceAreaLocationWebPageSchema(location, route?.title ?? `Web Design in ${card.title}`),
  ];
}
