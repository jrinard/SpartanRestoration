import type { ServiceAreaV2Card } from "@/lib/service-area-v2-content";

const serviceAreaPath = (slug: string) => `/service-areas/${slug}`;

/** Spartan `/service-area` hub cards — geography only; services live in hero pills + dedicated pages. */
export const spartanServiceAreaV2Cards: ServiceAreaV2Card[] = [
  {
    id: "clark-county",
    slug: "clark-county-wa",
    href: serviceAreaPath("clark-county-wa"),
    title: "Clark County, WA",
    description:
      "Based in Vancouver, Spartan Restoration serves all of Clark County, including Vancouver, Camas, Washougal, Battle Ground, Ridgefield, and nearby neighborhoods. Water damage mitigation, mold remediation, and storm or sewage cleanup with licensed, insured, IICRC-certified crews.",
    ctaLabel: "Clark County coverage",
  },
  {
    id: "portland-metro",
    slug: "portland-metro-or",
    href: serviceAreaPath("portland-metro-or"),
    title: "Portland Metro, OR",
    description:
      "Properties on the Oregon side of the Columbia River, including Portland, Gresham, Troutdale, and surrounding communities, can call the same Vancouver team for emergency water extraction, structural drying, mold remediation, and storm cleanup.",
    ctaLabel: "Portland metro help",
  },
  {
    id: "longview-kelso",
    slug: "longview-kelso-wa",
    href: serviceAreaPath("longview-kelso-wa"),
    title: "Longview & Kelso, WA",
    description:
      "Spartan Restoration supports homeowners and businesses in Cowlitz County and along the I-5 corridor with water damage restoration, mold removal, and storm or sewage cleanup, with documentation suited for insurance claims.",
    ctaLabel: "Longview area help",
  },
  {
    id: "battle-ground",
    slug: "battle-ground-wa",
    href: serviceAreaPath("battle-ground-wa"),
    title: "Battle Ground, WA",
    description:
      "North Clark County homes and businesses in Battle Ground rely on Spartan Restoration for burst pipes, crawlspace moisture, mold remediation, and storm damage. Emergency mitigation and drying from a Vancouver-based team.",
    ctaLabel: "Battle Ground help",
  },
  {
    id: "ridgefield",
    slug: "ridgefield-wa",
    href: serviceAreaPath("ridgefield-wa"),
    title: "Ridgefield, WA",
    description:
      "Ridgefield’s growing neighborhoods and commercial sites get the same Spartan Restoration response as the rest of Clark County — water extraction, structural drying, mold treatment, and storm or sewage cleanup.",
    ctaLabel: "Ridgefield help",
  },
  {
    id: "camas-washougal",
    slug: "camas-washougal-wa",
    href: serviceAreaPath("camas-washougal-wa"),
    title: "Camas & Washougal, WA",
    description:
      "East Clark County properties in Camas and Washougal — from river-adjacent commercial sites to hillside homes — receive water damage mitigation, mold remediation, and storm cleanup from Spartan Restoration in Vancouver.",
    ctaLabel: "Camas & Washougal help",
  },
];
