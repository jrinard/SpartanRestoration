import {
  defaultHeaderButtonPreviewSettings,
  formatButtonBackgroundColor,
  getButtonPreviewStyleRecord,
  parseButtonBackgroundColor,
  pickButtonPreviewSettings,
  type ButtonPreviewSize,
} from "@/lib/button-preview";
import {
  getSpacerStripeBackground,
  type PreviewGradientDirection,
  type PreviewGradientMode,
} from "@/lib/preview-gradient";
import { getSiteContainedLayoutClassName } from "@/lib/site-layout";
import type { CSSProperties } from "react";

export type HeaderV3NavButtonSize = ButtonPreviewSize;

export type HeaderV3LogoVariant = "white" | "black" | "color";

export type HeaderV3LayoutWidth = "contained" | "full";

export type HeaderV3PreviewSettings = {
  from: string;
  to: string;
  /** Full-header gradient (header v1 / v2). */
  backgroundMode: PreviewGradientMode;
  backgroundDirection: PreviewGradientDirection;
  navBackground: string;
  navTextColor: string;
  navTextHoverColor: string;
  navHoverBackground: string;
  navButtonSize: HeaderV3NavButtonSize;
  navButtonRadiusPx: number;
  logoVariant: HeaderV3LogoVariant;
  layoutWidth: HeaderV3LayoutWidth;
  /** Inner bar height for header v1 / v2 (px). */
  headerHeightPx: number;
  /** Rendered logo image height (px). 0 = theme default size. */
  logoSizePx: number;
  /** Overflow zone height behind the logo (px). 0 = match logo image height. */
  logoHeightPx: number;
  /** Solid background behind the logo when it extends below the header bar. */
  logoBackgroundColor: string;
  /** Top margin on the logo link (px). */
  logoMarginTopPx: number;
  /** Vertical alignment of the logo within the header bar (v1 / v2). */
  logoVerticalAlign: HeaderLogoVerticalAlign;
  /** Header v1 service nav label font size (em). */
  headerV1NavTextSizeEm: number;
};

export type HeaderLogoVerticalAlign = "top" | "center" | "bottom";

export const headerLogoVerticalAlignOptions: {
  value: HeaderLogoVerticalAlign;
  label: string;
}[] = [
  { value: "top", label: "Top" },
  { value: "center", label: "Center" },
  { value: "bottom", label: "Bottom" },
];

export const defaultHeaderV1HeightPx = 80;
export const defaultHeaderV2HeightPx = 96;

export const headerHeightOptions = [
  56, 64, 72, 80, 88, 96, 104, 112, 120, 128, 144, 160, 176, 192, 208, 224, 240,
] as const;

export const headerLogoSizeOptions = [
  0, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120, 128, 144, 160, 176, 192, 208, 224, 240,
] as const;

export const headerLogoHeightOptions = [
  0, 56, 64, 72, 80, 88, 96, 104, 112, 120, 128, 144, 160, 176, 192, 208,
] as const;

export const headerLogoMarginTopOptions = [
  0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96,
] as const;

export const defaultHeaderV1NavTextSizeEm = 1;

export const headerV1NavTextSizeOptions = [0.5, 0.65, 0.75, 0.85, 1, 1.2, 1.5, 1.75, 2] as const;

export type HeaderV1NavTextSizeEm = (typeof headerV1NavTextSizeOptions)[number];

export function isHeaderV1NavTextSizeEm(value: number): value is HeaderV1NavTextSizeEm {
  return headerV1NavTextSizeOptions.some((option) => Math.abs(option - value) < 0.001);
}

export function snapHeaderV1NavTextSizeEm(value: number): HeaderV1NavTextSizeEm {
  if (isHeaderV1NavTextSizeEm(value)) return value;

  return headerV1NavTextSizeOptions.reduce((closest, option) =>
    Math.abs(option - value) < Math.abs(closest - value) ? option : closest,
  );
}

export function formatHeaderV1NavTextSizeEm(value: number): string {
  return `${value}em`;
}

