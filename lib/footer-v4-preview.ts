import type { CSSProperties } from "react";
import { siteConfig } from "@/config/site";
import { washingFooter } from "@/lib/demo-content";
import { getLibraryLogoMainSrc } from "@/lib/image-library-folder";
import type { NavBarLink } from "@/lib/nav-bar-preview";
import {
  defaultFooterV1LogoSizePx,
  footerV1LogoSizeOptions,
  getFooterV1LogoMaxWidthPx,
  isFooterV1LogoSizePx,
  snapFooterV1LogoSizePx,
  stepFooterV1LogoSizePx,
} from "@/lib/footer-v1-preview";

export type FooterV4ServiceLink = {
  label: string;
  href: string;
};

export type FooterV4Content = {
  address: string;
  phone: string;
  email: string;
  copyright: string;
  hours: string[];
  licenses: string[];
  serviceLinks: FooterV4ServiceLink[];
  facebookUrl: string;
  instagramUrl: string;
};

export type FooterV4PreviewSettings = {
  bannerFrom: string;
  bannerTo: string;
  headingColor: string;
  textColor: string;
  linkColor: string;
  linkHoverColor: string;
  socialColor: string;
  socialHoverColor: string;
  bottomBarBackgroundColor: string;
  bottomBarTextColor: string;
  logoSizePx: number;
  showFacebook: boolean;
  showInstagram: boolean;
  contentAddress?: string;
  contentPhone?: string;
  contentEmail?: string;
  contentCopyright?: string;
  contentHours?: string[];
  contentLicenses?: string[];
  contentLogoSrc?: string;
  contentFacebookUrl?: string;
  contentInstagramUrl?: string;
  serviceLinks?: NavBarLink[];
};

export const defaultFooterV4LogoSizePx = 96;

export { footerV1LogoSizeOptions as footerV4LogoSizeOptions, stepFooterV1LogoSizePx as stepFooterV4LogoSizePx };

export function snapFooterV4LogoSizePx(value: number): number {
  if (isFooterV1LogoSizePx(value)) return value;
  if (value === defaultFooterV4LogoSizePx) return defaultFooterV4LogoSizePx;
  return snapFooterV1LogoSizePx(value);
}

export function getFooterV4LogoMaxWidthPx(logoHeightPx: number): number {
  return Math.round((logoHeightPx / defaultFooterV1LogoSizePx) * 220);
}

export const defaultFooterV4PreviewSettings: FooterV4PreviewSettings = {
  bannerFrom: "#1e5799",
  bannerTo: "#78e7fd",
  headingColor: "#ffffff",
  textColor: "#ffffff",
  linkColor: "#ffffff",
  linkHoverColor: "#ffffff",
  socialColor: "#ffffff",
  socialHoverColor: "#ffffff",
  bottomBarBackgroundColor: "#000000",
  bottomBarTextColor: "#ffffff",
  logoSizePx: defaultFooterV4LogoSizePx,
  showFacebook: true,
  showInstagram: true,
};

export function getDefaultFooterV4ServiceLinks(): NavBarLink[] {
  return washingFooter.serviceLinks.map((link, index) => ({
    id: `footer-v4-service-${index}`,
    label: link.label,
    href: link.href,
  }));
}

export function resolveFooterV4LogoSrc(
  settings: FooterV4PreviewSettings,
  libraryFolder: string,
): string {
  const override = settings.contentLogoSrc?.trim();
  if (override) return override;
  const orgLogo = siteConfig.assets.logo?.trim();
  if (orgLogo) return orgLogo;
  return getLibraryLogoMainSrc(libraryFolder);
}

function resolveString(override: string | undefined, fallback: string): string {
  return override !== undefined ? override.trim() : fallback;
}

function resolveLines(override: string[] | undefined, fallback: string[]): string[] {
  if (override === undefined) return fallback;
  return override.map((line) => line.trim()).filter(Boolean);
}

export function buildDefaultFooterV4Copyright(
  brandName: string,
  year = new Date().getFullYear(),
): string {
  return `© ${year} ${brandName}. All rights reserved.`;
}

export function resolveFooterV4ServiceLinks(
  settings: FooterV4PreviewSettings,
  defaults: FooterV4ServiceLink[],
): FooterV4ServiceLink[] {
  if (settings.serviceLinks?.length) {
    return settings.serviceLinks.map((link) => ({
      label: link.label.trim(),
      href: link.href.trim(),
    }));
  }
  return defaults;
}

