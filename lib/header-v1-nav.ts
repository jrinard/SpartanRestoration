import { defaultSiteIconName, resolveSiteIconName, type SiteIconName } from "@/lib/site-icons";

export type HeaderV1NavLinkTarget = "_self" | "_blank";

export type HeaderV1NavLink = {
  id: string;
  label: string;
  pageHref: string;
  anchorId: string;
  icon?: SiteIconName;
  /** Where to open the link — use `_blank` for external sites. */
  target?: HeaderV1NavLinkTarget;
};

/** @deprecated Use HeaderV1NavLink */
export type HeaderV1NavItem = HeaderV1NavLink & {
  href?: string;
  pageHref?: string;
};

export const defaultHeaderV1NavLinks: ReadonlyArray<HeaderV1NavLink> = [
  {
    id: "water-damage-restoration",
    icon: "droplets",
    label: "Water Damage\nRestoration",
    pageHref: "/",
    anchorId: "water-damage-restoration",
  },
  {
    id: "mold-removal",
    icon: "biohazard",
    label: "Mold Remediation",
    pageHref: "/",
    anchorId: "mold-removal",
  },
  {
    id: "storm-sewage-cleanup",
    icon: "cloud-rain",
    label: "Storm &\nSewage",
    pageHref: "/",
    anchorId: "storm",
  },
];

/** @deprecated Use defaultHeaderV1NavLinks */
export const headerV1ServiceNav: ReadonlyArray<HeaderV1NavItem> = defaultHeaderV1NavLinks;

/** Text and Images row anchor ids — independent of header nav config. */
export const headerV1TextImagesRowAnchorIds = [
  "water-damage-restoration",
  "mold-removal",
  "storm",
] as const;

export function createHeaderV1NavLinkId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `nav-link-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `nav-link-${Date.now().toString(36)}`;
}

export function isExternalNavHref(href: string): boolean {
  const trimmed = href.trim();
  return /^https?:\/\//i.test(trimmed) || trimmed.startsWith("//");
}

/** Sentinel value for the nav link editor Page dropdown. */
export const headerV1NavExternalPageValue = "__external__";

export function resolveHeaderV1NavLinkTarget(
  link: HeaderV1NavLink,
): HeaderV1NavLinkTarget | undefined {
  if (link.target === "_blank" || link.target === "_self") {
    return link.target;
  }
  return undefined;
}

export function createHeaderV1NavLink(
  partial: Partial<HeaderV1NavLink> = {},
  index = 0,
): HeaderV1NavLink {
  return {
    id: partial.id ?? createHeaderV1NavLinkId(),
    label: partial.label ?? `Link ${index + 1}`,
    pageHref: partial.pageHref?.trim() || "/",
    anchorId: partial.anchorId?.trim().replace(/^#/, "") ?? "",
    icon: partial.icon,
    target: partial.target,
  };
}

export function normalizeHeaderV1AnchorId(value: string): string {
  return value.trim().replace(/^#/, "");
}

export function getHeaderV1NavLinkHref(link: HeaderV1NavLink): string {
  const page = link.pageHref.trim() || "/";
  if (isExternalNavHref(page)) {
    return page;
  }
  const anchor = normalizeHeaderV1AnchorId(link.anchorId);
  return anchor ? `${page}#${anchor}` : page;
}

/** @deprecated Use getHeaderV1NavLinkHref */
export function getHeaderV1NavItemHref(item: HeaderV1NavItem): string {
  const page = item.pageHref?.trim() || "/";
  const rawAnchor = item.href ?? item.anchorId ?? "";
  const anchor = normalizeHeaderV1AnchorId(rawAnchor);
  return anchor ? `${page}#${anchor}` : page;
}

export function getHeaderV1NavLinkPillLabel(link: HeaderV1NavLink, index: number): string {
  const firstLine = link.label.split("\n")[0]?.trim();
  return firstLine || `Link ${index + 1}`;
}

function normalizeHeaderV1NavLink(value: unknown, index: number): HeaderV1NavLink | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Partial<HeaderV1NavLink & { href?: string }>;
  const id = typeof record.id === "string" && record.id.trim() ? record.id.trim() : createHeaderV1NavLinkId();
  const label = typeof record.label === "string" ? record.label : `Link ${index + 1}`;
  const pageHref =
    typeof record.pageHref === "string" && record.pageHref.trim()
      ? record.pageHref.trim()
      : "/";

  let anchorId = "";
  if (typeof record.anchorId === "string") {
    anchorId = normalizeHeaderV1AnchorId(record.anchorId);
  } else if (typeof record.href === "string") {
    anchorId = normalizeHeaderV1AnchorId(record.href);
  }

  if (anchorId === "fire-damage-restoration") {
    anchorId = headerV1TextImagesRowAnchorIds[2];
  }

  const icon =
    typeof record.icon === "string"
      ? resolveSiteIconName(record.icon, defaultSiteIconName)
      : undefined;

  const isExternal = isExternalNavHref(pageHref);
  const target =
    record.target === "_blank" || record.target === "_self" ? record.target : undefined;

  return {
    id,
    label,
    pageHref,
    anchorId: isExternal ? "" : anchorId,
    icon,
    target,
  };
}

