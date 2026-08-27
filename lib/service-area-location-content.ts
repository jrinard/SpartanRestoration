import { siteConfig } from "@/config/site";
import {
  defaultHeroV4PreviewSettings,
  defaultHeroV4ServicePills,
  normalizeHeroV4PreviewSettings,
  type HeroV4Breadcrumb,
  type HeroV4PreviewSettings,
  type HeroV4ServicePill,
} from "@/lib/hero-v4-preview";
import { phoneTelHref } from "@/lib/phone";
import { serviceAreaV2Cards } from "@/lib/service-area-v2-content";
import { getServiceAreaLocationPath, SERVICE_AREAS_PATH } from "@/lib/service-area-pages";

export type ServiceAreaLocationSeo = {
  title: string;
  description: string;
  path: string;
  ogImageAlt: string;
  keywords: string[];
};

export type ServiceAreaLocationDefinition = {
  slug: string;
  name: string;
  /** Used in the hero headline — e.g. "Salmon Creek", "Clark County". */
  headlineArea: string;
  /** Hero h1 — service-specific per town. */
  heroHeadline: string;
  body: string;
  seo: ServiceAreaLocationSeo;
};

/** Per-location hero headlines — varied service emphasis, title case. */
const serviceAreaLocationHeroHeadlines: Record<string, string> = {
  "clark-county-wa": "Web Design Across Clark County",
  "salmon-creek-wa": "Custom Web Design for Salmon Creek",
  "hazel-dell-wa": "Local Web Design for Hazel Dell",
  "felida-wa": "Logo & Branding for Felida",
  "ridgefield-wa": "Custom Web Design for Ridgefield",
  "la-center-wa": "Local Web Design for La Center",
  "battle-ground-wa": "Custom Software for Battle Ground",
  "brush-prairie-wa": "Logo & Branding for Brush Prairie",
  "hockinson-wa": "Custom Software for Hockinson",
  "camas-wa": "Business Growth in Camas",
  "washougal-wa": "Reputation Growth in Washougal",
  "orchards-wa": "Website Optimization in Orchards",
  "woodland-wa": "Logo & Branding for Woodland",
};

function buildLocationHeroHeadline(slug: string, headlineArea: string): string {
  const custom = serviceAreaLocationHeroHeadlines[slug];
  if (custom) return custom;
  return `Custom Web Design for ${headlineArea}`;
}

/** Short meta descriptions (~155 chars) for SERP snippets — separate from on-page body copy. */
const serviceAreaLocationMetaDescriptions: Record<string, string> = {
  "clark-county-wa":
    "Web design, software, CRM, and branding for Clark County, WA businesses. Local Vancouver studio serving Vancouver, Camas, Battle Ground, and more. Free review.",
  "salmon-creek-wa":
    "Web design and SEO for Salmon Creek, WA businesses near I-5 and WSU Vancouver. Mobile-friendly sites from a local studio. Get a free website review.",
  "hazel-dell-wa":
    "Local web design for Hazel Dell and the Highway 99 corridor. Honest scopes, fair pricing, and brand refreshes from a Clark County team you can call.",
  "felida-wa":
    "Logo design, business cards, brochures, and web design for Felida, WA professionals. Graphic design and custom sites from a local studio. Free quote.",
  "ridgefield-wa":
    "Web design and SEO for fast-growing Ridgefield, WA. Landing pages, HOA sites, and search optimization from a local Clark County studio. Free review.",
  "la-center-wa":
    "Local web design for La Center and north Clark County, WA. Small-town sites and print-ready graphic design from an honest local team. Free quote.",
  "battle-ground-wa":
    "Custom software, CRM, and web design for Battle Ground, WA businesses. Built around your workflow by a local Clark County studio. Free written quote.",
  "brush-prairie-wa":
    "Logo design, brochures, business cards, and websites for Brush Prairie, WA contractors and service businesses. Local branding from one team.",
  "hockinson-wa":
    "Custom software, booking flows, and web design for Hockinson, WA service businesses. Loyal local support in east Clark County. Free project quote.",
  "camas-wa":
    "Software development, CRM, and web design for Camas, WA commercial and professional clients. Local studio, direct communication. Free review.",
  "washougal-wa":
    "Reputation growth with Reviewbox.io and web design for Washougal, WA businesses. Stronger Google reviews and local SEO. Free quote.",
  "orchards-wa":
    "Web design, SEO, and site maintenance for Orchards, WA retailers and service businesses east of Vancouver. Ongoing optimization. Free review.",
  "woodland-wa":
    "Software development, CRM, and web design for Woodland, WA industrial and downtown businesses. Local, honest partnership. Free written quote.",
};

