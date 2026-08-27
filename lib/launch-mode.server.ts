import { readCurrentOrgId, readOrgSite, writeOrgLaunchMode } from "@/lib/org/read-org.server";

export type LaunchMode = "live" | "under-construction";

export async function readLaunchMode(): Promise<LaunchMode> {
  const orgId = await readCurrentOrgId();
  const site = await readOrgSite(orgId);
  return site.launch.mode;
}

export async function writeLaunchMode(mode: LaunchMode): Promise<void> {
  const orgId = await readCurrentOrgId();
  await writeOrgLaunchMode(orgId, mode);
}

export function isUnderConstruction(mode: LaunchMode): boolean {
  return mode === "under-construction";
}
