"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { creativeStorageKeys } from "@/lib/creative-themes";
import { getColorTheme } from "@/lib/color-themes";
import {
  copyPlaygroundSectionInstanceSettings,
  copyPlaygroundSectionInstanceSettingsByConfig,
  runPlaygroundPageInstanceRepairIfNeeded,
} from "@/lib/playground-page-instance-clone";
import { playgroundNavSyncEvent } from "@/lib/playground-nav-sync";
import {
  clonePlaygroundPageSectionsFromHome,
  createDefaultPlaygroundPagesState,
  createPlaygroundPage,
  deletePlaygroundPage,
  findPlaygroundPageBySlug,
  getActivePlaygroundPage,
  getNavLinksFromPlaygroundPages,
  getPlaygroundPageSections,
  homePlaygroundPageId,
  loadPlaygroundPagesState,
  renamePlaygroundPage,
  reorderPlaygroundPages,
  savePlaygroundPagesState,
  setActivePlaygroundPageInStorage,
  updatePlaygroundPageSections,
  type PlaygroundPage,
  type PlaygroundPagesState,
} from "@/lib/playground-pages";
import {
  applyPlaygroundSectionPatch,
  duplicatePlaygroundSection,
  getPlaygroundSectionVariant,
  getPreviewSections,
  getVisiblePlaygroundSections,
  type PlaygroundSectionConfig,
} from "@/lib/playground-sections";
import { getPlaygroundModalOnlySections } from "@/lib/playground-modal-sections";
import { HashScrollOnNavigate } from "@/components/dev/HashScrollOnNavigate";

type PlaygroundSectionsContextValue = {
  pages: PlaygroundPage[];
  activePage: PlaygroundPage;
  activePageId: string;
  setActivePageId: (pageId: string) => void;
  createPage: (name: string) => void;
  deletePage: (pageId: string) => void;
  renamePage: (pageId: string, name: string) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  navLinks: ReturnType<typeof getNavLinksFromPlaygroundPages>;
  sections: PlaygroundSectionConfig[];
  setSections: (sections: PlaygroundSectionConfig[]) => void;
  updateSection: (id: string, patch: Partial<PlaygroundSectionConfig>) => void;
  duplicateSection: (sourceId: string) => void;
  previewSections: PlaygroundSectionConfig[];
  visibleSections: PlaygroundSectionConfig[];
  contactFormEditorOpen: boolean;
  setContactFormEditorOpen: (open: boolean) => void;
  ready: boolean;
};

const PlaygroundSectionsContext = createContext<PlaygroundSectionsContextValue | null>(null);

