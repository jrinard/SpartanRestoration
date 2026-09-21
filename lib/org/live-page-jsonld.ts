import { SERVICE_AREAS_PATH } from "@/lib/service-area-pages";
import {
  getServiceAreaV2CardBySlug,
  getServiceAreaV2CardHref,
  type ServiceAreaV2Card,
} from "@/lib/service-area-v2-content";
import {
  CONTRACTOR_SERVICE_AREA_HUB_PATH,
  getContractorServiceAreaLocationDefinition,
  isContractorServiceAreaLocationSlug,
  isContractorServiceAreaOrg,
} from "@/lib/contractor-service-area-locations";
import {
  getServiceAreaV2CardBySlugForOrg,
  getServiceAreaV2CardsForOrg,
} from "@/lib/service-area-v2-cards";
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

function locationSchemaItems(cards: ServiceAreaV2Card[], seo: OrgSeoFile) {
  return cards.map((card) => {
    const route =
      findOrgSeoRouteBySlug(seo, `service-areas/${card.slug}`) ??
      findOrgSeoRouteBySlug(seo, card.slug);
    return {
      name: card.title,
      path: route?.path ?? getServiceAreaV2CardHref(card),
      description: route?.description ?? card.description,
      headlineArea: headlineAreaFromName(card.title),
    };
  });
}

function buildContractorLocationPageSchemas(
  orgId: "spartan" | "stonepillar",
  slug: string,
  seo: OrgSeoFile,
): Record<string, unknown>[] {
  const card = getServiceAreaV2CardBySlugForOrg(orgId, slug);
  const locationDef = getContractorServiceAreaLocationDefinition(orgId, slug);
  if (!card || !locationDef) return [];

  const route =
    findOrgSeoRouteBySlug(seo, slug) ?? findOrgSeoRouteBySlug(seo, locationDef.slug);
  const path = route?.path ?? getServiceAreaV2CardHref(card);
  const description = route?.description ?? locationDef.seo.description;
  const location = {
    name: card.title,
    path,
    description,
    headlineArea: locationDef.headlineArea,
  };

  return [
    buildBreadcrumbListSchema([
      { name: "Home", path: "/" },
      { name: "Service Area", path: CONTRACTOR_SERVICE_AREA_HUB_PATH },
      { name: card.title, path },
    ]),
    buildServiceAreaLocationWebPageSchema(
      location,
      route?.title ?? locationDef.seo.title,
    ),
  ];
}

/** Location JSON-LD keyed off org pages and hub cards. */
export function buildLiveSlugSeoSchemas(
  slug: string,
  seo: OrgSeoFile,
  orgId?: string,
): Record<string, unknown>[] {
  const cards = getServiceAreaV2CardsForOrg(orgId ?? "lsd");

  if (isContractorServiceAreaOrg(orgId) && slug === "service-area") {
    const hubDescription =
      findOrgSeoRouteBySlug(seo, "service-area")?.description ??
      (orgId === "spartan"
        ? "Spartan Restoration serves Vancouver, Clark County, the Portland metro, and southwest Washington."
        : "Stone Pillar Contractors serves Vancouver, Clark County, the Portland metro, and southwest Washington.");
    return [
      buildBreadcrumbListSchema([
        { name: "Home", path: "/" },
        { name: "Service Area", path: CONTRACTOR_SERVICE_AREA_HUB_PATH },
      ]),
      buildServiceAreaLocationsItemListSchema(locationSchemaItems(cards, seo), hubDescription),
    ];
  }

  if (isContractorServiceAreaOrg(orgId) && isContractorServiceAreaLocationSlug(slug)) {
    return buildContractorLocationPageSchemas(orgId, slug, seo);
  }

  if (slug === "service-areas") {
    return [
      buildBreadcrumbListSchema([
        { name: "Home", path: "/" },
        { name: "Service Areas", path: SERVICE_AREAS_PATH },
      ]),
      buildServiceAreaLocationsItemListSchema(
        locationSchemaItems(cards, seo),
        findOrgSeoRouteBySlug(seo, "service-areas")?.description ?? pageSeo.serviceAreas.description,
      ),
    ];
  }

  const card = getServiceAreaV2CardBySlug(slug);
  if (!card || isContractorServiceAreaOrg(orgId)) return [];

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
