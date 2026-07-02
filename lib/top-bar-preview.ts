import { siteConfig } from "@/config/site";
import { getSiteLayoutWidthClassName } from "@/lib/site-layout";

export type TopBarLayoutWidth = "contained" | "full";

export type TopBarPreviewSettings = {
  layoutWidth: TopBarLayoutWidth;
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
};

export const defaultTopBarHeightPx = 61;
export const defaultTopBarLeftWidthPercent = 40;
export const defaultTopBarTextSizePx = 18;

export const topBarTextSizeOptions = [14, 16, 18, 20, 22, 24] as const;

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
  leftLabel: "Open Hours",
  leftAccent: "24/7",
  rightText: `Call now ${siteConfig.phone}`,
  phoneHref: phoneTelHref(siteConfig.phone),
  textSizePx: defaultTopBarTextSizePx,
};

export function getTopBarLayoutWidthClassName(layoutWidth: TopBarLayoutWidth): string {
  return getSiteLayoutWidthClassName(layoutWidth);
}
