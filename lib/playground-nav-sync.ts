import {
  getNavLinksFromPlaygroundPages,
  type PlaygroundPage,
} from "@/lib/playground-pages";
import {
  loadNavBarPreviewSettings,
  saveNavBarPreviewSettings,
} from "@/lib/nav-bar-preview-storage";

export const playgroundNavSyncEvent = "playground-nav-sync";

export function syncPlaygroundNavFromPages(pages: PlaygroundPage[]): void {
  if (typeof window === "undefined") return;

  const current = loadNavBarPreviewSettings();
  const nextItems = getNavLinksFromPlaygroundPages(pages);

  saveNavBarPreviewSettings({
    ...current,
    items: nextItems,
  });

  queueMicrotask(() => {
    window.dispatchEvent(new CustomEvent(playgroundNavSyncEvent));
  });
}
