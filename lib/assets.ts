import { statSync } from "fs";
import path from "path";

function getPublicAssetPath(assetPath: string): string {
  return path.join(process.cwd(), "public", assetPath.replace(/^\//, ""));
}

export function assetExists(assetPath: string): boolean {
  try {
    statSync(getPublicAssetPath(assetPath));
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns a cache-busted URL for public assets.
 * Uses the file's mtime so asset swaps show up after deploy without clearing cache.
 */
export function getAssetUrl(assetPath: string): string {
  try {
    const { mtimeMs } = statSync(getPublicAssetPath(assetPath));
    return `${assetPath}?v=${Math.floor(mtimeMs)}`;
  } catch {
    return assetPath;
  }
}
