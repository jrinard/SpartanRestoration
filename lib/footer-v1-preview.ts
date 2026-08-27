import type { CSSProperties } from "react";
import type { TeamContact } from "@/config/site";
import { siteConfig } from "@/config/site";
import { getLibraryLogoMainSrc } from "@/lib/image-library-folder";
import type { NavBarLink } from "@/lib/nav-bar-preview";
import {
  getPreviewGradientBackground,
  previewGradientDirections,
  type PreviewGradientDirection,
} from "@/lib/preview-gradient";
import {
  siteContainedMaxWidthClass,
  siteLayoutWidthOptions,
  type SiteLayoutWidth,
} from "@/lib/site-layout";

export type FooterV1ContactOverride = {
  name: string;
  phone: string;
  email?: string;
};

export type FooterV1Content = {
  brandName: string;
  tagline: string;
  serviceArea: string;
  contacts: TeamContact[];
  copyright: string;
};

export type FooterV1PreviewSettings = {
  /** Business name under the logo. */
  brandNameColor: string;
  /** Tagline / description blurb. */
  taglineColor: string;
  navColor: string;
  navHoverColor: string;
  /** "Contact" heading and team member names. */
  contactHeadingColor: string;
  /** Phone numbers and service area. */
  contactTextColor: string;
  contactLinkHoverColor: string;
  contactButtonBgColor: string;
  contactButtonHoverBgColor: string;
  contactButtonTextColor: string;
  mainBackgroundFrom: string;
  mainBackgroundTo: string;
  mainBackgroundDirection: PreviewGradientDirection;
  /** Optional library image layered over the main footer gradient. */
  mainBackgroundImageSrc?: string;
  bottomBarBackgroundColor: string;
  bottomBarTextColor: string;
  /** Contact heading, names, and phone numbers. */
  contactTextSizeEm: number;
  layoutWidth: SiteLayoutWidth;
  /** Extra horizontal inset for contained content. */
  contentInsetPx: number;
  /** Full-width background behind the main area (visible in contained mode). */
  outerBackgroundColor: string;
  /** Playground copy overrides — unset fields fall back to site defaults. */
  contentBrandName?: string;
  contentTagline?: string;
  contentServiceArea?: string;
  /** @deprecated — use contentContacts */
  contentContactName?: string;
  /** @deprecated — use contentContacts */
  contentContactPhone?: string;
  contentContacts?: FooterV1ContactOverride[];
  contentCopyright?: string;
  /** Footer logo height in px (default 56). */
  logoSizePx: number;
  /** Optional library image override for the footer logo. */
  contentLogoSrc?: string;
  /** When true (default), footer nav links mirror global Nav-v1 links. */
  useGlobalNav?: boolean;
  /** Custom footer nav links when `useGlobalNav` is false. */
  navItems?: NavBarLink[];
};

export const defaultFooterV1OuterBackgroundColor = "#e8ecf0";

export const footerV1ContentInsetOptions = [0, 16, 24, 32, 48, 64, 80, 96, 128] as const;

export type FooterV1ContentInsetPx = (typeof footerV1ContentInsetOptions)[number];

export function snapFooterV1ContentInsetPx(value: number): FooterV1ContentInsetPx {
  if (footerV1ContentInsetOptions.some((option) => option === value)) {
    return value as FooterV1ContentInsetPx;
  }

  return footerV1ContentInsetOptions.reduce((closest, option) =>
    Math.abs(option - value) < Math.abs(closest - value) ? option : closest,
  );
}

export { siteLayoutWidthOptions as footerV1LayoutWidthOptions };

export const defaultFooterV1LogoSizePx = 56;

export const footerV1LogoSizeOptions = [
  32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120, 128, 144, 160, 176, 192, 208, 224, 240,
] as const;

export type FooterV1LogoSizePx = (typeof footerV1LogoSizeOptions)[number];

export function isFooterV1LogoSizePx(value: number): value is FooterV1LogoSizePx {
  return footerV1LogoSizeOptions.some((option) => option === value);
}

