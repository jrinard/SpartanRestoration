import path from "node:path";
import { isVisionRuntime } from "@/lib/org/vision-runtime";

export {
  isReservedOrgId,
  isSafeOrgId,
  reservedOrgIds,
  slugifyOrgFolder,
} from "@/lib/org/org-id";

export const orgsRootDir = () => path.join(process.cwd(), "orgs");
export const currentOrgFile = () => path.join(orgsRootDir(), "current.json");
export const orgSequenceFile = () => path.join(orgsRootDir(), "sequence.json");
export const visionSiteDir = () => path.join(process.cwd(), "site");

export function orgDir(orgId: string): string {
  if (isVisionRuntime()) {
    return visionSiteDir();
  }
  return path.join(orgsRootDir(), orgId);
}

export function orgFile(orgId: string, name: string): string {
  return path.join(orgDir(orgId), name);
}

export function orgHistoryDir(orgId: string): string {
  return path.join(orgDir(orgId), "history");
}

export function orgAssetsDir(orgId: string): string {
  return path.join(orgDir(orgId), "assets");
}

/** URL prefix for this org’s pillar files. */
export function orgAssetsUrlPrefix(orgId: string): string {
  return `/org-assets/${orgId}`;
}
