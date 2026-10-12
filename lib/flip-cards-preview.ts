import bundledFlipCardsPresetLibrary from "@/lib/flip-cards-preset-library.json";
import { isFlipCardsVariant } from "@/lib/flip-cards-cards";

export type FlipCardsVariant = "dark" | "medium" | "light" | "accent";

export type FlipCardsPreviewCard = {
  id: string;
  frontLabel: string;
  frontLines?: string[];
  title: string;
  variant: FlipCardsVariant;
  frontImage?: string;
  bullets?: string[];
  paragraph?: string;
  /** Overrides theme back fill and front border when set. */
  backColor?: string;
};

export type FlipCardsPreviewSettings = {
  heading: string;
  showTornDivider: boolean;
  /** Section band behind heading, cards, and wavy divider (#RRGGBB). Omit to use page background. */
  sectionBackground?: string;
  cards: FlipCardsPreviewCard[];
};

export const flipCardsVariants: FlipCardsVariant[] = ["dark", "medium", "light", "accent"];

function ospressureFallbackCards(): FlipCardsPreviewCard[] {
  const entry = bundledFlipCardsPresetLibrary.entries.find((item) => item.id === "ospressure");
  const cards = entry?.settings?.cards;
  return Array.isArray(cards) ? (cards as FlipCardsPreviewCard[]) : [];
}

export const defaultFlipCardsFour: FlipCardsPreviewCard[] = ospressureFallbackCards();

export const defaultFlipCardsThree: FlipCardsPreviewCard[] = defaultFlipCardsFour.slice(0, 3);

export const defaultFlipCardsPreviewSettings: FlipCardsPreviewSettings = {
  heading: "SERVICES",
  showTornDivider: true,
  cards: defaultFlipCardsFour,
};

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function normalizeStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const lines = value.filter((entry): entry is string => typeof entry === "string");
  return lines.length > 0 ? lines : undefined;
}

function normalizeFlipCardsCard(value: unknown, fallback: FlipCardsPreviewCard): FlipCardsPreviewCard {
  if (!value || typeof value !== "object") return fallback;
  const card = value as Partial<FlipCardsPreviewCard>;
  const frontLines = normalizeStringArray(card.frontLines);
  const bullets = normalizeStringArray(card.bullets);
  const paragraph = typeof card.paragraph === "string" ? card.paragraph : undefined;
  return {
    id: typeof card.id === "string" && card.id.trim() ? card.id.trim() : fallback.id,
    frontLabel:
      typeof card.frontLabel === "string"
        ? card.frontLabel
        : frontLines?.join(" ") ?? fallback.frontLabel,
    frontLines,
    title: typeof card.title === "string" ? card.title : fallback.title,
    variant: isFlipCardsVariant(card.variant) ? card.variant : fallback.variant,
    frontImage:
      typeof card.frontImage === "string" ? card.frontImage.trim() : fallback.frontImage,
    bullets: bullets ?? fallback.bullets,
    paragraph: paragraph ?? fallback.paragraph,
    backColor:
      typeof card.backColor === "string" && card.backColor.trim()
        ? isHexColor(card.backColor)
          ? card.backColor
          : fallback.backColor
        : undefined,
  };
}

function normalizeFlipCardsCards(value: unknown): FlipCardsPreviewCard[] {
  if (!Array.isArray(value) || value.length === 0) return defaultFlipCardsFour;
  return value.map((entry, index) =>
    normalizeFlipCardsCard(entry, defaultFlipCardsFour[index] ?? defaultFlipCardsFour[0]!),
  );
}

export function normalizeFlipCardsPreviewSettings(
  value: Partial<FlipCardsPreviewSettings>,
): FlipCardsPreviewSettings {
  const sectionBackground =
    typeof value.sectionBackground === "string" && isHexColor(value.sectionBackground.trim())
      ? value.sectionBackground.trim()
      : undefined;

  return {
    heading:
      typeof value.heading === "string" ? value.heading : defaultFlipCardsPreviewSettings.heading,
    showTornDivider:
      typeof value.showTornDivider === "boolean"
        ? value.showTornDivider
        : defaultFlipCardsPreviewSettings.showTornDivider,
    ...(sectionBackground ? { sectionBackground } : {}),
    cards: normalizeFlipCardsCards(value.cards),
  };
}

export function resolveFlipCardsSectionBackground(
  settings: FlipCardsPreviewSettings,
): string | undefined {
  const value = settings.sectionBackground?.trim();
  if (value && isHexColor(value)) return value;
  return undefined;
}

export function nextFlipCardsVariant(index: number): FlipCardsVariant {
  return flipCardsVariants[index % flipCardsVariants.length] ?? "dark";
}

export function cardsForFlipLayout(
  cards: readonly FlipCardsPreviewCard[],
  layout: "three" | "four",
  fallbacks: readonly FlipCardsPreviewCard[] = layout === "four"
    ? defaultFlipCardsFour
    : defaultFlipCardsThree,
): FlipCardsPreviewCard[] {
  const count = layout === "four" ? 4 : 3;
  const next = cards.slice(0, count);
  while (next.length < count) {
    const fallback = fallbacks[next.length] ?? fallbacks[0]!;
    next.push(structuredClone(fallback));
  }
  return next;
}
