import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { normalizeHomepageConfig, type HomepageConfig } from "@/lib/homepage-config";
import type {
  HomepageConfigHistoryAction,
  HomepageConfigHistoryEntry,
  HomepageConfigHistoryManifest,
  HomepageConfigHistorySnapshot,
} from "@/lib/homepage-config-history";

const historyDir = () => path.join(process.cwd(), "lib", "homepage-config-history");
const manifestPath = () => path.join(historyDir(), "manifest.json");

function formatHistoryFilename(savedAt: string, action: HomepageConfigHistoryAction): string {
  const stamp = savedAt.replace(/[:.]/g, "-");
  return `${stamp}-${action}.json`;
}

function emptyManifest(): HomepageConfigHistoryManifest {
  return { entries: [] };
}

export async function readHomepageConfigHistoryManifest(): Promise<HomepageConfigHistoryManifest> {
  try {
    const raw = await readFile(manifestPath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<HomepageConfigHistoryManifest>;
    const entries = Array.isArray(parsed.entries)
      ? parsed.entries.filter((entry): entry is HomepageConfigHistoryEntry => {
          if (!entry || typeof entry !== "object") return false;
          const record = entry as Partial<HomepageConfigHistoryEntry>;
          return (
            typeof record.id === "string" &&
            (record.action === "staging" || record.action === "live") &&
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
  manifest: HomepageConfigHistoryManifest,
): Promise<void> {
  await mkdir(historyDir(), { recursive: true });
  await writeFile(manifestPath(), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

export async function appendHomepageConfigHistoryEntry(
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

  await mkdir(historyDir(), { recursive: true });
  await writeFile(
    path.join(historyDir(), filename),
    `${JSON.stringify(normalized, null, 2)}\n`,
    "utf8",
  );

  const manifest = await readHomepageConfigHistoryManifest();
  manifest.entries.unshift(entry);
  await writeHomepageConfigHistoryManifest(manifest);

  return entry;
}

export async function readHomepageConfigHistorySnapshot(
  id: string,
): Promise<HomepageConfigHistorySnapshot | null> {
  const manifest = await readHomepageConfigHistoryManifest();
  const entry = manifest.entries.find((candidate) => candidate.id === id);
  if (!entry) return null;

  try {
    const raw = await readFile(path.join(historyDir(), entry.filename), "utf8");
    return {
      entry,
      config: normalizeHomepageConfig(JSON.parse(raw)),
    };
  } catch {
    return null;
  }
}

export async function deleteHomepageConfigHistoryEntry(id: string): Promise<boolean> {
  const manifest = await readHomepageConfigHistoryManifest();
  const entry = manifest.entries.find((candidate) => candidate.id === id);
  if (!entry) return false;

  try {
    await unlink(path.join(historyDir(), entry.filename));
  } catch {
    // Missing file is fine — still remove manifest entry.
  }

  manifest.entries = manifest.entries.filter((candidate) => candidate.id !== id);
  await writeHomepageConfigHistoryManifest(manifest);
  return true;
}
