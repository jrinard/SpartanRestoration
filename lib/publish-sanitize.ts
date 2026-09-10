import type { HomepageConfig } from "@/lib/homepage-config";
import type { HeroV4PreviewSettings } from "@/lib/hero-v4-preview";
import type { SectionInstanceSettings } from "@/lib/section-instance-storage";

/** Drop hero fields that are toggled off — live + Vision pack should not ship dormant copy. */
export function sanitizeHeroV4ForPublish(
  settings: HeroV4PreviewSettings,
): HeroV4PreviewSettings {
  return {
    ...settings,
    servicePills: settings.showServicePills ? settings.servicePills : [],
    gallerySlides: settings.showGallery ? settings.gallerySlides : [],
    bullets: settings.showBullets ? settings.bullets : [],
  };
}

function sanitizeSectionSlot(slot: SectionInstanceSettings): SectionInstanceSettings {
  if (!slot.heroV4) return slot;
  return {
    ...slot,
    heroV4: sanitizeHeroV4ForPublish(slot.heroV4),
  };
}

/** Strip disabled subsection data before Vision pack / publish export. */
export function sanitizeHomepageConfigForPublish(config: HomepageConfig): HomepageConfig {
  const sections = config.previewSettings?.sections;
  if (!sections) return config;

  const nextSections = Object.fromEntries(
    Object.entries(sections).map(([id, slot]) => [id, sanitizeSectionSlot(slot)]),
  );

  return {
    ...config,
    previewSettings: {
      ...config.previewSettings,
      sections: nextSections,
    },
  };
}
