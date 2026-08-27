import { statSync } from "fs";
import path from "path";
import { parseOrgAssetUrl } from "@/lib/org/asset-url";
import { isSafeOrgId, orgAssetsDir } from "@/lib/org/paths";

function getAssetFilePath(assetPath: string): string {
  const trimmed = assetPath.trim().split("?")[0];
  const orgAsset = parseOrgAssetUrl(trimmed);
  if (orgAsset) {
    return path.join(orgAssetsDir(orgAsset.orgId), orgAsset.relative);
  }

  const legacy = /^\/([a-z0-9][a-z0-9-]{0,62})\/(.+)$/i.exec(trimmed);
  if (legacy && isSafeOrgId(legacy[1].toLowerCase())) {
    return path.join(orgAssetsDir(legacy[1].toLowerCase()), legacy[2]);
  }

  return path.join(process.cwd(), "public", trimmed.replace(/^\//, ""));
}

/**
 * Returns a cache-busted URL for org or public assets (server only).
 * Uses the file's mtime so asset swaps show up after deploy without clearing cache.
 */
export function getAssetUrl(assetPath: string): string {
  const base = assetPath.trim().split("?")[0];
  if (!base) return assetPath.trim();

  try {
    const { mtimeMs } = statSync(getAssetFilePath(base));
    return `${base}?v=${Math.floor(mtimeMs)}`;
  } catch {
    return base;
  }
}

/** True when the asset file exists on disk (org pillar or public/). Server only. */
export function assetExists(assetPath: string): boolean {
  try {
    statSync(getAssetFilePath(assetPath));
    return true;
  } catch {
    return false;
  }
}
