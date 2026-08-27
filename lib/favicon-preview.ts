import { siteConfig } from "@/config/site";
import { normalizePublicImageSrc } from "@/lib/image-library";

/** Browser tab meta and favicon assets saved with homepage publish. */
export type FaviconPreviewSettings = {
  /** Full document title shown in the browser tab on the homepage. */
  browserTitle: string;
  /** Browser tab icon — use a 32×32 PNG. */
  favicon32: string;
  /** Apple home screen / bookmark icon — use a 180×180 PNG. */
  favicon180: string;
};

export const defaultFaviconPreviewSettings: FaviconPreviewSettings = {
  browserTitle: siteConfig.name,
  favicon32: siteConfig.assets.favicon,
  favicon180: siteConfig.assets.appleTouchIcon,
};

/** Title used in the tab and metadata — trims edges, falls back to site default when empty. */
export function getEffectiveBrowserTitle(
  settings?: Partial<FaviconPreviewSettings> | null,
): string {
  const raw =
    typeof settings?.browserTitle === "string"
      ? settings.browserTitle
      : defaultFaviconPreviewSettings.browserTitle;

  const trimmed = raw.trim();
  return trimmed || defaultFaviconPreviewSettings.browserTitle;
}

export function normalizeFaviconPreviewSettings(
  value: Partial<FaviconPreviewSettings> | null | undefined,
): FaviconPreviewSettings {
  if (!value || typeof value !== "object") {
    return { ...defaultFaviconPreviewSettings };
  }

  return {
    browserTitle:
      typeof value.browserTitle === "string"
        ? value.browserTitle
        : defaultFaviconPreviewSettings.browserTitle,
    favicon32:
      normalizePublicImageSrc(value.favicon32) ?? defaultFaviconPreviewSettings.favicon32,
    favicon180:
      normalizePublicImageSrc(value.favicon180) ?? defaultFaviconPreviewSettings.favicon180,
  };
}

export function buildFaviconMetadataIcons(
  settings?: Partial<FaviconPreviewSettings> | null,
) {
  const normalized = normalizeFaviconPreviewSettings(settings ?? undefined);

  return {
    icon: [
      {
        url: normalized.favicon32,
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: normalized.favicon180,
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}

export const faviconPreviewUpdatedEvent = "lifespring-favicon-preview-updated";

export function notifyFaviconPreviewUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(faviconPreviewUpdatedEvent));
}
