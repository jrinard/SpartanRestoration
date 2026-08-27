import { defaultSiteIconName, resolveSiteIconName, type SiteIconName } from "@/lib/site-icons";

export type HeaderV1NavSide = "left" | "right";

export type HeaderV1NavLink = {
  id: string;
  label: string;
  pageHref: string;
  anchorId: string;
  icon?: SiteIconName;
  /** Header v2 — which side of the centered logo. Ignored on header v1. */
  side?: HeaderV1NavSide;
};

/** @deprecated Use HeaderV1NavLink */
export type HeaderV1NavItem = HeaderV1NavLink & {
  href?: string;
  pageHref?: string;
};

export const defaultHeaderV1NavLinks: ReadonlyArray<HeaderV1NavLink> = [
  {
    id: "commercial",
    icon: "building-2",
    label: "Commercial",
    pageHref: "/",
    anchorId: "commercial",
    side: "left",
  },
  {
    id: "residential",
    icon: "home",
    label: "Residential",
    pageHref: "/",
    anchorId: "residential",
    side: "left",
  },
  {
    id: "restoration",
    icon: "hammer",
    label: "Restoration",
    pageHref: "/",
    anchorId: "restoration",
    side: "right",
  },
];

/** @deprecated Use defaultHeaderV1NavLinks */
export const headerV1ServiceNav: ReadonlyArray<HeaderV1NavItem> = defaultHeaderV1NavLinks;

/** Text and Images row anchor ids — independent of header nav config. */
export const headerV1TextImagesRowAnchorIds = [
  "commercial",
  "residential",
  "restoration",
] as const;

function inferHeaderV1NavLinkIconFromLabel(label: string): SiteIconName | undefined {
  const normalized = label.toLowerCase().replace(/\s+/g, " ");

  if (normalized.includes("commercial")) return "building-2";
  if (normalized.includes("residential")) return "home";
  if (normalized.includes("restoration")) return "hammer";

  return undefined;
}

/** Old Spartan header defaults — replaced when labels point to Stone Pillar nav. */
const legacySpartanHeaderNavIcons = new Set<SiteIconName>(["droplets", "biohazard", "flame"]);

export function createHeaderV1NavLinkId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `nav-link-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `nav-link-${Date.now().toString(36)}`;
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
    side: partial.side === "right" ? "right" : partial.side === "left" ? "left" : undefined,
  };
}

export function normalizeHeaderV1AnchorId(value: string): string {
  return value.trim().replace(/^#/, "");
}

export function getHeaderV1NavLinkHref(link: HeaderV1NavLink): string {
  const page = link.pageHref.trim() || "/";
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

  const icon =
    typeof record.icon === "string"
      ? resolveSiteIconName(record.icon, defaultSiteIconName)
      : undefined;

  const side =
    record.side === "right" ? "right" : record.side === "left" ? "left" : undefined;

  return { id, label, pageHref, anchorId, icon, side };
}

export function getHeaderV1NavLinkSide(link: HeaderV1NavLink): HeaderV1NavSide {
  return link.side === "right" ? "right" : "left";
}

function inferHeaderV1NavLinkSide(
  link: HeaderV1NavLink,
  index: number,
  total: number,
): HeaderV1NavSide {
  if (link.side === "left" || link.side === "right") {
    return link.side;
  }

  const defaultLink = defaultHeaderV1NavLinks.find((entry) => entry.id === link.id);
  if (defaultLink?.side) {
    return defaultLink.side;
  }

  const midpoint = Math.ceil(total / 2);
  return index < midpoint ? "left" : "right";
}

export function partitionHeaderV1NavLinksBySide(
  links: readonly HeaderV1NavLink[],
): { left: HeaderV1NavLink[]; right: HeaderV1NavLink[] } {
  const left: HeaderV1NavLink[] = [];
  const right: HeaderV1NavLink[] = [];

  for (const link of links) {
    if (getHeaderV1NavLinkSide(link) === "right") {
      right.push({ ...link });
    } else {
      left.push({ ...link });
    }
  }

  return { left, right };
}

/** @deprecated Use partitionHeaderV1NavLinksBySide */
export function splitHeaderV1NavLinks(
  links: readonly HeaderV1NavLink[],
): { left: HeaderV1NavLink[]; right: HeaderV1NavLink[] } {
  return partitionHeaderV1NavLinksBySide(links);
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
  const inferredIcon = inferHeaderV1NavLinkIconFromLabel(link.label);

  if (link.icon) {
    const resolved = resolveSiteIconName(link.icon, defaultSiteIconName);
    if (!inferredIcon || !legacySpartanHeaderNavIcons.has(resolved)) {
      return resolved;
    }
  }

  if (legacyIcons?.[link.id]) {
    const resolved = resolveSiteIconName(legacyIcons[link.id], defaultSiteIconName);
    if (!inferredIcon || !legacySpartanHeaderNavIcons.has(resolved)) {
      return resolved;
    }
  }

  if (inferredIcon) {
    return inferredIcon;
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
      return withDefaultHeaderV1NavLinkIcons(
        normalized.map((link, index) => ({
          ...link,
          side: inferHeaderV1NavLinkSide(link, index, normalized.length),
        })),
        legacy?.headerV1NavIcons,
      );
    }

    return [];
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

export function addHeaderV1NavLink(
  links: readonly HeaderV1NavLink[],
  side: HeaderV1NavSide = "left",
): HeaderV1NavLink[] {
  return [...links, createHeaderV1NavLink({ side }, links.length)];
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