/** Town-specific keyword targets per location page. */
const serviceAreaLocationKeywords: Record<string, string[]> = {
  "clark-county-wa": [
    "web design clark county wa",
    "web designer vancouver wa",
    "custom website clark county",
    "web developer vancouver wa",
    "website design camas wa",
  ],
  "salmon-creek-wa": [
    "web design salmon creek wa",
    "website designer salmon creek",
    "seo salmon creek wa",
    "web design wsu vancouver area",
    "website optimization clark county",
  ],
  "hazel-dell-wa": [
    "web design hazel dell wa",
    "website designer hazel dell",
    "web design highway 99 vancouver",
    "local web designer north vancouver wa",
    "website design clark county wa",
  ],
  "felida-wa": [
    "web design felida wa",
    "logo design felida wa",
    "graphic design felida",
    "business cards felida wa",
    "branding clark county wa",
  ],
  "ridgefield-wa": [
    "web design ridgefield wa",
    "website designer ridgefield",
    "seo ridgefield wa",
    "landing page design ridgefield",
    "web developer north clark county",
  ],
  "la-center-wa": [
    "web design la center wa",
    "website designer la center",
    "graphic design la center wa",
    "small business website clark county",
    "local web design north clark county",
  ],
  "battle-ground-wa": [
    "web design battle ground wa",
    "custom software battle ground wa",
    "crm development battle ground",
    "website designer battle ground",
    "web developer clark county wa",
  ],
  "brush-prairie-wa": [
    "web design brush prairie wa",
    "logo design brush prairie",
    "brochure design clark county wa",
    "contractor website brush prairie",
    "branding brush prairie wa",
  ],
  "hockinson-wa": [
    "web design hockinson wa",
    "custom software hockinson",
    "website designer hockinson",
    "booking software clark county wa",
    "web developer east clark county",
  ],
  "camas-wa": [
    "web design camas wa",
    "software development camas wa",
    "crm setup camas",
    "website designer camas",
    "custom website camas wa",
  ],
  "washougal-wa": [
    "web design washougal wa",
    "reputation management washougal",
    "google reviews washougal wa",
    "reviewbox washougal",
    "website designer columbia gorge",
  ],
  "orchards-wa": [
    "web design orchards wa",
    "seo orchards wa",
    "website maintenance vancouver wa",
    "website designer fourth plain",
    "search optimization clark county",
  ],
  "woodland-wa": [
    "web design woodland wa",
    "software development woodland wa",
    "crm woodland wa",
    "website designer woodland",
    "web design port of woodland area",
  ],
};

function buildLocationKeywords(slug: string, headlineArea: string): string[] {
  const specific = serviceAreaLocationKeywords[slug];
  if (specific) return specific;

  const areaLower = headlineArea.toLowerCase();
  return [
    `web design ${areaLower}`,
    `web designer ${areaLower}`,
    `website design ${slug.replace(/-/g, " ")}`,
    "web design clark county wa",
    "web designer vancouver wa",
  ];
}

function buildMetaDescription(slug: string, body: string): string {
  const custom = serviceAreaLocationMetaDescriptions[slug];
  if (custom) return custom;

  if (body.length <= 155) return body;
  const trimmed = body.slice(0, 152).trim();
  const lastSpace = trimmed.lastIndexOf(" ");
  return `${trimmed.slice(0, lastSpace > 80 ? lastSpace : 152)}...`;
}

function buildLocationSeo(
  name: string,
  headlineArea: string,
  slug: string,
  body: string,
): ServiceAreaLocationSeo {
  const path = getServiceAreaLocationPath(slug);
  return {
    title: `Web Design in ${name}`,
    description: buildMetaDescription(slug, body),
    path,
    ogImageAlt: `${siteConfig.name} web design in ${name}`,
    keywords: buildLocationKeywords(slug, headlineArea),
  };
}

