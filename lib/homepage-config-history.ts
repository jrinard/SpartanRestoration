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

export function getHomepageConfigHistoryActionLabel(action: HomepageConfigHistoryAction): string {
  if (action === "staging") return "Saved to /preview";
  if (action === "pulled") return "Pulled live";
  return "Published to /";
}
