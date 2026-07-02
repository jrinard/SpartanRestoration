import { getCommittedHomepagePreviewSettings } from "@/lib/homepage-settings";
import {
  defaultNavBarLinks,
  defaultNavBarPreviewSettings,
  navBarHeightOptions,
  type NavBarLayoutWidth,
  type NavBarLink,
  type NavBarPreviewSettings,
} from "@/lib/nav-bar-preview";

export const navBarPreviewStorageKey = "lifespring-nav-bar-preview";

function isNavBarLayoutWidth(value: unknown): value is NavBarLayoutWidth {
  return value === "contained" || value === "full";
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function normalizeNavBarLink(value: unknown, fallback: NavBarLink): NavBarLink {
  if (!value || typeof value !== "object") return fallback;

  const link = value as Partial<NavBarLink>;
  return {
    label:
      typeof link.label === "string" && link.label.trim() ? link.label.trim() : fallback.label,
    href: typeof link.href === "string" && link.href.trim() ? link.href.trim() : fallback.href,
  };
}

function normalizeNavBarItems(value: unknown): NavBarLink[] {
  if (!Array.isArray(value) || value.length === 0) {
    return defaultNavBarLinks;
  }

  return value.map((item, index) =>
    normalizeNavBarLink(item, defaultNavBarLinks[index] ?? defaultNavBarLinks[0]),
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

  const stored = localStorage.getItem(navBarPreviewStorageKey);
  if (!stored) return defaultNavBarPreviewSettings;

  return parseStoredNavBarPreview(stored) ?? defaultNavBarPreviewSettings;
}

export function saveNavBarPreviewSettings(settings: NavBarPreviewSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(navBarPreviewStorageKey, JSON.stringify(settings));
}
