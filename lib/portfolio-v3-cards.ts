import { defaultPortfolioV2SampleImage, type PortfolioV2ModalImage } from "@/lib/portfolio-v2-preview";
import { createPortfolioV3CardId, type PortfolioV3Card } from "@/lib/portfolio-v3-preview";
import { createPortfolioV2ModalImageId } from "@/lib/portfolio-v2-tabs";

export function dedupePortfolioV3CardIds(cards: readonly PortfolioV3Card[]): PortfolioV3Card[] {
  const seen = new Set<string>();
  return cards.map((card) => {
    if (!seen.has(card.id)) {
      seen.add(card.id);
      return card;
    }
    return { ...card, id: createPortfolioV3CardId() };
  });
}

export function updatePortfolioV3Card(
  cards: readonly PortfolioV3Card[],
  cardId: string,
  patch: Partial<Omit<PortfolioV3Card, "id">>,
): PortfolioV3Card[] {
  return cards.map((card) => (card.id === cardId ? { ...card, ...patch } : card));
}

export function addPortfolioV3Card(cards: readonly PortfolioV3Card[]): PortfolioV3Card[] {
  const index = cards.length + 1;
  return [
    ...cards,
    {
      id: createPortfolioV3CardId(),
      imageSrc: defaultPortfolioV2SampleImage,
      imageAlt: `Gallery photo ${index}`,
    },
  ];
}

export function deletePortfolioV3Card(
  cards: readonly PortfolioV3Card[],
  cardId: string,
): PortfolioV3Card[] {
  if (cards.length <= 1) return [...cards];
  return cards.filter((card) => card.id !== cardId);
}

export function reorderPortfolioV3Cards(
  cards: readonly PortfolioV3Card[],
  fromIndex: number,
  toIndex: number,
): PortfolioV3Card[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return [...cards];
  if (fromIndex >= cards.length || toIndex >= cards.length) return [...cards];
  const next = [...cards];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function addPortfolioV3ModalImage(
  card: PortfolioV3Card,
): PortfolioV3Card {
  const modalImages = card.modalImages ?? [
    {
      id: `${card.id}-modal-1`,
      imageSrc: card.imageSrc,
      imageAlt: card.imageAlt,
    },
  ];
  return {
    ...card,
    modalImages: [
      ...modalImages,
      {
        id: createPortfolioV2ModalImageId(),
        imageSrc: defaultPortfolioV2SampleImage,
        imageAlt: "",
      },
    ],
  };
}

export function updatePortfolioV3ModalImage(
  card: PortfolioV3Card,
  imageId: string,
  patch: Partial<Omit<PortfolioV2ModalImage, "id">>,
): PortfolioV3Card {
  const modalImages = card.modalImages ?? [];
  return {
    ...card,
    modalImages: modalImages.map((image) =>
      image.id === imageId ? { ...image, ...patch } : image,
    ),
  };
}

export function deletePortfolioV3ModalImage(
  card: PortfolioV3Card,
  imageId: string,
): PortfolioV3Card {
  const modalImages = card.modalImages ?? [];
  if (modalImages.length <= 1) return card;
  return {
    ...card,
    modalImages: modalImages.filter((image) => image.id !== imageId),
  };
}
