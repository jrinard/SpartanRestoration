import { siteConfig } from "@/config/site";
import {
  getImageLibraryFolderForColorTheme,
  type ColorThemeId,
} from "@/lib/color-themes";
import { orgStorageGet, orgStorageSet, orgStorageRemove } from "@/lib/org/browser-storage";
import { orgAssetUrl, orgLibraryUrl } from "@/lib/org/asset-url";

/** @deprecated Legacy key — migrated to override key on read. */
export const imageLibraryFolderStorageKey = "lifespring-playground-image-library-folder";
export const imageLibraryFolderOverrideStorageKey =
  "lifespring-playground-image-library-folder-override";
export const imageLibraryFolderUpdatedEvent = "lifespring-image-library-folder-updated";

/** Production default from site config (non-playground). */
export function getDefaultImageLibraryFolder(): string {
  return siteConfig.assets.themeFolder;
}

/** Safe org / theme-pack folder name — letters, numbers, hyphen, underscore. */
export function normalizeImageLibraryFolder(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim().toLowerCase();
  if (!trimmed || trimmed.includes("..") || trimmed.includes("/")) return null;
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(trimmed)) return null;

  return trimmed;
}

function readStoredOverride(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const override = orgStorageGet(imageLibraryFolderOverrideStorageKey);
    const normalizedOverride = normalizeImageLibraryFolder(override);
    if (normalizedOverride) return normalizedOverride;

    // One-time migration from the old always-on folder key.
    const legacy = orgStorageGet(imageLibraryFolderStorageKey);
    const normalizedLegacy = normalizeImageLibraryFolder(legacy);
    if (normalizedLegacy) {
      orgStorageSet(imageLibraryFolderOverrideStorageKey, normalizedLegacy);
      orgStorageRemove(imageLibraryFolderStorageKey);
      return normalizedLegacy;
    }
  } catch {
    return null;
  }

  return null;
}

export function loadPlaygroundImageLibraryFolderOverride(): string | null {
  return readStoredOverride();
}

export function savePlaygroundImageLibraryFolderOverride(folder: string): void {
  if (typeof window === "undefined") return;

  const normalized = normalizeImageLibraryFolder(folder);
  if (!normalized) return;

  orgStorageSet(imageLibraryFolderOverrideStorageKey, normalized);
}

export function clearPlaygroundImageLibraryFolderOverride(): void {
  if (typeof window === "undefined") return;

  orgStorageRemove(imageLibraryFolderOverrideStorageKey);
  orgStorageRemove(imageLibraryFolderStorageKey);
}

export function resolvePlaygroundImageLibraryFolder(
  colorThemeId: ColorThemeId | string,
): string {
  return (
    readStoredOverride() ??
    normalizeImageLibraryFolder(siteConfig.assets.themeFolder) ??
    getImageLibraryFolderForColorTheme(colorThemeId)
  );
}

/** @deprecated Use resolvePlaygroundImageLibraryFolder(colorThemeId). */
export function loadPlaygroundImageLibraryFolder(): string {
  return getDefaultImageLibraryFolder();
}

/** @deprecated Use savePlaygroundImageLibraryFolderOverride. */
export function savePlaygroundImageLibraryFolder(folder: string): void {
  savePlaygroundImageLibraryFolderOverride(folder);
}

export function notifyImageLibraryFolderUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(imageLibraryFolderUpdatedEvent));
}

export function getImageLibraryPathsForFolder(folder: string) {
  const themeSegment = normalizeImageLibraryFolder(folder) ?? getDefaultImageLibraryFolder();

  return {
    themeSegment,
    publicPrefix: orgAssetUrl(themeSegment),
    libraryPrefix: orgLibraryUrl(themeSegment),
  };
}

/** Primary header logo file — one per org under orgs/<id>/assets/images/. */
export const libraryLogoMainFile = "logo-main.png";

export function getLibraryLogoMainSrc(folder: string): string {
  const { libraryPrefix } = getImageLibraryPathsForFolder(folder);
  return `${libraryPrefix}/${libraryLogoMainFile}`;
}

export function getLibraryLogoMainSrcForColorTheme(colorThemeId: ColorThemeId | string): string {
  return getLibraryLogoMainSrc(getImageLibraryFolderForColorTheme(colorThemeId));
}
