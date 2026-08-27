import type { NavBarLink } from "@/lib/nav-bar-preview";
import { isContactHref } from "@/lib/contact-modal";
import { createNavBarLinkId } from "@/lib/nav-bar-preview";
import { createPlaygroundSectionId } from "@/lib/playground-section-id";
import type { HomepageConfig, HomepageSectionEntry } from "@/lib/homepage-config";
import { orgStorageGet, orgStorageSet } from "@/lib/org/browser-storage";
import { SERVICE_AREAS_PAGE_SLUG } from "@/lib/service-area-pages";
import { getServiceAreaLocationDefinition } from "@/lib/service-area-location-content";

import {
  defaultPlaygroundSections,
  mergePlaygroundSectionOrder,
  parsePlaygroundSectionOrder,
  playgroundSectionOrderKey,
  type PlaygroundSectionConfig,
} from "@/lib/playground-sections";

export const playgroundPagesStorageKey = "lifespring-playground-pages";

export const homePlaygroundPageId = "page-home";

export type PlaygroundPage = {
  id: string;
  name: string;
  slug: string;
  isHome?: boolean;
  /** When false, omit from nav generated from pages. Default true. */
  includeInNav?: boolean;
};

export type PlaygroundPagesState = {
  pages: PlaygroundPage[];
  activePageId: string;
  sectionsByPageId: Record<string, PlaygroundSectionConfig[]>;
};

function createPageId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `page-${crypto.randomUUID().slice(0, 8)}`;
  }

  return `page-${Date.now().toString(36)}`;
}

export function slugifyPlaygroundPageName(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "page"
  );
}

export function getPlaygroundPageHref(page: PlaygroundPage): string {
  if (page.isHome) return "/";
  return `/${page.slug}`;
}

export function getPlaygroundPreviewPath(page: PlaygroundPage): string {
  if (page.isHome) return "/preview";
  return `/preview/${page.slug}`;
}

/** Map live page hrefs to /preview paths — safe for SSR (no localStorage). */
export function resolvePreviewNavHref(href: string): string {
  const hashIndex = href.indexOf("#");
  const pathname = (hashIndex === -1 ? href : href.slice(0, hashIndex)).trim() || "/";
  const hash = hashIndex === -1 ? "" : href.slice(hashIndex);

  if (isContactHref(pathname)) {
    return href;
  }

  if (pathname.startsWith("/preview")) {
    return href;
  }

  if (pathname === "/" || pathname === "") {
    return `/preview${hash}`;
  }

  const slug = pathname.replace(/^\/+|\/+$/g, "");
  if (!slug) {
    return `/preview${hash}`;
  }

  return `/preview/${slug}${hash}`;
}

export function findPlaygroundPageByHref(
  pages: PlaygroundPage[],
  href: string,
): PlaygroundPage | undefined {
  const normalized = href.trim();
  if (normalized === "/" || normalized === "") {
    return pages.find((page) => page.isHome);
  }

  if (normalized.startsWith("/preview/")) {
    const slug = normalized.slice("/preview/".length).replace(/\/+$/g, "");
    if (!slug) return pages.find((page) => page.isHome);
    return pages.find((page) => !page.isHome && page.slug === slug);
  }

  if (normalized === "/preview") {
    return pages.find((page) => page.isHome);
  }

  if (!normalized.startsWith("/")) return undefined;

  const slug = normalized.slice(1).replace(/\/+$/g, "");
  if (!slug) return pages.find((page) => page.isHome);
  return pages.find((page) => !page.isHome && page.slug === slug);
}

export function findPlaygroundPageBySlug(
  pages: PlaygroundPage[],
  slug: string | undefined,
): PlaygroundPage | undefined {
  if (!slug) {
    return pages.find((page) => page.isHome);
  }

  return pages.find((page) => !page.isHome && page.slug === slug);
}

export function setActivePlaygroundPageInStorage(pageId: string): void {
  if (typeof window === "undefined") return;

  const state = loadPlaygroundPagesState();
  if (!state.pages.some((page) => page.id === pageId)) return;

  savePlaygroundPagesState({ ...state, activePageId: pageId });
}

export const reservedPageSlugs = [
  "playground",
  "forge",
  "preview",
  "api",
  "org-assets",
  "home",
  "privacy",
  "terms",
  "_next",
] as const;

