import { getSiteLayoutWidthClassName } from "@/lib/site-layout";
import { parseNavHref } from "@/lib/scroll-to-hash";

export type NavBarLayoutWidth = "contained" | "full";

export type NavBarLink = {
  id: string;
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
  { id: "nav-home", label: "Home", href: "/" },
  { id: "nav-services", label: "Our Services", href: "#services" },
  { id: "nav-insurance", label: "Insurance", href: "#insurance" },
  { id: "nav-gallery", label: "Gallery", href: "#gallery" },
  { id: "nav-service-area", label: "Service Area", href: "#service-area" },
];

export function createNavBarLinkId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `nav-link-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `nav-link-${Date.now().toString(36)}`;
}

export function parseNavBarLinkHref(href: string): { pageHref: string; anchorId: string } {
  const { pathname, hash } = parseNavHref(href);
  return {
    pageHref: pathname || "/",
    anchorId: hash.replace(/^#/, ""),
  };
}

export function buildNavBarLinkHref(pageHref: string, anchorId: string): string {
  const page = pageHref.trim() || "/";
  const anchor = anchorId.trim().replace(/^#/, "");
  if (!anchor) return page;
  if (page === "/") return `#${anchor}`;
  return `${page}#${anchor}`;
}

export function createNavBarLink(partial: Partial<NavBarLink> = {}, index = 0): NavBarLink {
  const pageHref = partial.href ? parseNavBarLinkHref(partial.href).pageHref : "/";
  const anchorId = partial.href ? parseNavBarLinkHref(partial.href).anchorId : "";

  return {
    id: partial.id ?? createNavBarLinkId(),
    label: partial.label?.trim() || `Link ${index + 1}`,
    href: partial.href?.trim() || buildNavBarLinkHref(pageHref, anchorId),
  };
}

export function getNavBarLinkPillLabel(link: NavBarLink, index: number): string {
  const label = link.label.trim();
  return label || `Link ${index + 1}`;
}

export function addNavBarLink(links: readonly NavBarLink[]): NavBarLink[] {
  return [...links, createNavBarLink({}, links.length)];
}

export function updateNavBarLink(
  links: readonly NavBarLink[],
  linkId: string,
  patch: Partial<NavBarLink>,
): NavBarLink[] {
  return links.map((link) => (link.id === linkId ? { ...link, ...patch, id: link.id } : link));
}

export function deleteNavBarLink(links: readonly NavBarLink[], linkId: string): NavBarLink[] {
  return links.filter((link) => link.id !== linkId);
}

export function reorderNavBarLinks(
  links: readonly NavBarLink[],
  fromIndex: number,
  toIndex: number,
): NavBarLink[] {
  if (fromIndex === toIndex) return [...links];

  const next = [...links];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

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
