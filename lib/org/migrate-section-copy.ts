import {
  lsdHeroV21Copy,
  lsdProjects,
  lsdBrandingProjects,
  lsdReviewboxCopy,
  lsdSimpleServices,
  lsdServicesV1Cta,
  heroV21Demo,
  reviewboxContent,
  servicesV1Cta,
} from "@/lib/demo-content";
import {
  buildServiceAreaLocationHeroV4,
  getServiceAreaLocationDefinition,
  isGenericServiceAreaHeroHeadline,
} from "@/lib/service-area-location-content";
import type { HeroV21Copy, HeroV21PreviewSettings } from "@/lib/hero-v21-preview";
import type { PortfolioPreviewSettings } from "@/lib/portfolio-preview";
import type { ReviewboxPreviewSettings } from "@/lib/reviewbox-preview";
import type {
  SectionInstanceSettings,
  ServicesV1InstanceSettings,
} from "@/lib/section-instance-storage";
import type { ServiceV1, ServicesV1Cta } from "@/components/sections/Services-v1";
import type { HomepageConfig, HomepageSectionEntry } from "@/lib/homepage-config";
import type { HomepagePreviewSettings } from "@/lib/homepage-settings";
import { phoneTelHref } from "@/lib/phone";
import { isStaleLsdServicesV1Cta } from "@/lib/services-v1-cta";

function allSectionEntries(config: HomepageConfig): HomepageSectionEntry[] {
  return [...config.sections, ...(config.pages ?? []).flatMap((page) => page.sections)];
}

function resolveVariant(entry: HomepageSectionEntry): string | undefined {
  if (entry.variant) return entry.variant;
  if (entry.group === "portfolio") return "portfolio-v1";
  if (entry.group === "reviewbox") return "reviewbox-v1";
  if (entry.group === "services") return "services-v1";
  return undefined;
}

function snapshot<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function orgImage(orgId: string, relative: string): string {
  return `/org-assets/${orgId}/images/${relative.replace(/^\/+/, "")}`;
}

function ensurePreviewSettings(config: HomepageConfig): HomepagePreviewSettings {
  if (!config.previewSettings) config.previewSettings = {};
  if (!config.previewSettings.sections) config.previewSettings.sections = {};
  return config.previewSettings;
}

function ensureSlot(
  previewSettings: HomepagePreviewSettings,
  id: string,
): SectionInstanceSettings {
  const sections = previewSettings.sections ?? {};
  previewSettings.sections = sections;
  if (!sections[id]) sections[id] = {};
  return sections[id];
}

function hasHeroCopy(settings: HeroV21PreviewSettings | undefined): boolean {
  return Boolean(settings?.headlineLines && settings.headlineLines.length > 0);
}

function hasPortfolioCopy(settings: PortfolioPreviewSettings | undefined): boolean {
  return Boolean(settings?.projects && settings.projects.length > 0);
}

function hasServicesCopy(settings: ServicesV1InstanceSettings | undefined): boolean {
  return Boolean(settings?.services && settings.services.length > 0);
}

function hasStaleLsdServicesV1Cta(settings: ServicesV1InstanceSettings | undefined): boolean {
  return isStaleLsdServicesV1Cta(settings?.cta);
}

function hasReviewboxCopy(settings: ReviewboxPreviewSettings | undefined): boolean {
  return Boolean(settings?.headlineLines && settings.headlineLines.length > 0);
}

function fillTextImagePhoneCopy(
  slot: SectionInstanceSettings,
  sitePhone: string | undefined,
): boolean {
  const phone = sitePhone?.trim();
  if (!phone) return false;

  let changed = false;

  if (slot.textImage && slot.textImage.contentPhoneLabel === undefined) {
    slot.textImage = {
      ...slot.textImage,
      contentPhoneLabel: phone,
      contentPhoneHref: phoneTelHref(phone),
    };
    changed = true;
  }

  if (
    slot.textImages &&
    slot.textImages.contentRow3PhoneLabel === undefined &&
    slot.textImages.contentRow1PhoneLabel === undefined
  ) {
    slot.textImages = {
      ...slot.textImages,
      contentRow3PhoneLabel: phone,
      contentRow3PhoneHref: phoneTelHref(phone),
    };
    changed = true;
  }

  return changed;
}

