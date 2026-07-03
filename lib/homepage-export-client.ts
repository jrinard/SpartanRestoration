"use client";

import type { HomepageConfig, HomepageSectionEntry } from "@/lib/homepage-config";
import { creativeStorageKeys } from "@/lib/creative-themes";
import type { ColorThemeId } from "@/lib/color-themes";
import { getColorTheme } from "@/lib/color-themes";
import type { FontThemeId } from "@/lib/creative-themes";
import { getFontTheme } from "@/lib/creative-themes";
import { contactPreviewStorageKey } from "@/lib/contact-preview-storage";
import { footerV3PreviewStorageKey } from "@/lib/footer-v3-preview-storage";
import { footerV1PreviewStorageKey } from "@/lib/footer-v1-preview-storage";
import { headerV3NavGradientStorageKey } from "@/lib/header-v3-storage";
import { heroBannerPreviewStorageKey } from "@/lib/hero-banner-preview-storage";
import { heroV1PreviewStorageKey } from "@/lib/hero-v1-preview-storage";
import { heroV21PreviewStorageKey, heroButtonPreviewStorageKey } from "@/lib/hero-v21-preview-storage";
import { copyContentInstanceSettings, loadAllContentInstanceSettings } from "@/lib/content-instance-storage";
import {
  getPlaygroundPageSections,
  homePlaygroundPageId,
  loadPlaygroundPagesState,
} from "@/lib/playground-pages";
import {
  getPlaygroundSectionVariant,
  getPreviewSections,
} from "@/lib/playground-sections";
import { portfolioPreviewStorageKey } from "@/lib/portfolio-preview-storage";
import { reviewboxPreviewStorageKey } from "@/lib/reviewbox-preview-storage";
import { textIconsV3PreviewStorageKey } from "@/lib/text-icons-v3-preview-storage";
import { textImagePreviewStorageKey } from "@/lib/text-image-preview-storage";
import { navBarPreviewStorageKey } from "@/lib/nav-bar-preview-storage";
import { topBarPreviewStorageKey } from "@/lib/top-bar-preview-storage";
import { servicesV1PreviewStorageKey } from "@/lib/services-v1-preview-storage";
import { servicesIconsV2PreviewStorageKey } from "@/lib/services-icons-v2-preview-storage";
import { loadAllSpacerInstanceSettings } from "@/lib/spacer-instance-storage";
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

export function collectHomepageConfigFromStorage(): HomepageConfig {
  const pagesState = loadPlaygroundPagesState();
  const playgroundSections = getPlaygroundPageSections(pagesState, homePlaygroundPageId);

  const sections: HomepageSectionEntry[] = getPreviewSections(playgroundSections).map(
    (section) => ({
      group: section.group,
      variant: getPlaygroundSectionVariant(section),
      ...(section.group === "spacer" || section.group === "content" ? { id: section.id } : {}),
    }),
  );

  const previewSpacers = getPreviewSections(playgroundSections).filter(
    (section) => section.group === "spacer",
  );
  const previewContents = getPreviewSections(playgroundSections).filter(
    (section) => section.group === "content",
  );
  const spacerInstances = loadAllSpacerInstanceSettings();
  const contentInstances = loadAllContentInstanceSettings();
  const spacers: HomepagePreviewSettings["spacers"] = {};
  const contents: HomepagePreviewSettings["contents"] = {};
  for (const section of previewSpacers) {
    const settings = spacerInstances[section.id];
    if (settings) {
      spacers[section.id] = settings;
    }
  }
  for (const section of previewContents) {
    const settings = contentInstances[section.id];
    if (settings) {
      contents[section.id] = settings;
    }
  }

  const storedColor = localStorage.getItem(creativeStorageKeys.colorTheme);
  const storedFont = localStorage.getItem(creativeStorageKeys.fontTheme);

  const previewSettings: HomepagePreviewSettings = {
    topBar: readJson(topBarPreviewStorageKey),
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
    contact: readJson(contactPreviewStorageKey),
    textIconsV3: readJson(textIconsV3PreviewStorageKey),
    textImage: readJson(textImagePreviewStorageKey),
    servicesIconsV2: readJson(servicesIconsV2PreviewStorageKey),
  };

  const hasPreviewSettings = Object.entries(previewSettings).some(([key, value]) => {
    if (key === "spacers" || key === "contents") {
      return value !== undefined && value !== null && Object.keys(value).length > 0;
    }
    return value !== undefined && value !== null;
  });

  return {
    sections,
    colorThemeId: storedColor ? getColorTheme(storedColor).id : ("lifespring" as ColorThemeId),
    fontThemeId: storedFont ? getFontTheme(storedFont).id : ("editorial" as FontThemeId),
    previewSettings: hasPreviewSettings ? previewSettings : undefined,
  };
}

export async function publishHomepageConfigFromStorage(): Promise<void> {
  const config = collectHomepageConfigFromStorage();

  if (config.sections.length === 0) {
    throw new Error("No sections are checked for Preview in the playground.");
  }

  const response = await fetch("/api/homepage-config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "publish", config }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to publish homepage.");
  }
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
