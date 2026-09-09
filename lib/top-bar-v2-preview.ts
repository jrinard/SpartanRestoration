import { siteConfig } from "@/config/site";
import { phoneTelHref } from "@/lib/phone";
import { getSiteLayoutWidthClassName } from "@/lib/site-layout";
import {
  defaultTopBarHeightPx,
  defaultTopBarTextSizePx,
  type TopBarLayoutWidth,
} from "@/lib/top-bar-preview";

export type TopBarV2PreviewSettings = {
  layoutWidth: TopBarLayoutWidth;
  heightPx: number;
  /** Single bar fill. */
  backgroundColor: string;
  /** Full-width background behind the bar (visible in contained mode). */
  outerBackgroundColor: string;
  text1: string;
  text2: string;
  callText: string;
  text1Color: string;
  text2Color: string;
  callColor: string;
  phoneHref: string;
  textSizePx: number;
};

export const defaultTopBarV2PreviewSettings: TopBarV2PreviewSettings = {
  layoutWidth: "full",
  heightPx: defaultTopBarHeightPx,
  backgroundColor: "#242424",
  outerBackgroundColor: "#ffffff",
  text1: "Quality work. Done right.",
  text2: "- Call today",
  callText: siteConfig.phone,
  text1Color: "#ffffff",
  text2Color: "#ffffff",
  callColor: "#ffc847",
  phoneHref: phoneTelHref(siteConfig.phone),
  textSizePx: defaultTopBarTextSizePx,
};

export function getTopBarV2LayoutWidthClassName(layoutWidth: TopBarLayoutWidth): string {
  return getSiteLayoutWidthClassName(layoutWidth);
}
