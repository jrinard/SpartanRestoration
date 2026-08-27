import type {
  ServicesV1Background,
  ServiceV1,
  ServicesV1Cta,
} from "@/components/sections/Services-v1";
import type { ContactPreviewSettings } from "@/lib/contact-preview";
import type { CtaV1PreviewSettings } from "@/lib/cta-v1-preview";
import type { FooterV4PreviewSettings } from "@/lib/footer-v4-preview";
import type { FooterV1PreviewSettings } from "@/lib/footer-v1-preview";
import type { FooterV3PreviewSettings } from "@/lib/footer-v3-preview";
import type { HeaderV3PreviewSettings } from "@/lib/header-v3-gradient";
import type { HeroBannerPreviewSettings } from "@/lib/hero-banner-preview";
import type { HeroV1PreviewSettings } from "@/lib/hero-v1-preview";
import type { HeroV21PreviewSettings } from "@/lib/hero-v21-preview";
import type { HeroV4PreviewSettings } from "@/lib/hero-v4-preview";
import type { NavBarPreviewSettings } from "@/lib/nav-bar-preview";
import type { PortfolioPreviewSettings } from "@/lib/portfolio-preview";
import type { PortfolioV2PreviewSettings } from "@/lib/portfolio-v2-preview";
import type { ImagesV1PreviewSettings } from "@/lib/images-v1-preview";
import type { ReviewboxPreviewSettings } from "@/lib/reviewbox-preview";
import type { ReviewsPreviewSettings } from "@/lib/reviews-preview";
import type { ServiceAreaV1PreviewSettings } from "@/lib/service-area-preview";
import type { ServiceAreaV2PreviewSettings } from "@/lib/service-area-v2-preview";
import type { ServicesIconsV2PreviewSettings } from "@/lib/services-icons-v2-preview";
import type { ServicesV1LayoutWidth } from "@/lib/services-v1-preview";
import type { SpacerInstanceSettings } from "@/lib/spacer-instance-storage";
import type { TextIconsV3PreviewSettings } from "@/lib/text-icons-v3-preview";
import type { TextImagePreviewSettings } from "@/lib/text-image-preview";
import type { TextImagesPreviewSettings } from "@/lib/text-images-preview";
import type { TopBarPreviewSettings } from "@/lib/top-bar-preview";

import { orgStorageGet, orgStorageSet } from "@/lib/org/browser-storage";

export type ServicesV1InstanceSettings = {
  layoutWidth?: ServicesV1LayoutWidth;
  background?: ServicesV1Background;
  heading?: string;
  services?: ServiceV1[];
  cta?: ServicesV1Cta;
};

/** Per playground section slot — keyed by unique section id. */
export type SectionInstanceSettings = {
  topBar?: TopBarPreviewSettings;
  navBar?: NavBarPreviewSettings;
  headerV3?: HeaderV3PreviewSettings;
  heroBanner?: HeroBannerPreviewSettings;
  heroV1?: HeroV1PreviewSettings;
  heroV21?: HeroV21PreviewSettings;
  heroV4?: HeroV4PreviewSettings;
  spacer?: SpacerInstanceSettings;
  textIconsV3?: TextIconsV3PreviewSettings;
  textImage?: TextImagePreviewSettings;
  textImages?: TextImagesPreviewSettings;
  imagesV1?: ImagesV1PreviewSettings;
  servicesV1?: ServicesV1InstanceSettings;
  servicesIconsV2?: ServicesIconsV2PreviewSettings;
  serviceAreaV1?: ServiceAreaV1PreviewSettings;
  serviceAreaV2?: ServiceAreaV2PreviewSettings;
  reviewbox?: ReviewboxPreviewSettings;
  portfolio?: PortfolioPreviewSettings;
  portfolioV2?: PortfolioV2PreviewSettings;
  reviews?: ReviewsPreviewSettings;
  contact?: ContactPreviewSettings;
  ctaV1?: CtaV1PreviewSettings;
  footerV3?: FooterV3PreviewSettings;
  footerV1?: FooterV1PreviewSettings;
  footerV4?: FooterV4PreviewSettings;
};

