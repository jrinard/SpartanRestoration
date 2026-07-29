import { siteConfig } from "@/config/site";
import { normalizePublicImageSrc } from "@/lib/image-library";

/** Favicon assets saved with homepage publish. */
export type FaviconPreviewSettings = {
  /** Browser tab icon — use a 32×32 PNG. */
  favicon32: string;
  /** Apple home screen / bookmark icon — use a 180×180 PNG. */
  favicon180: string;
};

export const defaultFaviconPreviewSettings: FaviconPreviewSettings = {
  favicon32: siteConfig.assets.favicon,
  favicon180: siteConfig.assets.appleTouchIcon,
};

export function normalizeFaviconPreviewSettings(
  value: Partial<FaviconPreviewSettings> | null | undefined,
): FaviconPreviewSettings {
  if (!value || typeof value !== "object") {
    return { ...defaultFaviconPreviewSettings };
  }

  return {
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
