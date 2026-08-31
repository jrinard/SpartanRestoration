"use client";

import type { HomepageConfig } from "@/lib/homepage-config";
import { creativeStorageKeys } from "@/lib/creative-themes";
import { contactPreviewStorageKey } from "@/lib/contact-preview-storage";
import { analyticsPreviewStorageKey } from "@/lib/analytics-preview-storage";
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
import { heroV4PreviewStorageKey } from "@/lib/hero-v4-preview-storage";
import {
  buildPlaygroundPagesStateFromHomepageConfig,
  savePlaygroundPagesState,
} from "@/lib/playground-pages";
import { portfolioPreviewStorageKey } from "@/lib/portfolio-preview-storage";
import { portfolioV2PreviewStorageKey } from "@/lib/portfolio-v2-preview-storage";
import { reviewboxPreviewStorageKey } from "@/lib/reviewbox-preview-storage";
import { textIconsV3PreviewStorageKey } from "@/lib/text-icons-v3-preview-storage";
import { textImagePreviewStorageKey } from "@/lib/text-image-preview-storage";
import { textImagesPreviewStorageKey } from "@/lib/text-images-preview-storage";
import { imagesV1PreviewStorageKey } from "@/lib/images-v1-preview-storage";
import { navBarPreviewStorageKey } from "@/lib/nav-bar-preview-storage";
import { topBarPreviewStorageKey } from "@/lib/top-bar-preview-storage";
import { servicesV1PreviewStorageKey } from "@/lib/services-v1-preview-storage";
import { servicesIconsV2PreviewStorageKey } from "@/lib/services-icons-v2-preview-storage";
import { serviceAreaV2PreviewStorageKey } from "@/lib/service-area-v2-preview-storage";
import { reviewsPreviewStorageKey } from "@/lib/reviews-preview-storage";
import {
  spacerGradientStorageKey,
  spacerStripeStorageKey,
} from "@/lib/spacer-preview-storage";
import type { HomepagePreviewSettings } from "@/lib/homepage-settings";
import {
  sectionInstancesStorageKey,
  type SectionInstanceSettings,
} from "@/lib/section-instance-storage";
import { faviconPreviewStorageKey } from "@/lib/favicon-preview-storage";
import { getClientOrgId, orgStorageSet, orgStorageRemove, clearCurrentOrgStorage, purgeLegacyGlobalPlaygroundKeys } from "@/lib/org/browser-storage";
import { normalizeLsdServicesV1Instance } from "@/lib/services-v1-cta";
import { reconcileHomePageGlobalPreviewSettings } from "@/lib/home-preview-sync";

function writeJson(key: string, value: unknown): void {
  orgStorageSet(key, JSON.stringify(value));
}

function writeOptionalJson(key: string, value: unknown | undefined): void {
  if (value === undefined || value === null) return;
  writeJson(key, value);
}

function buildSectionInstances(previewSettings: HomepagePreviewSettings): Record<string, SectionInstanceSettings> {
  const instances: Record<string, SectionInstanceSettings> = {};

  if (previewSettings.sections) {
    for (const [id, settings] of Object.entries(previewSettings.sections)) {
      const next =
        getClientOrgId() === "lsd" && settings.servicesV1
          ? { ...settings, servicesV1: normalizeLsdServicesV1Instance(settings.servicesV1) }
          : settings;
      instances[id] = { ...instances[id], ...next };
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

/** Hydrate playground localStorage from a saved homepage config snapshot. */
export function applyHomepageConfigToStorage(config: HomepageConfig): void {
  if (typeof window === "undefined") return;

  clearCurrentOrgStorage();
  purgeLegacyGlobalPlaygroundKeys();

  const previewSettings = reconcileHomePageGlobalPreviewSettings(config).previewSettings ?? {};

  orgStorageSet(creativeStorageKeys.colorTheme, config.colorThemeId);
  orgStorageSet(creativeStorageKeys.fontTheme, config.fontThemeId);
  if (config.pageBackgroundColor) {
    orgStorageSet(creativeStorageKeys.pageBackground, config.pageBackgroundColor);
  } else {
    orgStorageRemove(creativeStorageKeys.pageBackground);
  }

  savePlaygroundPagesState(buildPlaygroundPagesStateFromHomepageConfig(config));

  writeJson(sectionInstancesStorageKey, buildSectionInstances(previewSettings));

  writeOptionalJson(topBarPreviewStorageKey, previewSettings.topBar);
  writeOptionalJson(navBarPreviewStorageKey, previewSettings.navBar);
  writeOptionalJson(heroBannerPreviewStorageKey, previewSettings.heroBanner);
  writeOptionalJson(heroV1PreviewStorageKey, previewSettings.heroV1);
  writeOptionalJson(heroV21PreviewStorageKey, previewSettings.heroV21);
  writeOptionalJson(heroButtonPreviewStorageKey, previewSettings.heroV21);
  writeOptionalJson(heroV4PreviewStorageKey, previewSettings.heroV4);
  writeOptionalJson(headerV3NavGradientStorageKey, previewSettings.headerV3);
  writeOptionalJson(reviewboxPreviewStorageKey, previewSettings.reviewbox);
  writeOptionalJson(footerV3PreviewStorageKey, previewSettings.footerV3);
  writeOptionalJson(footerV1PreviewStorageKey, previewSettings.footerV1);
  writeOptionalJson(portfolioPreviewStorageKey, previewSettings.portfolio);
  writeOptionalJson(portfolioV2PreviewStorageKey, previewSettings.portfolioV2);
  writeOptionalJson(spacerStripeStorageKey, previewSettings.spacerStripe);
  writeOptionalJson(spacerGradientStorageKey, previewSettings.spacerGradient);
  writeOptionalJson(contactPreviewStorageKey, previewSettings.contact);
  writeOptionalJson(analyticsPreviewStorageKey, previewSettings.analytics);
  writeOptionalJson(faviconPreviewStorageKey, previewSettings.favicon);
  writeOptionalJson(ctaV1PreviewStorageKey, previewSettings.ctaV1);
  writeOptionalJson(textIconsV3PreviewStorageKey, previewSettings.textIconsV3);
  writeOptionalJson(textImagePreviewStorageKey, previewSettings.textImage);
  writeOptionalJson(textImagesPreviewStorageKey, previewSettings.textImages);
  writeOptionalJson(imagesV1PreviewStorageKey, previewSettings.imagesV1);
  writeOptionalJson(servicesIconsV2PreviewStorageKey, previewSettings.servicesIconsV2);
  writeOptionalJson(serviceAreaV2PreviewStorageKey, previewSettings.serviceAreaV2);
  writeOptionalJson(reviewsPreviewStorageKey, previewSettings.reviews);

  if (previewSettings.servicesV1LayoutWidth) {
    writeJson(servicesV1PreviewStorageKey, {
      layoutWidth: previewSettings.servicesV1LayoutWidth,
    });
  }
}
