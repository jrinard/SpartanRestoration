import type { ServiceAreaV2Card } from "@/lib/service-area-v2-content";

/** Stone Pillar `/service-area` hub cards — geography only; services live in hero pills + dedicated pages. */
export const stonepillarServiceAreaV2Cards: ServiceAreaV2Card[] = [
  {
    id: "clark-county",
    slug: "clark-county-wa",
    href: "/service-areas/clark-county-wa",
    title: "Clark County, WA",
    description:
      "Based in Vancouver, Stone Pillar Contractors serves all of Clark County, including Vancouver, Camas, Washougal, Battle Ground, Ridgefield, and nearby neighborhoods. Kitchen and bath remodeling, water damage build-back, commercial tenant improvements, and insurance-related reconstruction.",
    ctaLabel: "Clark County coverage",
  },
  {
    id: "portland-metro",
    slug: "portland-metro-or",
    href: "/contact",
    title: "Portland Metro",
    description:
      "Properties on the Oregon side of the Columbia River, including Portland, Gresham, Troutdale, and surrounding communities, can call the same Vancouver team for remodeling, water damage build-back, and commercial tenant improvements.",
    ctaLabel: "Portland help",
  },
  {
    id: "longview-kelso",
    slug: "longview-kelso-wa",
    href: "/contact",
    title: "Longview & Kelso, WA",
    description:
      "Stone Pillar Contractors supports homeowners and businesses in Cowlitz County and along the I-5 corridor with remodeling, reconstruction, and commercial construction, with documentation suited for insurance-related rebuild work.",
    ctaLabel: "Longview area help",
  },
];
