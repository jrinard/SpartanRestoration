import { execFile } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { appendHomepageConfigHistoryEntry } from "@/lib/homepage-config-history.server";
import { orgDir } from "@/lib/org/paths";
import { readOrgHomepageConfig, readOrgMeta, writeOrgStagingConfig } from "@/lib/org/read-org.server";
import type { OrgMeta } from "@/lib/org/types";
import type { HomepageConfig } from "@/lib/homepage-config";

const execFileAsync = promisify(execFile);
const GIT_TIMEOUT = 120_000;
const RSYNC_TIMEOUT = 120_000;

function isInside(parent: string, child: string): boolean {
  const root = parent.endsWith(path.sep) ? parent : `${parent}${path.sep}`;
  return child === parent || child.startsWith(root);
}

function hasVisionSite(dest: string): boolean {
  return existsSync(path.join(dest, "site", "homepage-config.json"));
}

const STRAY_DIR_FILES = new Set([".DS_Store", ".env.local", "Thumbs.db"]);

function canCloneInto(dir: string): boolean {
  return readdirSync(dir).every((name) => STRAY_DIR_FILES.has(name));
}

async function git(cwd: string | null, args: string[]): Promise<void> {
  const cmd = cwd ? ["-C", cwd, ...args] : args;
  await execFileAsync("git", cmd, {
    timeout: GIT_TIMEOUT,
    maxBuffer: 2 * 1024 * 1024,
  });
}

function gitErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "stderr" in error) {
    const detail = String((error as { stderr?: unknown }).stderr ?? "").trim();
    if (detail) return detail;
  }
  return error instanceof Error ? error.message : fallback;
}

async function restoreSiteFromGit(dest: string, branch: string): Promise<void> {
  await git(dest, ["fetch", "origin", branch]);
  try {
    await git(dest, ["restore", "--source", `origin/${branch}`, "site/"]);
  } catch {
    await git(dest, ["restore", "site/"]);
  }
}

function ensureVisionEnv(dest: string): void {
  const envPath = path.join(dest, ".env.local");
  if (!existsSync(envPath)) {
    writeFileSync(envPath, "LIFESPRING_VISION=1\n");
  }
}

async function cloneVisionRepo(
  remoteUrl: string,
  dest: string,
  branch: string,
): Promise<void> {
  const parent = path.dirname(dest);
  if (!existsSync(parent)) {
    mkdirSync(parent, { recursive: true });
  }

  if (existsSync(dest) && !canCloneInto(dest)) {
    throw new Error(
      `Cannot clone into ${dest}: folder exists and is not empty. Delete it or pick a new path.`,
    );
  }

  if (existsSync(dest)) {
    try {
      await git(null, ["clone", "--branch", branch, "--single-branch", remoteUrl, dest]);
      return;
    } catch {
      // Empty dir exists — clone into a sibling temp dir, then move .git + files in.
      const temp = `${dest}-clone-${Date.now()}`;
      try {
        await git(null, ["clone", "--branch", branch, "--single-branch", remoteUrl, temp]);
      } catch {
        await git(null, ["clone", remoteUrl, temp]);
        await git(temp, ["checkout", branch]);
      }
      await execFileAsync(
        "rsync",
        ["-a", `${temp}/`, `${dest}/`],
        { timeout: RSYNC_TIMEOUT, maxBuffer: 2 * 1024 * 1024 },
      );
      await execFileAsync("rm", ["-rf", temp], { timeout: 30_000 });
      return;
    }
  }

  try {
    await git(null, ["clone", "--branch", branch, "--single-branch", remoteUrl, dest]);
  } catch {
    await git(null, ["clone", remoteUrl, dest]);
    await git(dest, ["checkout", branch]);
  }
}

async function syncVisionCheckout(org: OrgMeta, dest: string): Promise<boolean> {
  const branch = org.publish.branch.trim() || "main";
  const remoteUrl = org.publish.remoteUrl.trim();
  const hasGit = existsSync(path.join(dest, ".git"));

  if (!remoteUrl && (!existsSync(dest) || !hasGit)) {
    throw new Error(
      "Set Remote URL in org settings. Pull live clones from git when the local folder is missing or empty.",
    );
  }

  if (!existsSync(dest) || (!hasGit && canCloneInto(dest))) {
    await cloneVisionRepo(remoteUrl, dest, branch);
    ensureVisionEnv(dest);
    if (!hasVisionSite(dest)) {
      throw new Error(
        `Cloned ${dest} but site/homepage-config.json is missing on origin/${branch}. Pack and push from Forge first.`,
      );
    }
    return true;
  }

  if (!hasGit) {
    throw new Error(
      `Folder exists but is not a git repo: ${dest}. Empty it and Pull again, or point Local Folder at a new path.`,
    );
  }

  let pulled = false;
  try {
    await git(dest, ["pull", "--ff-only", "origin", branch]);
    pulled = true;
  } catch (error) {
    try {
      await git(dest, ["fetch", "origin", branch]);
      pulled = true;
    } catch (fetchError) {
      throw new Error(gitErrorMessage(fetchError, gitErrorMessage(error, `git sync failed in ${dest}`)));
    }
  }

  if (!hasVisionSite(dest)) {
    await restoreSiteFromGit(dest, branch);
  }

  if (!hasVisionSite(dest)) {
    throw new Error(
      `No site/homepage-config.json in ${dest} (including origin/${branch}). Pack and push from Forge first.`,
    );
  }

  ensureVisionEnv(dest);
  return pulled;
}

export async function pullLiveForOrg(
  orgId: string,
  localPathOverride?: string,
): Promise<{ fromDir: string; pulled: boolean; config: HomepageConfig }> {
  const org = await readOrgMeta(orgId);
  const raw = (localPathOverride ?? org.publish.localPath).trim();
  if (!raw) {
    throw new Error(
      "Set the customer folder in org settings (Vision git → Local folder), then Pull live.",
    );
  }

  const dest = path.resolve(raw);
  const builder = path.resolve(process.cwd());
  const site = path.join(dest, "site");

  if (existsSync(dest) && !statSync(dest).isDirectory()) {
    throw new Error(`Customer folder is not a directory: ${dest}`);
  }
  if (isInside(builder, dest)) {
    throw new Error("Customer folder cannot be inside this builder.");
  }
  if (isInside(dest, builder)) {
    throw new Error("Customer folder cannot be a parent of this builder.");
  }

  const pulled = await syncVisionCheckout(org, dest);

  await execFileAsync(
    "rsync",
    [
      "-a",
      "--delete",
      "--exclude=history",
      "--exclude=org.json",
      "--exclude=.DS_Store",
      `${site}/`,
      `${orgDir(orgId)}/`,
    ],
    { timeout: RSYNC_TIMEOUT, maxBuffer: 2 * 1024 * 1024 },
  );

  const live = await readOrgHomepageConfig(orgId);
  await writeOrgStagingConfig(orgId, live);
  await appendHomepageConfigHistoryEntry(orgId, live, "pulled");

  return { fromDir: dest, pulled, config: live };
}