export const sectionInstancesStorageKey = "lifespring-section-instances";

const legacyContentInstancesStorageKey = "lifespring-content-instances";
const legacySpacerInstancesStorageKey = "lifespring-spacer-instances";

function readJson<T>(raw: string | null): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function readLegacyContentInstances(): Record<string, SectionInstanceSettings> {
  if (typeof window === "undefined") return {};
  const raw = readJson<Record<string, SectionInstanceSettings>>(
    orgStorageGet(legacyContentInstancesStorageKey),
  );
  return raw ?? {};
}

function readLegacySpacerInstances(): Record<string, SpacerInstanceSettings> {
  if (typeof window === "undefined") return {};
  const raw = readJson<Record<string, SpacerInstanceSettings>>(
    orgStorageGet(legacySpacerInstancesStorageKey),
  );
  return raw ?? {};
}

function mergeLegacyInstances(): Record<string, SectionInstanceSettings> {
  const merged: Record<string, SectionInstanceSettings> = {};

  for (const [id, settings] of Object.entries(readLegacyContentInstances())) {
    merged[id] = { ...merged[id], ...settings };
  }

  for (const [id, settings] of Object.entries(readLegacySpacerInstances())) {
    merged[id] = { ...merged[id], spacer: settings };
  }

  return merged;
}

function readAllSectionInstancesRaw(): Record<string, SectionInstanceSettings> {
  if (typeof window === "undefined") return {};

  const unified = readJson<Record<string, SectionInstanceSettings>>(
    orgStorageGet(sectionInstancesStorageKey),
  );
  if (unified && Object.keys(unified).length > 0) {
    return unified;
  }

  const legacy = mergeLegacyInstances();
  if (Object.keys(legacy).length > 0) {
    orgStorageSet(sectionInstancesStorageKey, JSON.stringify(legacy));
  }

  return legacy;
}

function writeAllSectionInstances(instances: Record<string, SectionInstanceSettings>): void {
  if (typeof window === "undefined") return;
  orgStorageSet(sectionInstancesStorageKey, JSON.stringify(instances));
}

export function loadSectionInstanceSettings(
  instanceId: string,
): SectionInstanceSettings | undefined {
  return readAllSectionInstancesRaw()[instanceId];
}

export function saveSectionInstanceSettings(
  instanceId: string,
  settings: SectionInstanceSettings,
): void {
  const instances = readAllSectionInstancesRaw();
  instances[instanceId] = settings;
  writeAllSectionInstances(instances);
}

export function patchSectionInstanceSettings(
  instanceId: string,
  patch: Partial<SectionInstanceSettings>,
): void {
  const current = loadSectionInstanceSettings(instanceId) ?? {};
  saveSectionInstanceSettings(instanceId, { ...current, ...patch });
}

export function loadAllSectionInstanceSettings(): Record<string, SectionInstanceSettings> {
  return readAllSectionInstancesRaw();
}

/** Nav bar is site-wide — remove stale per-slot overrides from instance storage. */
export function stripNavBarFromAllSectionInstances(): boolean {
  const instances = readAllSectionInstancesRaw();
  let changed = false;

  for (const [instanceId, settings] of Object.entries(instances)) {
    if (!settings.navBar) continue;
    const { navBar: _removed, ...rest } = settings;
    instances[instanceId] = rest;
    changed = true;
  }

  if (changed) {
    writeAllSectionInstances(instances);
  }

  return changed;
}

export type SectionInstanceField = keyof SectionInstanceSettings;

export function loadSectionInstanceField<K extends SectionInstanceField>(
  instanceId: string,
  field: K,
): SectionInstanceSettings[K] | undefined {
  return loadSectionInstanceSettings(instanceId)?.[field];
}

export function saveSectionInstanceField<K extends SectionInstanceField>(
  instanceId: string,
  field: K,
  value: NonNullable<SectionInstanceSettings[K]>,
): void {
  patchSectionInstanceSettings(instanceId, { [field]: value } as Partial<SectionInstanceSettings>);
}
