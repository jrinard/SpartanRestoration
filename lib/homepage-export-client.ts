"use client";

import type {
  HomepageConfig,
  HomepagePageSnapshot,
  HomepageSectionEntry,
} from "@/lib/homepage-config";
import { creativeStorageKeys } from "@/lib/creative-themes";
import type { ColorThemeId } from "@/lib/color-themes";
import { getColorTheme } from "@/lib/color-themes";
import type { FontThemeId } from "@/lib/creative-themes";
import { getFontTheme } from "@/lib/creative-themes";
import type { ContactPreviewSettings } from "@/lib/contact-preview";
import {
  contactPreviewStorageKey,
  normalizeContactPreviewSettings,
} from "@/lib/contact-preview-storage";
import { findPlaygroundContactSectionId } from "@/lib/playground-contact-section";
import { ctaV1PreviewStorageKey } from "@/lib/cta-v1-preview-storage";
import { footerV3PreviewStorageKey } from "@/lib/footer-v3-preview-storage";
import { footerV1PreviewStorageKey } from "@/lib/footer-v1-preview-storage";
import { headerV3NavGradientStorageKey } from "@/lib/header-v3-storage";
import { heroBannerPreviewStorageKey } from "@/lib/hero-banner-preview-storage";
import { heroV1PreviewStorageKey } from "@/lib/hero-v1-preview-storage";
import { heroV21PreviewStorageKey, heroButtonPreviewStorageKey } from "@/lib/hero-v21-preview-storage";
import { loadAllSectionInstanceSettings } from "@/lib/section-instance-storage";
import {
  getPlaygroundPageSections,
  homePlaygroundPageId,
  loadPlaygroundPagesState,
  type PlaygroundPagesState,
} from "@/lib/playground-pages";
import {
  getPlaygroundSectionVariant,
  getPreviewSections,
  type PlaygroundSectionConfig,
} from "@/lib/playground-sections";
import { portfolioPreviewStorageKey } from "@/lib/portfolio-preview-storage";
import { reviewboxPreviewStorageKey } from "@/lib/reviewbox-preview-storage";
import { textIconsV3PreviewStorageKey } from "@/lib/text-icons-v3-preview-storage";
import { textImagePreviewStorageKey } from "@/lib/text-image-preview-storage";
import { textImagesPreviewStorageKey } from "@/lib/text-images-preview-storage";
import { navBarPreviewStorageKey } from "@/lib/nav-bar-preview-storage";
import {
  collectTopBarPreviewSettingsForExport,
} from "@/lib/top-bar-preview-storage";
import { servicesV1PreviewStorageKey } from "@/lib/services-v1-preview-storage";
import { servicesIconsV2PreviewStorageKey } from "@/lib/services-icons-v2-preview-storage";
import {
  spacerGradientStorageKey,
  spacerStripeStorageKey,
} from "@/lib/spacer-preview-storage";
import type { HomepagePreviewSettings } from "@/lib/homepage-settings";

function readJson<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return undefined;
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function resolveTopBarSettingsForExport(
  pagesState: PlaygroundPagesState,
  sectionInstances: ReturnType<typeof loadAllSectionInstanceSettings>,
) {
  return collectTopBarPreviewSettingsForExport(pagesState, sectionInstances);
}

function resolveContactSettingsForExport(
  pagesState: PlaygroundPagesState,
  sectionInstances: ReturnType<typeof loadAllSectionInstanceSettings>,
): ContactPreviewSettings | undefined {
  const fromGlobal = readJson<ContactPreviewSettings>(contactPreviewStorageKey);
  if (fromGlobal) {
    return normalizeContactPreviewSettings(fromGlobal);
  }

  const homeSections = getPlaygroundPageSections(pagesState, homePlaygroundPageId);
  const homeContactId = findPlaygroundContactSectionId(homeSections);
  if (homeContactId) {
    const fromHome = sectionInstances[homeContactId]?.contact;
    if (fromHome) return normalizeContactPreviewSettings(fromHome);
  }

  for (const page of pagesState.pages) {
    const sections = getPlaygroundPageSections(pagesState, page.id);
    const contactId = findPlaygroundContactSectionId(sections);
    if (!contactId) continue;

    const fromPage = sectionInstances[contactId]?.contact;
    if (fromPage) return normalizeContactPreviewSettings(fromPage);
  }

  return undefined;
}

function mapPreviewSectionsToEntries(
  sections: PlaygroundSectionConfig[],
): HomepageSectionEntry[] {
  return sections.map((section) => ({
    group: section.group,
    variant: getPlaygroundSectionVariant(section),
    id: section.id,
  }));
}

