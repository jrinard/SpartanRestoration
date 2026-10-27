import { stonePillarTextIconsContent } from "@/lib/demo-content";
import {
  resolveTextIconsV3Items,
  type TextIconsV3Item,
  type TextIconsV3PreviewSettings,
} from "@/lib/text-icons-v3-preview";
import { type SiteIconName } from "@/lib/site-icons";

export function createTextIconsV3ItemId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `text-icons-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `text-icons-${Date.now().toString(36)}`;
}

export function createTextIconsV3Item(
  partial?: Partial<TextIconsV3Item>,
): TextIconsV3Item {
  return {
    id: partial?.id?.trim() || createTextIconsV3ItemId(),
    title: partial?.title?.trim() || "New item",
    description: partial?.description ?? "",
    icon: partial?.icon ?? "shield-check",
  };
}

export function getTextIconsV3ItemPillLabel(
  item: TextIconsV3Item,
  index: number,
): string {
  const title = item.title.trim();
  if (title) return title.length > 24 ? `${title.slice(0, 21)}…` : title;
  return `Item ${index + 1}`;
}

export function addTextIconsV3Item(
  items: readonly TextIconsV3Item[],
): TextIconsV3Item[] {
  return [...items, createTextIconsV3Item()];
}

export function deleteTextIconsV3Item(
  items: readonly TextIconsV3Item[],
  itemId: string,
): TextIconsV3Item[] {
  if (items.length <= 1) return [...items];
  return items.filter((item) => item.id !== itemId);
}

export function reorderTextIconsV3Items(
  items: readonly TextIconsV3Item[],
  fromIndex: number,
  toIndex: number,
): TextIconsV3Item[] {
  if (fromIndex === toIndex) return [...items];
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  if (!moved) return [...items];
  next.splice(toIndex, 0, moved);
  return next;
}

/** Built-in cards when this instance has not saved its own list yet. */
export function getTextIconsV3FallbackItems(): readonly TextIconsV3Item[] {
  return stonePillarTextIconsContent.items;
}

export function resolveEditableTextIconsV3Items(
  settings: TextIconsV3PreviewSettings,
): TextIconsV3Item[] {
  return resolveTextIconsV3Items(settings, getTextIconsV3FallbackItems());
}

export function commitTextIconsV3Items(
  settings: TextIconsV3PreviewSettings,
  items: readonly TextIconsV3Item[],
): TextIconsV3PreviewSettings {
  const itemIcons: Partial<Record<string, SiteIconName>> = {};
  const itemTitles: Partial<Record<string, string>> = {};
  const itemDescriptions: Partial<Record<string, string>> = {};

  for (const item of items) {
    if (item.icon) itemIcons[item.id] = item.icon;
    if (item.title.trim()) itemTitles[item.id] = item.title;
    if (item.description.trim()) itemDescriptions[item.id] = item.description;
  }

  return {
    ...settings,
    items: [...items],
    itemIcons,
    itemTitles,
    itemDescriptions,
  };
}

export function getTextIconsV3ItemGrid(count: number): {
  columnsMobile: number;
  columnsSm: number;
  columns: number;
  columnsLg: number;
  compact: boolean;
} {
  const safeCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  if (safeCount <= 1) {
    return { columnsMobile: 1, columnsSm: 1, columns: 1, columnsLg: 1, compact: false };
  }
  if (safeCount === 2) {
    return { columnsMobile: 1, columnsSm: 2, columns: 2, columnsLg: 2, compact: false };
  }
  if (safeCount === 3) {
    return { columnsMobile: 1, columnsSm: 3, columns: 3, columnsLg: 3, compact: false };
  }
  if (safeCount === 4) {
    return { columnsMobile: 1, columnsSm: 2, columns: 4, columnsLg: 4, compact: false };
  }
  if (safeCount === 5) {
    return { columnsMobile: 1, columnsSm: 2, columns: 5, columnsLg: 3, compact: true };
  }
  if (safeCount === 6) {
    return { columnsMobile: 1, columnsSm: 3, columns: 3, columnsLg: 3, compact: false };
  }
  if (safeCount <= 8) {
    return { columnsMobile: 1, columnsSm: 2, columns: 4, columnsLg: 4, compact: true };
  }
  return { columnsMobile: 1, columnsSm: 2, columns: 5, columnsLg: 3, compact: true };
}
