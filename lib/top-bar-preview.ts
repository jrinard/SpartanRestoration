import type { CSSProperties } from "react";
import { siteConfig } from "@/config/site";
import { contactButtonBorderRadiusOptions } from "@/lib/contact-preview";
import { getResponsiveSiteLayoutWidthClassName } from "@/lib/site-layout";
import type { TopBarSocialLink } from "@/lib/top-bar-social";

export type TopBarLayoutWidth = "contained" | "full";

export type TopBarPreviewSettings = {
  layoutWidth: TopBarLayoutWidth;
  /** When unset, mobile matches `layoutWidth` (legacy org JSON). */
  layoutWidthMobile?: TopBarLayoutWidth;
  heightPx: number;
  /** Left segment width as a percentage of the bar (remainder is right). */
  leftWidthPercent: number;
  leftBackgroundColor: string;
  rightBackgroundColor: string;
  /** Full-width background behind the bar (visible in contained mode). */
  outerBackgroundColor: string;
  leftLabelColor: string;
  leftAccentColor: string;
  rightTextColor: string;
  leftLabel: string;
  leftAccent: string;
  rightText: string;
  phoneHref: string;
  /** Shared font size for left and right top bar text (px). */
  textSizePx: number;
  /** When true, call CTA is on the left and open hours on the right. */
  inverted?: boolean;
  /** Brand social icons pinned to the right edge of the bar. */
  socialLinks: TopBarSocialLink[];
  socialIconColor: string;
  /** Distance from the right viewport edge (px). */
  socialLinksInsetPx: number;
  /** When true, show a contact button beside the call link (opens contact modal). */
  showContactButton?: boolean;
  contactButtonLabel?: string;
  contactButtonBgColor?: string;
  contactButtonHoverBgColor?: string;
  contactButtonTextColor?: string;
  contactButtonTextHoverColor?: string;
  contactButtonRadiusPx?: number;
  contactButtonTextSizePx?: number;
};

export const defaultTopBarHeightPx = 61;
export const defaultTopBarLeftWidthPercent = 40;
export const defaultTopBarTextSizePx = 18;
export const defaultTopBarSocialLinksInsetPx = 20;

export const topBarHeightOptions = [32, 40, 48, 56, 61, 64, 72, 80, 88, 96, 104, 112, 120] as const;

export const topBarTextSizeOptions = [14, 16, 18, 20, 22, 24] as const;

export const topBarContactButtonTextSizeOptions = [12, 14, 16, 18, 20] as const;

export const defaultTopBarContactButtonLabel = "Contact Us";

export const topBarLayoutWidths: { value: TopBarLayoutWidth; label: string }[] = [
  { value: "contained", label: "Contained" },
  { value: "full", label: "Full width" },
];

function phoneTelHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits ? `tel:+${digits.length === 10 ? `1${digits}` : digits}` : "tel:";
}

export const defaultTopBarPreviewSettings: TopBarPreviewSettings = {
  layoutWidth: "full",
  heightPx: defaultTopBarHeightPx,
  leftWidthPercent: defaultTopBarLeftWidthPercent,
  leftBackgroundColor: "#e5e5e5",
  rightBackgroundColor: "#F3C35D",
  outerBackgroundColor: "#ffffff",
  leftLabelColor: "#000000",
  leftAccentColor: "#243348",
  rightTextColor: "#000000",
  leftLabel: "Strong in Every",
  leftAccent: "Detail",
  rightText: `Call now ${siteConfig.phone}`,
  phoneHref: phoneTelHref(siteConfig.phone),
  textSizePx: defaultTopBarTextSizePx,
  inverted: false,
  socialLinks: [],
  socialIconColor: "#ffffff",
  socialLinksInsetPx: defaultTopBarSocialLinksInsetPx,
  contactButtonLabel: defaultTopBarContactButtonLabel,
  contactButtonBgColor: "#f3c35d",
  contactButtonHoverBgColor: "#efc25b",
  contactButtonTextColor: "#243348",
  contactButtonTextHoverColor: "#243348",
  contactButtonRadiusPx: 4,
  contactButtonTextSizePx: 14,
};

export function getTopBarContactButtonLabel(settings: TopBarPreviewSettings): string {
  const label = settings.contactButtonLabel?.trim();
  return label || defaultTopBarContactButtonLabel;
}

export function getTopBarContactButtonCssProperties(
  settings: TopBarPreviewSettings,
): CSSProperties {
  return {
    "--top-bar-contact-btn-bg": settings.contactButtonBgColor ?? defaultTopBarPreviewSettings.contactButtonBgColor,
    "--top-bar-contact-btn-hover-bg":
      settings.contactButtonHoverBgColor ?? defaultTopBarPreviewSettings.contactButtonHoverBgColor,
    "--top-bar-contact-btn-color":
      settings.contactButtonTextColor ?? defaultTopBarPreviewSettings.contactButtonTextColor,
    "--top-bar-contact-btn-hover-color":
      settings.contactButtonTextHoverColor ?? defaultTopBarPreviewSettings.contactButtonTextHoverColor,
    "--top-bar-contact-btn-radius": `${settings.contactButtonRadiusPx ?? defaultTopBarPreviewSettings.contactButtonRadiusPx}px`,
    "--top-bar-contact-btn-text-size": `${settings.contactButtonTextSizePx ?? defaultTopBarPreviewSettings.contactButtonTextSizePx}px`,
  } as CSSProperties;
}

export function snapTopBarContactButtonRadiusPx(value: number): number {
  if (
    contactButtonBorderRadiusOptions.includes(
      value as (typeof contactButtonBorderRadiusOptions)[number],
    )
  ) {
    return value;
  }

  return contactButtonBorderRadiusOptions.reduce((closest, option) =>
    Math.abs(option - value) < Math.abs(closest - value) ? option : closest,
  );
}

export function snapTopBarContactButtonTextSizePx(value: number): number {
  if (
    topBarContactButtonTextSizeOptions.includes(
      value as (typeof topBarContactButtonTextSizeOptions)[number],
    )
  ) {
    return value;
  }

  return topBarContactButtonTextSizeOptions.reduce((closest, option) =>
    Math.abs(option - value) < Math.abs(closest - value) ? option : closest,
  );
}

export function getTopBarLayoutWidthClassName(
  layoutWidth: TopBarLayoutWidth,
  layoutWidthMobile?: TopBarLayoutWidth,
): string {
  return getResponsiveSiteLayoutWidthClassName(layoutWidth, layoutWidthMobile);
}
