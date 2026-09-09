import type { ServiceAreaV2Card } from "@/lib/service-area-v2-content";

/** Spartan `/service-area` hub cards — geography only; services live in hero pills + dedicated pages. */
export const spartanServiceAreaV2Cards: ServiceAreaV2Card[] = [
  {
    id: "clark-county",
    slug: "clark-county-wa",
    href: "/service-areas/clark-county-wa",
    title: "Clark County, WA",
    description:
      "Based in Vancouver, Spartan Restoration serves all of Clark County, including Vancouver, Camas, Washougal, Battle Ground, Ridgefield, and nearby neighborhoods. Water damage mitigation, mold remediation, and storm or sewage cleanup with licensed, insured, IICRC-certified crews.",
    ctaLabel: "Clark County coverage",
  },
  {
    id: "portland-metro",
    slug: "portland-metro-or",
    href: "/contact",
    title: "Portland Metro, OR",
    description:
      "Properties on the Oregon side of the Columbia River, including Portland, Gresham, Troutdale, and surrounding communities, can call the same Vancouver team for emergency water extraction, structural drying, mold remediation, and storm cleanup.",
    ctaLabel: "Portland metro help",
  },
  {
    id: "longview-kelso",
    slug: "longview-kelso-wa",
    href: "/contact",
    title: "Longview & Kelso, WA",
    description:
      "Spartan Restoration supports homeowners and businesses in Cowlitz County and along the I-5 corridor with water damage restoration, mold removal, and storm or sewage cleanup, with documentation suited for insurance claims.",
    ctaLabel: "Longview area help",
  },
];