function heroCopyForOrg(orgId: string): HeroV21Copy {
  return orgId === "lsd" ? snapshot(lsdHeroV21Copy) : snapshot(heroV21Demo);
}

function genericProjects(orgId: string) {
  return [
    {
      title: "Sample project",
      tags: "Website",
      description: "Replace this card with work from this organization.",
      imageSrc: orgImage(orgId, "portfolio-sites/ospower-example.png"),
      imageAlt: "Sample project placeholder",
    },
  ];
}

function genericBranding(orgId: string) {
  return [
    {
      title: "Sample brand",
      tags: "Branding",
      imageSrc: orgImage(orgId, "portfolio_images/port-brand-1.png"),
      imageAlt: "Sample brand placeholder",
    },
  ];
}

function genericServices(orgId: string): ServiceV1[] {
  return [
    {
      title: "Service one",
      description: "Describe a service this organization offers.",
      icon: orgImage(orgId, "demo-website-design.png"),
      iconAlt: "Service icon",
      bullets: ["Benefit one", "Benefit two", "Benefit three"],
    },
    {
      title: "Service two",
      description: "A second service card so the layout matches a live section.",
      icon: orgImage(orgId, "demo-custom-soft.png"),
      iconAlt: "Service icon",
      bullets: ["Benefit one", "Benefit two", "Benefit three"],
    },
  ];
}

function mergeHeroCopy(
  existing: HeroV21PreviewSettings | undefined,
  orgId: string,
): HeroV21PreviewSettings {
  const copy = heroCopyForOrg(orgId);
  if (!existing) {
    return {
      button: {
        navBackground: "#c9a227",
        navTextColor: "#ffffff",
        navTextHoverColor: "#ffffff",
        navHoverBackground: "#a8861f",
        navButtonSize: "large",
        navButtonRadiusPx: 10,
      },
      background: { from: "#111111", to: "#1a2744", intensity: 40 },
      ...copy,
    };
  }
  return { ...existing, ...copy };
}

function mergePortfolioCopy(
  existing: PortfolioPreviewSettings | undefined,
  orgId: string,
): PortfolioPreviewSettings {
  return {
    theme: existing?.theme ?? "dark",
    heading: existing?.heading ?? "Projects",
    projects: orgId === "lsd" ? snapshot(lsdProjects) : genericProjects(orgId),
    brandingProjects: orgId === "lsd" ? snapshot(lsdBrandingProjects) : genericBranding(orgId),
    ctaLabel: existing?.ctaLabel,
    ctaHref: existing?.ctaHref,
  };
}

function mergeServicesCopy(
  existing: ServicesV1InstanceSettings | undefined,
  orgId: string,
): ServicesV1InstanceSettings {
  const cta: ServicesV1Cta =
    orgId === "lsd" ? snapshot(lsdServicesV1Cta) : snapshot(servicesV1Cta);
  return {
    ...existing,
    heading: existing?.heading ?? "Services",
    services: orgId === "lsd" ? snapshot(lsdSimpleServices) : genericServices(orgId),
    cta,
  };
}

function mergeReviewboxCopy(
  existing: ReviewboxPreviewSettings | undefined,
  orgId: string,
): ReviewboxPreviewSettings {
  const copy = orgId === "lsd" ? snapshot(lsdReviewboxCopy) : snapshot(reviewboxContent);
  return {
    theme: existing?.theme ?? "dark",
    background: existing?.background ?? { from: "#111111", to: "#1a2744", intensity: 40 },
    titleColor: existing?.titleColor ?? "#ffffff",
    bodyColor: existing?.bodyColor ?? "#4d82b8",
    ...copy,
  };
}

function fillCityHeroV4Copy(config: HomepageConfig, preview: HomepagePreviewSettings): boolean {
  let changed = false;
  const clarkPage = (config.pages ?? []).find(
    (page) => page.slug === "clark-county-wa" || page.slug === "service-areas/clark-county-wa",
  );
  const clarkHero = clarkPage?.sections.find(
    (section) => section.group === "hero" && (section.variant === "hero-v4" || !section.variant),
  );
  const clarkBase =
    clarkHero?.id && preview.sections?.[clarkHero.id]?.heroV4
      ? preview.sections[clarkHero.id]?.heroV4
      : undefined;

  for (const page of config.pages ?? []) {
    const location = getServiceAreaLocationDefinition(page.slug);
    if (!location) continue;

    const hero = page.sections.find(
      (section) => section.group === "hero" && (section.variant === "hero-v4" || !section.variant),
    );
    if (!hero?.id) continue;

    const slot = ensureSlot(preview, hero.id);
    if (location.slug === "clark-county-wa" && slot.heroV4?.headline?.trim()) continue;
    if (location.slug !== "clark-county-wa" && !isGenericServiceAreaHeroHeadline(slot.heroV4?.headline)) {
      continue;
    }

    slot.heroV4 = buildServiceAreaLocationHeroV4(location, clarkBase ?? slot.heroV4);
    changed = true;
  }

  return changed;
}

