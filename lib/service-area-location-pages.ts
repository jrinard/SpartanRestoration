import {
  cloneHomepageSections,
  type HomepageConfig,
  type HomepagePageSnapshot,
  type HomepageSectionEntry,
} from "@/lib/homepage-config";
import type { HomepagePreviewSettings } from "@/lib/homepage-settings";
import type { HeroV4PreviewSettings } from "@/lib/hero-v4-preview";
import { normalizeHeroV4PreviewSettings } from "@/lib/hero-v4-preview";
import {
  buildServiceAreaLocationHeroV4,
  getServiceAreaLocationDefinition,
} from "@/lib/service-area-location-content";
import {
  CLARK_COUNTY_WA_PAGE_SLUG,
  findHomepagePageByLocationSlug,
  getClarkCountyWaPageSections,
  getConfiguredPageSections,
  getServiceAreaLocationConfigSlug,
  SERVICE_AREAS_PAGE_SLUG,
  serviceAreaLocationPages,
} from "@/lib/service-area-pages";
import type { SectionInstanceSettings } from "@/lib/section-instance-storage";

function getClarkCountyTemplatePage(config: HomepageConfig): HomepagePageSnapshot | null {
  return findHomepagePageByLocationSlug(config, CLARK_COUNTY_WA_PAGE_SLUG) ?? null;
}

function getSectionInstanceMap(
  previewSettings?: HomepagePreviewSettings,
): Record<string, SectionInstanceSettings> {
  return { ...(previewSettings?.sections ?? {}) };
}

function findHeroV4Section(sections: HomepageSectionEntry[]): HomepageSectionEntry | undefined {
  return sections.find((section) => section.group === "hero" && section.variant === "hero-v4");
}

function applyHeroToSectionSettings(
  sectionSettings: Record<string, SectionInstanceSettings>,
  heroSectionId: string | undefined,
  heroV4: HeroV4PreviewSettings,
): void {
  if (!heroSectionId) return;

  sectionSettings[heroSectionId] = {
    ...sectionSettings[heroSectionId],
    heroV4,
  };
}

function cloneClarkSectionSettings(
  clarkSections: HomepageSectionEntry[],
  newSections: HomepageSectionEntry[],
  clarkSectionSettings: Record<string, SectionInstanceSettings>,
): Record<string, SectionInstanceSettings> {
  const cloned: Record<string, SectionInstanceSettings> = {};

  clarkSections.forEach((section, index) => {
    const oldId = section.id;
    const newId = newSections[index]?.id;
    if (!oldId || !newId || !clarkSectionSettings[oldId]) return;
    cloned[newId] = structuredClone(clarkSectionSettings[oldId]);
  });

  return cloned;
}

function buildLocationPageFromClarkTemplate(
  clarkPage: HomepagePageSnapshot,
  clarkSectionSettings: Record<string, SectionInstanceSettings>,
  citySlug: string,
  name: string,
): { page: HomepagePageSnapshot; sectionSettings: Record<string, SectionInstanceSettings> } {
  const location = getServiceAreaLocationDefinition(citySlug);
  if (!location) {
    throw new Error(`Unknown service area location slug: ${citySlug}`);
  }

  const sections = cloneHomepageSections(clarkPage.sections);
  const sectionSettings = cloneClarkSectionSettings(
    clarkPage.sections,
    sections,
    clarkSectionSettings,
  );

  const heroSection = findHeroV4Section(sections);
  const clarkHeroSection = findHeroV4Section(clarkPage.sections);
  const clarkHeroBase =
    clarkHeroSection?.id && clarkSectionSettings[clarkHeroSection.id]?.heroV4
      ? normalizeHeroV4PreviewSettings(clarkSectionSettings[clarkHeroSection.id]!.heroV4!)
      : undefined;

  const heroV4 = buildServiceAreaLocationHeroV4(location, clarkHeroBase);
  applyHeroToSectionSettings(sectionSettings, heroSection?.id, heroV4);

  return {
    page: { slug: getServiceAreaLocationConfigSlug(citySlug), name, sections },
    sectionSettings,
  };
}

/**
 * Official LSD behavior: extra town pages are the Clark County template with unique hero copy.
 * Applied at read time so empty JSON slots still render Camas, Battle Ground, etc.
 */
