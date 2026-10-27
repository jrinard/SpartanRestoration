import { createPortfolioV3CardId, type PortfolioV3Card, type PortfolioV3PreviewSettings } from "@/lib/portfolio-v3-preview";
import { dedupePortfolioV3CardIds } from "@/lib/portfolio-v3-cards";

export type PortfolioV3GalleryTab = {
  id: string;
  label: string;
  cards: PortfolioV3Card[];
};

export function createPortfolioV3GalleryTabId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `portfolio-v3-tab-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `portfolio-v3-tab-${Date.now().toString(36)}`;
}

export function portfolioV3HasGalleryTabs(
  settings: Pick<PortfolioV3PreviewSettings, "galleryTabs">,
): boolean {
  return Boolean(settings.galleryTabs && settings.galleryTabs.length >= 1);
}

export function resolvePortfolioV3WallCards(
  settings: PortfolioV3PreviewSettings,
  activeTabId: string | null,
): PortfolioV3Card[] {
  if (!portfolioV3HasGalleryTabs(settings)) {
    return settings.cards;
  }

  const tabs = settings.galleryTabs!;
  const active =
    tabs.find((tab) => tab.id === activeTabId) ?? tabs[0] ?? null;
  return active?.cards ?? settings.cards;
}

export function createEmptyPortfolioV3CardSlots(
  count: number,
  idPrefix: string,
): PortfolioV3Card[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${idPrefix}-${String(index + 1).padStart(2, "0")}`,
    imageSrc: "",
    imageAlt: "",
  }));
}

export function createDefaultPortfolioV3GalleryTabs(
  inProgressCards: readonly PortfolioV3Card[],
): PortfolioV3GalleryTab[] {
  return [
    {
      id: createPortfolioV3GalleryTabId(),
      label: "In-Progress",
      cards: dedupePortfolioV3CardIds(inProgressCards.map((card) => ({ ...card }))),
    },
    {
      id: createPortfolioV3GalleryTabId(),
      label: "Completed",
      cards: createEmptyPortfolioV3CardSlots(6, "portfolio-v3-card-completed"),
    },
  ];
}

export function normalizePortfolioV3GalleryTabs(
  value: unknown,
  normalizeCards: (cards: unknown) => PortfolioV3Card[],
): PortfolioV3GalleryTab[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;

  const tabs = value
    .map((entry, index) => {
      if (!entry || typeof entry !== "object") return null;
      const tab = entry as Partial<PortfolioV3GalleryTab>;
      const id =
        typeof tab.id === "string" && tab.id.trim()
          ? tab.id.trim()
          : createPortfolioV3GalleryTabId();
      const label =
        typeof tab.label === "string" && tab.label.trim()
          ? tab.label.trim()
          : `Tab ${index + 1}`;
      const cards = normalizeCards(tab.cards);
      return { id, label, cards };
    })
    .filter((tab): tab is PortfolioV3GalleryTab => tab !== null);

  return tabs.length > 0 ? tabs : undefined;
}

export function getPortfolioV3GalleryTabPillLabel(tab: PortfolioV3GalleryTab, index: number): string {
  const label = tab.label.trim();
  return label || `Tab ${index + 1}`;
}

/** Keep top-level `cards` aligned with the first tab for legacy readers. */
export function syncPortfolioV3CardsFromGalleryTabs(
  settings: PortfolioV3PreviewSettings,
): PortfolioV3PreviewSettings {
  if (!portfolioV3HasGalleryTabs(settings)) return settings;
  const firstCards = settings.galleryTabs![0]?.cards ?? settings.cards;
  return { ...settings, cards: firstCards.map((card) => ({ ...card })) };
}

export function addPortfolioV3GalleryTab(
  settings: PortfolioV3PreviewSettings,
): PortfolioV3PreviewSettings {
  if (!portfolioV3HasGalleryTabs(settings)) {
    return syncPortfolioV3CardsFromGalleryTabs({
      ...settings,
      galleryTabs: [
        {
          id: createPortfolioV3GalleryTabId(),
          label: "Tab 1",
          cards: settings.cards.map((card) => ({ ...card })),
        },
      ],
    });
  }

  const index = settings.galleryTabs!.length;
  return syncPortfolioV3CardsFromGalleryTabs({
    ...settings,
    galleryTabs: [
      ...settings.galleryTabs!,
      {
        id: createPortfolioV3GalleryTabId(),
        label: `Tab ${index + 1}`,
        cards: createEmptyPortfolioV3CardSlots(6, `portfolio-v3-tab-${index + 1}-card`),
      },
    ],
  });
}

export function deletePortfolioV3GalleryTab(
  settings: PortfolioV3PreviewSettings,
  tabId: string,
): PortfolioV3PreviewSettings {
  if (!portfolioV3HasGalleryTabs(settings)) return settings;

  const tabs = settings.galleryTabs!.filter((tab) => tab.id !== tabId);
  if (tabs.length === 0) {
    const removed = settings.galleryTabs!.find((tab) => tab.id === tabId);
    const { galleryTabs: _removed, ...rest } = settings;
    return {
      ...rest,
      cards: removed?.cards.map((card) => ({ ...card })) ?? settings.cards,
    };
  }

  return syncPortfolioV3CardsFromGalleryTabs({
    ...settings,
    galleryTabs: tabs,
  });
}

export function reorderPortfolioV3GalleryTabs(
  tabs: readonly PortfolioV3GalleryTab[],
  fromIndex: number,
  toIndex: number,
): PortfolioV3GalleryTab[] {
  if (fromIndex === toIndex) return [...tabs];
  const next = [...tabs];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function replacePortfolioV3GalleryTabs(
  settings: PortfolioV3PreviewSettings,
  galleryTabs: PortfolioV3GalleryTab[],
): PortfolioV3PreviewSettings {
  if (galleryTabs.length === 0) {
    const { galleryTabs: _removed, ...rest } = settings;
    return rest;
  }
  return syncPortfolioV3CardsFromGalleryTabs({ ...settings, galleryTabs });
}

export function updatePortfolioV3GalleryTabLabel(
  tabs: readonly PortfolioV3GalleryTab[],
  tabId: string,
  label: string,
): PortfolioV3GalleryTab[] {
  const trimmed = label.trim();
  if (!trimmed) return [...tabs];
  return tabs.map((tab) => (tab.id === tabId ? { ...tab, label: trimmed } : tab));
}
