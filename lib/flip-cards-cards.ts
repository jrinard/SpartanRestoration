import {
  nextFlipCardsVariant,
  type FlipCardsPreviewCard,
  type FlipCardsVariant,
} from "@/lib/flip-cards-preview";

export function isFlipCardsVariant(value: unknown): value is FlipCardsVariant {
  return value === "dark" || value === "medium" || value === "light" || value === "accent";
}

export function updateFlipCardsCard(
  cards: readonly FlipCardsPreviewCard[],
  cardId: string,
  patch: Partial<FlipCardsPreviewCard>,
): FlipCardsPreviewCard[] {
  return cards.map((card) => (card.id === cardId ? { ...card, ...patch } : card));
}

export function createFlipCardsCardId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `flip-card-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `flip-card-${Date.now().toString(36)}`;
}

export function getFlipCardsCardPillLabel(
  card: FlipCardsPreviewCard,
  index: number,
): string {
  const label = card.frontLabel.trim() || card.title.trim();
  if (label) return label.length > 28 ? `${label.slice(0, 25)}…` : label;
  return `Card ${index + 1}`;
}

export function frontTextPatchFromEditor(
  text: string,
): Pick<FlipCardsPreviewCard, "frontLabel" | "frontLines"> {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length <= 1) {
    return { frontLabel: lines[0] ?? "", frontLines: undefined };
  }
  return { frontLabel: lines.join(" "), frontLines: lines };
}

export function frontDisplayText(card: FlipCardsPreviewCard): string {
  if (card.frontLines?.length) return card.frontLines.join("\n");
  return card.frontLabel;
}

export function addFlipCardsCard(
  cards: readonly FlipCardsPreviewCard[],
): FlipCardsPreviewCard[] {
  return [
    ...cards,
    {
      id: createFlipCardsCardId(),
      frontLabel: "New service",
      title: "New service",
      variant: nextFlipCardsVariant(cards.length),
      frontImage: "",
      bullets: ["Add a detail line"],
    },
  ];
}
