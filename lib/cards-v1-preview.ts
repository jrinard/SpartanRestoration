import type { SiteLayoutWidth } from "@/lib/site-layout";
import {
  getPreviewGradientBackground,
  previewGradientDirections,
  type PreviewGradientDirection,
} from "@/lib/preview-gradient";

export type CardsV1Variant = "dark" | "medium" | "light" | "accent";

export type CardsV1Card = {
  id: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  variant: CardsV1Variant;
};

export type CardsV1PreviewSettings = {
  heading: string;
  headingColor: string;
  showDivider: boolean;
  cardBorderRadiusPx: number;
  cardBorderWidthPx: number;
  /** Empty keeps each card's theme variant color. */
  cardBorderColor: string;
  showBookEnds: boolean;
  bookEndWidthPx: CardsV1BookEndWidth;
  layoutWidth: SiteLayoutWidth;
  /** Heading and card titles. */
  labelFontStyle: CardsV1LabelFontStyle;
  subtitleColor: string;
  /** Missing/empty keeps today’s transparent section (page shows through). */
  backgroundFrom?: string;
  backgroundTo?: string;
  backgroundDirection?: PreviewGradientDirection;
  /** Full-width color behind a contained section. Empty keeps the page showing. */
  outerBackgroundColor?: string;
  cards: CardsV1Card[];
};

export const cardsV1LabelFontStyleOptions = [
  { value: "normal", label: "Normal" },
  { value: "italic", label: "Italic" },
  { value: "slant", label: "Slant" },
] as const;

export type CardsV1LabelFontStyle = (typeof cardsV1LabelFontStyleOptions)[number]["value"];

export function isCardsV1LabelFontStyle(value: unknown): value is CardsV1LabelFontStyle {
  return value === "normal" || value === "italic" || value === "slant";
}

export const defaultCardsV1HeadingColor = "#ffffff";
export const defaultCardsV1SubtitleColor = "#ffffff";
export const defaultCardsV1CardBorderRadiusPx = 0;
export const defaultCardsV1CardBorderWidthPx = 4;
export const defaultCardsV1BookEndWidthPx = 100;

export const cardsV1BookEndWidthOptions = [80, 100, 120, 140, 160, 180, 200, 240] as const;

export type CardsV1BookEndWidthPx = (typeof cardsV1BookEndWidthOptions)[number];
export type CardsV1BookEndWidth = CardsV1BookEndWidthPx | "full";

export function isCardsV1BookEndFullWidth(value: unknown): value is "full" {
  return value === "full";
}

export function normalizeCardsV1BookEndWidthPx(value: number): CardsV1BookEndWidthPx {
  if (cardsV1BookEndWidthOptions.includes(value as CardsV1BookEndWidthPx)) {
    return value as CardsV1BookEndWidthPx;
  }

  return cardsV1BookEndWidthOptions.reduce((closest, option) =>
    Math.abs(option - value) < Math.abs(closest - value) ? option : closest,
  );
}

export function normalizeCardsV1BookEndWidth(value: unknown): CardsV1BookEndWidth {
  if (isCardsV1BookEndFullWidth(value)) return "full";
  if (typeof value === "number") return normalizeCardsV1BookEndWidthPx(value);
  return defaultCardsV1BookEndWidthPx;
}

export const cardsV1CardBorderRadiusOptions = [0, 8, 12, 16, 24, 32, 40, 48] as const;
export const cardsV1CardBorderWidthOptions = [0, 1, 2, 3, 4, 6, 8, 12] as const;

export type CardsV1CardBorderWidthPx = (typeof cardsV1CardBorderWidthOptions)[number];

export function normalizeCardsV1CardBorderWidthPx(value: number): CardsV1CardBorderWidthPx {
  if (cardsV1CardBorderWidthOptions.includes(value as CardsV1CardBorderWidthPx)) {
    return value as CardsV1CardBorderWidthPx;
  }

  return cardsV1CardBorderWidthOptions.reduce((closest, option) =>
    Math.abs(option - value) < Math.abs(closest - value) ? option : closest,
  );
}

export type CardsV1CardBorderRadiusPx = (typeof cardsV1CardBorderRadiusOptions)[number];

export function normalizeCardsV1CardBorderRadiusPx(value: number): CardsV1CardBorderRadiusPx {
  if (cardsV1CardBorderRadiusOptions.includes(value as CardsV1CardBorderRadiusPx)) {
    return value as CardsV1CardBorderRadiusPx;
  }

  return cardsV1CardBorderRadiusOptions.reduce((closest, option) =>
    Math.abs(option - value) < Math.abs(closest - value) ? option : closest,
  );
}

export const cardsV1Variants: CardsV1Variant[] = ["dark", "medium", "light", "accent"];

export const defaultCardsV1Cards: CardsV1Card[] = [
  {
    id: "cards-v1-residential",
    title: "Residential Washing",
    subtitle: "",
    imageSrc: "/osp/pic-pressure3.jpeg",
    variant: "dark",
  },
  {
    id: "cards-v1-commercial",
    title: "Commercial Washing",
    subtitle: "",
    imageSrc: "/osp/pic-commercial3.jpeg",
    variant: "medium",
  },
  {
    id: "cards-v1-organic",
    title: "Organic Growth Management",
    subtitle: "",
    imageSrc: "/osp/Organic_management.jpeg",
    variant: "light",
  },
];

export const defaultCardsV1PreviewSettings: CardsV1PreviewSettings = {
  heading: "SERVICES",
  headingColor: defaultCardsV1HeadingColor,
  showDivider: false,
  cardBorderRadiusPx: defaultCardsV1CardBorderRadiusPx,
  cardBorderWidthPx: defaultCardsV1CardBorderWidthPx,
  cardBorderColor: "",
  showBookEnds: false,
  bookEndWidthPx: defaultCardsV1BookEndWidthPx,
  layoutWidth: "full",
  labelFontStyle: "italic",
  subtitleColor: defaultCardsV1SubtitleColor,
  backgroundFrom: "",
  backgroundTo: "",
  backgroundDirection: "none",
  outerBackgroundColor: "",
  cards: defaultCardsV1Cards,
};

export const cardsV1GradientDirections = previewGradientDirections;

export function getCardsV1BackgroundStyle(settings: CardsV1PreviewSettings): string | undefined {
  const from = settings.backgroundFrom?.trim();
  if (!from) return undefined;
  const to = settings.backgroundTo?.trim() || from;
  const direction = settings.backgroundDirection ?? "none";
  return getPreviewGradientBackground(from, to, direction);
}

export function nextCardsV1Variant(index: number): CardsV1Variant {
  return cardsV1Variants[index % cardsV1Variants.length] ?? "dark";
}
