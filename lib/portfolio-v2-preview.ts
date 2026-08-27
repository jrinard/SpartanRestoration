import type { CSSProperties } from "react";
import type { SiteLayoutWidth } from "@/lib/site-layout";
import { getSiteLayoutWidthClassName } from "@/lib/site-layout";
import type { PortfolioSectionTheme } from "@/lib/portfolio-preview";

export { portfolioSectionThemes } from "@/lib/portfolio-preview";
export type { PortfolioSectionTheme };

export type PortfolioV2ModalImage = {
  id: string;
  imageSrc: string;
  imageAlt: string;
};

export type PortfolioV2Tab = {
  id: string;
  label: string;
  backgroundImageSrc: string;
  backgroundOverlayColor: string;
  /** 0–1 overlay strength over the tab background image. */
  backgroundOverlayOpacity: number;
  labelColor: string;
  modalImages: PortfolioV2ModalImage[];
};

export type PortfolioV2PreviewSettings = {
  theme: PortfolioSectionTheme;
  layoutWidth: SiteLayoutWidth;
  sliceWidthPx: number;
  sliceHeightPx: number;
  gapPx: number;
  sectionPaddingTopPx: number;
  sectionPaddingBottomPx: number;
  /** Total height of the slice row area; 0 = auto (padding + slice height). */
  sectionHeightPx: number;
  /** Backslash parallelogram slices + angled labels (straight top/bottom edges). */
  angledLabels: boolean;
  /** Stack tabs vertically — each slice rotated 90° clockwise into a horizontal bar. */
  horizontalLayout: boolean;
  /** Tint color mixed over the slice on hover. */
  sliceHoverColor: string;
  /** 0–1 hover tint strength. */
  sliceHoverOpacity: number;
  /** Scale multiplier on hover (e.g. 1.04). */
  sliceHoverScale: number;
  /** Section title shown beside the slice row. */
  sectionHeading?: string;
  /** Intro copy below the section title. */
  sectionDescription?: string;
  /** Intro text color — defaults to white (dark) / black (light) when unset. */
  sectionDescriptionColor?: string;
  tabs: PortfolioV2Tab[];
};

export const defaultPortfolioV2SampleImage = "/stone/library/Sample-Content-Image.png";

/** Pure black slice overlay — rgb(0, 0, 0). */
export const portfolioV2OverlayBlack = "#000000";
/** Charcoal slice overlay — rgb(26, 26, 26). */
export const portfolioV2OverlayCharcoal = "#1a1a1a";
export const defaultPortfolioV2OverlayOpacity = 0.5;

/**
 * Visual baseline — angled portfolio-v2 (Stone Pillar, 2026-08-05).
 * User-confirmed alignment. Restore these if a future tweak needs rollback.
 *
 * Slice slant: clip-path polygon(52% 0, 100% 0, 48% 100%, 0 100%) + seam overlap 52% of width.
 * Label rotation is derived from slice W×H + inset (parallel to parallelogram sides).
 */
export const portfolioV2VisualBaseline = {
  savedAt: "2026-08-05",
  sliceClipInsetPercent: 52,
  layout: {
    sliceWidthPx: 90,
    sliceHeightPx: 290,
    gapPx: 0,
    sectionHeightPx: 293,
    angledLabels: true,
  },
  hover: {
    color: "#ffffff",
    opacity: 0.28,
    scale: 1.04,
  },
} as const;

export function getPortfolioV2DefaultOverlayColor(index: number): string {
  return index % 2 === 0 ? portfolioV2OverlayBlack : portfolioV2OverlayCharcoal;
}

function createDefaultModalImages(prefix: string, count = 4): PortfolioV2ModalImage[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `portfolio-v2-image-${prefix}-${index + 1}`,
    imageSrc: defaultPortfolioV2SampleImage,
    imageAlt: `${prefix} portfolio photo ${index + 1}`,
  }));
}

function createDefaultPortfolioV2Tab(
  label: string,
  index: number,
  id?: string,
): PortfolioV2Tab {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return {
    id: id ?? `portfolio-v2-tab-${slug}`,
    label,
    backgroundImageSrc: defaultPortfolioV2SampleImage,
    backgroundOverlayColor: getPortfolioV2DefaultOverlayColor(index),
    backgroundOverlayOpacity: defaultPortfolioV2OverlayOpacity,
    labelColor: "#ffffff",
    modalImages: createDefaultModalImages(label),
  };
}

/** Kitchen Cabinets + 6 portfolio categories — 7 slices total. */
export const defaultPortfolioV2TabLabels = [
  "Kitchen Cabinets / Vanity",
  "Misc Exterior",
  "Misc Interior",
  "Pillar Base Resurfacing",
  "Garage Demolition",
  "Patio Enclosures",
  "Custom Restaurant Benches",
] as const;

export const defaultPortfolioV2TabCount = defaultPortfolioV2TabLabels.length;

