"use client";

import { useCallback, useEffect, useState } from "react";
import { creativeStorageKeys } from "@/lib/creative-themes";
import { getColorTheme } from "@/lib/color-themes";
import { copySpacerInstanceSettings } from "@/lib/spacer-instance-storage";
import {
  defaultPlaygroundSections,
  duplicateSpacerSection,
  getPreviewSections,
  mergePlaygroundSectionOrder,
  playgroundSectionOrderKey,
  type PlaygroundSectionConfig,
} from "@/lib/playground-sections";
import { orgStorageGet, orgStorageSet } from "@/lib/org/browser-storage";

export function usePlaygroundSections() {
  const [sections, setSectionsState] = useState(defaultPlaygroundSections);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = orgStorageGet(playgroundSectionOrderKey);
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
    orgStorageSet(playgroundSectionOrderKey, JSON.stringify(next));
  }, []);

  const updateSection = useCallback(
    (id: string, patch: Partial<PlaygroundSectionConfig>) => {
      setSectionsState((current) => {
        const next = current.map((section) =>
          section.id === id ? { ...section, ...patch } : section,
        );
        orgStorageSet(playgroundSectionOrderKey, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const duplicateSpacer = useCallback((sourceId: string) => {
    setSectionsState((current) => {
      const result = duplicateSpacerSection(current, sourceId);
      if (!result) return current;

      const storedColor = orgStorageGet(creativeStorageKeys.colorTheme);
      const colorThemeId = storedColor ? getColorTheme(storedColor).id : getColorTheme("lifespring").id;
      copySpacerInstanceSettings(sourceId, result.newId, colorThemeId);

      orgStorageSet(playgroundSectionOrderKey, JSON.stringify(result.sections));
      return result.sections;
    });
  }, []);

  return {
    sections,
    setSections,
    updateSection,
    duplicateSpacer,
    previewSections: getPreviewSections(sections),
    ready,
  };
}
