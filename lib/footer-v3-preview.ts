import type { HeaderV3LogoVariant } from "@/lib/header-v3-gradient";

export type FooterV3LogoVariant = HeaderV3LogoVariant;

export type FooterV3Theme = "dark" | "light";

export type FooterV3LayoutWidth = "contained" | "full";

export type FooterV3PreviewSettings = {
  /** "Crafting digital experiences…" under the logo (siteConfig.tagline). */
  subtextColor: string;
  /** Long description below subtext (siteConfig.description). */
  extraTextColor: string;
  /** Nav pills, phone, and Contact us. */
  linkColor: string;
  linkHoverColor: string;
  /** "Start a project" label accent. */
  accentColor: string;
  copyrightColor: string;
  domainColor: string;
  socialColor: string;
  socialHoverColor: string;
  layoutWidth: FooterV3LayoutWidth;
  logoVariant: FooterV3LogoVariant;
  theme: FooterV3Theme;
};

export const defaultFooterV3PreviewSettings: FooterV3PreviewSettings = {
  subtextColor: "#4d82b8",
  extraTextColor: "#8888a0",
  linkColor: "#8888a0",
  linkHoverColor: "#ffffff",
  accentColor: "#4d82b8",
  copyrightColor: "#8888a0",
  domainColor: "#8888a0",
  socialColor: "#8888a0",
  socialHoverColor: "#4d82b8",
  layoutWidth: "contained",
  logoVariant: "white",
  theme: "dark",
};

export const footerV3LogoVariants: { value: FooterV3LogoVariant; label: string }[] = [
  { value: "white", label: "White" },
  { value: "black", label: "Black" },
  { value: "color", label: "Color" },
];

export const footerV3Themes: { value: FooterV3Theme; label: string }[] = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];

export const footerV3LayoutWidths: { value: FooterV3LayoutWidth; label: string }[] = [
  { value: "contained", label: "Contained" },
  { value: "full", label: "Full width" },
];

export function getFooterV3ContainerClassName(layoutWidth: FooterV3LayoutWidth): string {
  if (layoutWidth === "full") {
    return "max-w-none px-10 lg:px-16 xl:px-20";
  }

  return "";
}