export function snapFooterV1LogoSizePx(value: number): FooterV1LogoSizePx {
  if (isFooterV1LogoSizePx(value)) return value;

  return footerV1LogoSizeOptions.reduce((closest, option) =>
    Math.abs(option - value) < Math.abs(closest - value) ? option : closest,
  );
}

export function stepFooterV1LogoSizePx(current: number, direction: -1 | 1): number {
  const options = footerV1LogoSizeOptions;
  const snapped = snapFooterV1LogoSizePx(current);
  let index = options.indexOf(snapped);
  const nextIndex = Math.max(0, Math.min(options.length - 1, index + direction));
  return options[nextIndex] ?? defaultFooterV1LogoSizePx;
}

/** Max logo width scales with height — 220px at the default 56px height. */
export function getFooterV1LogoMaxWidthPx(logoHeightPx: number): number {
  return Math.round((logoHeightPx / defaultFooterV1LogoSizePx) * 220);
}

export function resolveFooterV1LogoSrc(
  settings: FooterV1PreviewSettings,
  libraryFolder: string,
): string {
  const override = settings.contentLogoSrc?.trim();
  if (override) return override;
  const orgLogo = siteConfig.assets.logo?.trim();
  if (orgLogo) return orgLogo;
  return getLibraryLogoMainSrc(libraryFolder);
}

export const defaultFooterV1ContactTextSizeEm = 1.25;

export const footerV1ContactTextSizeOptions = [0.5, 0.65, 0.75, 0.85, 1, 1.2, 1.25, 1.5, 1.75, 2] as const;

export type FooterV1ContactTextSizeEm = (typeof footerV1ContactTextSizeOptions)[number];

export function isFooterV1ContactTextSizeEm(value: number): value is FooterV1ContactTextSizeEm {
  return footerV1ContactTextSizeOptions.some((option) => Math.abs(option - value) < 0.001);
}

export function snapFooterV1ContactTextSizeEm(value: number): FooterV1ContactTextSizeEm {
  if (isFooterV1ContactTextSizeEm(value)) return value;

  return footerV1ContactTextSizeOptions.reduce((closest, option) =>
    Math.abs(option - value) < Math.abs(closest - value) ? option : closest,
  );
}

export function formatFooterV1ContactTextSizeEm(value: number): string {
  return `${value}em`;
}

export function footerUsesGlobalNav(settings: FooterV1PreviewSettings): boolean {
  return settings.useGlobalNav !== false;
}

/** Overlay site-wide footer nav mode onto per-page instance settings. */
export function mergeFooterV1GlobalNavPreference(
  settings: FooterV1PreviewSettings,
  globalSettings: FooterV1PreviewSettings,
): FooterV1PreviewSettings {
  const useGlobalNav = footerUsesGlobalNav(globalSettings);

  return {
    ...settings,
    useGlobalNav,
    navItems: useGlobalNav ? undefined : settings.navItems,
  };
}

export function getDefaultFooterV1NavLinks(): NavBarLink[] {
  return siteConfig.footerNav.map((item, index) => ({
    id: `footer-nav-${index}`,
    label: item.label,
    href: item.href,
  }));
}

export const defaultFooterV1PreviewSettings: FooterV1PreviewSettings = {
  brandNameColor: "#243348",
  taglineColor: "#5d7894",
  navColor: "#243348",
  navHoverColor: "#000000",
  contactHeadingColor: "#243348",
  contactTextColor: "#5d7894",
  contactLinkHoverColor: "#243348",
  contactButtonBgColor: "#f3c35d",
  contactButtonHoverBgColor: "#efc25b",
  contactButtonTextColor: "#243348",
  mainBackgroundFrom: "#ffffff",
  mainBackgroundTo: "#ffffff",
  mainBackgroundDirection: "none",
  mainBackgroundImageSrc: "",
  bottomBarBackgroundColor: "#f3c35d",
  bottomBarTextColor: "#243348",
  contactTextSizeEm: defaultFooterV1ContactTextSizeEm,
  layoutWidth: "contained",
  contentInsetPx: 48,
  outerBackgroundColor: defaultFooterV1OuterBackgroundColor,
  logoSizePx: defaultFooterV1LogoSizePx,
  useGlobalNav: true,
};