export function PlaygroundSectionsProvider({ children }: { children: ReactNode }) {
  const [pagesState, setPagesState] = useState<PlaygroundPagesState>(
    createDefaultPlaygroundPagesState,
  );
  const [ready, setReady] = useState(false);
  const [contactFormEditorOpen, setContactFormEditorOpen] = useState(false);

  useEffect(() => {
    const storedColor = localStorage.getItem(creativeStorageKeys.colorTheme);
    const colorThemeId = storedColor
      ? getColorTheme(storedColor).id
      : getColorTheme("lifespring").id;

    runPlaygroundPageInstanceRepairIfNeeded(colorThemeId);
    setPagesState(loadPlaygroundPagesState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    savePlaygroundPagesState(pagesState);
    window.dispatchEvent(new CustomEvent(playgroundNavSyncEvent));
  }, [pagesState, ready]);

  const activePage = getActivePlaygroundPage(pagesState);
  const sections = getPlaygroundPageSections(pagesState, pagesState.activePageId);

  const setActivePageId = useCallback((pageId: string) => {
    setPagesState((current) => {
      if (!current.pages.some((page) => page.id === pageId)) return current;
      return { ...current, activePageId: pageId };
    });
  }, []);

  const createPage = useCallback((name: string) => {
    setPagesState((current) => {
      const page = createPlaygroundPage(name, current.pages);
      const homeSections = getPlaygroundPageSections(current, homePlaygroundPageId);
      const clonedSections = clonePlaygroundPageSectionsFromHome(homeSections);

      const storedColor = localStorage.getItem(creativeStorageKeys.colorTheme);
      const colorThemeId = storedColor
        ? getColorTheme(storedColor).id
        : getColorTheme("lifespring").id;
      copyPlaygroundSectionInstanceSettings(homeSections, clonedSections, colorThemeId);

      return {
        pages: [...current.pages, page],
        activePageId: page.id,
        sectionsByPageId: {
          ...current.sectionsByPageId,
          [page.id]: clonedSections,
        },
      };
    });
  }, []);

  const deletePage = useCallback((pageId: string) => {
    setPagesState((current) => deletePlaygroundPage(current, pageId) ?? current);
  }, []);

  const renamePage = useCallback((pageId: string, name: string) => {
    setPagesState((current) => renamePlaygroundPage(current, pageId, name) ?? current);
  }, []);

  const reorderPages = useCallback((fromIndex: number, toIndex: number) => {
    setPagesState((current) => reorderPlaygroundPages(current, fromIndex, toIndex));
  }, []);

  const setSections = useCallback((next: PlaygroundSectionConfig[]) => {
    setPagesState((current) =>
      updatePlaygroundPageSections(current, current.activePageId, next),
    );
  }, []);

  const updateSection = useCallback((id: string, patch: Partial<PlaygroundSectionConfig>) => {
    setPagesState((current) => {
      const pageSections = getPlaygroundPageSections(current, current.activePageId);
      const nextSections = pageSections.map((section) =>
        section.id === id ? applyPlaygroundSectionPatch(section, patch) : section,
      );

      return updatePlaygroundPageSections(current, current.activePageId, nextSections);
    });
  }, []);

  const duplicateSection = useCallback((sourceId: string) => {
    setPagesState((current) => {
      const pageSections = getPlaygroundPageSections(current, current.activePageId);
      const result = duplicatePlaygroundSection(pageSections, sourceId);
      if (!result) return current;

      const source = pageSections.find((section) => section.id === sourceId);
      const target = result.sections.find((section) => section.id === result.newId);
      if (source && target) {
        const storedColor = localStorage.getItem(creativeStorageKeys.colorTheme);
        const colorThemeId = storedColor
          ? getColorTheme(storedColor).id
          : getColorTheme("lifespring").id;
        copyPlaygroundSectionInstanceSettingsByConfig(source, target, colorThemeId);
      }

      return updatePlaygroundPageSections(current, current.activePageId, result.sections);
    });
  }, []);

  const navLinks = useMemo(
    () => getNavLinksFromPlaygroundPages(pagesState.pages),
    [pagesState.pages],
  );

  const value: PlaygroundSectionsContextValue = {
    pages: pagesState.pages,
    activePage,
    activePageId: pagesState.activePageId,
    setActivePageId,
    createPage,
    deletePage,
    renamePage,
    reorderPages,
    navLinks,
    sections,
    setSections,
    updateSection,
    duplicateSection,
    previewSections: getPreviewSections(sections),
    visibleSections: getVisiblePlaygroundSections(sections),
    contactFormEditorOpen,
    setContactFormEditorOpen,
    ready,
  };

  return (
    <PlaygroundSectionsContext.Provider value={value}>
      {children}
      <HashScrollOnNavigate />
    </PlaygroundSectionsContext.Provider>
  );
}

export function usePlaygroundSections() {
  const context = useContext(PlaygroundSectionsContext);
  if (context) return context;

  throw new Error("usePlaygroundSections must be used within PlaygroundSectionsProvider");
}

export function useOptionalPlaygroundSections() {
  return useContext(PlaygroundSectionsContext);
}

/** Standalone hook for /preview — reads the same localStorage without playground-only context. */
export function usePlaygroundSectionsStorage(previewSlug?: string) {
  const [pagesState, setPagesState] = useState<PlaygroundPagesState>(
    createDefaultPlaygroundPagesState,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedColor = localStorage.getItem(creativeStorageKeys.colorTheme);
    const colorThemeId = storedColor
      ? getColorTheme(storedColor).id
      : getColorTheme("lifespring").id;

    runPlaygroundPageInstanceRepairIfNeeded(colorThemeId);
    setPagesState(loadPlaygroundPagesState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    const handler = () => {
      setPagesState(loadPlaygroundPagesState());
    };

    window.addEventListener("storage", handler);
    window.addEventListener(playgroundNavSyncEvent, handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener(playgroundNavSyncEvent, handler);
    };
  }, [ready]);

  const activePage = useMemo(() => {
    if (!ready) return getActivePlaygroundPage(createDefaultPlaygroundPagesState());

    const pageFromSlug = findPlaygroundPageBySlug(pagesState.pages, previewSlug);
    if (pageFromSlug) return pageFromSlug;

    return getActivePlaygroundPage(pagesState);
  }, [pagesState, previewSlug, ready]);

  const sections = getPlaygroundPageSections(pagesState, activePage.id);

  useEffect(() => {
    if (!ready || !activePage) return;
    if (pagesState.activePageId === activePage.id) return;
    setActivePlaygroundPageInStorage(activePage.id);
  }, [activePage.id, pagesState.activePageId, ready]);

  return {
    sections,
    previewSections: getPreviewSections(sections),
    activePage,
    ready,
  };
}
