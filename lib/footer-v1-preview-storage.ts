import {
  getCommittedHomepagePreviewSettings,
  shouldUsePlaygroundPreviewSettings,
} from "@/lib/homepage-settings";
import {
  defaultFooterV1PreviewSettings,
  getDefaultFooterV1NavLinks,
  footerUsesGlobalNav,
  mergeFooterV1GlobalContent,
  mergeFooterV1GlobalNavPreference,
  resolveFooterV1WithGlobalPreference,
  snapFooterV1ContactTextSizeEm,
  snapFooterV1ContentInsetPx,
  snapFooterV1LogoSizePx,
  type FooterV1ContactOverride,
  type FooterV1ContentOverrides,
  type FooterV1PreviewSettings,
} from "@/lib/footer-v1-preview";
import { normalizeImageLibrarySrc } from "@/lib/image-library";
import { normalizeNavBarItems } from "@/lib/nav-bar-preview-storage";
import type { PreviewGradientDirection } from "@/lib/preview-gradient";
import type { SiteLayoutWidth } from "@/lib/site-layout";
import {
  loadAllSectionInstanceSettings,
  saveSectionInstanceField,
} from "@/lib/section-instance-storage";

import { orgStorageGet, orgStorageSet } from "@/lib/org/browser-storage";

export const footerV1PreviewStorageKey = "lifespring-footer-v1-preview";

export const footerV1GlobalNavSyncEvent = "footer-v1-global-nav-sync";

export function notifyFooterV1GlobalNavUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(footerV1GlobalNavSyncEvent));
}

export function loadFooterV1GlobalNavPreference(): boolean {
  return footerUsesGlobalNav(loadFooterV1PreviewSettings());
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function isPreviewGradientDirection(value: unknown): value is PreviewGradientDirection {
  return (
    value === "none" ||
    value === "to bottom" ||
    value === "to top" ||
    value === "to right" ||
    value === "to left" ||
    value === "to bottom right" ||
    value === "to bottom left" ||
    value === "to top right" ||
    value === "to top left"
  );
}

function isSiteLayoutWidth(value: unknown): value is SiteLayoutWidth {
  return value === "contained" || value === "full";
}

function isFooterV1PreviewSettings(value: unknown): value is Partial<FooterV1PreviewSettings> {
  if (!value || typeof value !== "object") return false;
  return true;
}

function normalizeContentOverrideString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function normalizeFooterV1ContentContacts(
  value: unknown,
): FooterV1ContactOverride[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const contacts = value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const record = entry as Record<string, unknown>;
      if (typeof record.name !== "string" || typeof record.phone !== "string") return null;

      return {
        name: record.name,
        phone: record.phone,
        ...(typeof record.email === "string" ? { email: record.email } : {}),
      };
    })
    .filter((entry): entry is FooterV1ContactOverride => entry !== null);

  return contacts.length > 0 ? contacts : undefined;
}