/** Matches LifeSpring header-v3 defaults. */
export const defaultHeaderV3PreviewSettings: HeaderV3PreviewSettings = {
  from: "#1b1b1b",
  to: "#030303",
  backgroundMode: "linear",
  backgroundDirection: "to right",
  ...defaultHeaderButtonPreviewSettings,
  logoVariant: "color",
  layoutWidth: "contained",
  headerHeightPx: defaultHeaderV1HeightPx,
  logoSizePx: 0,
  logoHeightPx: 0,
  logoBackgroundColor: "#000000",
  logoMarginTopPx: 0,
  logoVerticalAlign: "center",
  headerV1NavTextSizeEm: defaultHeaderV1NavTextSizeEm,
};

export function getDefaultHeaderHeightPx(variantId: string | undefined): number {
  if (variantId === "header-v2") return defaultHeaderV2HeightPx;
  return defaultHeaderV1HeightPx;
}

export function getDefaultHeaderV3PreviewSettingsForVariant(
  variantId?: string,
): HeaderV3PreviewSettings {
  return {
    ...defaultHeaderV3PreviewSettings,
    headerHeightPx: getDefaultHeaderHeightPx(variantId),
  };
}

export function getHeaderInnerHeightStyle(
  settings: HeaderV3PreviewSettings | undefined,
  variantId: "header-v1" | "header-v2",
): CSSProperties {
  const heightPx = settings?.headerHeightPx ?? getDefaultHeaderHeightPx(variantId);
  return { height: `${heightPx}px`, minHeight: `${heightPx}px` };
}

export function getHeaderBarHeightPx(
  settings: HeaderV3PreviewSettings | undefined,
  variantId: "header-v1" | "header-v2",
): number {
  return settings?.headerHeightPx ?? getDefaultHeaderHeightPx(variantId);
}

export function getHeaderLogoImageHeightPx(
  settings: HeaderV3PreviewSettings | undefined,
  _variantId: "header-v1" | "header-v2",
): number | null {
  const logoSize = settings?.logoSizePx ?? 0;
  if (logoSize > 0) return logoSize;

  const logoHeight = settings?.logoHeightPx ?? 0;
  if (logoHeight > 0) return logoHeight;

  return null;
}

/** @deprecated Prefer getHeaderLogoImageHeightPx for image sizing. */
export function getHeaderLogoHeightPx(
  settings: HeaderV3PreviewSettings | undefined,
  variantId: "header-v1" | "header-v2",
): number {
  const imageHeight = getHeaderLogoImageHeightPx(settings, variantId);
  const zoneHeight = settings?.logoHeightPx ?? 0;
  if (zoneHeight > 0) return Math.max(zoneHeight, imageHeight ?? 0);
  if (imageHeight !== null) return imageHeight;
  return getHeaderBarHeightPx(settings, variantId);
}

export function getHeaderLogoLinkMinHeightPx(
  settings: HeaderV3PreviewSettings | undefined,
  variantId: "header-v1" | "header-v2",
): number {
  const imageHeight = getHeaderLogoImageHeightPx(settings, variantId) ?? 0;
  const zoneHeight = settings?.logoHeightPx ?? 0;
  return Math.max(imageHeight, zoneHeight);
}

export function headerLogoOverflows(
  settings: HeaderV3PreviewSettings | undefined,
  variantId: "header-v1" | "header-v2",
): boolean {
  const barHeight = getHeaderBarHeightPx(settings, variantId);
  return getHeaderLogoLinkMinHeightPx(settings, variantId) > barHeight;
}

export const headerV3NavButtonSizes: { value: HeaderV3NavButtonSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "xlarge", label: "Extra Large" },
];

export const headerV3LogoVariants: { value: HeaderV3LogoVariant; label: string }[] = [
  { value: "white", label: "White" },
  { value: "black", label: "Black" },
  { value: "color", label: "Color" },
];

export const headerV3LayoutWidths: { value: HeaderV3LayoutWidth; label: string }[] = [
  { value: "contained", label: "Contained" },
  { value: "full", label: "Full width" },
];

export function getHeaderLayoutWidthClassName(layoutWidth: HeaderV3LayoutWidth): string {
  const base = "mx-auto w-full";

  if (layoutWidth === "full") {
    return `${base} max-w-none px-10 lg:px-16 xl:px-20`;
  }

  return getSiteContainedLayoutClassName();
}