export { previewGradientDirections as footerV1GradientDirections };

export function getFooterV1MainBackground(settings: FooterV1PreviewSettings): string {
  return getPreviewGradientBackground(
    settings.mainBackgroundFrom,
    settings.mainBackgroundTo,
    settings.mainBackgroundDirection,
  );
}

/** Main footer fill — gradient and/or library image. */
export function getFooterV1MainBackgroundStyle(
  settings: FooterV1PreviewSettings,
): CSSProperties {
  const gradient = getFooterV1MainBackground(settings);
  const imageSrc = settings.mainBackgroundImageSrc?.trim() ?? "";

  if (imageSrc) {
    return {
      backgroundColor: settings.mainBackgroundFrom,
      backgroundImage: `url("${imageSrc}"), ${gradient}`,
      backgroundSize: "cover, auto",
      backgroundPosition: "center, center",
      backgroundRepeat: "no-repeat, no-repeat",
    };
  }

  return { background: gradient };
}

export function getFooterV1CssVariables(
  settings: FooterV1PreviewSettings,
): Record<string, string> {
  const logoHeightPx = snapFooterV1LogoSizePx(settings.logoSizePx);

  return {
    "--footer-v1-brand-name-color": settings.brandNameColor,
    "--footer-v1-tagline-color": settings.taglineColor,
    "--footer-v1-nav-color": settings.navColor,
    "--footer-v1-nav-hover": settings.navHoverColor,
    "--footer-v1-contact-heading-color": settings.contactHeadingColor,
    "--footer-v1-contact-text-color": settings.contactTextColor,
    "--footer-v1-contact-link-hover": settings.contactLinkHoverColor,
    "--footer-v1-contact-btn-bg": settings.contactButtonBgColor,
    "--footer-v1-contact-btn-hover-bg": settings.contactButtonHoverBgColor,
    "--footer-v1-contact-btn-color": settings.contactButtonTextColor,
    "--footer-v1-bottom-bg": settings.bottomBarBackgroundColor,
    "--footer-v1-bottom-color": settings.bottomBarTextColor,
    "--footer-v1-contact-text-size": formatFooterV1ContactTextSizeEm(
      snapFooterV1ContactTextSizeEm(settings.contactTextSizeEm),
    ),
    "--footer-v1-logo-height": `${logoHeightPx}px`,
    "--footer-v1-logo-max-width": `${getFooterV1LogoMaxWidthPx(logoHeightPx)}px`,
  };
}

export function getFooterV1LayoutWidthClassName(layoutWidth: SiteLayoutWidth): string {
  if (layoutWidth === "full") {
    return "mx-auto w-full max-w-none";
  }

  return `mx-auto w-full ${siteContainedMaxWidthClass}`;
}

function resolveContentString(
  override: string | undefined,
  fallback: string,
): string {
  return override !== undefined ? override.trim() : fallback;
}

/** Default bottom-bar copyright — year stays current unless overridden in playground. */
export function buildDefaultFooterV1Copyright(
  brandName: string,
  year = new Date().getFullYear(),
): string {
  return `© ${year} ${brandName}. All rights reserved.`;
}

/** Build the contact list used when saving playground edits. */
export function seedFooterV1ContentContacts(
  defaults: TeamContact[],
  settings: FooterV1PreviewSettings,
): FooterV1ContactOverride[] {
  if (settings.contentContacts !== undefined) {
    return settings.contentContacts.map((contact, index) => ({
      name: contact.name.trim(),
      phone: contact.phone.trim(),
      email: contact.email?.trim() ?? defaults[index]?.email ?? "",
    }));
  }

  const hasLegacyOverride =
    settings.contentContactName !== undefined || settings.contentContactPhone !== undefined;

  if (hasLegacyOverride) {
    const contacts = defaults.length > 0 ? defaults.map((contact) => ({ ...contact })) : [{ name: "", phone: "", email: "" }];
    contacts[0] = {
      ...contacts[0],
      name:
        settings.contentContactName !== undefined
          ? settings.contentContactName.trim()
          : contacts[0].name,
      phone:
        settings.contentContactPhone !== undefined
          ? settings.contentContactPhone.trim()
          : contacts[0].phone,
    };
    return contacts;
  }

  return defaults.map((contact) => ({ ...contact }));
}

