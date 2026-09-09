import { SERVICE_AREAS_PATH } from "@/lib/service-area-pages";
import {
  getServiceAreaV2CardBySlug,
  getServiceAreaV2CardHref,
  type ServiceAreaV2Card,
} from "@/lib/service-area-v2-content";
import { getServiceAreaV2CardsForOrg } from "@/lib/service-area-v2-cards";
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
    const route = findOrgSeoRouteBySlug(seo, card.slug);
    return {
      name: card.title,
      path: route?.path ?? getServiceAreaV2CardHref(card),
      description: route?.description ?? card.description,
      headlineArea: headlineAreaFromName(card.title),
    };
  });
}

/** Location JSON-LD keyed off org pages and hub cards. */
export function buildLiveSlugSeoSchemas(
  slug: string,
  seo: OrgSeoFile,
  orgId?: string,
): Record<string, unknown>[] {
  const cards = getServiceAreaV2CardsForOrg(orgId ?? "lsd");

  if (orgId === "spartan" && slug === "service-area") {
    const hubDescription =
      findOrgSeoRouteBySlug(seo, "service-area")?.description ??
      "Spartan Restoration serves Vancouver, Clark County, and the Portland metro.";
    return [
      buildBreadcrumbListSchema([
        { name: "Home", path: "/" },
        { name: "Service Area", path: "/service-area" },
      ]),
      buildServiceAreaLocationsItemListSchema(locationSchemaItems(cards, seo), hubDescription),
    ];
  }

  if (orgId === "spartan" && slug === "service-areas/clark-county-wa") {
    const route = findOrgSeoRouteBySlug(seo, slug);
    const path = route?.path ?? "/service-areas/clark-county-wa";
    const description =
      route?.description ??
      "Spartan Restoration serves Clark County, WA with water damage, mold, and storm cleanup.";
    const location = {
      name: "Clark County, WA",
      path,
      description,
      headlineArea: "Clark County",
    };
    return [
      buildBreadcrumbListSchema([
        { name: "Home", path: "/" },
        { name: "Service Area", path: "/service-area" },
        { name: "Clark County, WA", path },
      ]),
      buildServiceAreaLocationWebPageSchema(
        location,
        route?.title ?? "Restoration Services in Clark County, WA | Spartan Restoration",
      ),
    ];
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
  if (!card || orgId === "spartan") return [];

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