export function normalizeFooterV1PreviewSettings(
  value: Partial<FooterV1PreviewSettings>,
): FooterV1PreviewSettings {
  return {
    brandNameColor: isHexColor(value.brandNameColor)
      ? value.brandNameColor
      : defaultFooterV1PreviewSettings.brandNameColor,
    taglineColor: isHexColor(value.taglineColor)
      ? value.taglineColor
      : defaultFooterV1PreviewSettings.taglineColor,
    navColor: isHexColor(value.navColor)
      ? value.navColor
      : defaultFooterV1PreviewSettings.navColor,
    navHoverColor: isHexColor(value.navHoverColor)
      ? value.navHoverColor
      : defaultFooterV1PreviewSettings.navHoverColor,
    contactHeadingColor: isHexColor(value.contactHeadingColor)
      ? value.contactHeadingColor
      : defaultFooterV1PreviewSettings.contactHeadingColor,
    contactTextColor: isHexColor(value.contactTextColor)
      ? value.contactTextColor
      : defaultFooterV1PreviewSettings.contactTextColor,
    contactLinkHoverColor: isHexColor(value.contactLinkHoverColor)
      ? value.contactLinkHoverColor
      : defaultFooterV1PreviewSettings.contactLinkHoverColor,
    contactButtonBgColor: isHexColor(value.contactButtonBgColor)
      ? value.contactButtonBgColor
      : defaultFooterV1PreviewSettings.contactButtonBgColor,
    contactButtonHoverBgColor: isHexColor(value.contactButtonHoverBgColor)
      ? value.contactButtonHoverBgColor
      : defaultFooterV1PreviewSettings.contactButtonHoverBgColor,
    contactButtonTextColor: isHexColor(value.contactButtonTextColor)
      ? value.contactButtonTextColor
      : defaultFooterV1PreviewSettings.contactButtonTextColor,
    mainBackgroundFrom: isHexColor(value.mainBackgroundFrom)
      ? value.mainBackgroundFrom
      : defaultFooterV1PreviewSettings.mainBackgroundFrom,
    mainBackgroundTo: isHexColor(value.mainBackgroundTo)
      ? value.mainBackgroundTo
      : defaultFooterV1PreviewSettings.mainBackgroundTo,
    mainBackgroundDirection: isPreviewGradientDirection(value.mainBackgroundDirection)
      ? value.mainBackgroundDirection
      : defaultFooterV1PreviewSettings.mainBackgroundDirection,
    mainBackgroundImageSrc: normalizeImageLibrarySrc(value.mainBackgroundImageSrc),
    bottomBarBackgroundColor: isHexColor(value.bottomBarBackgroundColor)
      ? value.bottomBarBackgroundColor
      : defaultFooterV1PreviewSettings.bottomBarBackgroundColor,
    bottomBarTextColor: isHexColor(value.bottomBarTextColor)
      ? value.bottomBarTextColor
      : defaultFooterV1PreviewSettings.bottomBarTextColor,
    contactTextSizeEm:
      typeof value.contactTextSizeEm === "number"
        ? snapFooterV1ContactTextSizeEm(value.contactTextSizeEm)
        : defaultFooterV1PreviewSettings.contactTextSizeEm,
    layoutWidth: isSiteLayoutWidth(value.layoutWidth)
      ? value.layoutWidth
      : defaultFooterV1PreviewSettings.layoutWidth,
    contentInsetPx:
      typeof value.contentInsetPx === "number"
        ? snapFooterV1ContentInsetPx(value.contentInsetPx)
        : defaultFooterV1PreviewSettings.contentInsetPx,
    outerBackgroundColor: isHexColor(value.outerBackgroundColor)
      ? value.outerBackgroundColor
      : defaultFooterV1PreviewSettings.outerBackgroundColor,
    contentBrandName: normalizeContentOverrideString(value.contentBrandName),
    contentTagline: normalizeContentOverrideString(value.contentTagline),
    contentServiceArea: normalizeContentOverrideString(value.contentServiceArea),
    contentContactName: normalizeContentOverrideString(value.contentContactName),
    contentContactPhone: normalizeContentOverrideString(value.contentContactPhone),
    contentContacts: normalizeFooterV1ContentContacts(value.contentContacts),
    contentCopyright: normalizeContentOverrideString(value.contentCopyright),
    logoSizePx:
      typeof value.logoSizePx === "number"
        ? snapFooterV1LogoSizePx(value.logoSizePx)
        : defaultFooterV1PreviewSettings.logoSizePx,
    contentLogoSrc: normalizeImageLibrarySrc(value.contentLogoSrc),
    useGlobalNav: value.useGlobalNav === false ? false : true,
    navItems:
      value.useGlobalNav === false
        ? normalizeNavBarItems(value.navItems ?? getDefaultFooterV1NavLinks())
        : undefined,
  };
}

