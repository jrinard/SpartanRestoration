import type { ImagesV1Card, ImagesV1CardLinkTarget } from "@/lib/images-v1-preview";
import { isExternalNavHref } from "@/lib/nav-bar-preview";

export function createImagesV1CardId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `images-v1-card-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `images-v1-card-${Date.now().toString(36)}`;
}

export function getImagesV1CardPillLabel(card: ImagesV1Card, index: number): string {
  const alt = card.imageAlt.trim();
  if (alt) return alt.length > 24 ? `${alt.slice(0, 21)}…` : alt;
  return `Image ${index + 1}`;
}

export function addImagesV1Card(cards: readonly ImagesV1Card[]): ImagesV1Card[] {
  return [
    ...cards,
    {
      id: createImagesV1CardId(),
      imageSrc: "",
      imageAlt: "",
    },
  ];
}

export function deleteImagesV1Card(
  cards: readonly ImagesV1Card[],
  cardId: string,
): ImagesV1Card[] {
  return cards.filter((card) => card.id !== cardId);
}

export function reorderImagesV1Cards(
  cards: readonly ImagesV1Card[],
  fromIndex: number,
  toIndex: number,
): ImagesV1Card[] {
  if (fromIndex === toIndex) return [...cards];
  const next = [...cards];
  const [moved] = next.splice(fromIndex, 1);
  if (!moved) return [...cards];
  next.splice(toIndex, 0, moved);
  return next;
}

export function updateImagesV1Card(
  cards: readonly ImagesV1Card[],
  cardId: string,
  patch: Partial<Pick<ImagesV1Card, "imageSrc" | "imageAlt" | "linkHref" | "linkTarget">>,
): ImagesV1Card[] {
  return cards.map((card) => (card.id === cardId ? { ...card, ...patch } : card));
}

export function getImagesV1CardSeoName(card: ImagesV1Card): string {
  const alt = card.imageAlt.trim();
  if (alt) return alt;
  return "Image";
}

export function getImagesV1CardLinkTitle(
  card: ImagesV1Card,
  target: ImagesV1CardLinkTarget,
): string {
  const name = getImagesV1CardSeoName(card);
  if (target === "_blank") {
    return `Visit ${name} (opens in new tab)`;
  }
  return `Visit ${name}`;
}

export function resolveImagesV1CardLink(card: ImagesV1Card): {
  href: string;
  target: ImagesV1CardLinkTarget;
  rel?: string;
} | null {
  const href = card.linkHref?.trim();
  if (!href) return null;

  const target =
    card.linkTarget === "_blank" || card.linkTarget === "_self"
      ? card.linkTarget
      : isExternalNavHref(href)
        ? "_blank"
        : "_self";

  return {
    href,
    target,
    rel: target === "_blank" ? "noopener noreferrer" : undefined,
  };
}
