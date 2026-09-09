import {
  nextCardsV1Variant,
  type CardsV1Card,
  type CardsV1Variant,
} from "@/lib/cards-v1-preview";

export function createCardsV1CardId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `cards-v1-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `cards-v1-${Date.now().toString(36)}`;
}

export function getCardsV1CardPillLabel(card: CardsV1Card, index: number): string {
  const title = card.title.trim();
  if (title) return title.length > 24 ? `${title.slice(0, 21)}…` : title;
  return `Card ${index + 1}`;
}

export function addCardsV1Card(cards: readonly CardsV1Card[]): CardsV1Card[] {
  return [
    ...cards,
    {
      id: createCardsV1CardId(),
      title: "New card",
      subtitle: "",
      imageSrc: "",
      variant: nextCardsV1Variant(cards.length),
    },
  ];
}

export function deleteCardsV1Card(cards: readonly CardsV1Card[], cardId: string): CardsV1Card[] {
  if (cards.length <= 1) return [...cards];
  return cards.filter((card) => card.id !== cardId);
}

export function reorderCardsV1Cards(
  cards: readonly CardsV1Card[],
  fromIndex: number,
  toIndex: number,
): CardsV1Card[] {
  if (fromIndex === toIndex) return [...cards];
  const next = [...cards];
  const [moved] = next.splice(fromIndex, 1);
  if (!moved) return [...cards];
  next.splice(toIndex, 0, moved);
  return next;
}

export function updateCardsV1Card(
  cards: readonly CardsV1Card[],
  cardId: string,
  patch: Partial<Pick<CardsV1Card, "title" | "subtitle" | "imageSrc" | "variant">>,
): CardsV1Card[] {
  return cards.map((card) => (card.id === cardId ? { ...card, ...patch } : card));
}

export function isCardsV1Variant(value: unknown): value is CardsV1Variant {
  return value === "dark" || value === "medium" || value === "light" || value === "accent";
}
