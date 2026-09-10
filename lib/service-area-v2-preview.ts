import type { PreviewGradientDirection } from "@/lib/preview-gradient";
import { getPreviewGradientBackground } from "@/lib/preview-gradient";
import { getSiteLayoutWidthClassName, type SiteLayoutWidth } from "@/lib/site-layout";
import type { ServiceAreaV2Card } from "@/lib/service-area-v2-content";
import type { CSSProperties } from "react";

export type ServiceAreaV2SectionTheme = "light" | "dark";

export type ServiceAreaV2BackgroundMode = "solid" | "gradient";

export type ServiceAreaV2BackgroundSettings = {
  from: string;
  to: string;
  direction: PreviewGradientDirection;
  intensity: number;
};

export type ServiceAreaV2PreviewSettings = {
  theme: ServiceAreaV2SectionTheme;
  eyebrow: string;
  heading: string;
  intro: string;
  accentColor: string;
  layoutWidth: SiteLayoutWidth;
  solidBackground: string;
  backgroundMode: ServiceAreaV2BackgroundMode;
  background: ServiceAreaV2BackgroundSettings;
  cardBackgroundColor: string;
  cardHoverBackgroundColor: string;
  cardTextColor: string;
  cardMutedColor: string;
  /** Card description/body — falls back to cardMutedColor when unset. */
  cardBodyColor?: string;
  linkColor: string;
  cardBorderRadiusPx: number;
  /** Instance overrides for hub cards — falls back to org defaults when unset. */
  cards?: ServiceAreaV2Card[];
};

export const defaultServiceAreaV2BackgroundSettings: ServiceAreaV2BackgroundSettings = {
  from: "#f6f5fa",
  to: "#e8e6f0",
  direction: "to bottom",
  intensity: 0,
};

export const serviceAreaV2LightThemeDefaults = {
  solidBackground: "#ffffff",
  cardBackgroundColor: "#eef4fb",
  cardHoverBackgroundColor: "#e3eef9",
  cardTextColor: "#12121c",
  cardMutedColor: "#5c5c72",
  linkColor: "#85a33f",
};

export const serviceAreaV2DarkThemeDefaults = {
  solidBackground: "#111111",
  cardBackgroundColor: "#1a2433",
  cardHoverBackgroundColor: "#1f2d40",
  cardTextColor: "#ffffff",
  cardMutedColor: "#b8b8c8",
  linkColor: "#85a33f",
};

export function getServiceAreaV2ThemeDefaults(theme: ServiceAreaV2SectionTheme) {
  return theme === "light" ? serviceAreaV2LightThemeDefaults : serviceAreaV2DarkThemeDefaults;
}

/** Matches the bundled `lifespring` preset in service-area-v2-preset-library.json. */
export const defaultServiceAreaV2PreviewSettings: ServiceAreaV2PreviewSettings = {
  theme: "light",
  eyebrow: "Clark County & Beyond",
  heading: "Find your town",
  intro:
    "Every community gets the same local team, the same thoughtful strategy and clean builds, and the same honest, no-pressure project quote.",
  accentColor: "#4d82b8",
  layoutWidth: "contained",
  solidBackground: serviceAreaV2LightThemeDefaults.solidBackground,
  backgroundMode: "solid",
  background: defaultServiceAreaV2BackgroundSettings,
  cardBackgroundColor: serviceAreaV2LightThemeDefaults.cardBackgroundColor,
  cardHoverBackgroundColor: serviceAreaV2LightThemeDefaults.cardHoverBackgroundColor,
  cardTextColor: serviceAreaV2LightThemeDefaults.cardTextColor,
  cardMutedColor: serviceAreaV2LightThemeDefaults.cardMutedColor,
  linkColor: serviceAreaV2LightThemeDefaults.linkColor,
  cardBorderRadiusPx: 20,
};

export function getServiceAreaV2BackgroundStyle(
  settings: ServiceAreaV2PreviewSettings,
): CSSProperties {
  if (settings.backgroundMode === "gradient") {
    return {
      background: getPreviewGradientBackground(
        settings.background.from,
        settings.background.to,
        settings.background.direction,
      ),
    };
  }

  return { backgroundColor: settings.solidBackground };
}

export function getServiceAreaV2LayoutWidthClassName(layoutWidth: SiteLayoutWidth): string {
  return getSiteLayoutWidthClassName(layoutWidth);
}