export function augmentHomepageConfigWithServiceAreaLocations(
  config: HomepageConfig,
): HomepageConfig {
  const clarkPage = getClarkCountyTemplatePage(config);
  if (!clarkPage) return config;

  const clarkSectionSettings = getSectionInstanceMap(config.previewSettings);
  const existingPages = [...(config.pages ?? [])];
  const existingCitySlugs = new Set(
    existingPages.map((page) => getServiceAreaLocationDefinition(page.slug)?.slug).filter(Boolean),
  );
  const mergedSectionSettings = { ...clarkSectionSettings };

  for (const { slug, name } of serviceAreaLocationPages) {
    const existingPage = findHomepagePageByLocationSlug({ ...config, pages: existingPages }, slug);
    const location = getServiceAreaLocationDefinition(slug);

    if (existingPage) {
      const heroSection = findHeroV4Section(existingPage.sections);
      if (location && heroSection?.id && location.slug !== CLARK_COUNTY_WA_PAGE_SLUG) {
        const clarkHeroSection = findHeroV4Section(clarkPage.sections);
        const clarkHeroBase =
          clarkHeroSection?.id && clarkSectionSettings[clarkHeroSection.id]?.heroV4
            ? normalizeHeroV4PreviewSettings(clarkSectionSettings[clarkHeroSection.id]!.heroV4!)
            : undefined;
        applyHeroToSectionSettings(
          mergedSectionSettings,
          heroSection.id,
          buildServiceAreaLocationHeroV4(location, clarkHeroBase),
        );
      }
      continue;
    }

    if (existingCitySlugs.has(slug)) continue;

    const built = buildLocationPageFromClarkTemplate(
      clarkPage,
      clarkSectionSettings,
      slug,
      name,
    );
    existingPages.push(built.page);
    existingCitySlugs.add(slug);
    Object.assign(mergedSectionSettings, built.sectionSettings);
  }

  return {
    ...config,
    pages: sortHomepagePageSnapshots(existingPages),
    previewSettings: {
      ...config.previewSettings,
      sections: mergedSectionSettings,
    },
  };
}

export function sortHomepagePageSnapshots(
  pages: HomepagePageSnapshot[],
): HomepagePageSnapshot[] {
  return [...pages].sort((a, b) => {
    if (a.slug === SERVICE_AREAS_PAGE_SLUG) return -1;
    if (b.slug === SERVICE_AREAS_PAGE_SLUG) return 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}

export function isServiceAreaLocationSlug(slug: string): boolean {
  return Boolean(getServiceAreaLocationDefinition(slug));
}

export function getServiceAreaLocationPageSections(
  config: HomepageConfig,
  slug: string,
): HomepageSectionEntry[] {
  const configured = getConfiguredPageSections(config, slug);
  if (configured) return configured;
  return getClarkCountyWaPageSections(config);
}

/** Always overlay unique town hero copy — Official live render path. */
export function getServiceAreaLocationPreviewSettings(
  config: HomepageConfig,
  slug: string,
  sections: HomepageSectionEntry[],
): HomepagePreviewSettings | undefined {
  const heroSection = findHeroV4Section(sections);
  const location = getServiceAreaLocationDefinition(slug);
  if (!heroSection?.id || !location) return config.previewSettings;
  if (location.slug === CLARK_COUNTY_WA_PAGE_SLUG) return config.previewSettings;

  const clarkPage = getClarkCountyTemplatePage(config);
  const clarkSectionSettings = getSectionInstanceMap(config.previewSettings);
  const clarkHeroSection = clarkPage ? findHeroV4Section(clarkPage.sections) : undefined;
  const clarkHeroBase =
    clarkHeroSection?.id && clarkSectionSettings[clarkHeroSection.id]?.heroV4
      ? normalizeHeroV4PreviewSettings(clarkSectionSettings[clarkHeroSection.id]!.heroV4!)
      : undefined;

  const heroV4 = buildServiceAreaLocationHeroV4(location, clarkHeroBase);

  return {
    ...config.previewSettings,
    sections: {
      ...config.previewSettings?.sections,
      [heroSection.id]: {
        ...config.previewSettings?.sections?.[heroSection.id],
        heroV4,
      },
    },
  };
}

export function withServiceAreaLocationPageConfig(
  config: HomepageConfig,
  slug: string,
): HomepageConfig | null {
  if (!isServiceAreaLocationSlug(slug) && slug !== SERVICE_AREAS_PAGE_SLUG) {
    return null;
  }

  const sections = getServiceAreaLocationPageSections(config, slug);
  if (sections.length === 0) return null;

  const previewSettings = isServiceAreaLocationSlug(slug)
    ? getServiceAreaLocationPreviewSettings(config, slug, sections)
    : config.previewSettings;

  return { ...config, sections, previewSettings };
}
