import { siteConfig } from "@/config/site";
import type { HeroV4PreviewSettings } from "@/lib/hero-v4-preview";
import {
  defaultHeroV4PreviewSettings,
  normalizeHeroV4PreviewSettings,
} from "@/lib/hero-v4-preview";
import { phoneTelHref } from "@/lib/phone";
import type { ServiceAreaLocationDefinition } from "@/lib/service-area-location-content";
import { getServiceAreaLocationPath } from "@/lib/service-area-pages";

export type ContractorServiceAreaOrgId = "spartan" | "stonepillar";

export const CONTRACTOR_SERVICE_AREA_HUB_PATH = "/service-area";

export const contractorServiceAreaLocationSlugs = [
  "clark-county-wa",
  "portland-metro-or",
  "longview-kelso-wa",
  "battle-ground-wa",
  "ridgefield-wa",
  "camas-washougal-wa",
] as const;

export type ContractorServiceAreaLocationSlug =
  (typeof contractorServiceAreaLocationSlugs)[number];

export function isContractorServiceAreaOrg(
  orgId: string | undefined,
): orgId is ContractorServiceAreaOrgId {
  return orgId === "spartan" || orgId === "stonepillar";
}

export function isContractorServiceAreaLocationSlug(
  slug: string,
): slug is ContractorServiceAreaLocationSlug {
  const city = slug.replace(/^\/?service-areas\//, "").replace(/^\/+|\/+$/g, "");
  return contractorServiceAreaLocationSlugs.includes(
    city as ContractorServiceAreaLocationSlug,
  );
}

type LocationCopy = {
  name: string;
  headlineArea: string;
  heroHeadline: string;
  body: string;
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
};

const spartanLocationCopy: Record<ContractorServiceAreaLocationSlug, LocationCopy> = {
  "clark-county-wa": {
    name: "Clark County, WA",
    headlineArea: "Clark County",
    heroHeadline: "Restoration services\nacross Clark County",
    body: "From Vancouver and Salmon Creek to Camas, Washougal, and Battle Ground, Spartan Restoration helps homeowners and businesses recover from water damage, mold, and storm events. Licensed, insured, IICRC-certified crews based in Vancouver with documentation suited for insurance claims.",
    seoTitle: "Restoration Services in Clark County, WA | Spartan Restoration",
    metaDescription:
      "Water damage, mold remediation, and storm cleanup across Clark County, WA — Vancouver, Camas, Washougal, Battle Ground, and nearby communities. Licensed Vancouver crews.",
    keywords: [
      "water damage restoration Clark County WA",
      "mold remediation Vancouver WA",
      "storm cleanup Camas WA",
      "emergency restoration Battle Ground WA",
      "Spartan Restoration Clark County",
    ],
  },
  "portland-metro-or": {
    name: "Portland Metro, OR",
    headlineArea: "Portland Metro",
    heroHeadline: "Restoration for the\nPortland metro area",
    body: "Spartan Restoration responds on the Oregon side of the Columbia River for water extraction, structural drying, mold remediation, and storm or sewage cleanup. We serve Portland, Gresham, Troutdale, Happy Valley, and surrounding metro neighborhoods from our Vancouver, WA base — one team for cross-river emergencies and insurance-ready documentation.",
    seoTitle: "Water & Mold Restoration Portland Metro | Spartan Restoration",
    metaDescription:
      "Emergency water damage and mold remediation in Portland, Gresham, Troutdale, and the Oregon metro. Vancouver-based Spartan Restoration — licensed, insured, IICRC-certified.",
    keywords: [
      "water damage restoration Portland OR",
      "mold remediation Gresham OR",
      "storm cleanup Portland metro",
      "sewage cleanup Troutdale OR",
      "Spartan Restoration Portland",
    ],
  },
  "longview-kelso-wa": {
    name: "Longview & Kelso, WA",
    headlineArea: "Longview & Kelso",
    heroHeadline: "Restoration along the\nLongview & Kelso corridor",
    body: "Homes and businesses in Cowlitz County count on Spartan Restoration for burst pipes, flooding, mold after moisture intrusion, and storm damage along the I-5 corridor. We stabilize structures, dry building assemblies, and provide clear scopes and photos for adjusters serving Longview, Kelso, and surrounding Cowlitz County communities.",
    seoTitle: "Restoration Services Longview & Kelso, WA | Spartan Restoration",
    metaDescription:
      "Water damage restoration and mold remediation in Longview, Kelso, and Cowlitz County, WA. Insurance documentation from licensed Vancouver-based crews.",
    keywords: [
      "water damage restoration Longview WA",
      "mold remediation Kelso WA",
      "storm cleanup Cowlitz County",
      "emergency restoration I-5 corridor WA",
      "Spartan Restoration Longview",
    ],
  },
  "battle-ground-wa": {
    name: "Battle Ground, WA",
    headlineArea: "Battle Ground",
    heroHeadline: "Water & mold help in\nBattle Ground",
    body: "Battle Ground and north Clark County properties face roof leaks, appliance failures, crawlspace moisture, and storm runoff like the rest of the region — with fast-growing neighborhoods and varied home ages. Spartan Restoration provides emergency water mitigation, mold remediation, and sewage cleanup with local response from Vancouver and rebuild coordination when you need it.",
    seoTitle: "Water Damage Restoration Battle Ground, WA | Spartan Restoration",
    metaDescription:
      "Emergency water mitigation and mold remediation in Battle Ground, WA and north Clark County. Licensed, insured restoration from Spartan Restoration in Vancouver.",
    keywords: [
      "water damage restoration Battle Ground WA",
      "mold remediation Battle Ground",
      "storm cleanup north Clark County",
      "emergency water extraction Battle Ground",
      "Spartan Restoration Battle Ground",
    ],
  },
  "ridgefield-wa": {
    name: "Ridgefield, WA",
    headlineArea: "Ridgefield",
    heroHeadline: "Restoration services\nin Ridgefield",
    body: "Ridgefield’s mix of new construction, established neighborhoods, and commercial growth along I-5 means water damage can show up in slabs, attics, and tenant spaces alike. Spartan Restoration delivers extraction, drying, mold treatment, and storm cleanup for Ridgefield homeowners and businesses with the same Vancouver team that serves all of Clark County.",
    seoTitle: "Water & Mold Restoration Ridgefield, WA | Spartan Restoration",
    metaDescription:
      "Water damage and mold remediation in Ridgefield, WA. Emergency drying and storm cleanup from licensed Spartan Restoration crews based in Vancouver.",
    keywords: [
      "water damage restoration Ridgefield WA",
      "mold remediation Ridgefield",
      "storm cleanup Ridgefield WA",
      "emergency restoration north Clark County",
      "Spartan Restoration Ridgefield",
    ],
  },
  "camas-washougal-wa": {
    name: "Camas & Washougal, WA",
    headlineArea: "Camas & Washougal",
    heroHeadline: "Restoration in Camas\n& Washougal",
    body: "East Clark County — Camas, Washougal, and the Columbia River Gorge gateway — sees heavy rain, wind-driven leaks, and river-adjacent moisture challenges. Spartan Restoration handles water damage mitigation, mold remediation, and storm or sewage events for residential and commercial properties from downtown districts to hillside neighborhoods, with documentation ready for insurance carriers.",
    seoTitle: "Restoration Camas & Washougal, WA | Spartan Restoration",
    metaDescription:
      "Water damage, mold, and storm cleanup in Camas and Washougal, WA. Local Vancouver-based Spartan Restoration — licensed, insured, IICRC-certified.",
    keywords: [
      "water damage restoration Camas WA",
      "mold remediation Washougal WA",
      "storm cleanup east Clark County",
      "emergency restoration Columbia River Gorge",
      "Spartan Restoration Camas Washougal",
    ],
  },
};

const stonepillarLocationCopy: Record<ContractorServiceAreaLocationSlug, LocationCopy> = {
  "clark-county-wa": {
    name: "Clark County, WA",
    headlineArea: "Clark County",
    heroHeadline: "General contracting\nacross Clark County",
    body: "Stone Pillar Contractors serves Clark County from Vancouver — kitchen and bath remodeling, water damage build-back, commercial tenant improvements, and insurance-related reconstruction. From Salmon Creek to Camas, Washougal, Battle Ground, and Ridgefield, one local team manages scopes, permits, and quality finishes.",
    seoTitle: "General Contractor Clark County, WA | Stone Pillar Contractors",
    metaDescription:
      "Remodeling, reconstruction, and tenant improvements across Clark County, WA. Vancouver-based Stone Pillar Contractors — kitchen, bath, and insurance build-back.",
    keywords: [
      "general contractor Clark County WA",
      "remodeling Vancouver WA",
      "water damage reconstruction Camas",
      "tenant improvement Vancouver WA",
      "Stone Pillar Contractors Clark County",
    ],
  },
  "portland-metro-or": {
    name: "Portland Metro, OR",
    headlineArea: "Portland Metro",
    heroHeadline: "Build-back & remodeling\nin the Portland metro",
    body: "Stone Pillar Contractors supports Oregon-side properties in the Portland metro — remodeling, water damage reconstruction, and commercial tenant improvements — from the same Vancouver, WA operation that serves Clark County. Portland, Gresham, Troutdale, and cross-river clients get coordinated construction, clear timelines, and documentation suited to insurance-related rebuilds.",
    seoTitle: "Contractor & Remodeling Portland Metro | Stone Pillar Contractors",
    metaDescription:
      "Remodeling, water damage build-back, and tenant improvements in Portland, Gresham, and the Oregon metro. Stone Pillar Contractors — Vancouver-based.",
    keywords: [
      "general contractor Portland OR",
      "remodeling Gresham OR",
      "water damage reconstruction Portland metro",
      "tenant improvement Portland OR",
      "Stone Pillar Contractors Portland",
    ],
  },
  "longview-kelso-wa": {
    name: "Longview & Kelso, WA",
    headlineArea: "Longview & Kelso",
    heroHeadline: "Construction & rebuild\nin Longview & Kelso",
    body: "Stone Pillar Contractors helps Cowlitz County homeowners and businesses with remodeling, structural repairs after water events, and commercial construction along the I-5 corridor. Longview, Kelso, and surrounding communities receive the same Vancouver team for insurance-related reconstruction, interior upgrades, and coordinated trades.",
    seoTitle: "Contractor Longview & Kelso, WA | Stone Pillar Contractors",
    metaDescription:
      "Remodeling and reconstruction in Longview, Kelso, and Cowlitz County, WA. Insurance build-back and tenant improvements from Stone Pillar Contractors.",
    keywords: [
      "general contractor Longview WA",
      "remodeling Kelso WA",
      "water damage reconstruction Cowlitz County",
      "commercial construction Longview WA",
      "Stone Pillar Contractors Longview",
    ],
  },
  "battle-ground-wa": {
    name: "Battle Ground, WA",
    headlineArea: "Battle Ground",
    heroHeadline: "Remodeling & build-back\nin Battle Ground",
    body: "Battle Ground homeowners and businesses choose Stone Pillar Contractors for kitchen and bath remodels, additions, and rebuilds after water or storm damage. North Clark County projects benefit from a Vancouver-based crew that understands local codes, suburban lot conditions, and the mix of new and established housing in the Battle Ground area.",
    seoTitle: "General Contractor Battle Ground, WA | Stone Pillar Contractors",
    metaDescription:
      "Kitchen and bath remodeling, reconstruction, and tenant work in Battle Ground, WA. Stone Pillar Contractors — local Vancouver general contractor.",
    keywords: [
      "general contractor Battle Ground WA",
      "kitchen remodel Battle Ground",
      "water damage reconstruction Battle Ground",
      "home remodeling north Clark County",
      "Stone Pillar Contractors Battle Ground",
    ],
  },
  "ridgefield-wa": {
    name: "Ridgefield, WA",
    headlineArea: "Ridgefield",
    heroHeadline: "Contracting services\nin Ridgefield",
    body: "Ridgefield’s rapid growth brings new builds, HOA common-area work, and remodels in established neighborhoods. Stone Pillar Contractors delivers tenant improvements, residential renovations, and insurance-related reconstruction for Ridgefield properties — coordinated scheduling and finishes from a Clark County team based in Vancouver.",
    seoTitle: "General Contractor Ridgefield, WA | Stone Pillar Contractors",
    metaDescription:
      "Remodeling and commercial build-out in Ridgefield, WA. Water damage reconstruction and tenant improvements from Stone Pillar Contractors.",
    keywords: [
      "general contractor Ridgefield WA",
      "remodeling Ridgefield WA",
      "tenant improvement Ridgefield",
      "reconstruction north Clark County",
      "Stone Pillar Contractors Ridgefield",
    ],
  },
  "camas-washougal-wa": {
    name: "Camas & Washougal, WA",
    headlineArea: "Camas & Washougal",
    heroHeadline: "Remodeling in Camas\n& Washougal",
    body: "East Clark County communities — Camas, Washougal, and the Gorge gateway — need contractors who handle hillside sites, older downtown buildings, and modern residential upgrades. Stone Pillar Contractors provides kitchen and bath remodeling, commercial tenant improvements, and water damage build-back with local knowledge of Camas-Washougal neighborhoods and permitting paths.",
    seoTitle: "General Contractor Camas & Washougal, WA | Stone Pillar Contractors",
    metaDescription:
      "Remodeling and reconstruction in Camas and Washougal, WA. Kitchen, bath, and insurance build-back from Stone Pillar Contractors in Vancouver.",
    keywords: [
      "general contractor Camas WA",
      "remodeling Washougal WA",
      "water damage reconstruction east Clark County",
      "tenant improvement Camas WA",
      "Stone Pillar Contractors Washougal",
    ],
  },
};

function copyForOrg(orgId: ContractorServiceAreaOrgId): Record<
  ContractorServiceAreaLocationSlug,
  LocationCopy
> {
  return orgId === "spartan" ? spartanLocationCopy : stonepillarLocationCopy;
}

export function getContractorServiceAreaLocationPages(): {
  slug: ContractorServiceAreaLocationSlug;
  name: string;
}[] {
  return contractorServiceAreaLocationSlugs.map((slug) => ({
    slug,
    name: copyForOrg("spartan")[slug].name,
  }));
}

function contractorServiceAreaBreadcrumbs(location: ServiceAreaLocationDefinition) {
  return [
    { label: "Home", href: "/" },
    { label: "Service Area", href: CONTRACTOR_SERVICE_AREA_HUB_PATH },
    { label: location.name },
  ];
}

/** Hero-v4 for Spartan / Stone Pillar location pages (Clark County template + local copy). */
export function buildContractorServiceAreaLocationHeroV4(
  orgId: ContractorServiceAreaOrgId,
  location: ServiceAreaLocationDefinition,
  base: Partial<HeroV4PreviewSettings> = defaultHeroV4PreviewSettings,
): HeroV4PreviewSettings {
  const normalizedBase = normalizeHeroV4PreviewSettings(base);
  const brand =
    orgId === "spartan" ? "Spartan Restoration" : "Stone Pillar Contractors";
  const damagePhrase =
    orgId === "spartan"
      ? "Water, mold, or storm damage"
      : "Remodeling or rebuild needs";

  return normalizeHeroV4PreviewSettings({
    ...normalizedBase,
    eyebrow: `${brand} · ${location.name}`,
    headline: location.heroHeadline,
    body: location.body,
    formSubtext: `${damagePhrase} in ${location.headlineArea}.`,
    phoneLabel: siteConfig.phone,
    phoneHref: phoneTelHref(siteConfig.phone),
    showForm: normalizedBase.showForm,
    showBreadcrumbs: true,
    showBullets: false,
    showPhoneCta: normalizedBase.showPhoneCta,
    showServicePills: false,
    servicePills: [],
    breadcrumbs: contractorServiceAreaBreadcrumbs(location),
  });
}

export function getContractorServiceAreaLocationDefinition(
  orgId: ContractorServiceAreaOrgId,
  slug: string,
): ServiceAreaLocationDefinition | undefined {
  const city = slug.replace(/^\/?service-areas\//, "").replace(/^\/+|\/+$/g, "");
  if (!isContractorServiceAreaLocationSlug(city)) return undefined;

  const copy = copyForOrg(orgId)[city];
  const path = getServiceAreaLocationPath(city);
  const brand =
    orgId === "spartan" ? "Spartan Restoration" : "Stone Pillar Contractors";

  return {
    slug: city,
    name: copy.name,
    headlineArea: copy.headlineArea,
    heroHeadline: copy.heroHeadline,
    body: copy.body,
    seo: {
      title: copy.seoTitle,
      description: copy.metaDescription,
      path,
      ogImageAlt: `${brand} serving ${copy.name}`,
      keywords: copy.keywords,
    },
  };
}