type LegacyHeaderV1NavSettings = {
  headerV1NavLinkTargets?: unknown;
  headerV1NavIcons?: Partial<Record<string, SiteIconName>>;
};

function buildLinksFromLegacyTargets(
  linkTargets: unknown,
  iconMap?: Partial<Record<string, SiteIconName>>,
): HeaderV1NavLink[] {
  const defaults = defaultHeaderV1NavLinks.map((link) => ({ ...link }));
  if (!linkTargets || typeof linkTargets !== "object") {
    return defaults;
  }

  const record = linkTargets as Record<string, unknown>;
  return defaults.map((link) => {
    const entry = record[link.id];
    if (!entry || typeof entry !== "object") return link;

    const target = entry as { pageHref?: string; anchorId?: string };
    return {
      ...link,
      pageHref:
        typeof target.pageHref === "string" && target.pageHref.trim()
          ? target.pageHref.trim()
          : link.pageHref,
      anchorId:
        typeof target.anchorId === "string" && target.anchorId.trim()
          ? normalizeHeaderV1AnchorId(target.anchorId)
          : link.anchorId,
      icon: iconMap?.[link.id] ?? link.icon,
    };
  });
}

export function resolveHeaderV1NavLinkIcon(
  link: HeaderV1NavLink,
  legacyIcons?: Partial<Record<string, SiteIconName>>,
): SiteIconName {
  if (link.icon) {
    return resolveSiteIconName(link.icon, defaultSiteIconName);
  }

  if (legacyIcons?.[link.id]) {
    return resolveSiteIconName(legacyIcons[link.id], defaultSiteIconName);
  }

  const defaultLink = defaultHeaderV1NavLinks.find((entry) => entry.id === link.id);
  if (defaultLink?.icon) {
    return resolveSiteIconName(defaultLink.icon, defaultSiteIconName);
  }

  return defaultSiteIconName;
}

function withDefaultHeaderV1NavLinkIcons(
  links: HeaderV1NavLink[],
  legacyIcons?: Partial<Record<string, SiteIconName>>,
): HeaderV1NavLink[] {
  return links.map((link) => ({
    ...link,
    icon: resolveHeaderV1NavLinkIcon(link, legacyIcons),
  }));
}

export function normalizeHeaderV1NavLinks(
  value: unknown,
  legacy?: LegacyHeaderV1NavSettings,
): HeaderV1NavLink[] {
  if (Array.isArray(value)) {
    const normalized = value
      .map((entry, index) => normalizeHeaderV1NavLink(entry, index))
      .filter((entry): entry is HeaderV1NavLink => entry !== null);

    if (normalized.length > 0) {
      return withDefaultHeaderV1NavLinkIcons(normalized, legacy?.headerV1NavIcons);
    }
  }

  if (legacy?.headerV1NavLinkTargets) {
    return withDefaultHeaderV1NavLinkIcons(
      buildLinksFromLegacyTargets(legacy.headerV1NavLinkTargets, legacy.headerV1NavIcons),
      legacy.headerV1NavIcons,
    );
  }

  return withDefaultHeaderV1NavLinkIcons(
    defaultHeaderV1NavLinks.map((link) => ({ ...link })),
    legacy?.headerV1NavIcons,
  );
}

export function addHeaderV1NavLink(links: readonly HeaderV1NavLink[]): HeaderV1NavLink[] {
  return [...links, createHeaderV1NavLink({}, links.length)];
}

export function updateHeaderV1NavLink(
  links: readonly HeaderV1NavLink[],
  linkId: string,
  patch: Partial<HeaderV1NavLink>,
): HeaderV1NavLink[] {
  return links.map((link) => (link.id === linkId ? { ...link, ...patch, id: link.id } : link));
}

export function deleteHeaderV1NavLink(
  links: readonly HeaderV1NavLink[],
  linkId: string,
): HeaderV1NavLink[] {
  return links.filter((link) => link.id !== linkId);
}

export function headerV1NavLinksToItems(links: readonly HeaderV1NavLink[]): HeaderV1NavLink[] {
  return links.map((link) => ({ ...link }));
}
