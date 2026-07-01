import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type LaunchMode = "live" | "under-construction";

const siteConfigPath = () => path.join(process.cwd(), "config", "site.ts");

const launchModePattern =
  /mode: "(live|under-construction)" as "under-construction" \| "live"/;

export async function readLaunchMode(): Promise<LaunchMode> {
  try {
    const content = await readFile(siteConfigPath(), "utf8");
    const match = content.match(launchModePattern);
    if (match?.[1] === "live" || match?.[1] === "under-construction") {
      return match[1];
    }
  } catch {
    // fall through
  }

  return "under-construction";
}

export async function writeLaunchMode(mode: LaunchMode): Promise<void> {
  const content = await readFile(siteConfigPath(), "utf8");

  if (!launchModePattern.test(content)) {
    throw new Error("Could not find launch.mode in config/site.ts");
  }

  const next = content.replace(
    launchModePattern,
    `mode: "${mode}" as "under-construction" | "live"`,
  );

  await writeFile(siteConfigPath(), next, "utf8");
}

export function isUnderConstruction(mode: LaunchMode): boolean {
  return mode === "under-construction";
}