/** Resolved footer copy — merges playground overrides with section defaults. */
export function resolveFooterV4Content(
  defaults: FooterV4Content,
  settings: FooterV4PreviewSettings,
  brandName: string,
): FooterV4Content {
  const copyright =
    settings.contentCopyright !== undefined
      ? settings.contentCopyright.trim()
      : defaults.copyright || buildDefaultFooterV4Copyright(brandName);

  return {
    address: resolveString(settings.contentAddress, defaults.address),
    phone: resolveString(settings.contentPhone, defaults.phone),
    email: resolveString(settings.contentEmail, defaults.email),
    copyright,
    hours: resolveLines(settings.contentHours, defaults.hours),
    licenses: resolveLines(settings.contentLicenses, defaults.licenses),
    serviceLinks: resolveFooterV4ServiceLinks(settings, defaults.serviceLinks),
    facebookUrl: resolveString(settings.contentFacebookUrl, defaults.facebookUrl),
    instagramUrl: resolveString(settings.contentInstagramUrl, defaults.instagramUrl),
  };
}

export function getFooterV4CssVariables(
  settings: FooterV4PreviewSettings,
): Record<string, string> {
  const logoHeightPx = snapFooterV4LogoSizePx(settings.logoSizePx);

  return {
    "--footer-v4-banner-from": settings.bannerFrom,
    "--footer-v4-banner-to": settings.bannerTo,
    "--footer-v4-heading-color": settings.headingColor,
    "--footer-v4-text-color": settings.textColor,
    "--footer-v4-link-color": settings.linkColor,
    "--footer-v4-link-hover-color": settings.linkHoverColor,
    "--footer-v4-social-color": settings.socialColor,
    "--footer-v4-social-hover-color": settings.socialHoverColor,
    "--footer-v4-bottom-bg": settings.bottomBarBackgroundColor,
    "--footer-v4-bottom-text": settings.bottomBarTextColor,
    "--footer-v4-logo-height": `${logoHeightPx}px`,
    "--footer-v4-logo-max-width": `${getFooterV4LogoMaxWidthPx(logoHeightPx)}px`,
  };
}

export function getFooterV4Style(settings: FooterV4PreviewSettings): CSSProperties {
  return getFooterV4CssVariables(settings) as CSSProperties;
}

export const footerV4ContentOverrideKeys = [
  "contentAddress",
  "contentPhone",
  "contentEmail",
  "contentCopyright",
  "contentHours",
  "contentLicenses",
  "contentLogoSrc",
  "contentFacebookUrl",
  "contentInstagramUrl",
] as const satisfies readonly (keyof FooterV4PreviewSettings)[];

export type FooterV4ContentOverrideKey = (typeof footerV4ContentOverrideKeys)[number];

export type FooterV4ContentOverrides = Pick<
  FooterV4PreviewSettings,
  FooterV4ContentOverrideKey
>;

export function pickFooterV4ContentOverrides(
  settings: FooterV4PreviewSettings,
): FooterV4ContentOverrides {
  const picked: FooterV4ContentOverrides = {};
  for (const key of footerV4ContentOverrideKeys) {
    if (settings[key] !== undefined) {
      (picked as Record<string, unknown>)[key] = settings[key];
    }
  }
  return picked;
}

export function mergeFooterV4GlobalContent(
  instance: FooterV4PreviewSettings,
  global?: FooterV4PreviewSettings,
): FooterV4PreviewSettings {
  if (!global) return instance;
  return { ...instance, ...pickFooterV4ContentOverrides(global) };
}

export function buildFooterV4DefaultContent(
  props: { hours: string[]; serviceLinks: FooterV4ServiceLink[]; licenses: string[] },
  brandName = siteConfig.name,
): FooterV4Content {
  const year = new Date().getFullYear();
  return {
    address: siteConfig.address || "Vancouver, WA",
    phone: siteConfig.phone,
    email: siteConfig.email,
    copyright: buildDefaultFooterV4Copyright(brandName, year),
    hours: props.hours,
    licenses: props.licenses,
    serviceLinks: props.serviceLinks,
    facebookUrl: siteConfig.social.facebook,
    instagramUrl: siteConfig.social.instagram,
  };
}
