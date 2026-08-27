import { getCommittedHomepagePreviewSettings, shouldUsePlaygroundPreviewSettings } from "@/lib/homepage-settings";
import {
  defaultPortfolioPreviewSettings,
  type PortfolioPreviewSettings,
  type PortfolioSectionTheme,
} from "@/lib/portfolio-preview";

import { orgStorageGet, orgStorageSet } from "@/lib/org/browser-storage";

export const portfolioPreviewStorageKey = "lifespring-portfolio-preview";

function isPortfolioSectionTheme(value: unknown): value is PortfolioSectionTheme {
  return value === "dark" || value === "light";
}

function normalizePortfolioPreviewSettings(
  value: Partial<PortfolioPreviewSettings>,
): PortfolioPreviewSettings {
  return {
    theme: isPortfolioSectionTheme(value.theme)
      ? value.theme
      : defaultPortfolioPreviewSettings.theme,
    heading: typeof value.heading === "string" ? value.heading : defaultPortfolioPreviewSettings.heading,
    projects: Array.isArray(value.projects) ? value.projects : defaultPortfolioPreviewSettings.projects,
    brandingProjects: Array.isArray(value.brandingProjects)
      ? value.brandingProjects
      : defaultPortfolioPreviewSettings.brandingProjects,
    ctaLabel: typeof value.ctaLabel === "string" ? value.ctaLabel : undefined,
    ctaHref: typeof value.ctaHref === "string" ? value.ctaHref : undefined,
  };
}

function isPortfolioPreviewSettings(value: unknown): value is Partial<PortfolioPreviewSettings> {
  if (!value || typeof value !== "object") return false;

  const settings = value as Partial<PortfolioPreviewSettings>;
  if (settings.theme !== undefined && !isPortfolioSectionTheme(settings.theme)) return false;

  return true;
}

export function loadPortfolioPreviewSettings(): PortfolioPreviewSettings {
  if (!shouldUsePlaygroundPreviewSettings()) {
    const committed = getCommittedHomepagePreviewSettings()?.portfolio;
    if (committed) return normalizePortfolioPreviewSettings(committed);
  }

  if (typeof window === "undefined") {
    return defaultPortfolioPreviewSettings;
  }

  try {
    const stored = orgStorageGet(portfolioPreviewStorageKey);
    if (!stored) return defaultPortfolioPreviewSettings;

    const parsed: unknown = JSON.parse(stored);
    if (isPortfolioPreviewSettings(parsed)) return normalizePortfolioPreviewSettings(parsed);
  } catch {
    // ignore invalid storage
  }

  return defaultPortfolioPreviewSettings;
}

export function savePortfolioPreviewSettings(settings: PortfolioPreviewSettings): void {
  if (typeof window === "undefined") return;
  orgStorageSet(portfolioPreviewStorageKey, JSON.stringify(settings));
}