/** Horizontal list layout — tabs per left column before the second column starts. */
export const portfolioV2ListFirstColumnTabCount = 4;

export function splitPortfolioV2TabsForListColumns(tabs: PortfolioV2Tab[]): {
  firstColumn: PortfolioV2Tab[];
  secondColumn: PortfolioV2Tab[];
} {
  const splitAt = portfolioV2ListFirstColumnTabCount;
  return {
    firstColumn: tabs.slice(0, splitAt),
    secondColumn: tabs.slice(splitAt),
  };
}

export const defaultPortfolioV2Tabs: PortfolioV2Tab[] = defaultPortfolioV2TabLabels.map(
  (label, index) =>
    createDefaultPortfolioV2Tab(
      label,
      index,
      index === 0 ? "portfolio-v2-tab-cabinets" : undefined,
    ),
);

/** Renames legacy tab ids / labels saved before Stone Pillar slice names. */
const portfolioV2LegacyTabLabelById: Record<string, string> = {
  "portfolio-v2-tab-countertops": "Misc Exterior",
  "portfolio-v2-tab-tile": "Misc Interior",
  "portfolio-v2-tab-remodeling": "Pillar Base Resurfacing",
};

const portfolioV2LegacyTabLabelByText: Record<string, string> = {
  Cabinets: "Kitchen Cabinets / Vanity",
  Countertops: "Misc Exterior",
  Tile: "Misc Interior",
  Remodeling: "Pillar Base Resurfacing",
};

export function resolvePortfolioV2TabLabel(id: string, label: string): string {
  const byId = portfolioV2LegacyTabLabelById[id.trim()];
  if (byId) return byId;

  const trimmed = label.trim();
  return portfolioV2LegacyTabLabelByText[trimmed] ?? trimmed;
};

/** Clip-path inset — steeper `\` cut; seam overlap matches for flush tiles (see portfolioV2VisualBaseline). */
export const portfolioV2SliceClipInsetPercent = portfolioV2VisualBaseline.sliceClipInsetPercent;
export const portfolioV2SliceClipInsetRatio = portfolioV2SliceClipInsetPercent / 100;

export function getPortfolioV2SliceSeamOverlapPx(settings: PortfolioV2PreviewSettings): number {
  return Math.round(settings.sliceWidthPx * portfolioV2SliceClipInsetRatio);
}

/** Stacked list row height (derived from slice W, capped for a compact section). */
export function getPortfolioV2ListBarHeightPx(settings: PortfolioV2PreviewSettings): number {
  const scaled = Math.round(settings.sliceWidthPx * 0.58);
  return Math.min(64, Math.max(40, scaled));
}

/** Stacked list row width (derived from slice H, capped). */
export function getPortfolioV2ListBarWidthPx(settings: PortfolioV2PreviewSettings): number {
  const scaled = Math.round(settings.sliceHeightPx * 0.76);
  return Math.min(280, Math.max(180, scaled));
}

export function getPortfolioV2ListSeamOverlapPx(settings: PortfolioV2PreviewSettings): number {
  return Math.round(getPortfolioV2ListBarHeightPx(settings) * portfolioV2SliceClipInsetRatio);
}

export const defaultPortfolioV2SliceWidthPx = 90;
export const defaultPortfolioV2SliceHeightPx = 290;
/** Compact horizontal list row — shorter than swapping slice W×H. */
export const defaultPortfolioV2ListBarHeightPx = 52;
export const defaultPortfolioV2ListBarWidthPx = 220;
export const defaultPortfolioV2GapPx = 0;
export const defaultPortfolioV2SectionHeightPx = 293;
export const defaultPortfolioV2SliceHoverColor = "#ffffff";
export const defaultPortfolioV2SliceHoverOpacity = 0.28;
export const defaultPortfolioV2SliceHoverScale = 1.04;
export const defaultPortfolioV2SectionHeading = "Portfolio";
export const defaultPortfolioV2SectionDescription =
  "You deserve craftsmanship you can see and trust. Our portfolio spans residential and commercial projects, each one finished with the same care we’ll bring to yours. Browse the categories below to explore completed work and current builds.";
export const portfolioV2DarkIntroColor = "#ffffff";
export const portfolioV2LightIntroColor = "#000000";

