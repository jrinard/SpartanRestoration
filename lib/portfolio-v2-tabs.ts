import {
  defaultPortfolioV2SampleImage,
  defaultPortfolioV2OverlayOpacity,
  getPortfolioV2DefaultOverlayColor,
  type PortfolioV2ModalImage,
  type PortfolioV2Tab,
} from "@/lib/portfolio-v2-preview";

export function createPortfolioV2TabId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `portfolio-v2-tab-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `portfolio-v2-tab-${Date.now().toString(36)}`;
}

export function createPortfolioV2ModalImageId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `portfolio-v2-image-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `portfolio-v2-image-${Date.now().toString(36)}`;
}

export function getPortfolioV2TabPillLabel(tab: PortfolioV2Tab, index: number): string {
  const label = tab.label.trim();
  if (label) return label.length > 20 ? `${label.slice(0, 17)}…` : label;
  return `Tab ${index + 1}`;
}

export function addPortfolioV2Tab(tabs: readonly PortfolioV2Tab[]): PortfolioV2Tab[] {
  const index = tabs.length + 1;
  const label = `Category ${index}`;

  return [
    ...tabs,
    {
      id: createPortfolioV2TabId(),
      label,
      backgroundImageSrc: defaultPortfolioV2SampleImage,
      backgroundOverlayColor: getPortfolioV2DefaultOverlayColor(tabs.length),
      backgroundOverlayOpacity: defaultPortfolioV2OverlayOpacity,
      labelColor: "#ffffff",
      modalImages: Array.from({ length: 4 }, (_, imageIndex) => ({
        id: createPortfolioV2ModalImageId(),
        imageSrc: defaultPortfolioV2SampleImage,
        imageAlt: `${label} portfolio photo ${imageIndex + 1}`,
      })),
    },
  ];
}

export function deletePortfolioV2Tab(
  tabs: readonly PortfolioV2Tab[],
  tabId: string,
): PortfolioV2Tab[] {
  return tabs.filter((tab) => tab.id !== tabId);
}

export function reorderPortfolioV2Tabs(
  tabs: readonly PortfolioV2Tab[],
  fromIndex: number,
  toIndex: number,
): PortfolioV2Tab[] {
  if (fromIndex === toIndex) return [...tabs];
  const next = [...tabs];
  const [moved] = next.splice(fromIndex, 1);
  if (!moved) return [...tabs];
  next.splice(toIndex, 0, moved);
  return next;
}

export function updatePortfolioV2Tab(
  tabs: readonly PortfolioV2Tab[],
  tabId: string,
  patch: Partial<Omit<PortfolioV2Tab, "id">>,
): PortfolioV2Tab[] {
  return tabs.map((tab) => (tab.id === tabId ? { ...tab, ...patch, id: tab.id } : tab));
}

export function addPortfolioV2ModalImage(tab: PortfolioV2Tab): PortfolioV2Tab {
  return {
    ...tab,
    modalImages: [
      ...tab.modalImages,
      {
        id: createPortfolioV2ModalImageId(),
        imageSrc: defaultPortfolioV2SampleImage,
        imageAlt: "",
      },
    ],
  };
}

export function deletePortfolioV2ModalImage(
  tab: PortfolioV2Tab,
  imageId: string,
): PortfolioV2Tab {
  return {
    ...tab,
    modalImages: tab.modalImages.filter((image) => image.id !== imageId),
  };
}

export function updatePortfolioV2ModalImage(
  tab: PortfolioV2Tab,
  imageId: string,
  patch: Partial<Pick<PortfolioV2ModalImage, "imageSrc" | "imageAlt">>,
): PortfolioV2Tab {
  return {
    ...tab,
    modalImages: tab.modalImages.map((image) =>
      image.id === imageId ? { ...image, ...patch, id: image.id } : image,
    ),
  };
}

export function reorderPortfolioV2ModalImages(
  tab: PortfolioV2Tab,
  fromIndex: number,
  toIndex: number,
): PortfolioV2Tab {
  if (fromIndex === toIndex) return tab;
  const next = [...tab.modalImages];
  const [moved] = next.splice(fromIndex, 1);
  if (!moved) return tab;
  next.splice(toIndex, 0, moved);
  return { ...tab, modalImages: next };
}
