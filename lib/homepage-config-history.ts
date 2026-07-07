import type { ColorThemeId } from "@/lib/color-themes";
import type { HomepageConfig } from "@/lib/homepage-config";

export type HomepageConfigHistoryAction = "staging" | "live";

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
  return action === "staging" ? "Saved to /preview" : "Published to /";
}
