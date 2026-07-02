"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { creativeStorageKeys } from "@/lib/creative-themes";
import { getColorTheme } from "@/lib/color-themes";
import { copySpacerInstanceSettings } from "@/lib/spacer-instance-storage";
import { copyContentInstanceSettings } from "@/lib/content-instance-storage";
import {
  defaultPlaygroundSections,
  duplicatePlaygroundSection,
  getPreviewSections,
  getVisiblePlaygroundSections,
  mergePlaygroundSectionOrder,
  playgroundSectionOrderKey,
  type PlaygroundSectionConfig,
} from "@/lib/playground-sections";

type PlaygroundSectionsContextValue = {
  sections: PlaygroundSectionConfig[];
  setSections: (sections: PlaygroundSectionConfig[]) => void;
  updateSection: (id: string, patch: Partial<PlaygroundSectionConfig>) => void;
  duplicateSection: (sourceId: string) => void;
  previewSections: PlaygroundSectionConfig[];
  visibleSections: PlaygroundSectionConfig[];
  ready: boolean;
};

const PlaygroundSectionsContext = createContext<PlaygroundSectionsContextValue | null>(null);

export function PlaygroundSectionsProvider({ children }: { children: ReactNode }) {
  const [sections, setSectionsState] = useState(defaultPlaygroundSections);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(playgroundSectionOrderKey);
    if (stored) {
      try {
        setSectionsState(mergePlaygroundSectionOrder(JSON.parse(stored)));
      } catch {
        setSectionsState(defaultPlaygroundSections);
      }
    }
    setReady(true);
  }, []);

  const setSections = useCallback((next: PlaygroundSectionConfig[]) => {
    setSectionsState(next);
    localStorage.setItem(playgroundSectionOrderKey, JSON.stringify(next));
  }, []);

  const updateSection = useCallback(
    (id: string, patch: Partial<PlaygroundSectionConfig>) => {
      setSectionsState((current) => {
        const next = current.map((section) =>
          section.id === id ? { ...section, ...patch } : section,
        );
        localStorage.setItem(playgroundSectionOrderKey, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const duplicateSection = useCallback((sourceId: string) => {
    setSectionsState((current) => {
      const result = duplicatePlaygroundSection(current, sourceId);
      if (!result) return current;

      const source = current.find((section) => section.id === sourceId);
      if (source?.group === "spacer") {
        const storedColor = localStorage.getItem(creativeStorageKeys.colorTheme);
        const colorThemeId = storedColor
          ? getColorTheme(storedColor).id
          : getColorTheme("lifespring").id;
        copySpacerInstanceSettings(sourceId, result.newId, colorThemeId);
      } else if (source?.group === "content") {
        copyContentInstanceSettings(sourceId, result.newId);
      }

      localStorage.setItem(playgroundSectionOrderKey, JSON.stringify(result.sections));
      return result.sections;
    });
  }, []);

  const value: PlaygroundSectionsContextValue = {
    sections,
    setSections,
    updateSection,
    duplicateSection,
    previewSections: getPreviewSections(sections),
    visibleSections: getVisiblePlaygroundSections(sections),
    ready,
  };

  return (
    <PlaygroundSectionsContext.Provider value={value}>{children}</PlaygroundSectionsContext.Provider>
  );
}

export function usePlaygroundSections() {
  const context = useContext(PlaygroundSectionsContext);
  if (context) return context;

  throw new Error("usePlaygroundSections must be used within PlaygroundSectionsProvider");
}

/** Standalone hook for /preview — reads the same localStorage without playground-only context. */
export function usePlaygroundSectionsStorage() {
  const [sections, setSectionsState] = useState(defaultPlaygroundSections);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(playgroundSectionOrderKey);
    if (stored) {
      try {
        setSectionsState(mergePlaygroundSectionOrder(JSON.parse(stored)));
      } catch {
        setSectionsState(defaultPlaygroundSections);
      }
    }
    setReady(true);
  }, []);

  return {
    sections,
    previewSections: getPreviewSections(sections),
    ready,
  };
}
