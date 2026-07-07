import { statSync } from "fs";
import path from "path";

function getPublicFilePath(assetPath: string): string {
  return path.join(process.cwd(), "public", assetPath.replace(/^\//, ""));
}

/**
 * Returns a cache-busted URL for public assets.
 * Uses the file's mtime so asset swaps show up after deploy without clearing cache.
 */
export function getAssetUrl(assetPath: string): string {
  try {
    const { mtimeMs } = statSync(getPublicFilePath(assetPath));
    return `${assetPath}?v=${Math.floor(mtimeMs)}`;
  } catch {
    return assetPath;
  }
}

/** True when the asset file exists under public/. */
export function assetExists(assetPath: string): boolean {
  try {
    statSync(getPublicFilePath(assetPath));
    return true;
  } catch {
    return false;
  }
}