function resolveFooterV1Contacts(
  defaults: TeamContact[],
  settings: FooterV1PreviewSettings,
  brandName: string,
): TeamContact[] {
  return seedFooterV1ContentContacts(defaults, settings).map((contact, index) => ({
    name: contact.name || defaults[index]?.name || brandName,
    phone: contact.phone || defaults[index]?.phone || "",
    email: contact.email ?? defaults[index]?.email ?? "",
  }));
}

/** Resolved footer copy for display — merges playground overrides with defaults. */
export function resolveFooterV1Content(
  defaults: FooterV1Content,
  settings: FooterV1PreviewSettings,
): FooterV1Content {
  const brandName = resolveContentString(settings.contentBrandName, defaults.brandName);
  const tagline = resolveContentString(settings.contentTagline, defaults.tagline);
  const serviceArea = resolveContentString(settings.contentServiceArea, defaults.serviceArea);
  const copyright =
    settings.contentCopyright !== undefined
      ? settings.contentCopyright.trim()
      : buildDefaultFooterV1Copyright(brandName);
  const contacts = resolveFooterV1Contacts(defaults.contacts, settings, brandName);

  return { brandName, tagline, serviceArea, contacts, copyright };
}

/** Site-wide footer copy — synced across all footer-v1 instances. */
export const footerV1ContentOverrideKeys = [
  "contentBrandName",
  "contentTagline",
  "contentServiceArea",
  "contentContactName",
  "contentContactPhone",
  "contentContacts",
  "contentCopyright",
  "contentLogoSrc",
] as const satisfies readonly (keyof FooterV1PreviewSettings)[];

export type FooterV1ContentOverrideKey = (typeof footerV1ContentOverrideKeys)[number];

export type FooterV1ContentOverrides = Pick<
  FooterV1PreviewSettings,
  FooterV1ContentOverrideKey
>;

export function pickFooterV1ContentOverrides(
  settings: FooterV1PreviewSettings,
): FooterV1ContentOverrides {
  const {
    contentBrandName,
    contentTagline,
    contentServiceArea,
    contentContactName,
    contentContactPhone,
    contentContacts,
    contentCopyright,
    contentLogoSrc,
  } = settings;

  return {
    ...(contentBrandName !== undefined ? { contentBrandName } : {}),
    ...(contentTagline !== undefined ? { contentTagline } : {}),
    ...(contentServiceArea !== undefined ? { contentServiceArea } : {}),
    ...(contentContactName !== undefined ? { contentContactName } : {}),
    ...(contentContactPhone !== undefined ? { contentContactPhone } : {}),
    ...(contentContacts !== undefined ? { contentContacts } : {}),
    ...(contentCopyright !== undefined ? { contentCopyright } : {}),
    ...(contentLogoSrc !== undefined ? { contentLogoSrc } : {}),
  };
}

/** Global footer copy wins over stale per-instance overrides on preview/publish. */
export function mergeFooterV1GlobalContent(
  instance: FooterV1PreviewSettings,
  global?: FooterV1PreviewSettings,
): FooterV1PreviewSettings {
  if (!global) return instance;
  return { ...instance, ...pickFooterV1ContentOverrides(global) };
}

/** When Global is on, home footer styling + nav apply site-wide; copy always merges from global. */
export function resolveFooterV1WithGlobalPreference(
  instance: FooterV1PreviewSettings,
  global?: FooterV1PreviewSettings,
): FooterV1PreviewSettings {
  if (!global) return instance;
  if (footerUsesGlobalNav(global)) {
    return { ...global, useGlobalNav: true, navItems: undefined };
  }
  return mergeFooterV1GlobalContent(instance, global);
}
