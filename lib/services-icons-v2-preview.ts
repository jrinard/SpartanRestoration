import {
  buttonBorderRadiusOptions,
  normalizeButtonBorderRadiusPx,
} from "@/lib/button-preview";
import {
  getPreviewGradientBackground,
  previewGradientDirections,
  type PreviewGradientDirection,
} from "@/lib/preview-gradient";
import type { SiteLayoutWidth } from "@/lib/site-layout";
import type { SiteIconName } from "@/lib/site-icons";

export type ServicesIconsV2PreviewSettings = {
  backgroundFrom: string;
  backgroundTo: string;
  backgroundDirection: PreviewGradientDirection;
  layoutWidth: SiteLayoutWidth;
  outerBackgroundColor: string;
  cardBackgroundColor: string;
  circleColor: string;
  iconColor: string;
  cardTextColor: string;
  headingColor: string;
  ctaBackgroundColor: string;
  ctaTextColor: string;
  cardFontSizePx: number;
  headingFontSizePx: number;
  cardBorderRadiusPx: number;
  cardPaddingPx: number;
  cardMinHeightPx: number;
  iconSizePx: number;
  /** Playground overrides keyed by service id. */
  serviceIcons: Partial<Record<string, SiteIconName>>;
  /** Playground label overrides keyed by service id. */
  serviceLabels: Partial<Record<string, string>>;
  /** Playground CTA phone label override (display text). */
  ctaLabel?: string;
  /** Playground CTA tel href override. */
  ctaHref?: string;
  /** Playground section heading override (h2). */
  sectionHeading?: string;
};

export const defaultServicesIconsV2OuterBackgroundColor = "#ffffff";

export const defaultServicesIconsV2PreviewSettings: ServicesIconsV2PreviewSettings = {
  backgroundFrom: "#ffffff",
  backgroundTo: "#ffffff",
  backgroundDirection: "none",
  layoutWidth: "contained",
  outerBackgroundColor: defaultServicesIconsV2OuterBackgroundColor,
  cardBackgroundColor: "#000000",
  circleColor: "#748B9F",
  iconColor: "#ffffff",
  cardTextColor: "#ffffff",
  headingColor: "#000000",
  ctaBackgroundColor: "#748B9F",
  ctaTextColor: "#ffffff",
  cardFontSizePx: 24,
  headingFontSizePx: 48,
  cardBorderRadiusPx: 10,
  cardPaddingPx: 30,
  cardMinHeightPx: 140,
  iconSizePx: 75,
  serviceIcons: {},
  serviceLabels: {},
};

export { previewGradientDirections as servicesIconsV2GradientDirections };
export { buttonBorderRadiusOptions as servicesIconsV2BorderRadiusOptions };

export function getServicesIconsV2BackgroundStyle(
  settings: ServicesIconsV2PreviewSettings,
): string {
  return getPreviewGradientBackground(
    settings.backgroundFrom,
    settings.backgroundTo,
    settings.backgroundDirection,
  );
}

export function normalizeServicesIconsV2BorderRadiusPx(value: number): number {
  return normalizeButtonBorderRadiusPx(value);
}

export function clampServicesIconsV2FontSizePx(
  value: number,
  fallback: number,
  min: number,
  max: number,
): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function clampServicesIconsV2CardPaddingPx(value: number): number {
  if (!Number.isFinite(value)) return defaultServicesIconsV2PreviewSettings.cardPaddingPx;
  return Math.min(48, Math.max(16, Math.round(value)));
}

export function clampServicesIconsV2CardMinHeightPx(value: number): number {
  if (!Number.isFinite(value)) return defaultServicesIconsV2PreviewSettings.cardMinHeightPx;
  return Math.min(220, Math.max(100, Math.round(value)));
}

export function clampServicesIconsV2IconSizePx(value: number): number {
  if (!Number.isFinite(value)) return defaultServicesIconsV2PreviewSettings.iconSizePx;
  return Math.min(96, Math.max(48, Math.round(value)));
}