function collectPreviewSettingsFromPages(
  pagesState: PlaygroundPagesState,
): HomepagePreviewSettings {
  const sectionInstances = loadAllSectionInstanceSettings();
  const publishedSections: HomepagePreviewSettings["sections"] = {};
  const spacers: HomepagePreviewSettings["spacers"] = {};
  const contents: HomepagePreviewSettings["contents"] = {};

  for (const page of pagesState.pages) {
    const previewSectionSlots = getPreviewSections(
      getPlaygroundPageSections(pagesState, page.id),
    );

    for (const section of previewSectionSlots) {
      const settings = sectionInstances[section.id];
      if (!settings) continue;

      const { topBar: _topBar, ...sectionSettings } = settings;
      if (Object.keys(sectionSettings).length === 0) continue;

      publishedSections[section.id] = sectionSettings;

      if (settings.spacer) {
        spacers[section.id] = settings.spacer;
      }

      if (settings.textIconsV3 || settings.textImage || settings.textImages) {
        contents[section.id] = {
          textIconsV3: settings.textIconsV3,
          textImage: settings.textImage,
          textImages: settings.textImages,
        };
      }
    }
  }

  const previewSettings: HomepagePreviewSettings = {
    topBar: resolveTopBarSettingsForExport(pagesState, sectionInstances),
    navBar: readJson(navBarPreviewStorageKey),
    heroBanner: readJson(heroBannerPreviewStorageKey),
    heroV1: readJson(heroV1PreviewStorageKey),
    heroV21:
      readJson(heroV21PreviewStorageKey) ?? readJson(heroButtonPreviewStorageKey),
    headerV3: readJson(headerV3NavGradientStorageKey),
    reviewbox: readJson(reviewboxPreviewStorageKey),
    footerV3: readJson(footerV3PreviewStorageKey),
    footerV1: readJson(footerV1PreviewStorageKey),
    portfolio: readJson(portfolioPreviewStorageKey),
    servicesV1LayoutWidth: readJson<{ layoutWidth?: HomepagePreviewSettings["servicesV1LayoutWidth"] }>(
      servicesV1PreviewStorageKey,
    )?.layoutWidth,
    spacerStripe: readJson(spacerStripeStorageKey),
    spacerGradient: readJson(spacerGradientStorageKey),
    spacers: Object.keys(spacers).length > 0 ? spacers : undefined,
    contents: Object.keys(contents).length > 0 ? contents : undefined,
    sections: Object.keys(publishedSections).length > 0 ? publishedSections : undefined,
    contact: resolveContactSettingsForExport(pagesState, sectionInstances),
    ctaV1: readJson(ctaV1PreviewStorageKey),
    textIconsV3: readJson(textIconsV3PreviewStorageKey),
    textImage: readJson(textImagePreviewStorageKey),
    textImages: readJson(textImagesPreviewStorageKey),
    servicesIconsV2: readJson(servicesIconsV2PreviewStorageKey),
  };

  const hasPreviewSettings = Object.entries(previewSettings).some(([key, value]) => {
    if (key === "spacers" || key === "contents" || key === "sections") {
      return value !== undefined && value !== null && Object.keys(value).length > 0;
    }
    return value !== undefined && value !== null;
  });

  return hasPreviewSettings ? previewSettings : {};
}

export function collectHomepageConfigFromStorage(): HomepageConfig {
  const pagesState = loadPlaygroundPagesState();
  const homeSections = mapPreviewSectionsToEntries(
    getPreviewSections(getPlaygroundPageSections(pagesState, homePlaygroundPageId)),
  );

  const pages: HomepagePageSnapshot[] = pagesState.pages.flatMap((page) => {
    if (page.isHome) return [];

    const previewSections = getPreviewSections(
      getPlaygroundPageSections(pagesState, page.id),
    );
    if (previewSections.length === 0) return [];

    return [
      {
        slug: page.slug,
        name: page.name,
        sections: mapPreviewSectionsToEntries(previewSections),
      },
    ];
  });

  const previewSettings = collectPreviewSettingsFromPages(pagesState);
  const storedColor = localStorage.getItem(creativeStorageKeys.colorTheme);
  const storedFont = localStorage.getItem(creativeStorageKeys.fontTheme);

  return {
    sections: homeSections,
    pages: pages.length > 0 ? pages : undefined,
    colorThemeId: storedColor ? getColorTheme(storedColor).id : ("lifespring" as ColorThemeId),
    fontThemeId: storedFont ? getFontTheme(storedFont).id : ("editorial" as FontThemeId),
    previewSettings:
      Object.keys(previewSettings).length > 0
        ? (previewSettings as HomepageConfig["previewSettings"])
        : undefined,
  };
}

async function postHomepageConfigAction(
  action: "publish" | "stage",
  config: HomepageConfig,
): Promise<void> {
  const response = await fetch("/api/homepage-config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, config }),
  });

  if (!response.ok) {
    const message = await response.text();
    const fallback =
      action === "stage" ? "Failed to save staging preview." : "Failed to publish homepage.";
    throw new Error(message || fallback);
  }
}

export async function stageHomepageConfigFromStorage(): Promise<void> {
  const config = collectHomepageConfigFromStorage();

  if (config.sections.length === 0) {
    throw new Error("No sections are checked for Preview in the playground.");
  }

  await postHomepageConfigAction("stage", config);
}

export async function publishHomepageConfigFromStorage(): Promise<void> {
  const config = collectHomepageConfigFromStorage();

  if (config.sections.length === 0) {
    throw new Error("No sections are checked for Preview in the playground.");
  }

  await postHomepageConfigAction("publish", config);
}

export async function revertHomepageToConstruction(): Promise<void> {
  const response = await fetch("/api/homepage-config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "revert" }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to revert homepage.");
  }
}
