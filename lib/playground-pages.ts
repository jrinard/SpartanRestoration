import type { NavBarLink } from "@/lib/nav-bar-preview";
import { createNavBarLinkId } from "@/lib/nav-bar-preview";
import { createPlaygroundSectionId } from "@/lib/playground-section-id";
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

export function findPlaygroundPageByHref(
  pages: PlaygroundPage[],
  href: string,
): PlaygroundPage | undefined {
  const normalized = href.trim();
  if (normalized === "/" || normalized === "") {
    return pages.find((page) => page.isHome);
  }

  if (normalized.startsWith("/preview/")) {
    const slug = normalized.slice("/preview/".length).split("/")[0];
    if (!slug) return pages.find((page) => page.isHome);
    return pages.find((page) => !page.isHome && page.slug === slug);
  }

  if (normalized === "/preview") {
    return pages.find((page) => page.isHome);
  }

  if (!normalized.startsWith("/")) return undefined;

  const slug = normalized.slice(1).split("/")[0];
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

export function getNavLinksFromPlaygroundPages(pages: PlaygroundPage[]): NavBarLink[] {
  return pages.map((page) => ({
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
    preview: section.preview,
    hidden: section.hidden,
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
  const base = slugifyPlaygroundPageName(name);
  let slug = base;
  let suffix = 2;

  while (
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
    pages: normalizedPages,
    activePageId,
    sectionsByPageId,
  };
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
    const stored = localStorage.getItem(playgroundSectionOrderKey);
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
    const stored = localStorage.getItem(playgroundPagesStorageKey);
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
  localStorage.setItem(playgroundPagesStorageKey, JSON.stringify(state));
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
      slug: entry.isHome ? entry.slug : uniquePageSlug(trimmed, state.pages, pageId),
    };
  });

  return { ...state, pages };
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