export function loadFooterV1PreviewSettings(): FooterV1PreviewSettings {
  if (!shouldUsePlaygroundPreviewSettings()) {
    const committed = getCommittedHomepagePreviewSettings()?.footerV1;
    if (committed) return normalizeFooterV1PreviewSettings(committed);
  }

  if (typeof window === "undefined") {
    return defaultFooterV1PreviewSettings;
  }

  try {
    const stored = orgStorageGet(footerV1PreviewStorageKey);
    if (!stored) return defaultFooterV1PreviewSettings;

    const parsed: unknown = JSON.parse(stored);
    if (isFooterV1PreviewSettings(parsed)) {
      return normalizeFooterV1PreviewSettings(parsed);
    }
  } catch {
    // ignore invalid storage
  }

  return defaultFooterV1PreviewSettings;
}

export function saveFooterV1PreviewSettings(settings: FooterV1PreviewSettings): void {
  if (typeof window === "undefined") return;
  const normalized = normalizeFooterV1PreviewSettings(settings);
  orgStorageSet(footerV1PreviewStorageKey, JSON.stringify(normalized));

  if (footerUsesGlobalNav(normalized)) {
    syncFooterV1SettingsToAllInstances(normalized);
  }
}

function syncFooterV1SettingsToAllInstances(settings: FooterV1PreviewSettings): void {
  const instances = loadAllSectionInstanceSettings();
  for (const [instanceId, instanceSettings] of Object.entries(instances)) {
    if (!instanceSettings.footerV1) continue;
    saveSectionInstanceField(instanceId, "footerV1", settings);
  }
}

/** Persist footer copy site-wide — global storage + every footer-v1 instance slot. */
export function saveFooterV1ContentOverrides(patch: FooterV1ContentOverrides): void {
  if (typeof window === "undefined") return;

  const global = normalizeFooterV1PreviewSettings({
    ...loadFooterV1PreviewSettings(),
    ...patch,
  });
  saveFooterV1PreviewSettings(global);

  const instances = loadAllSectionInstanceSettings();
  for (const [instanceId, settings] of Object.entries(instances)) {
    if (!settings.footerV1) continue;
    saveSectionInstanceField(
      instanceId,
      "footerV1",
      normalizeFooterV1PreviewSettings({ ...settings.footerV1, ...patch }),
    );
  }
}

export function resolveFooterV1PreviewSettings(
  instance?: FooterV1PreviewSettings,
  global?: FooterV1PreviewSettings,
): FooterV1PreviewSettings | undefined {
  if (!instance && !global) return undefined;
  if (!instance) return global ? normalizeFooterV1PreviewSettings(global) : undefined;
  if (!global) return normalizeFooterV1PreviewSettings(instance);
  return normalizeFooterV1PreviewSettings(
    resolveFooterV1WithGlobalPreference(instance, global),
  );
}

/** Apply site-wide footer nav + copy when loading instance or published settings. */
export function applyFooterV1PreviewLoadTransform(
  settings: FooterV1PreviewSettings,
): FooterV1PreviewSettings {
  const global = loadFooterV1PreviewSettings();
  return normalizeFooterV1PreviewSettings(
    resolveFooterV1WithGlobalPreference(
      applyFooterV1GlobalNavPreference(settings),
      global,
    ),
  );
}

export function saveFooterV1GlobalNavPreference(
  useGlobalNav: boolean,
  navItemsWhenLocal?: FooterV1PreviewSettings["navItems"],
): void {
  const current = loadFooterV1PreviewSettings();
  const next = normalizeFooterV1PreviewSettings({
    ...current,
    useGlobalNav,
    navItems: useGlobalNav ? undefined : navItemsWhenLocal,
  });
  saveFooterV1PreviewSettings(next);
  notifyFooterV1GlobalNavUpdated();
}

/** Apply the site-wide global-nav toggle to instance-scoped footer settings. */
export function applyFooterV1GlobalNavPreference(
  settings: FooterV1PreviewSettings,
): FooterV1PreviewSettings {
  return mergeFooterV1GlobalNavPreference(settings, loadFooterV1PreviewSettings());
}
