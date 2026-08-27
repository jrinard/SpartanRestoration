import {
  getCommittedHomepagePreviewSettings,
  shouldUsePlaygroundPreviewSettings,
} from "@/lib/homepage-settings";
import {
  defaultFooterV4PreviewSettings,
  mergeFooterV4GlobalContent,
  pickFooterV4ContentOverrides,
  type FooterV4ContentOverrides,
  type FooterV4PreviewSettings,
} from "@/lib/footer-v4-preview";
import type { NavBarLink } from "@/lib/nav-bar-preview";
import {
  loadAllSectionInstanceSettings,
  saveSectionInstanceField,
} from "@/lib/section-instance-storage";
import { orgStorageGet, orgStorageSet } from "@/lib/org/browser-storage";

export const footerV4PreviewStorageKey = "lifespring-footer-v4-preview";

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function isNavBarLink(value: unknown): value is NavBarLink {
  if (!value || typeof value !== "object") return false;
  const link = value as NavBarLink;
  return typeof link.id === "string" && typeof link.label === "string" && typeof link.href === "string";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

export function normalizeFooterV4PreviewSettings(
  value: Partial<FooterV4PreviewSettings>,
): FooterV4PreviewSettings {
  return {
    bannerFrom: isHexColor(value.bannerFrom)
      ? value.bannerFrom
      : defaultFooterV4PreviewSettings.bannerFrom,
    bannerTo: isHexColor(value.bannerTo) ? value.bannerTo : defaultFooterV4PreviewSettings.bannerTo,
    headingColor: isHexColor(value.headingColor)
      ? value.headingColor
      : defaultFooterV4PreviewSettings.headingColor,
    textColor: isHexColor(value.textColor)
      ? value.textColor
      : defaultFooterV4PreviewSettings.textColor,
    linkColor: isHexColor(value.linkColor)
      ? value.linkColor
      : defaultFooterV4PreviewSettings.linkColor,
    linkHoverColor: isHexColor(value.linkHoverColor)
      ? value.linkHoverColor
      : defaultFooterV4PreviewSettings.linkHoverColor,
    socialColor: isHexColor(value.socialColor)
      ? value.socialColor
      : defaultFooterV4PreviewSettings.socialColor,
    socialHoverColor: isHexColor(value.socialHoverColor)
      ? value.socialHoverColor
      : defaultFooterV4PreviewSettings.socialHoverColor,
    bottomBarBackgroundColor: isHexColor(value.bottomBarBackgroundColor)
      ? value.bottomBarBackgroundColor
      : defaultFooterV4PreviewSettings.bottomBarBackgroundColor,
    bottomBarTextColor: isHexColor(value.bottomBarTextColor)
      ? value.bottomBarTextColor
      : defaultFooterV4PreviewSettings.bottomBarTextColor,
    logoSizePx:
      typeof value.logoSizePx === "number" && Number.isFinite(value.logoSizePx)
        ? value.logoSizePx
        : defaultFooterV4PreviewSettings.logoSizePx,
    showFacebook:
      typeof value.showFacebook === "boolean"
        ? value.showFacebook
        : defaultFooterV4PreviewSettings.showFacebook,
    showInstagram:
      typeof value.showInstagram === "boolean"
        ? value.showInstagram
        : defaultFooterV4PreviewSettings.showInstagram,
    contentAddress:
      typeof value.contentAddress === "string" ? value.contentAddress : value.contentAddress,
    contentPhone: typeof value.contentPhone === "string" ? value.contentPhone : value.contentPhone,
    contentEmail: typeof value.contentEmail === "string" ? value.contentEmail : value.contentEmail,
    contentCopyright:
      typeof value.contentCopyright === "string" ? value.contentCopyright : value.contentCopyright,
    contentHours: isStringArray(value.contentHours) ? value.contentHours : value.contentHours,
    contentLicenses: isStringArray(value.contentLicenses)
      ? value.contentLicenses
      : value.contentLicenses,
    contentLogoSrc:
      typeof value.contentLogoSrc === "string" ? value.contentLogoSrc : value.contentLogoSrc,
    contentFacebookUrl:
      typeof value.contentFacebookUrl === "string"
        ? value.contentFacebookUrl
        : value.contentFacebookUrl,
    contentInstagramUrl:
      typeof value.contentInstagramUrl === "string"
        ? value.contentInstagramUrl
        : value.contentInstagramUrl,
    serviceLinks: Array.isArray(value.serviceLinks)
      ? value.serviceLinks.filter(isNavBarLink)
      : value.serviceLinks,
  };
}

export function loadFooterV4PreviewSettings(): FooterV4PreviewSettings {
  if (!shouldUsePlaygroundPreviewSettings()) {
    const committed = getCommittedHomepagePreviewSettings()?.footerV4;
    if (committed) return normalizeFooterV4PreviewSettings(committed);
  }

  if (typeof window === "undefined") {
    return defaultFooterV4PreviewSettings;
  }

  try {
    const stored = orgStorageGet(footerV4PreviewStorageKey);
    if (!stored) return defaultFooterV4PreviewSettings;
    const parsed: unknown = JSON.parse(stored);
    if (parsed && typeof parsed === "object") {
      return normalizeFooterV4PreviewSettings(parsed as Partial<FooterV4PreviewSettings>);
    }
  } catch {
    // ignore invalid storage
  }

  return defaultFooterV4PreviewSettings;
}

export function saveFooterV4PreviewSettings(settings: FooterV4PreviewSettings): void {
  if (typeof window === "undefined") return;
  orgStorageSet(footerV4PreviewStorageKey, JSON.stringify(normalizeFooterV4PreviewSettings(settings)));
}

export function saveFooterV4ContentOverrides(patch: FooterV4ContentOverrides): void {
  if (typeof window === "undefined") return;

  const global = normalizeFooterV4PreviewSettings({
    ...loadFooterV4PreviewSettings(),
    ...patch,
  });
  saveFooterV4PreviewSettings(global);

  const instances = loadAllSectionInstanceSettings();
  for (const [instanceId, settings] of Object.entries(instances)) {
    if (!settings.footerV4) continue;
    saveSectionInstanceField(
      instanceId,
      "footerV4",
      normalizeFooterV4PreviewSettings({ ...settings.footerV4, ...patch }),
    );
  }
}

export function resolveFooterV4PreviewSettings(
  instance?: FooterV4PreviewSettings,
  global?: FooterV4PreviewSettings,
): FooterV4PreviewSettings | undefined {
  if (!instance && !global) return undefined;
  if (!instance) return global ? normalizeFooterV4PreviewSettings(global) : undefined;
  if (!global) return normalizeFooterV4PreviewSettings(instance);
  return normalizeFooterV4PreviewSettings(mergeFooterV4GlobalContent(instance, global));
}
