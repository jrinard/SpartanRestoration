import type { ServiceAreaV2Card } from "@/lib/service-area-v2-content";

const serviceAreaPath = (slug: string) => `/service-areas/${slug}`;

/** Stone Pillar `/service-area` hub cards — geography only; services live in hero pills + dedicated pages. */
export const stonepillarServiceAreaV2Cards: ServiceAreaV2Card[] = [
  {
    id: "clark-county",
    slug: "clark-county-wa",
    href: serviceAreaPath("clark-county-wa"),
    title: "Clark County, WA",
    description:
      "Based in Vancouver, Stone Pillar Contractors serves all of Clark County, including Vancouver, Camas, Washougal, Battle Ground, Ridgefield, and nearby neighborhoods. Kitchen and bath remodeling, water damage build-back, commercial tenant improvements, and insurance-related reconstruction.",
    ctaLabel: "Clark County coverage",
  },
  {
    id: "portland-metro",
    slug: "portland-metro-or",
    href: serviceAreaPath("portland-metro-or"),
    title: "Portland Metro, OR",
    description:
      "Properties on the Oregon side of the Columbia River, including Portland, Gresham, Troutdale, and surrounding communities, can call the same Vancouver team for remodeling, water damage build-back, and commercial tenant improvements.",
    ctaLabel: "Portland help",
  },
  {
    id: "longview-kelso",
    slug: "longview-kelso-wa",
    href: serviceAreaPath("longview-kelso-wa"),
    title: "Longview & Kelso, WA",
    description:
      "Stone Pillar Contractors supports homeowners and businesses in Cowlitz County and along the I-5 corridor with remodeling, reconstruction, and commercial construction, with documentation suited for insurance-related rebuild work.",
    ctaLabel: "Longview area help",
  },
  {
    id: "battle-ground",
    slug: "battle-ground-wa",
    href: serviceAreaPath("battle-ground-wa"),
    title: "Battle Ground, WA",
    description:
      "Battle Ground homeowners and businesses choose Stone Pillar Contractors for kitchen and bath remodels, additions, and rebuilds after water or storm damage — local Vancouver general contracting with clear scopes.",
    ctaLabel: "Battle Ground help",
  },
  {
    id: "ridgefield",
    slug: "ridgefield-wa",
    href: serviceAreaPath("ridgefield-wa"),
    title: "Ridgefield, WA",
    description:
      "Ridgefield remodeling, tenant improvements, and insurance-related reconstruction from Stone Pillar Contractors. One Clark County team for north county growth and commercial build-out.",
    ctaLabel: "Ridgefield help",
  },
  {
    id: "camas-washougal",
    slug: "camas-washougal-wa",
    href: serviceAreaPath("camas-washougal-wa"),
    title: "Camas & Washougal, WA",
    description:
      "Camas and Washougal projects — kitchen and bath upgrades, commercial tenant work, and water damage build-back — managed by Stone Pillar Contractors from Vancouver with east Clark County experience.",
    ctaLabel: "Camas & Washougal help",
  },
];
