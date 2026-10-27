import path from "path";
import { siteConfig } from "@/config/site";
import {
  getDefaultImageLibraryFolder,
  getImageLibraryPathsForFolder,
} from "@/lib/image-library-folder";

/** Site-config asset folder — production default; playground can override in localStorage. */
export const imageLibraryThemeSegment = siteConfig.assets.themeFolder;

const siteLibraryPaths = getImageLibraryPathsForFolder(imageLibraryThemeSegment);

/** @deprecated Prefer getImageLibraryPathsForFolder(folder) in playground code. */
export const imageLibraryPublicPrefix = siteLibraryPaths.publicPrefix;
/** @deprecated Prefer getImageLibraryPathsForFolder(folder) in playground code. */
export const imageLibraryFolderPublicPrefix = siteLibraryPaths.libraryPrefix;

export type ImageLibraryScope = "library" | "theme";

export type ImageLibraryEntry = {
  src: string;
  label: string;
  alt: string;
};

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif)$/i;

/** Human-readable label from a public URL path. */
export function imageLabelFromSrc(src: string): string {
  const filename = path.basename(src, path.extname(src));
  return filename.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

/** Default alt text from a public URL path. */
export function imageAltFromSrc(src: string): string {
  const label = imageLabelFromSrc(src);
  if (!label) return "Image";
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function isImageLibraryPath(value: string): boolean {
  return /^\/[a-z0-9][a-z0-9_-]*(\/.*)?$/i.test(value) && !value.includes("..");
}

export function normalizePublicImageSrc(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.includes("..")) return undefined;
  return trimmed;
}

/** @deprecated Use normalizePublicImageSrc */
export const normalizeImageLibrarySrc = normalizePublicImageSrc;

export function isImageFileName(name: string): boolean {
  return IMAGE_EXT.test(name);
}

/** Relative path under org assets/library (e.g. Commercial-ti). */
export function normalizeImageLibrarySubpath(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim().replace(/^\/+|\/+$/g, "");
  if (!trimmed || trimmed.includes("..")) return null;

  for (const segment of trimmed.split("/")) {
    if (!segment || segment === "." || segment === "..") return null;
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(segment)) return null;
  }

  return trimmed;
}

export function toImageLibraryEntry(src: string): ImageLibraryEntry {
  const label = imageLabelFromSrc(src);
  return {
    src,
    label,
    alt: imageAltFromSrc(src),
  };
}

export function getDefaultImageLibraryEntries(folder?: string): ImageLibraryEntry[] {
  const { publicPrefix, libraryPrefix } = getImageLibraryPathsForFolder(
    folder ?? getDefaultImageLibraryFolder(),
  );

  return [
    toImageLibraryEntry(`${publicPrefix}/favicon-32.png`),
    toImageLibraryEntry(`${publicPrefix}/logo.png`),
    toImageLibraryEntry(`${libraryPrefix}/sample-content-image.png`),
  ];
}

/** Fallback when the library API is unavailable. */
export const defaultImageLibraryEntries: ImageLibraryEntry[] =
  getDefaultImageLibraryEntries();
