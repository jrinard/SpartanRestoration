"use client";

import type { HomepageConfig, HomepageSectionEntry } from "@/lib/homepage-config";
import { creativeStorageKeys } from "@/lib/creative-themes";
import { contactPreviewStorageKey } from "@/lib/contact-preview-storage";
import { ctaV1PreviewStorageKey } from "@/lib/cta-v1-preview-storage";
import { footerV3PreviewStorageKey } from "@/lib/footer-v3-preview-storage";
import { footerV1PreviewStorageKey } from "@/lib/footer-v1-preview-storage";
import { headerV3NavGradientStorageKey } from "@/lib/header-v3-storage";
import { heroBannerPreviewStorageKey } from "@/lib/hero-banner-preview-storage";
import { heroV1PreviewStorageKey } from "@/lib/hero-v1-preview-storage";
import {
  heroButtonPreviewStorageKey,
  heroV21PreviewStorageKey,
} from "@/lib/hero-v21-preview-storage";
import {
  homePlaygroundPageId,
  loadPlaygroundPagesState,
  savePlaygroundPagesState,
  updatePlaygroundPageSections,
} from "@/lib/playground-pages";
import { parsePlaygroundSectionOrder, type PlaygroundSectionConfig } from "@/lib/playground-sections";
import { portfolioPreviewStorageKey } from "@/lib/portfolio-preview-storage";
import { reviewboxPreviewStorageKey } from "@/lib/reviewbox-preview-storage";
import { textIconsV3PreviewStorageKey } from "@/lib/text-icons-v3-preview-storage";
import { textImagePreviewStorageKey } from "@/lib/text-image-preview-storage";
import { textImagesPreviewStorageKey } from "@/lib/text-images-preview-storage";
import { navBarPreviewStorageKey } from "@/lib/nav-bar-preview-storage";
import { topBarPreviewStorageKey } from "@/lib/top-bar-preview-storage";
import { servicesV1PreviewStorageKey } from "@/lib/services-v1-preview-storage";
import { servicesIconsV2PreviewStorageKey } from "@/lib/services-icons-v2-preview-storage";
import {
  spacerGradientStorageKey,
  spacerStripeStorageKey,
} from "@/lib/spacer-preview-storage";
import type { HomepagePreviewSettings } from "@/lib/homepage-settings";
import {
  sectionInstancesStorageKey,
  type SectionInstanceSettings,
} from "@/lib/section-instance-storage";
import { createPlaygroundSectionId } from "@/lib/playground-section-id";

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function writeOptionalJson(key: string, value: unknown | undefined): void {
  if (value === undefined || value === null) return;
  writeJson(key, value);
}

function buildSectionInstances(previewSettings: HomepagePreviewSettings): Record<string, SectionInstanceSettings> {
  const instances: Record<string, SectionInstanceSettings> = {};

  if (previewSettings.sections) {
    for (const [id, settings] of Object.entries(previewSettings.sections)) {
      instances[id] = { ...instances[id], ...settings };
    }
  }

  if (previewSettings.spacers) {
    for (const [id, spacer] of Object.entries(previewSettings.spacers)) {
      instances[id] = { ...instances[id], spacer };
    }
  }

  if (previewSettings.contents) {
    for (const [id, content] of Object.entries(previewSettings.contents)) {
      instances[id] = { ...instances[id], ...content };
    }
  }

  return instances;
}

function buildPlaygroundSectionsFromSnapshot(
  sections: HomepageSectionEntry[],
): PlaygroundSectionConfig[] {
  const snapshotSections = sections.map((section) => ({
    id: section.id ?? createPlaygroundSectionId(section.group),
    group: section.group,
    variant: section.variant,
    preview: true,
    hidden: false,
  }));

  const merged = parsePlaygroundSectionOrder(snapshotSections, {
    mergeMissingDefaults: true,
  });

  const snapshotIds = new Set(snapshotSections.map((section) => section.id));
  return merged.map((section) =>
    snapshotIds.has(section.id) ? { ...section, preview: true, hidden: false } : section,
  );
}

/** Hydrate playground localStorage from a saved homepage config snapshot. */
export function applyHomepageConfigToStorage(config: HomepageConfig): void {
  if (typeof window === "undefined") return;

  const previewSettings = config.previewSettings ?? {};

  localStorage.setItem(creativeStorageKeys.colorTheme, config.colorThemeId);
  localStorage.setItem(creativeStorageKeys.fontTheme, config.fontThemeId);

  let pagesState = loadPlaygroundPagesState();
  pagesState = updatePlaygroundPageSections(
    { ...pagesState, activePageId: homePlaygroundPageId },
    homePlaygroundPageId,
    buildPlaygroundSectionsFromSnapshot(config.sections),
  );

  if (config.pages) {
    for (const pageSnapshot of config.pages) {
      const playgroundPage = pagesState.pages.find(
        (page) => !page.isHome && page.slug === pageSnapshot.slug,
      );
      if (!playgroundPage) continue;

      pagesState = updatePlaygroundPageSections(
        pagesState,
        playgroundPage.id,
        buildPlaygroundSectionsFromSnapshot(pageSnapshot.sections),
      );
    }
  }

  savePlaygroundPagesState(pagesState);

  writeJson(sectionInstancesStorageKey, buildSectionInstances(previewSettings));

  writeOptionalJson(topBarPreviewStorageKey, previewSettings.topBar);
  writeOptionalJson(navBarPreviewStorageKey, previewSettings.navBar);
  writeOptionalJson(heroBannerPreviewStorageKey, previewSettings.heroBanner);
  writeOptionalJson(heroV1PreviewStorageKey, previewSettings.heroV1);
  writeOptionalJson(heroV21PreviewStorageKey, previewSettings.heroV21);
  writeOptionalJson(heroButtonPreviewStorageKey, previewSettings.heroV21);
  writeOptionalJson(headerV3NavGradientStorageKey, previewSettings.headerV3);
  writeOptionalJson(reviewboxPreviewStorageKey, previewSettings.reviewbox);
  writeOptionalJson(footerV3PreviewStorageKey, previewSettings.footerV3);
  writeOptionalJson(footerV1PreviewStorageKey, previewSettings.footerV1);
  writeOptionalJson(portfolioPreviewStorageKey, previewSettings.portfolio);
  writeOptionalJson(spacerStripeStorageKey, previewSettings.spacerStripe);
  writeOptionalJson(spacerGradientStorageKey, previewSettings.spacerGradient);
  writeOptionalJson(contactPreviewStorageKey, previewSettings.contact);
  writeOptionalJson(ctaV1PreviewStorageKey, previewSettings.ctaV1);
  writeOptionalJson(textIconsV3PreviewStorageKey, previewSettings.textIconsV3);
  writeOptionalJson(textImagePreviewStorageKey, previewSettings.textImage);
  writeOptionalJson(textImagesPreviewStorageKey, previewSettings.textImages);
  writeOptionalJson(servicesIconsV2PreviewStorageKey, previewSettings.servicesIconsV2);

  if (previewSettings.servicesV1LayoutWidth) {
    writeJson(servicesV1PreviewStorageKey, {
      layoutWidth: previewSettings.servicesV1LayoutWidth,
    });
  }
}
