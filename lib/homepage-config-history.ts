import type { ColorThemeId } from "@/lib/color-themes";
import type { HomepageConfig } from "@/lib/homepage-config";

export type HomepageConfigHistoryAction = "staging" | "live" | "pulled";

export type HomepageConfigHistoryEntry = {
  id: string;
  action: HomepageConfigHistoryAction;
  savedAt: string;
  sectionCount: number;
  colorThemeId: ColorThemeId;
  filename: string;
};

export type HomepageConfigHistoryManifest = {
  entries: HomepageConfigHistoryEntry[];
};

export type HomepageConfigHistorySnapshot = {
  entry: HomepageConfigHistoryEntry;
  config: HomepageConfig;
};

export const HOMEPAGE_CONFIG_HISTORY_RETENTION_DAYS = 30;
export const HOMEPAGE_CONFIG_HISTORY_RETENTION_MIN_DAYS = 1;
export const HOMEPAGE_CONFIG_HISTORY_RETENTION_MAX_DAYS = 3650;
export const HOMEPAGE_CONFIG_HISTORY_RETENTION_PRESETS = [7, 15, 30] as const;

export function parseHomepageConfigHistoryRetentionDays(value: unknown): number | null {
  const days = typeof value === "number" ? value : Number(value);
  if (
    !Number.isInteger(days) ||
    days < HOMEPAGE_CONFIG_HISTORY_RETENTION_MIN_DAYS ||
    days > HOMEPAGE_CONFIG_HISTORY_RETENTION_MAX_DAYS
  ) {
    return null;
  }
  return days;
}

export function getHomepageConfigHistoryActionLabel(action: HomepageConfigHistoryAction): string {
  if (action === "staging") return "Saved to /preview";
  if (action === "pulled") return "Pulled live";
  return "Published to /";
}

export function isHomepageConfigHistoryOlderThan(
  savedAt: string,
  days = HOMEPAGE_CONFIG_HISTORY_RETENTION_DAYS,
  now = Date.now(),
): boolean {
  const saved = Date.parse(savedAt);
  if (!Number.isFinite(saved)) return false;
  return saved < now - days * 24 * 60 * 60 * 1000;
}

export function filterHomepageConfigHistoryOlderThan(
  entries: HomepageConfigHistoryEntry[],
  days = HOMEPAGE_CONFIG_HISTORY_RETENTION_DAYS,
  now = Date.now(),
): HomepageConfigHistoryEntry[] {
  return entries.filter((entry) => isHomepageConfigHistoryOlderThan(entry.savedAt, days, now));
}