export function getHeaderV3InnerClassName(layoutWidth: HeaderV3LayoutWidth): string {
  return `${getHeaderLayoutWidthClassName(layoutWidth)} pt-5 pb-2.5 lg:pt-6 lg:pb-3`;
}

export function headerVariantUsesPreviewControls(variantId: string): boolean {
  return variantId === "header-v1" || variantId === "header-v2" || variantId === "header-v3";
}

/** @deprecated Use HeaderV3PreviewSettings */
export type HeaderV3NavGradient = Pick<HeaderV3PreviewSettings, "from" | "to">;

/** @deprecated Use defaultHeaderV3PreviewSettings */
export const defaultHeaderV3NavGradient: HeaderV3NavGradient = {
  from: defaultHeaderV3PreviewSettings.from,
  to: defaultHeaderV3PreviewSettings.to,
};

export function headerVariantUsesCustomBackground(variantId: string): boolean {
  return variantId === "header-v1" || variantId === "header-v2";
}

export function getHeaderCustomBackground(settings: HeaderV3PreviewSettings): string {
  return getSpacerStripeBackground(
    settings.from,
    settings.to,
    settings.backgroundDirection,
    settings.backgroundMode,
  );
}

export function getHeaderCustomStyleRecord(
  settings: HeaderV3PreviewSettings,
): Record<string, string> {
  return {
    background: getHeaderCustomBackground(settings),
    "--header-custom-background": getHeaderCustomBackground(settings),
    ...getButtonPreviewStyleRecord(pickButtonPreviewSettings(settings)),
  };
}

/** Button CSS vars only — for v1/v2 when background is rendered on a separate layer. */
export function getHeaderBarButtonStyleRecord(
  settings: HeaderV3PreviewSettings,
): Record<string, string> {
  return {
    ...getButtonPreviewStyleRecord(pickButtonPreviewSettings(settings)),
    "--header-v1-nav-text-size": formatHeaderV1NavTextSizeEm(settings.headerV1NavTextSizeEm),
  };
}

export function getHeaderBackgroundLayerHeightPx(
  settings: HeaderV3PreviewSettings,
  variantId: "header-v1" | "header-v2",
): number {
  return getHeaderBarHeightPx(settings, variantId);
}

export function getHeaderLogoLinkStyle(
  settings: HeaderV3PreviewSettings,
  variantId: "header-v1" | "header-v2",
): CSSProperties | undefined {
  const marginTop = settings.logoMarginTopPx ?? 0;
  const overflow = headerLogoOverflows(settings, variantId);
  const imageHeight = getHeaderLogoImageHeightPx(settings, variantId);
  const zoneHeight = settings.logoHeightPx > 0;
  const linkMinHeight = getHeaderLogoLinkMinHeightPx(settings, variantId);

  if (!overflow && marginTop <= 0 && imageHeight === null && !zoneHeight) {
    return undefined;
  }

  const style: CSSProperties = {};

  if (marginTop > 0) {
    style.marginTop = `${marginTop}px`;
  }

  if (linkMinHeight > 0) {
    style.minHeight = `${linkMinHeight}px`;
  }

  if (overflow) {
    const background = formatButtonBackgroundColor(
      parseButtonBackgroundColor(settings.logoBackgroundColor),
    );
    if (background !== "transparent") {
      style.background = background;
    }
  }

  return style;
}

export function getHeaderLogoVerticalAlignClassName(
  align: HeaderLogoVerticalAlign,
): string {
  if (align === "top") return "header-brand-link--align-top";
  if (align === "bottom") return "header-brand-link--align-bottom";
  return "header-brand-link--align-center";
}

export function getHeaderV3NavBackground({ from, to }: Pick<HeaderV3PreviewSettings, "from" | "to">): string {
  return `linear-gradient(to left, color-mix(in srgb, white 14%, ${from}) 0%, color-mix(in srgb, white 5%, ${from}) 28%, ${from} 72%, ${to} 100%)`;
}

export function getHeaderV3NavBarStyleRecord(
  settings: HeaderV3PreviewSettings,
): Record<string, string> {
  return {
    background: getHeaderV3NavBackground(settings),
    ...getButtonPreviewStyleRecord(pickButtonPreviewSettings(settings)),
  };
}
