"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { defaultColorThemeId } from "@/lib/color-themes";
import {
  clearPlaygroundImageLibraryFolderOverride,
  getImageLibraryPathsForFolder,
  imageLibraryFolderUpdatedEvent,
  loadPlaygroundImageLibraryFolderOverride,
  normalizeImageLibraryFolder,
  notifyImageLibraryFolderUpdated,
  savePlaygroundImageLibraryFolderOverride,
} from "@/lib/image-library-folder";
import { isForgePathname } from "@/lib/forge";

export function usePlaygroundImageLibraryFolder() {
  const pathname = usePathname();
  const isPlayground = isForgePathname(pathname);
  const themeFolder =
    normalizeImageLibraryFolder(siteConfig.assets.themeFolder) ??
    defaultColorThemeId;
  const [override, setOverrideState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isPlayground) {
      setOverrideState(null);
      setReady(true);
      return;
    }

    setOverrideState(loadPlaygroundImageLibraryFolderOverride());
    setReady(true);
  }, [isPlayground]);

  useEffect(() => {
    if (!ready || !isPlayground) return;

    const handler = () => {
      setOverrideState(loadPlaygroundImageLibraryFolderOverride());
    };

    window.addEventListener(imageLibraryFolderUpdatedEvent, handler);
    return () => window.removeEventListener(imageLibraryFolderUpdatedEvent, handler);
  }, [ready, isPlayground]);

  const folder = (isPlayground ? override : null) ?? themeFolder;
  const isThemeDefault = !isPlayground || override === null;

  const setFolderOverride = useCallback((value: string) => {
    const normalized = normalizeImageLibraryFolder(value);
    if (!normalized) return false;

    savePlaygroundImageLibraryFolderOverride(normalized);
    setOverrideState(normalized);
    notifyImageLibraryFolderUpdated();
    return true;
  }, []);

  const matchThemeFolder = useCallback(() => {
    clearPlaygroundImageLibraryFolderOverride();
    setOverrideState(null);
    notifyImageLibraryFolderUpdated();
    return themeFolder;
  }, [themeFolder]);

  const paths = getImageLibraryPathsForFolder(folder);

  return {
    folder,
    themeFolder,
    override,
    isThemeDefault,
    setFolder: setFolderOverride,
    matchThemeFolder,
    ready,
    paths,
    libraryRelativePath: `/org-assets/${folder}/images/`,
    /** @deprecated Use matchThemeFolder */
    resetToSiteDefault: matchThemeFolder,
  };
}
