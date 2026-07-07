import {
  defaultButtonBorderRadiusPx,
  normalizeButtonBorderRadiusPx,
  type ButtonPreviewSettings,
} from "@/lib/button-preview";
import { getSiteLayoutWidthClassName, type SiteLayoutWidth } from "@/lib/site-layout";
import { phoneTelHref } from "@/lib/phone";
import type { CSSProperties } from "react";

export type CtaV1LayoutWidth = SiteLayoutWidth;

export type CtaV1CardBackgroundMode = "solid" | "gradient";

export type CtaV1Content = {
  headlineLines: string[];
  phoneLabel: string;
  phoneHref: string;
};

export const ctaV1CardMaxWidthPx = 1040;

export function parseCtaV1HeadlineDraft(draft: string): string[] {
  return draft
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export type CtaV1PreviewSettings = ButtonPreviewSettings & {
  layoutWidth: CtaV1LayoutWidth;
  /** Section background — visible around the card in contained mode. */
  outerBackgroundColor: string;
  /** Card fill (contained) or full-bleed section background (full width). */
  cardBackgroundMode: CtaV1CardBackgroundMode;
  cardBackgroundColor: string;
  cardGradientFrom: string;
  cardGradientTo: string;
  /** Gradient angle in degrees. */
  cardGradientAngle: number;
  cardBorderRadiusPx: number;
  headlineColor: string;
  buttonVisible: boolean;
  /** @deprecated — use contentHeadlineLines */
  contentHeadline?: string;
  contentHeadlineLines?: string[];
  contentPhoneLabel?: string;
  contentPhoneHref?: string;
};

export const ctaV1CardBackgroundModes: { value: CtaV1CardBackgroundMode; label: string }[] = [
  { value: "solid", label: "Solid" },
  { value: "gradient", label: "Gradient" },
];

export const ctaV1LayoutWidths: { value: CtaV1LayoutWidth; label: string }[] = [
  { value: "contained", label: "Contained" },
  { value: "full", label: "Full width" },
];

export const ctaV1CardBorderRadiusOptions = [0, 8, 12, 16, 24, 32, 40, 48] as const;

export type CtaV1CardBorderRadiusPx = (typeof ctaV1CardBorderRadiusOptions)[number];

export function normalizeCtaV1CardBorderRadiusPx(value: number): CtaV1CardBorderRadiusPx {
  if (ctaV1CardBorderRadiusOptions.includes(value as CtaV1CardBorderRadiusPx)) {
    return value as CtaV1CardBorderRadiusPx;
  }

  return ctaV1CardBorderRadiusOptions.reduce((closest, option) =>
    Math.abs(option - value) < Math.abs(closest - value) ? option : closest,
  );
}

export const defaultCtaV1ButtonSettings: ButtonPreviewSettings = {
  navBackground: "#F3C35D",
  navTextColor: "#000000",
  navTextHoverColor: "#000000",
  navHoverBackground: "#B48130",
  navButtonSize: "large",
  navButtonRadiusPx: defaultButtonBorderRadiusPx,
};

export const defaultCtaV1PreviewSettings: CtaV1PreviewSettings = {
  layoutWidth: "contained",
  outerBackgroundColor: "#ffffff",
  cardBackgroundMode: "solid",
  cardBackgroundColor: "#000000",
  cardGradientFrom: "#000000",
  cardGradientTo: "#2E4359",
  cardGradientAngle: 135,
  cardBorderRadiusPx: 16,
  headlineColor: "#ffffff",
  buttonVisible: true,
  ...defaultCtaV1ButtonSettings,
};

export function getCtaV1CardBackground(settings: CtaV1PreviewSettings): string {
  if (settings.cardBackgroundMode === "gradient") {
    return `linear-gradient(${settings.cardGradientAngle}deg, ${settings.cardGradientFrom}, ${settings.cardGradientTo})`;
  }

  return settings.cardBackgroundColor;
}

export function getCtaV1CardStyle(settings: CtaV1PreviewSettings): CSSProperties {
  return {
    background: getCtaV1CardBackground(settings),
    borderRadius: `${settings.cardBorderRadiusPx}px`,
  };
}

export function getCtaV1SectionStyle(
  settings: CtaV1PreviewSettings,
  isContained: boolean,
): CSSProperties {
  if (isContained) {
    return { backgroundColor: settings.outerBackgroundColor };
  }

  return { background: getCtaV1CardBackground(settings) };
}

export function getCtaV1LayoutWidthClassName(layoutWidth: CtaV1LayoutWidth): string {
  return getSiteLayoutWidthClassName(layoutWidth);
}

export function pickCtaV1ButtonSettings(settings: CtaV1PreviewSettings): ButtonPreviewSettings {
  return {
    navBackground: settings.navBackground,
    navTextColor: settings.navTextColor,
    navTextHoverColor: settings.navTextHoverColor,
    navHoverBackground: settings.navHoverBackground,
    navButtonSize: settings.navButtonSize,
    navButtonRadiusPx: settings.navButtonRadiusPx,
  };
}

export function resolveCtaV1Content(
  defaults: CtaV1Content,
  settings: CtaV1PreviewSettings,
): CtaV1Content {
  const phoneLabel =
    settings.contentPhoneLabel !== undefined
      ? settings.contentPhoneLabel.trim()
      : defaults.phoneLabel;

  const headlineLines =
    settings.contentHeadlineLines !== undefined
      ? settings.contentHeadlineLines
      : settings.contentHeadline !== undefined
        ? parseCtaV1HeadlineDraft(settings.contentHeadline)
        : defaults.headlineLines;

  return {
    headlineLines,
    phoneLabel,
    phoneHref:
      settings.contentPhoneLabel !== undefined
        ? settings.contentPhoneHref?.trim() || (phoneLabel ? phoneTelHref(phoneLabel) : "")
        : defaults.phoneHref,
  };
}

export { normalizeButtonBorderRadiusPx as normalizeCtaV1ButtonRadiusPx };