export function joinCatchAllSlug(slug: string | string[] | undefined): string {
  if (!slug) return "";
  const parts = Array.isArray(slug) ? slug : [slug];
  return parts.filter(Boolean).join("/");
}

export function normalizePlaygroundPageSlug(input: string): string {
  const trimmed = input.trim().replace(/^\/+|\/+$/g, "");
  if (!trimmed) return "";

  return trimmed
    .split("/")
    .map((part) =>
      part
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    )
    .filter(Boolean)
    .join("/");
}

export function isReservedPageSlug(slug: string): boolean {
  const first = slug.replace(/^\/+/, "").split("/")[0] ?? "";
  if (!first) return true;
  const value = slugifyPlaygroundPageName(first);
  return (reservedPageSlugs as readonly string[]).includes(value) || value.startsWith("_");
}

export function getNavLinksFromPlaygroundPages(pages: PlaygroundPage[]): NavBarLink[] {
  return pages
    .filter((page) => page.includeInNav !== false)
    .map((page) => ({
      id: page.isHome ? "nav-home" : createNavBarLinkId(),
      label: page.name,
      href: getPlaygroundPageHref(page),
    }));
}

export function clonePlaygroundPageSectionsFromHome(
  homeSections: PlaygroundSectionConfig[],
): PlaygroundSectionConfig[] {
  const template = homeSections.length > 0 ? homeSections : defaultPlaygroundSections;

  return template.map((section) => ({
    group: section.group,
    defaultVariant: section.defaultVariant,
    variant: section.variant,
    /** Each page opts into preview independently — do not inherit home checkboxes. */
    preview: false,
    hidden: false,
    id: createPlaygroundSectionId(section.group),
  }));
}

/** @deprecated Use clonePlaygroundPageSectionsFromHome */
export function createDefaultPlaygroundPageSections(
  homeSections: PlaygroundSectionConfig[] = defaultPlaygroundSections,
): PlaygroundSectionConfig[] {
  return clonePlaygroundPageSectionsFromHome(homeSections);
}

export function createHomePlaygroundPage(): PlaygroundPage {
  return {
    id: homePlaygroundPageId,
    name: "Home",
    slug: "",
    isHome: true,
  };
}