export function getPortfolioV2SectionDescriptionColor(
  settings: PortfolioV2PreviewSettings,
): string {
  const custom = settings.sectionDescriptionColor?.trim();
  if (custom && /^#[0-9a-fA-F]{6}$/.test(custom)) return custom;
  return settings.theme === "light" ? portfolioV2LightIntroColor : portfolioV2DarkIntroColor;
}

export const defaultPortfolioV2PreviewSettings: PortfolioV2PreviewSettings = {
  theme: "dark",
  layoutWidth: "contained",
  sliceWidthPx: defaultPortfolioV2SliceWidthPx,
  sliceHeightPx: defaultPortfolioV2SliceHeightPx,
  gapPx: defaultPortfolioV2GapPx,
  sectionPaddingTopPx: 0,
  sectionPaddingBottomPx: 0,
  sectionHeightPx: defaultPortfolioV2SectionHeightPx,
  angledLabels: true,
  horizontalLayout: false,
  sliceHoverColor: defaultPortfolioV2SliceHoverColor,
  sliceHoverOpacity: defaultPortfolioV2SliceHoverOpacity,
  sliceHoverScale: defaultPortfolioV2SliceHoverScale,
  sectionHeading: defaultPortfolioV2SectionHeading,
  sectionDescription: defaultPortfolioV2SectionDescription,
  tabs: defaultPortfolioV2Tabs,
};

export function getPortfolioV2LayoutWidthClassName(layoutWidth: SiteLayoutWidth): string {
  return getSiteLayoutWidthClassName(layoutWidth);
}

export function getPortfolioV2EffectiveSliceHeightPx(settings: PortfolioV2PreviewSettings): number {
  const sliceHeight = settings.sliceHeightPx;
  if (settings.sectionHeightPx <= 0) return sliceHeight;

  const available =
    settings.sectionHeightPx - settings.sectionPaddingTopPx - settings.sectionPaddingBottomPx;
  if (available <= 0) return sliceHeight;

  return Math.min(sliceHeight, available);
}

/** Label angle (deg) parallel to the clip-path `\` edge for the given slice dimensions. */
export function getPortfolioV2LabelRotateDeg(settings: PortfolioV2PreviewSettings): number {
  const horizontalRun = settings.sliceWidthPx * portfolioV2SliceClipInsetRatio;
  const height = getPortfolioV2EffectiveSliceHeightPx(settings);
  if (horizontalRun <= 0 || height <= 0) return -90;

  const degrees = (Math.atan2(-height, horizontalRun) * 180) / Math.PI;
  return Math.round(degrees * 100) / 100;
}

/** Horizontal padding on the slice row. */
export function getPortfolioV2TrackPadXPx(_settings: PortfolioV2PreviewSettings): number {
  return 8;
}

export function getPortfolioV2CssVariables(settings: PortfolioV2PreviewSettings): CSSProperties {
  return {
    "--portfolio-v2-slice-width": `${settings.sliceWidthPx}px`,
    "--portfolio-v2-slice-height": `${getPortfolioV2EffectiveSliceHeightPx(settings)}px`,
    "--portfolio-v2-gap": `${settings.gapPx}px`,
    "--portfolio-v2-track-pad-x": `${getPortfolioV2TrackPadXPx(settings)}px`,
    "--portfolio-v2-slice-hover-color": settings.sliceHoverColor,
    "--portfolio-v2-slice-hover-opacity": String(settings.sliceHoverOpacity),
    "--portfolio-v2-slice-hover-scale": String(settings.sliceHoverScale),
    "--portfolio-v2-intro-color": getPortfolioV2SectionDescriptionColor(settings),
    ...(settings.horizontalLayout
      ? {
          "--portfolio-v2-list-bar-width": `${getPortfolioV2ListBarWidthPx(settings)}px`,
          "--portfolio-v2-list-bar-height": `${getPortfolioV2ListBarHeightPx(settings)}px`,
        }
      : undefined),
    ...(settings.angledLabels
      ? {
          "--portfolio-v2-slice-clip-inset": `${portfolioV2SliceClipInsetPercent}%`,
          "--portfolio-v2-label-rotate": `${getPortfolioV2LabelRotateDeg(settings)}deg`,
          "--portfolio-v2-slice-seam-overlap": `${
            settings.horizontalLayout
              ? getPortfolioV2ListSeamOverlapPx(settings)
              : getPortfolioV2SliceSeamOverlapPx(settings)
          }px`,
        }
      : undefined),
  } as CSSProperties;
}

export function clampPortfolioV2OverlayOpacity(value: number): number {
  if (!Number.isFinite(value)) return defaultPortfolioV2OverlayOpacity;
  return Math.min(1, Math.max(0, value));
}

export function clampPortfolioV2HoverOpacity(value: number): number {
  if (!Number.isFinite(value)) return defaultPortfolioV2SliceHoverOpacity;
  return Math.min(1, Math.max(0, value));
}

export function clampPortfolioV2HoverScale(value: number): number {
  if (!Number.isFinite(value)) return defaultPortfolioV2SliceHoverScale;
  return Math.min(1.15, Math.max(1, value));
}

/** Angled parallelogram slices in the vertical row layout. */
export function portfolioV2UsesAngledSlices(settings: PortfolioV2PreviewSettings): boolean {
  return settings.angledLabels && !settings.horizontalLayout;
}

/** Angled parallelogram tabs in the stacked horizontal list layout. */
export function portfolioV2UsesAngledList(settings: PortfolioV2PreviewSettings): boolean {
  return settings.angledLabels && settings.horizontalLayout;
}
