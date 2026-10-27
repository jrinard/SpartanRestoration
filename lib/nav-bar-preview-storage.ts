import { getCommittedHomepagePreviewSettings } from "@/lib/homepage-settings";
import {
  createNavBarLinkId,
  defaultNavBarLinks,
  defaultNavBarPreviewSettings,
  navBarHeightOptions,
  type NavBarLayoutWidth,
  type NavBarMobileToggleAlign,
  createNavBarDropdownItem,
  type NavBarDropdownItem,
  type NavBarLink,
  type NavBarPreviewSettings,
} from "@/lib/nav-bar-preview";
import { normalizeOptionalLayoutWidthMobile } from "@/lib/site-layout";

import { orgStorageGet, orgStorageSet } from "@/lib/org/browser-storage";

export const navBarPreviewStorageKey = "lifespring-nav-bar-preview";

function isNavBarLayoutWidth(value: unknown): value is NavBarLayoutWidth {
  return value === "contained" || value === "full";
}

function isNavBarMobileToggleAlign(value: unknown): value is NavBarMobileToggleAlign {
  return value === "left" || value === "center" || value === "right";
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function normalizeNavBarDropdownItems(value: unknown): NavBarDropdownItem[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;

  const items = value
    .map((entry, index) => {
      if (!entry || typeof entry !== "object") return null;
      return createNavBarDropdownItem(entry as Partial<NavBarDropdownItem>, index);
    })
    .filter((entry): entry is NavBarDropdownItem => entry !== null);

  return items.length > 0 ? items : undefined;
}

function normalizeNavBarLink(value: unknown, fallback: NavBarLink, index: number): NavBarLink {
  if (!value || typeof value !== "object") return fallback;

  const link = value as Partial<NavBarLink>;
  const label =
    typeof link.label === "string" && link.label.trim() ? link.label.trim() : fallback.label;
  const href =
    typeof link.href === "string" && link.href.trim() ? link.href.trim() : fallback.href;
  const id =
    typeof link.id === "string" && link.id.trim()
      ? link.id.trim()
      : fallback.id || createNavBarLinkId();
  const target =
    link.target === "_blank" || link.target === "_self" ? link.target : undefined;
  const visibleDesktop = link.visibleDesktop !== false;
  const visibleMobile = link.visibleMobile !== false;
  const openContactModal =
    link.openContactModal === false
      ? false
      : link.openContactModal === true
        ? true
        : undefined;
  const dropdown = link.dropdown === true;
  const dropdownItems = dropdown ? normalizeNavBarDropdownItems(link.dropdownItems) : undefined;

  return {
    id,
    label,
    href,
    target,
    visibleDesktop,
    visibleMobile,
    openContactModal,
    ...(dropdown
      ? {
          dropdown: true as const,
          dropdownItems: dropdownItems ?? [],
        }
      : {}),
  };
}

export function normalizeNavBarItems(value: unknown): NavBarLink[] {
  if (!Array.isArray(value) || value.length === 0) {
    return defaultNavBarLinks.map((link) => ({ ...link }));
  }

  return value.map((item, index) =>
    normalizeNavBarLink(
      item,
      defaultNavBarLinks[index] ?? defaultNavBarLinks[defaultNavBarLinks.length - 1]!,
      index,
    ),
  );
}

export function normalizeNavBarPreviewSettings(
  value: Partial<NavBarPreviewSettings>,
): NavBarPreviewSettings {
  return {
    ...defaultNavBarPreviewSettings,
    ...value,
    layoutWidth: isNavBarLayoutWidth(value.layoutWidth)
      ? value.layoutWidth
      : defaultNavBarPreviewSettings.layoutWidth,
    ...(normalizeOptionalLayoutWidthMobile(value.layoutWidthMobile)
      ? { layoutWidthMobile: normalizeOptionalLayoutWidthMobile(value.layoutWidthMobile) }
      : {}),
    heightPx:
      typeof value.heightPx === "number" &&
      navBarHeightOptions.includes(
        Math.round(value.heightPx) as (typeof navBarHeightOptions)[number],
      )
        ? Math.round(value.heightPx)
        : typeof value.heightPx === "number"
          ? Math.min(120, Math.max(48, Math.round(value.heightPx)))
          : defaultNavBarPreviewSettings.heightPx,
    backgroundColor: isHexColor(value.backgroundColor)
      ? value.backgroundColor
      : defaultNavBarPreviewSettings.backgroundColor,
    outerBackgroundColor: isHexColor(value.outerBackgroundColor)
      ? value.outerBackgroundColor
      : defaultNavBarPreviewSettings.outerBackgroundColor,
    linkColor: isHexColor(value.linkColor)
      ? value.linkColor
      : defaultNavBarPreviewSettings.linkColor,
    linkHoverColor: isHexColor(value.linkHoverColor)
      ? value.linkHoverColor
      : defaultNavBarPreviewSettings.linkHoverColor,
    mobileToggleAlign: isNavBarMobileToggleAlign(value.mobileToggleAlign)
      ? value.mobileToggleAlign
      : defaultNavBarPreviewSettings.mobileToggleAlign,
    items: normalizeNavBarItems(value.items),
  };
}

function parseStoredNavBarPreview(raw: string): NavBarPreviewSettings | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return normalizeNavBarPreviewSettings(parsed as Partial<NavBarPreviewSettings>);
    }
  } catch {
    // ignore invalid storage
  }

  return null;
}

export function loadNavBarPreviewSettings(): NavBarPreviewSettings {
  const committed = getCommittedHomepagePreviewSettings()?.navBar;
  if (committed) return committed;

  if (typeof window === "undefined") {
    return defaultNavBarPreviewSettings;
  }

  const stored = orgStorageGet(navBarPreviewStorageKey);
  if (!stored) return defaultNavBarPreviewSettings;

  return parseStoredNavBarPreview(stored) ?? defaultNavBarPreviewSettings;
}

export function saveNavBarPreviewSettings(settings: NavBarPreviewSettings): void {
  if (typeof window === "undefined") return;
  orgStorageSet(navBarPreviewStorageKey, JSON.stringify(settings));
}
