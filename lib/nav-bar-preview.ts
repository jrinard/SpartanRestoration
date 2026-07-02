import { getSiteLayoutWidthClassName } from "@/lib/site-layout";

export type NavBarLayoutWidth = "contained" | "full";

export type NavBarLink = {
  label: string;
  href: string;
};

export type NavBarPreviewSettings = {
  layoutWidth: NavBarLayoutWidth;
  heightPx: number;
  backgroundColor: string;
  /** Full-width background behind the bar (visible in contained mode). */
  outerBackgroundColor: string;
  linkColor: string;
  linkHoverColor: string;
  items: NavBarLink[];
};

export const defaultNavBarHeightPx = 70;

export const navBarHeightOptions = [56, 64, 70, 80, 88, 96] as const;

export const navBarLayoutWidths: { value: NavBarLayoutWidth; label: string }[] = [
  { value: "contained", label: "Contained" },
  { value: "full", label: "Full width" },
];

export const defaultNavBarLinks: NavBarLink[] = [
  { label: "Home", href: "/" },
  { label: "Our Services", href: "#services" },
  { label: "Insurance", href: "#insurance" },
  { label: "Gallery", href: "#gallery" },
  { label: "Service Area", href: "#service-area" },
];

export const defaultNavBarPreviewSettings: NavBarPreviewSettings = {
  layoutWidth: "contained",
  heightPx: defaultNavBarHeightPx,
  backgroundColor: "#000000",
  outerBackgroundColor: "#ffffff",
  linkColor: "#ffffff",
  linkHoverColor: "#F3C35D",
  items: defaultNavBarLinks,
};

export function getNavBarLayoutWidthClassName(layoutWidth: NavBarLayoutWidth): string {
  return getSiteLayoutWidthClassName(layoutWidth);
}
