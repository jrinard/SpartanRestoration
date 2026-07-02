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
  /** Logo height for header v1 / v2 (px). 0 = fit inside the header bar. */
  logoHeightPx: number;
  /** Solid background behind the logo when it extends below the header bar. */
  logoBackgroundColor: string;
  /** Top margin on the logo link (px). */
  logoMarginTopPx: number;
};

export const defaultHeaderV1HeightPx = 80;
export const defaultHeaderV2HeightPx = 96;

export const headerHeightOptions = [
  56, 64, 72, 80, 88, 96, 104, 112, 120, 128, 144,
] as const;

export const headerLogoHeightOptions = [
  0, 56, 64, 72, 80, 88, 96, 104, 112, 120, 128, 144, 160, 176, 192, 208,
] as const;

export const headerLogoMarginTopOptions = [
  0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96,
] as const;

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
  logoHeightPx: 0,
  logoBackgroundColor: "#000000",
  logoMarginTopPx: 0,
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

export function getHeaderLogoHeightPx(
  settings: HeaderV3PreviewSettings | undefined,
  variantId: "header-v1" | "header-v2",
): number {
  const barHeight = getHeaderBarHeightPx(settings, variantId);
  const logoHeight = settings?.logoHeightPx ?? 0;
  return logoHeight > 0 ? logoHeight : barHeight;
}

export function headerLogoOverflows(
  settings: HeaderV3PreviewSettings | undefined,
  variantId: "header-v1" | "header-v2",
): boolean {
  const barHeight = getHeaderBarHeightPx(settings, variantId);
  const logoHeight = settings?.logoHeightPx ?? 0;
  return logoHeight > barHeight;
}

export const headerV3NavButtonSizes: { value: HeaderV3NavButtonSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
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

  return `${base} max-w-6xl px-6 lg:px-8`;
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
  return getButtonPreviewStyleRecord(pickButtonPreviewSettings(settings));
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
  const customHeight = settings.logoHeightPx > 0;

  if (!overflow && marginTop <= 0 && !customHeight) {
    return undefined;
  }

  const style: CSSProperties = {};

  if (marginTop > 0) {
    style.marginTop = `${marginTop}px`;
  }

  if (overflow || customHeight) {
    style.minHeight = `${getHeaderLogoHeightPx(settings, variantId)}px`;
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