function uniquePageSlug(name: string, pages: PlaygroundPage[], excludePageId?: string): string {
  let base = normalizePlaygroundPageSlug(name) || "page";
  if (isReservedPageSlug(base)) {
    base = `${base}-page`;
  }

  let slug = base;
  let suffix = 2;

  while (
    isReservedPageSlug(slug) ||
    pages.some(
      (page) => !page.isHome && page.id !== excludePageId && page.slug === slug,
    )
  ) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export function createPlaygroundPage(name: string, pages: PlaygroundPage[]): PlaygroundPage {
  const trimmed = name.trim();
  const label = trimmed || "New Page";

  return {
    id: createPageId(),
    name: label,
    slug: uniquePageSlug(label, pages),
  };
}

function isPlaygroundPage(value: unknown): value is PlaygroundPage {
  if (!value || typeof value !== "object") return false;

  const page = value as Partial<PlaygroundPage>;
  return (
    typeof page.id === "string" &&
    typeof page.name === "string" &&
    typeof page.slug === "string"
  );
}

function isPlaygroundSectionArray(value: unknown): value is PlaygroundSectionConfig[] {
  return Array.isArray(value);
}

export function normalizePlaygroundPagesState(value: unknown): PlaygroundPagesState {
  if (!value || typeof value !== "object") {
    return createDefaultPlaygroundPagesState();
  }

  const record = value as Partial<PlaygroundPagesState>;
  const pages = Array.isArray(record.pages)
    ? record.pages.filter(isPlaygroundPage)
    : [createHomePlaygroundPage()];

  const normalizedPages = pages.length > 0 ? pages : [createHomePlaygroundPage()];
  const hasHome = normalizedPages.some((page) => page.isHome);

  if (!hasHome) {
    normalizedPages.unshift(createHomePlaygroundPage());
  }

  const hasServiceAreasIndex = normalizedPages.some(
    (page) => !page.isHome && page.slug === "service-areas",
  );
  for (let index = 0; index < normalizedPages.length; index += 1) {
    const page = normalizedPages[index];
    if (page.isHome) continue;
    const slug = normalizePlaygroundPageSlug(page.slug);
    const nested =
      hasServiceAreasIndex && slug && !slug.includes("/") && /^.+-wa$/.test(slug)
        ? `service-areas/${slug}`
        : slug;
    if (nested && nested !== page.slug) {
      normalizedPages[index] = { ...page, slug: nested };
    }
  }

  const sectionsByPageId: Record<string, PlaygroundSectionConfig[]> = {};
  const rawSections = record.sectionsByPageId;

  const homePage = normalizedPages.find((page) => page.id === homePlaygroundPageId);
  if (homePage) {
    const homeStored =
      rawSections && typeof rawSections === "object" ? rawSections[homePage.id] : undefined;

    if (isPlaygroundSectionArray(homeStored)) {
      const parsed = parsePlaygroundSectionOrder(homeStored, { mergeMissingDefaults: true });
      sectionsByPageId[homePage.id] = parsed.length > 0 ? parsed : defaultPlaygroundSections;
    } else {
      sectionsByPageId[homePage.id] = defaultPlaygroundSections;
    }
  }

  const homeTemplate = sectionsByPageId[homePlaygroundPageId] ?? defaultPlaygroundSections;

  for (const page of normalizedPages) {
    if (page.id === homePlaygroundPageId) continue;

    const stored = rawSections && typeof rawSections === "object" ? rawSections[page.id] : undefined;

    if (isPlaygroundSectionArray(stored)) {
      const parsed = parsePlaygroundSectionOrder(stored, { mergeMissingDefaults: false });
      sectionsByPageId[page.id] =
        parsed.length > 0 ? parsed : clonePlaygroundPageSectionsFromHome(homeTemplate);
    } else {
      sectionsByPageId[page.id] = clonePlaygroundPageSectionsFromHome(homeTemplate);
    }
  }

  const activePageId =
    typeof record.activePageId === "string" &&
    normalizedPages.some((page) => page.id === record.activePageId)
      ? record.activePageId
      : normalizedPages[0].id;

  return {
    pages: sortPlaygroundPages(normalizedPages),
    activePageId,
    sectionsByPageId,
  };
}

export function sortPlaygroundPages(pages: PlaygroundPage[]): PlaygroundPage[] {
  const homePages = pages.filter((page) => page.isHome);
  const otherPages = pages.filter((page) => !page.isHome);

  otherPages.sort((a, b) => {
    if (a.slug === SERVICE_AREAS_PAGE_SLUG) return -1;
    if (b.slug === SERVICE_AREAS_PAGE_SLUG) return 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });

  return [...homePages, ...otherPages];
}

export function createDefaultPlaygroundPagesState(): PlaygroundPagesState {
  const home = createHomePlaygroundPage();

  return {
    pages: [home],
    activePageId: home.id,
    sectionsByPageId: {
      [home.id]: defaultPlaygroundSections,
    },
  };
}

export function migrateLegacyPlaygroundSectionsState(): PlaygroundPagesState {
  if (typeof window === "undefined") {
    return createDefaultPlaygroundPagesState();
  }

  try {
    const stored = orgStorageGet(playgroundSectionOrderKey);
    if (!stored) return createDefaultPlaygroundPagesState();

    const home = createHomePlaygroundPage();
    return {
      pages: [home],
      activePageId: home.id,
      sectionsByPageId: {
        [home.id]: mergePlaygroundSectionOrder(JSON.parse(stored)),
      },
    };
  } catch {
    return createDefaultPlaygroundPagesState();
  }
}

export function loadPlaygroundPagesState(): PlaygroundPagesState {
  if (typeof window === "undefined") {
    return createDefaultPlaygroundPagesState();
  }

  try {
    const stored = orgStorageGet(playgroundPagesStorageKey);
    if (!stored) {
      return migrateLegacyPlaygroundSectionsState();
    }

    return normalizePlaygroundPagesState(JSON.parse(stored));
  } catch {
    return migrateLegacyPlaygroundSectionsState();
  }
}

export function savePlaygroundPagesState(state: PlaygroundPagesState): void {
  if (typeof window === "undefined") return;
  orgStorageSet(playgroundPagesStorageKey, JSON.stringify(state));
}

export function getActivePlaygroundPage(state: PlaygroundPagesState): PlaygroundPage {
  return (
    state.pages.find((page) => page.id === state.activePageId) ??
    state.pages[0] ??
    createHomePlaygroundPage()
  );
}

export function getPlaygroundPageSections(
  state: PlaygroundPagesState,
  pageId: string = state.activePageId,
): PlaygroundSectionConfig[] {
  const sections = state.sectionsByPageId[pageId];
  if (sections) return sections;

  const homeSections = state.sectionsByPageId[homePlaygroundPageId] ?? defaultPlaygroundSections;
  return clonePlaygroundPageSectionsFromHome(homeSections);
}

export function updatePlaygroundPageSections(
  state: PlaygroundPagesState,
  pageId: string,
  sections: PlaygroundSectionConfig[],
): PlaygroundPagesState {
  return {
    ...state,
    sectionsByPageId: {
      ...state.sectionsByPageId,
      [pageId]: sections,
    },
  };
}

export function deletePlaygroundPage(
  state: PlaygroundPagesState,
  pageId: string,
): PlaygroundPagesState | null {
  const page = state.pages.find((entry) => entry.id === pageId);
  if (!page || page.isHome) return null;

  const pages = state.pages.filter((entry) => entry.id !== pageId);
  const sectionsByPageId = { ...state.sectionsByPageId };
  delete sectionsByPageId[pageId];

  const activePageId =
    state.activePageId === pageId
      ? (pages.find((entry) => entry.isHome)?.id ?? pages[0]?.id ?? homePlaygroundPageId)
      : state.activePageId;

  return { pages, activePageId, sectionsByPageId };
}

export function renamePlaygroundPage(
  state: PlaygroundPagesState,
  pageId: string,
  name: string,
): PlaygroundPagesState | null {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const page = state.pages.find((entry) => entry.id === pageId);
  if (!page) return null;

  const pages = state.pages.map((entry) => {
    if (entry.id !== pageId) return entry;

    return {
      ...entry,
      name: trimmed,
    };
  });

  return { ...state, pages };
}

export function setPlaygroundPageRoute(
  state: PlaygroundPagesState,
  pageId: string,
  route: string,
): { ok: true; state: PlaygroundPagesState } | { ok: false; error: string } {
  const page = state.pages.find((entry) => entry.id === pageId);
  if (!page) return { ok: false, error: "Page not found." };
  if (page.isHome) return { ok: false, error: "Home stays / and cannot change." };

  const slug = normalizePlaygroundPageSlug(route);
  if (!slug) return { ok: false, error: "Enter a route like /service-areas/camas-wa." };
  if (isReservedPageSlug(slug)) {
    return { ok: false, error: `/${slug.split("/")[0]} is reserved.` };
  }

  const collision = state.pages.some(
    (entry) => entry.id !== pageId && !entry.isHome && entry.slug === slug,
  );
  if (collision) return { ok: false, error: `/${slug} is already used.` };

  return {
    ok: true,
    state: {
      ...state,
      pages: state.pages.map((entry) => (entry.id === pageId ? { ...entry, slug } : entry)),
    },
  };
}

export function setPlaygroundPageIncludeInNav(
  state: PlaygroundPagesState,
  pageId: string,
  includeInNav: boolean,
): PlaygroundPagesState | null {
  const page = state.pages.find((entry) => entry.id === pageId);
  if (!page || page.isHome) return null;

  return {
    ...state,
    pages: state.pages.map((entry) =>
      entry.id === pageId ? { ...entry, includeInNav } : entry,
    ),
  };
}

export function reorderPlaygroundPages(
  state: PlaygroundPagesState,
  fromIndex: number,
  toIndex: number,
): PlaygroundPagesState {
  if (fromIndex === toIndex) return state;
  if (fromIndex < 0 || toIndex < 0) return state;
  if (fromIndex >= state.pages.length || toIndex >= state.pages.length) return state;

  const pages = [...state.pages];
  const [moved] = pages.splice(fromIndex, 1);
  pages.splice(toIndex, 0, moved);

  return { ...state, pages };
}

function uniqueSlug(baseSlug: string, pages: PlaygroundPage[]): string {
  return uniquePageSlug(baseSlug, pages);
}

/**
 * Official LSD extra town pages: unique Clark County template + unique hero, not the hub.
 * Always restore those stacks from org JSON so Forge page switches match live.
 */
export function upsertPlaygroundLocationPagesFromConfig(
  state: PlaygroundPagesState,
  config: HomepageConfig,
): PlaygroundPagesState {
  let next: PlaygroundPagesState = {
    ...state,
    pages: [...state.pages],
    sectionsByPageId: { ...state.sectionsByPageId },
  };
  let changed = false;

  for (const pageSnapshot of config.pages ?? []) {
    const location = getServiceAreaLocationDefinition(pageSnapshot.slug);
    if (!location) continue;

    let playgroundPage = next.pages.find(
      (page) =>
        !page.isHome &&
        (page.slug === pageSnapshot.slug ||
          getServiceAreaLocationDefinition(page.slug)?.slug === location.slug),
    );

    if (!playgroundPage) {
      const created = createPlaygroundPage(pageSnapshot.name, next.pages);
      playgroundPage = {
        ...created,
        name: pageSnapshot.name,
        slug: pageSnapshot.slug,
        includeInNav: pageSnapshot.includeInNav,
      };
      next.pages.push(playgroundPage);
      changed = true;
    } else if (
      playgroundPage.slug !== pageSnapshot.slug ||
      playgroundPage.name !== pageSnapshot.name
    ) {
      next.pages = next.pages.map((page) =>
        page.id === playgroundPage?.id
          ? { ...page, slug: pageSnapshot.slug, name: pageSnapshot.name }
          : page,
      );
      playgroundPage = next.pages.find((page) => page.id === playgroundPage?.id);
      changed = true;
    }

    if (!playgroundPage) continue;

    const nextSections = buildPlaygroundSectionsFromSnapshot(pageSnapshot.sections);
    const previous = next.sectionsByPageId[playgroundPage.id];
    if (JSON.stringify(previous) !== JSON.stringify(nextSections)) {
      next = updatePlaygroundPageSections(next, playgroundPage.id, nextSections);
      changed = true;
    }
  }

  const sorted = sortPlaygroundPages(next.pages);
  if (sorted.some((page, index) => page.id !== next.pages[index]?.id)) {
    next = { ...next, pages: sorted };
    changed = true;
  }

  return changed ? next : state;
}

function buildPlaygroundSectionsFromSnapshot(
  sections: HomepageSectionEntry[],
): PlaygroundSectionConfig[] {
  const snapshotSections = sections.map((section) => ({
    id: section.id ?? createPlaygroundSectionId(section.group),
    group: section.group,
    variant: section.variant,
    preview: true,
    hidden: false,
  }));

  const merged = parsePlaygroundSectionOrder(snapshotSections, {
    mergeMissingDefaults: true,
  });

  const snapshotIds = new Set(snapshotSections.map((section) => section.id));
  return merged.map((section) =>
    snapshotIds.has(section.id)
      ? { ...section, preview: true, hidden: false }
      : { ...section, preview: false, hidden: true },
  );
}

/**
 * Rebuild the playground page list from org JSON.
 * Creates pages that exist in the snapshot even if they are missing from the browser.
 */
export function buildPlaygroundPagesStateFromHomepageConfig(
  config: HomepageConfig,
): PlaygroundPagesState {
  const home = createHomePlaygroundPage();
  const pages: PlaygroundPage[] = [home];
  const sectionsByPageId: Record<string, PlaygroundSectionConfig[]> = {
    [home.id]: buildPlaygroundSectionsFromSnapshot(config.sections),
  };

  for (const pageSnapshot of config.pages ?? []) {
    const page: PlaygroundPage = {
      id: createPageId(),
      name: pageSnapshot.name,
      slug: uniqueSlug(pageSnapshot.slug || pageSnapshot.name, pages),
      includeInNav: pageSnapshot.includeInNav,
    };
    pages.push(page);
    sectionsByPageId[page.id] = buildPlaygroundSectionsFromSnapshot(pageSnapshot.sections);
  }

  return {
    pages: sortPlaygroundPages(pages),
    activePageId: home.id,
    sectionsByPageId,
  };
}
