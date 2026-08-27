import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { normalizeHomepageConfig, type HomepageConfig } from "@/lib/homepage-config";
import type {
  HomepageConfigHistoryAction,
  HomepageConfigHistoryEntry,
  HomepageConfigHistoryManifest,
  HomepageConfigHistorySnapshot,
} from "@/lib/homepage-config-history";
import { fillMissingSectionCopy } from "@/lib/org/migrate-section-copy";
import { reconcileHomePageGlobalPreviewSettings } from "@/lib/home-preview-sync";
import { rewriteLegacyAssetPathsInJson } from "@/lib/org/migrate-pillar";
import { isSafeOrgId, orgHistoryDir } from "@/lib/org/paths";

function historyDir(orgId: string): string {
  if (!isSafeOrgId(orgId)) {
    throw new Error("Invalid organization id.");
  }
  return orgHistoryDir(orgId);
}

function manifestPath(orgId: string): string {
  return path.join(historyDir(orgId), "manifest.json");
}

function formatHistoryFilename(savedAt: string, action: HomepageConfigHistoryAction): string {
  const stamp = savedAt.replace(/[:.]/g, "-");
  return `${stamp}-${action}.json`;
}

function emptyManifest(): HomepageConfigHistoryManifest {
  return { entries: [] };
}

export async function readHomepageConfigHistoryManifest(
  orgId: string,
): Promise<HomepageConfigHistoryManifest> {
  try {
    const raw = await readFile(manifestPath(orgId), "utf8");
    const parsed = JSON.parse(raw) as Partial<HomepageConfigHistoryManifest>;
    const entries = Array.isArray(parsed.entries)
      ? parsed.entries.filter((entry): entry is HomepageConfigHistoryEntry => {
          if (!entry || typeof entry !== "object") return false;
          const record = entry as Partial<HomepageConfigHistoryEntry>;
          return (
            typeof record.id === "string" &&
            (record.action === "staging" ||
              record.action === "live" ||
              record.action === "pulled") &&
            typeof record.savedAt === "string" &&
            typeof record.sectionCount === "number" &&
            typeof record.colorThemeId === "string" &&
            typeof record.filename === "string"
          );
        })
      : [];

    return { entries };
  } catch {
    return emptyManifest();
  }
}

async function writeHomepageConfigHistoryManifest(
  orgId: string,
  manifest: HomepageConfigHistoryManifest,
): Promise<void> {
  await mkdir(historyDir(orgId), { recursive: true });
  await writeFile(manifestPath(orgId), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

export async function appendHomepageConfigHistoryEntry(
  orgId: string,
  config: HomepageConfig,
  action: HomepageConfigHistoryAction,
): Promise<HomepageConfigHistoryEntry> {
  const normalized = normalizeHomepageConfig(config);
  const savedAt = new Date().toISOString();
  const id = `${Date.now()}-${action}`;
  const filename = formatHistoryFilename(savedAt, action);

  const entry: HomepageConfigHistoryEntry = {
    id,
    action,
    savedAt,
    sectionCount: normalized.sections.length,
    colorThemeId: normalized.colorThemeId,
    filename,
  };

  await mkdir(historyDir(orgId), { recursive: true });
  await writeFile(
    path.join(historyDir(orgId), filename),
    `${JSON.stringify(normalized, null, 2)}\n`,
    "utf8",
  );

  const manifest = await readHomepageConfigHistoryManifest(orgId);
  manifest.entries.unshift(entry);
  await writeHomepageConfigHistoryManifest(orgId, manifest);

  return entry;
}

export async function readHomepageConfigHistorySnapshot(
  orgId: string,
  id: string,
): Promise<HomepageConfigHistorySnapshot | null> {
  const manifest = await readHomepageConfigHistoryManifest(orgId);
  const entry = manifest.entries.find((candidate) => candidate.id === id);
  if (!entry) return null;

  try {
    const raw = await readFile(path.join(historyDir(orgId), entry.filename), "utf8");
    const parsed = rewriteLegacyAssetPathsInJson(JSON.parse(raw), orgId);
    const { config } = fillMissingSectionCopy(normalizeHomepageConfig(parsed), orgId, {
      production: orgId === "lsd",
    });
    return {
      entry,
      config: reconcileHomePageGlobalPreviewSettings(config),
    };
  } catch {
    return null;
  }
}

export async function deleteHomepageConfigHistoryEntry(
  orgId: string,
  id: string,
): Promise<boolean> {
  const manifest = await readHomepageConfigHistoryManifest(orgId);
  const entry = manifest.entries.find((candidate) => candidate.id === id);
  if (!entry) return false;

  try {
    await unlink(path.join(historyDir(orgId), entry.filename));
  } catch {
    // Missing file is fine — still remove manifest entry.
  }

  manifest.entries = manifest.entries.filter((candidate) => candidate.id !== id);
  await writeHomepageConfigHistoryManifest(orgId, manifest);
  return true;
}
