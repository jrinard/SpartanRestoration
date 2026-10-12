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
import { getClientOrgId, orgOpenedEvent } from "@/lib/org/browser-storage";

function resolveOrgAssetFolder(): string | null {
  return normalizeImageLibraryFolder(getClientOrgId());
}

export function usePlaygroundImageLibraryFolder() {
  const pathname = usePathname();
  const isPlayground = isForgePathname(pathname);
  const [orgFolder, setOrgFolder] = useState<string | null>(() => resolveOrgAssetFolder());
  const themeFolder =
    normalizeImageLibraryFolder(siteConfig.assets.themeFolder) ??
    orgFolder ??
    defaultColorThemeId;
  const [override, setOverrideState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isPlayground) {
      setOverrideState(null);
      setOrgFolder(resolveOrgAssetFolder());
      setReady(true);
      return;
    }

    setOverrideState(loadPlaygroundImageLibraryFolderOverride());
    setOrgFolder(resolveOrgAssetFolder());
    setReady(true);
  }, [isPlayground]);

  useEffect(() => {
    if (!ready || !isPlayground) return;

    const syncOverride = () => {
      setOverrideState(loadPlaygroundImageLibraryFolderOverride());
    };
    const syncOrgFolder = () => {
      setOrgFolder(resolveOrgAssetFolder());
    };

    window.addEventListener(imageLibraryFolderUpdatedEvent, syncOverride);
    window.addEventListener(orgOpenedEvent, syncOrgFolder);
    return () => {
      window.removeEventListener(imageLibraryFolderUpdatedEvent, syncOverride);
      window.removeEventListener(orgOpenedEvent, syncOrgFolder);
    };
  }, [ready, isPlayground]);

  const folder = (isPlayground ? override : null) ?? orgFolder ?? themeFolder;
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