function headlineAreaFromTitle(title: string): string {
  return title.replace(/,\s*WA$/i, "").trim();
}

export const serviceAreaLocationDefinitions: ServiceAreaLocationDefinition[] =
  serviceAreaV2Cards.map((card) => {
    const headlineArea = headlineAreaFromTitle(card.title);
    return {
      slug: card.slug,
      name: card.title,
      headlineArea,
      heroHeadline: buildLocationHeroHeadline(card.slug, headlineArea),
      body: card.description,
      seo: buildLocationSeo(card.title, headlineArea, card.slug, card.description),
    };
  });

export function getServiceAreaLocationDefinition(
  slug: string,
): ServiceAreaLocationDefinition | undefined {
  const city = slug.replace(/^\/?service-areas\//, "").replace(/^\/+|\/+$/g, "");
  return serviceAreaLocationDefinitions.find((location) => location.slug === city);
}

/** True when a city hero is empty or still using the shared Clark County template copy. */
export function isGenericServiceAreaHeroHeadline(headline: string | undefined): boolean {
  const value = headline?.trim() ?? "";
  if (!value) return true;
  const normalized = value.replace(/\s+/g, " ").toLowerCase();
  return (
    normalized === defaultHeroV4PreviewSettings.headline.toLowerCase() ||
    normalized === "web design all across clark county"
  );
}

export function getServiceAreaLocationBreadcrumbs(
  location: ServiceAreaLocationDefinition,
): HeroV4Breadcrumb[] {
  return [
    { label: "Home", href: "/" },
    { label: "Service Areas", href: SERVICE_AREAS_PATH },
    { label: location.name },
  ];
}

export function getServiceAreaLocationBreadcrumbSchemaItems(
  location: ServiceAreaLocationDefinition,
) {
  return [
    { name: "Home", path: "/" },
    { name: "Service Areas", path: SERVICE_AREAS_PATH },
    { name: location.name, path: location.seo.path },
  ];
}

export function getServiceAreasIndexBreadcrumbSchemaItems() {
  return [
    { name: "Home", path: "/" },
    { name: "Service Areas", path: SERVICE_AREAS_PATH },
  ];
}

export function getServiceAreaLocationSchemaItems() {
  return serviceAreaLocationDefinitions.map((location) => ({
    name: location.name,
    path: location.seo.path,
    description: location.seo.description,
    headlineArea: location.headlineArea,
  }));
}

function localizeServicePills(
  pills: HeroV4ServicePill[],
  headlineArea: string,
): HeroV4ServicePill[] {
  const areaLabel = headlineArea.includes("County")
    ? `${headlineArea}, WA`
    : `${headlineArea}, WA`;

  return pills.map((pill) => ({
    ...pill,
    title: pill.title.replace(/Clark County, WA/g, areaLabel).replace(/Clark County/g, headlineArea),
    description: pill.description
      .replace(/Clark County, Washington/g, `${headlineArea}, Washington`)
      .replace(/Clark County/g, headlineArea)
      .replace(/Pacific Northwest/g, "Pacific Northwest"),
  }));
}

/** Hero-v4 settings for a service-area location page (Clark County template + local copy). */
export function buildServiceAreaLocationHeroV4(
  location: ServiceAreaLocationDefinition,
  base: Partial<HeroV4PreviewSettings> = defaultHeroV4PreviewSettings,
): HeroV4PreviewSettings {
  const normalizedBase = normalizeHeroV4PreviewSettings(base);

  return normalizeHeroV4PreviewSettings({
    ...normalizedBase,
    eyebrow: "Where We Serve",
    headline: location.heroHeadline,
    body: location.body,
    formSubtext: `Web design & custom software in ${location.name}.`,
    phoneLabel: siteConfig.phone,
    phoneHref: phoneTelHref(siteConfig.phone),
    showForm: normalizedBase.showForm,
    showBreadcrumbs: true,
    showBullets: false,
    showPhoneCta: true,
    showServicePills: true,
    servicePills: localizeServicePills(defaultHeroV4ServicePills, location.headlineArea),
    breadcrumbs: getServiceAreaLocationBreadcrumbs(location),
  });
}

export function getServiceAreaLocationSeo(slug: string): ServiceAreaLocationSeo | null {
  const location = getServiceAreaLocationDefinition(slug);
  return location?.seo ?? null;
}
