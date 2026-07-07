import { getCommittedHomepagePreviewSettings, shouldUsePlaygroundPreviewSettings } from "@/lib/homepage-settings";
import {
  defaultPortfolioPreviewSettings,
  type PortfolioPreviewSettings,
  type PortfolioSectionTheme,
} from "@/lib/portfolio-preview";

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
    const stored = localStorage.getItem(portfolioPreviewStorageKey);
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
  localStorage.setItem(portfolioPreviewStorageKey, JSON.stringify(settings));
}
