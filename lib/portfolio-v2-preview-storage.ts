import { getCommittedHomepagePreviewSettings } from "@/lib/homepage-settings";
import type { PortfolioSectionTheme } from "@/lib/portfolio-preview";
import {
  clampPortfolioV2OverlayOpacity,
  clampPortfolioV2HoverOpacity,
  clampPortfolioV2HoverScale,
  defaultPortfolioV2PreviewSettings,
  defaultPortfolioV2Tabs,
  defaultPortfolioV2TabCount,
  resolvePortfolioV2TabLabel,
  type PortfolioV2ModalImage,
  type PortfolioV2PreviewSettings,
  type PortfolioV2Tab,
} from "@/lib/portfolio-v2-preview";
import { createPortfolioV2TabId } from "@/lib/portfolio-v2-tabs";
import type { SiteLayoutWidth } from "@/lib/site-layout";

import { orgStorageGet, orgStorageSet } from "@/lib/org/browser-storage";

export const portfolioV2PreviewStorageKey = "lifespring-portfolio-v2-preview";

function isPortfolioSectionTheme(value: unknown): value is PortfolioSectionTheme {
  return value === "dark" || value === "light";
}

function isSiteLayoutWidth(value: unknown): value is SiteLayoutWidth {
  return value === "contained" || value === "full";
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function isPositiveNumber(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return fallback;
  return value;
}

function normalizePortfolioV2ModalImage(
  value: unknown,
  fallback: PortfolioV2ModalImage,
): PortfolioV2ModalImage {
  if (!value || typeof value !== "object") return fallback;
  const image = value as Partial<PortfolioV2ModalImage>;
  return {
    id:
      typeof image.id === "string" && image.id.trim()
        ? image.id.trim()
        : fallback.id,
    imageSrc: typeof image.imageSrc === "string" ? image.imageSrc.trim() : fallback.imageSrc,
    imageAlt: typeof image.imageAlt === "string" ? image.imageAlt.trim() : fallback.imageAlt,
  };
}

function normalizePortfolioV2ModalImages(value: unknown): PortfolioV2ModalImage[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry, index) =>
    normalizePortfolioV2ModalImage(entry, {
      id: `portfolio-v2-image-${index + 1}`,
      imageSrc: "",
      imageAlt: "",
    }),
  );
}

function normalizePortfolioV2Tab(value: unknown, fallback: PortfolioV2Tab): PortfolioV2Tab {
  if (!value || typeof value !== "object") return fallback;
  const tab = value as Partial<PortfolioV2Tab>;
  const id = typeof tab.id === "string" && tab.id.trim() ? tab.id.trim() : fallback.id;
  const rawLabel = typeof tab.label === "string" ? tab.label.trim() : fallback.label;

  return {
    id,
    label: resolvePortfolioV2TabLabel(id, rawLabel),
    backgroundImageSrc:
      typeof tab.backgroundImageSrc === "string"
        ? tab.backgroundImageSrc.trim()
        : fallback.backgroundImageSrc,
    backgroundOverlayColor: isHexColor(tab.backgroundOverlayColor)
      ? tab.backgroundOverlayColor
      : fallback.backgroundOverlayColor,
    backgroundOverlayOpacity: clampPortfolioV2OverlayOpacity(
      typeof tab.backgroundOverlayOpacity === "number"
        ? tab.backgroundOverlayOpacity
        : fallback.backgroundOverlayOpacity,
    ),
    labelColor: isHexColor(tab.labelColor) ? tab.labelColor : fallback.labelColor,
    modalImages: normalizePortfolioV2ModalImages(tab.modalImages),
  };
}

function clonePortfolioV2Tab(tab: PortfolioV2Tab): PortfolioV2Tab {
  return {
    ...tab,
    modalImages: tab.modalImages.map((image) => ({ ...image })),
  };
}

function normalizePortfolioV2Tabs(value: unknown): PortfolioV2Tab[] {
  if (!Array.isArray(value) || value.length === 0) {
    return defaultPortfolioV2Tabs.map(clonePortfolioV2Tab);
  }

  const normalized = value.map((entry, index) =>
    normalizePortfolioV2Tab(
      entry,
      defaultPortfolioV2Tabs[index] ?? {
        ...defaultPortfolioV2Tabs[0]!,
        id: createPortfolioV2TabId(),
        modalImages: [],
      },
    ),
  );

  while (normalized.length < defaultPortfolioV2TabCount) {
    const index = normalized.length;
    const fallback = defaultPortfolioV2Tabs[index];
    if (fallback) {
      normalized.push(clonePortfolioV2Tab(fallback));
    }
  }

  return normalized;
}

