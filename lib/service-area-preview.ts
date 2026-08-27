import { getSiteLayoutWidthClassName, type SiteLayoutWidth } from "@/lib/site-layout";
import type { CSSProperties } from "react";

export type ServiceAreaV1Location = {
  id: string;
  label: string;
};

export type ServiceAreaV1Size = "small" | "medium" | "large";

export type ServiceAreaV1BackgroundMode = "solid" | "gradient";

export const serviceAreaV1BackgroundModes: { value: ServiceAreaV1BackgroundMode; label: string }[] =
  [
    { value: "solid", label: "Solid" },
    { value: "gradient", label: "Gradient" },
  ];

export type ServiceAreaV1SizeOption = {
  value: ServiceAreaV1Size;
  label: string;
  iconSizePx: number;
  locationFontSizePx: number;
};

export const serviceAreaV1SizeOptions: ServiceAreaV1SizeOption[] = [
  { value: "small", label: "Small", iconSizePx: 40, locationFontSizePx: 16 },
  { value: "medium", label: "Medium", iconSizePx: 52, locationFontSizePx: 20 },
  { value: "large", label: "Large", iconSizePx: 64, locationFontSizePx: 24 },
];

export const defaultServiceAreaV1Size: ServiceAreaV1Size = "medium";

export const serviceAreaV1PinSrc = "/spartan/pin.png";

export const serviceAreaV1GraphSrc = "/spartan/Spartan-graph-white.png";

export const serviceAreaV1CardMaxWidthPx = 1040;

export const serviceAreaV1CardBorderRadiusOptions = [0, 8, 12, 16, 24, 32, 40, 48] as const;

export type ServiceAreaV1CardBorderRadiusPx =
  (typeof serviceAreaV1CardBorderRadiusOptions)[number];

export function normalizeServiceAreaV1CardBorderRadiusPx(
  value: number,
): ServiceAreaV1CardBorderRadiusPx {
  if (serviceAreaV1CardBorderRadiusOptions.includes(value as ServiceAreaV1CardBorderRadiusPx)) {
    return value as ServiceAreaV1CardBorderRadiusPx;
  }

  return serviceAreaV1CardBorderRadiusOptions.reduce((closest, option) =>
    Math.abs(option - value) < Math.abs(closest - value) ? option : closest,
  );
}

export type ServiceAreaV1PreviewSettings = {
  layoutWidth: SiteLayoutWidth;
  size: ServiceAreaV1Size;
  /** Section background around the card in contained mode. */
  outerBackgroundColor: string;
  backgroundMode: ServiceAreaV1BackgroundMode;
  /** Card fill (contained) or full-bleed section background (full width) when solid. */
  backgroundColor: string;
  backgroundGradientFrom: string;
  backgroundGradientTo: string;
  /** Gradient angle in degrees. */
  backgroundGradientAngle: number;
  cardBorderRadiusPx: number;
  headingColor: string;
  iconColor: string;
  locationTextColor: string;
  /** Playground heading override. */
  sectionHeading?: string;
  /** Playground graph image override — empty string hides the image. */
  graphImageSrc?: string;
  /** Playground location label overrides keyed by location id. */
  locationLabels: Partial<Record<string, string>>;
};

export const defaultServiceAreaV1BackgroundColor = "#4d82b8";

export const defaultServiceAreaV1OuterBackgroundColor = "#ffffff";

export const defaultServiceAreaV1PreviewSettings: ServiceAreaV1PreviewSettings = {
  layoutWidth: "full",
  size: defaultServiceAreaV1Size,
  outerBackgroundColor: defaultServiceAreaV1OuterBackgroundColor,
  backgroundMode: "solid",
  backgroundColor: defaultServiceAreaV1BackgroundColor,
  backgroundGradientFrom: defaultServiceAreaV1BackgroundColor,
  backgroundGradientTo: "#2e4359",
  backgroundGradientAngle: 135,
  cardBorderRadiusPx: 16,
  headingColor: "#ffffff",
  iconColor: "#000000",
  locationTextColor: "#ffffff",
  locationLabels: {},
};

export function isServiceAreaV1BackgroundMode(
  value: unknown,
): value is ServiceAreaV1BackgroundMode {
  return value === "solid" || value === "gradient";
}

export function getServiceAreaV1Background(settings: ServiceAreaV1PreviewSettings): string {
  if (settings.backgroundMode === "gradient") {
    return `linear-gradient(${settings.backgroundGradientAngle}deg, ${settings.backgroundGradientFrom}, ${settings.backgroundGradientTo})`;
  }

  return settings.backgroundColor;
}

export function isServiceAreaV1Size(value: unknown): value is ServiceAreaV1Size {
  return value === "small" || value === "medium" || value === "large";
}

export function getServiceAreaV1SizeOption(
  size: ServiceAreaV1Size = defaultServiceAreaV1Size,
): ServiceAreaV1SizeOption {
  return (
    serviceAreaV1SizeOptions.find((option) => option.value === size) ??
    serviceAreaV1SizeOptions.find((option) => option.value === defaultServiceAreaV1Size)!
  );
}

export function resolveServiceAreaV1GraphSrc(
  settings: ServiceAreaV1PreviewSettings,
): string | null {
  const override = settings.graphImageSrc;
  if (override === "") return null;
  if (override?.trim()) return override.trim();
  return serviceAreaV1GraphSrc;
}

export function getServiceAreaV1PinStyle(
  iconSizePx: number,
  iconColor: string,
): CSSProperties {
  return {
    width: iconSizePx,
    height: iconSizePx,
    backgroundColor: iconColor,
    WebkitMaskImage: `url(${serviceAreaV1PinSrc})`,
    maskImage: `url(${serviceAreaV1PinSrc})`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  };
}

export function getServiceAreaV1CardStyle(
  settings: ServiceAreaV1PreviewSettings,
): CSSProperties {
  return {
    background: getServiceAreaV1Background(settings),
    borderRadius: `${settings.cardBorderRadiusPx}px`,
  };
}

export function getServiceAreaV1SectionStyle(
  settings: ServiceAreaV1PreviewSettings,
  isContained: boolean,
): CSSProperties {
  if (isContained) {
    return { backgroundColor: settings.outerBackgroundColor };
  }

  return { background: getServiceAreaV1Background(settings) };
}

export function getServiceAreaV1LayoutWidthClassName(layoutWidth: SiteLayoutWidth): string {
  return getSiteLayoutWidthClassName(layoutWidth);
}
