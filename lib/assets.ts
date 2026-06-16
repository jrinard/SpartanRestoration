import { statSync } from "fs";
import path from "path";

/**
 * Returns a cache-busted URL for public assets.
 * Uses the file's mtime so asset swaps show up after deploy without clearing cache.
 */
export function getAssetUrl(assetPath: string): string {
  try {
    const filePath = path.join(process.cwd(), "public", assetPath.replace(/^\//, ""));
    const { mtimeMs } = statSync(filePath);
    return `${assetPath}?v=${Math.floor(mtimeMs)}`;
  } catch {
    return assetPath;
  }
}