/**
 * Fill missing section copy into homepage-config so LSD words live in org JSON,
 * not in demo-content special-cases. Generic orgs get add-section defaults.
 */
export function fillMissingSectionCopy(
  config: HomepageConfig,
  orgId: string,
  options?: { production?: boolean; sitePhone?: string },
): { config: HomepageConfig; changed: boolean } {
  const useProduction = options?.production ?? orgId === "lsd";
  const copyOrgId = useProduction ? "lsd" : orgId;
  const next: HomepageConfig = {
    ...config,
    previewSettings: config.previewSettings
      ? {
          ...config.previewSettings,
          sections: config.previewSettings.sections
            ? { ...config.previewSettings.sections }
            : {},
        }
      : { sections: {} },
  };

  const preview = ensurePreviewSettings(next);
  let changed = false;

  for (const entry of allSectionEntries(next)) {
    if (!entry.id) continue;
    const variant = resolveVariant(entry);
    const slot = ensureSlot(preview, entry.id);

    if (variant === "hero-v2.1" && !hasHeroCopy(slot.heroV21)) {
      slot.heroV21 = mergeHeroCopy(slot.heroV21 ?? preview.heroV21, copyOrgId);
      if (!hasHeroCopy(preview.heroV21)) {
        preview.heroV21 = mergeHeroCopy(preview.heroV21, copyOrgId);
      }
      changed = true;
    }

    if (variant === "portfolio-v1" && !hasPortfolioCopy(slot.portfolio)) {
      slot.portfolio = mergePortfolioCopy(slot.portfolio ?? preview.portfolio, copyOrgId);
      if (!hasPortfolioCopy(preview.portfolio)) {
        preview.portfolio = mergePortfolioCopy(preview.portfolio, copyOrgId);
      }
      changed = true;
    }

    if (variant === "services-v1") {
      const needsServicesCopy = !hasServicesCopy(slot.servicesV1);
      const needsLsdCtaFix = copyOrgId === "lsd" && hasStaleLsdServicesV1Cta(slot.servicesV1);
      if (needsServicesCopy || needsLsdCtaFix) {
        slot.servicesV1 = mergeServicesCopy(slot.servicesV1, copyOrgId);
        changed = true;
      }
    }

    if (variant === "reviewbox-v1" && !hasReviewboxCopy(slot.reviewbox)) {
      slot.reviewbox = mergeReviewboxCopy(slot.reviewbox ?? preview.reviewbox, copyOrgId);
      if (!hasReviewboxCopy(preview.reviewbox)) {
        preview.reviewbox = mergeReviewboxCopy(preview.reviewbox, copyOrgId);
      }
      changed = true;
    }

    if (
      (variant === "text-image-v1" || variant === "text-images-v1") &&
      fillTextImagePhoneCopy(slot, options?.sitePhone)
    ) {
      changed = true;
    }
  }

  if (copyOrgId === "lsd" && fillCityHeroV4Copy(next, preview)) {
    changed = true;
  }

  return { config: next, changed };
}

export function getPublishedProjects(config: HomepageConfig) {
  const fromLegacy = config.previewSettings?.portfolio?.projects;
  if (fromLegacy && fromLegacy.length > 0) return fromLegacy;
  for (const slot of Object.values(config.previewSettings?.sections ?? {})) {
    if (slot.portfolio?.projects && slot.portfolio.projects.length > 0) {
      return slot.portfolio.projects;
    }
  }
  return [];
}

export function getPublishedServices(config: HomepageConfig) {
  for (const slot of Object.values(config.previewSettings?.sections ?? {})) {
    if (slot.servicesV1?.services && slot.servicesV1.services.length > 0) {
      return slot.servicesV1.services;
    }
  }
  return [];
}
