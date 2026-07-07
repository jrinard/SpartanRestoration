import path from "path";

/** Theme-scoped folder under public/ — e.g. public/spartan/library */
export const imageLibraryThemeSegment = "spartan";
export const imageLibraryPublicPrefix = `/${imageLibraryThemeSegment}/library`;

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
  return value.startsWith(`${imageLibraryPublicPrefix}/`) && !value.includes("..");
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

export function toImageLibraryEntry(src: string): ImageLibraryEntry {
  const label = imageLabelFromSrc(src);
  return {
    src,
    label,
    alt: imageAltFromSrc(src),
  };
}

/** Fallback when the library API is unavailable. */
export const defaultImageLibraryEntries: ImageLibraryEntry[] = [
  toImageLibraryEntry(`${imageLibraryPublicPrefix}/sample-content-image.png`),
  toImageLibraryEntry("/spartan/Sample-Content-Image.png"),
];
