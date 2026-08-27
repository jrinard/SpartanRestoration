import {
  getHomepagePageSnapshot,
  getHomepageSections,
  type HomepageConfig,
  type HomepagePageSnapshot,
  type HomepageSectionEntry,
} from "@/lib/homepage-config";

/** City slug for Clark County — live path is `/service-areas/clark-county-wa`. */
export const CLARK_COUNTY_WA_PAGE_SLUG = "clark-county-wa";

/** Live URL for the Clark County service-area page. */
export const CLARK_COUNTY_WA_PATH = "/service-areas/clark-county-wa";

/** Playground / config slug for the service areas index. */
export const SERVICE_AREAS_PAGE_SLUG = "service-areas";

/** Live URL for the service areas index page. */
export const SERVICE_AREAS_PATH = "/service-areas";

/** Strip `service-areas/` so `camas-wa` and `service-areas/camas-wa` match. */
export function citySlugFromServiceAreaSlug(slug: string): string {
  return slug.replace(/^\/?service-areas\//, "").replace(/^\/+|\/+$/g, "");
}

/** Config slug used in Forge pages[] — nested under the hub. */
export function getServiceAreaLocationConfigSlug(slug: string): string {
  const city = citySlugFromServiceAreaSlug(slug);
  if (!city || city === SERVICE_AREAS_PAGE_SLUG) return SERVICE_AREAS_PAGE_SLUG;
  return `${SERVICE_AREAS_PAGE_SLUG}/${city}`;
}

/** URL path for a service-area landing page. Accepts `camas-wa` or `service-areas/camas-wa`. */
export function getServiceAreaLocationPath(slug: string): string {
  const city = citySlugFromServiceAreaSlug(slug);
  return city ? `${SERVICE_AREAS_PATH}/${city}` : SERVICE_AREAS_PATH;
}

/** Config + live paths for service-area location pages. */
export const serviceAreaLocationPages = [
  { slug: CLARK_COUNTY_WA_PAGE_SLUG, path: CLARK_COUNTY_WA_PATH, name: "Clark County, WA" },
  { slug: "salmon-creek-wa", path: getServiceAreaLocationPath("salmon-creek-wa"), name: "Salmon Creek, WA" },
  { slug: "hazel-dell-wa", path: getServiceAreaLocationPath("hazel-dell-wa"), name: "Hazel Dell, WA" },
  { slug: "felida-wa", path: getServiceAreaLocationPath("felida-wa"), name: "Felida, WA" },
  { slug: "ridgefield-wa", path: getServiceAreaLocationPath("ridgefield-wa"), name: "Ridgefield, WA" },
  { slug: "la-center-wa", path: getServiceAreaLocationPath("la-center-wa"), name: "La Center, WA" },
  { slug: "battle-ground-wa", path: getServiceAreaLocationPath("battle-ground-wa"), name: "Battle Ground, WA" },
  { slug: "brush-prairie-wa", path: getServiceAreaLocationPath("brush-prairie-wa"), name: "Brush Prairie, WA" },
  { slug: "hockinson-wa", path: getServiceAreaLocationPath("hockinson-wa"), name: "Hockinson, WA" },
  { slug: "camas-wa", path: getServiceAreaLocationPath("camas-wa"), name: "Camas, WA" },
  { slug: "washougal-wa", path: getServiceAreaLocationPath("washougal-wa"), name: "Washougal, WA" },
  { slug: "orchards-wa", path: getServiceAreaLocationPath("orchards-wa"), name: "Orchards, WA" },
  { slug: "woodland-wa", path: getServiceAreaLocationPath("woodland-wa"), name: "Woodland, WA" },
] as const;

export function findHomepagePageByLocationSlug(
  config: HomepageConfig,
  slug: string,
): HomepagePageSnapshot | undefined {
  const city = citySlugFromServiceAreaSlug(slug);
  const nested = getServiceAreaLocationConfigSlug(city);
  return (
    getHomepagePageSnapshot(config, nested) ??
    getHomepagePageSnapshot(config, city) ??
    getHomepagePageSnapshot(config, slug)
  );
}

/** Published section stack for a config page slug, or null when the page is missing. */
export function getConfiguredPageSections(
  config: HomepageConfig,
  slug: string,
): HomepageSectionEntry[] | null {
  const page = findHomepagePageByLocationSlug(config, slug);
  if (!page || page.sections.length === 0) return null;
  return page.sections;
}

/** Live Clark County page — falls back to home if the config page has not been saved yet. */
export function getClarkCountyWaPageSections(config: HomepageConfig): HomepageSectionEntry[] {
  return (
    getConfiguredPageSections(config, CLARK_COUNTY_WA_PAGE_SLUG) ?? getHomepageSections(config)
  );
}

/** Live service areas index — falls back to home if the config page has not been saved yet. */
export function getServiceAreasPageSections(config: HomepageConfig): HomepageSectionEntry[] {
  return getConfiguredPageSections(config, SERVICE_AREAS_PAGE_SLUG) ?? getHomepageSections(config);
}
