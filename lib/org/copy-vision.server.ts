import { execFile } from "node:child_process";
import { existsSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { readOrgMeta } from "@/lib/org/read-org.server";

const execFileAsync = promisify(execFile);

function isInside(parent: string, child: string): boolean {
  const root = parent.endsWith(path.sep) ? parent : `${parent}${path.sep}`;
  return child === parent || child.startsWith(root);
}

export async function copyVisionForOrg(orgId: string): Promise<{
  fromDir: string;
  toDir: string;
}> {
  const from = path.join(process.cwd(), "vision-out", orgId);
  if (!existsSync(path.join(from, "package.json"))) {
    throw new Error(`No pack at vision-out/${orgId}. Pack Vision first.`);
  }

  const org = await readOrgMeta(orgId);
  const raw = org.publish.localPath.trim();
  if (!raw) {
    throw new Error(
      "Set the customer folder in org settings (Vision git → Local folder), then Send again.",
    );
  }

  const dest = path.resolve(raw);
  const builder = path.resolve(process.cwd());
  const pack = path.resolve(from);

  if (!existsSync(dest) || !statSync(dest).isDirectory()) {
    throw new Error(`Customer folder does not exist: ${dest}`);
  }
  if (isInside(builder, dest)) {
    throw new Error("Customer folder cannot be inside this builder.");
  }
  if (isInside(dest, builder)) {
    throw new Error("Customer folder cannot be a parent of this builder.");
  }
  if (dest === pack) {
    throw new Error("Customer folder cannot be the pack folder.");
  }

  // --delete: dest matches the pack. Preserved (not deleted, not overwritten): .git,
  // .env.local, and optional repo-only docs the customer may add by hand.
  await execFileAsync(
    "rsync",
    [
      "-a",
      "--delete",
      "--exclude=node_modules",
      "--exclude=.next",
      "--exclude=.env.local",
      "--exclude=.git",
      "--exclude=.DS_Store",
      "--exclude=README",
      "--exclude=README.md",
      "--exclude=README.*",
      "--exclude=LICENSE",
      "--exclude=LICENSE.md",
      "--exclude=LICENSE.txt",
      "--exclude=.env.local.example",
      "--exclude=.github/",
      `${from}/`,
      `${dest}/`,
    ],
    { timeout: 120_000, maxBuffer: 2 * 1024 * 1024 },
  );

  writeFileSync(path.join(dest, ".env.local"), "LIFESPRING_VISION=1\n");

  if (process.platform === "darwin") {
    try {
      await execFileAsync("open", [dest]);
    } catch {
      // Finder is optional
    }
  }

  return { fromDir: path.join("vision-out", orgId), toDir: dest };
}