export function normalizePortfolioV2PreviewSettings(
  value: Partial<PortfolioV2PreviewSettings>,
): PortfolioV2PreviewSettings {
  return {
    ...defaultPortfolioV2PreviewSettings,
    ...value,
    theme: isPortfolioSectionTheme(value.theme)
      ? value.theme
      : defaultPortfolioV2PreviewSettings.theme,
    layoutWidth: isSiteLayoutWidth(value.layoutWidth)
      ? value.layoutWidth
      : defaultPortfolioV2PreviewSettings.layoutWidth,
    sliceWidthPx: isPositiveNumber(
      value.sliceWidthPx,
      defaultPortfolioV2PreviewSettings.sliceWidthPx,
    ),
    sliceHeightPx: isPositiveNumber(
      value.sliceHeightPx,
      defaultPortfolioV2PreviewSettings.sliceHeightPx,
    ),
    gapPx: isPositiveNumber(value.gapPx, defaultPortfolioV2PreviewSettings.gapPx),
    sectionPaddingTopPx: isPositiveNumber(
      value.sectionPaddingTopPx,
      defaultPortfolioV2PreviewSettings.sectionPaddingTopPx,
    ),
    sectionPaddingBottomPx: isPositiveNumber(
      value.sectionPaddingBottomPx,
      defaultPortfolioV2PreviewSettings.sectionPaddingBottomPx,
    ),
    sectionHeightPx: isPositiveNumber(
      value.sectionHeightPx,
      defaultPortfolioV2PreviewSettings.sectionHeightPx,
    ),
    angledLabels:
      typeof value.angledLabels === "boolean"
        ? value.angledLabels
        : typeof (value as { diamondLayout?: boolean }).diamondLayout === "boolean"
          ? (value as { diamondLayout: boolean }).diamondLayout
          : defaultPortfolioV2PreviewSettings.angledLabels,
    horizontalLayout:
      typeof value.horizontalLayout === "boolean"
        ? value.horizontalLayout
        : defaultPortfolioV2PreviewSettings.horizontalLayout,
    sliceHoverColor: isHexColor(value.sliceHoverColor)
      ? value.sliceHoverColor
      : defaultPortfolioV2PreviewSettings.sliceHoverColor,
    sliceHoverOpacity: clampPortfolioV2HoverOpacity(
      typeof value.sliceHoverOpacity === "number"
        ? value.sliceHoverOpacity
        : defaultPortfolioV2PreviewSettings.sliceHoverOpacity,
    ),
    sliceHoverScale: clampPortfolioV2HoverScale(
      typeof value.sliceHoverScale === "number"
        ? value.sliceHoverScale
        : defaultPortfolioV2PreviewSettings.sliceHoverScale,
    ),
    sectionHeading: normalizeOptionalString(value.sectionHeading),
    sectionDescription: normalizeOptionalString(value.sectionDescription),
    sectionDescriptionColor: isHexColor(value.sectionDescriptionColor)
      ? value.sectionDescriptionColor
      : undefined,
    tabs: normalizePortfolioV2Tabs(value.tabs),
  };
}

function isPortfolioV2PreviewSettings(
  value: unknown,
): value is Partial<PortfolioV2PreviewSettings> {
  if (!value || typeof value !== "object") return false;
  return Array.isArray((value as Partial<PortfolioV2PreviewSettings>).tabs);
}

export function loadPortfolioV2PreviewSettings(): PortfolioV2PreviewSettings {
  const committed = getCommittedHomepagePreviewSettings()?.portfolioV2;
  if (committed) return normalizePortfolioV2PreviewSettings(committed);

  if (typeof window === "undefined") {
    return defaultPortfolioV2PreviewSettings;
  }

  try {
    const stored = orgStorageGet(portfolioV2PreviewStorageKey);
    if (!stored) return defaultPortfolioV2PreviewSettings;

    const parsed: unknown = JSON.parse(stored);
    if (isPortfolioV2PreviewSettings(parsed)) {
      return normalizePortfolioV2PreviewSettings(parsed);
    }
  } catch {
    // ignore invalid storage
  }

  return defaultPortfolioV2PreviewSettings;
}

export function savePortfolioV2PreviewSettings(settings: PortfolioV2PreviewSettings): void {
  if (typeof window === "undefined") return;
  orgStorageSet(portfolioV2PreviewStorageKey, JSON.stringify(settings));
}
