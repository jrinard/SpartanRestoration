import type { CSSProperties } from "react";
import type { SiteLayoutWidth } from "@/lib/site-layout";
import { getSiteLayoutWidthClassName } from "@/lib/site-layout";
import type { PortfolioSectionTheme } from "@/lib/portfolio-preview";
import {
  defaultPortfolioV2SampleImage,
  type PortfolioV2ModalImage,
} from "@/lib/portfolio-v2-preview";

export { portfolioSectionThemes } from "@/lib/portfolio-preview";
export type { PortfolioSectionTheme };

export type PortfolioV3WallStyle = "cube" | "masonry";

export type PortfolioV3Card = {
  id: string;
  imageSrc: string;
  imageAlt: string;
  /** Modal heading — defaults to alt text. */
  title?: string;
  /** Short line under the thumbnail when captions are enabled. */
  caption?: string;
  modalImages?: PortfolioV2ModalImage[];
};

export type PortfolioV3PreviewSettings = {
  theme: PortfolioSectionTheme;
  layoutWidth: SiteLayoutWidth;
  /** Uniform square grid vs staggered column masonry. */
  wallStyle: PortfolioV3WallStyle;
  /** Gap between cards (px). */
  cardGapPx: number;
  cardBorderRadiusPx: number;
  /** Masonry / grid column count on large screens. */
  columnCount: number;
  sectionPaddingTopPx: number;
  sectionPaddingBottomPx: number;
  cardHoverScale: number;
  sectionHeading?: string;
  sectionDescription?: string;
  sectionDescriptionColor?: string;
  /** Intro copy sits left of the wall on large screens when enabled. */
  copyOnLeft: boolean;
  /** Blue (or custom) call bar under intro copy. */
  phoneBarVisible: boolean;
  phoneBarBackgroundColor: string;
  phoneBarTextColor: string;
  contentPhoneLabel?: string;
  contentPhoneHref?: string;
  /** Show per-card caption text under thumbnails. */
  captionsVisible: boolean;
  cards: PortfolioV3Card[];
};

export const defaultPortfolioV3SectionHeading = "Project gallery";
export const defaultPortfolioV3SectionDescription =
  "Browse recent work. Select a photo to view it larger.";

export const defaultPortfolioV3CardGapPx = 10;
export const defaultPortfolioV3CardBorderRadiusPx = 0;
export const defaultPortfolioV3ColumnCount = 3;
export const defaultPortfolioV3HoverScale = 1.04;

export const defaultPortfolioV3PhoneBarBackground = "#2C73B5";
export const defaultPortfolioV3PhoneBarTextColor = "#ffffff";
export const defaultPortfolioV3PhoneLabel = "Call now";

export function createPortfolioV3CardId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `portfolio-v3-card-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `portfolio-v3-card-${Date.now().toString(36)}`;
}

function createDefaultCard(index: number): PortfolioV3Card {
  return {
    id: createPortfolioV3CardId(),
    imageSrc: defaultPortfolioV2SampleImage,
    imageAlt: `Gallery photo ${index + 1}`,
  };
}

export const defaultPortfolioV3Cards: PortfolioV3Card[] = [
  createDefaultCard(0),
  createDefaultCard(1),
  createDefaultCard(2),
  createDefaultCard(3),
  createDefaultCard(4),
  createDefaultCard(5),
];

export const defaultPortfolioV3PreviewSettings: PortfolioV3PreviewSettings = {
  theme: "dark",
  layoutWidth: "contained",
  wallStyle: "masonry",
  cardGapPx: defaultPortfolioV3CardGapPx,
  cardBorderRadiusPx: defaultPortfolioV3CardBorderRadiusPx,
  columnCount: defaultPortfolioV3ColumnCount,
  sectionPaddingTopPx: 48,
  sectionPaddingBottomPx: 64,
  cardHoverScale: defaultPortfolioV3HoverScale,
  copyOnLeft: true,
  phoneBarVisible: false,
  phoneBarBackgroundColor: defaultPortfolioV3PhoneBarBackground,
  phoneBarTextColor: defaultPortfolioV3PhoneBarTextColor,
  captionsVisible: false,
  cards: defaultPortfolioV3Cards,
};

export function clampPortfolioV3HoverScale(value: number): number {
  return Math.min(1.12, Math.max(1, value));
}

export function getPortfolioV3LayoutWidthClassName(layoutWidth: SiteLayoutWidth): string {
  return getSiteLayoutWidthClassName(layoutWidth);
}

export function getPortfolioV3SectionDescriptionColor(settings: PortfolioV3PreviewSettings): string {
  if (settings.sectionDescriptionColor?.trim()) return settings.sectionDescriptionColor.trim();
  return settings.theme === "light" ? "#000000" : "#ffffff";
}

export function getPortfolioV3CssVariables(settings: PortfolioV3PreviewSettings): CSSProperties {
  return {
    "--portfolio-v3-gap": `${settings.cardGapPx}px`,
    "--portfolio-v3-radius": `${settings.cardBorderRadiusPx}px`,
    "--portfolio-v3-columns": String(Math.max(1, Math.min(6, settings.columnCount))),
    "--portfolio-v3-hover-scale": String(clampPortfolioV3HoverScale(settings.cardHoverScale)),
    "--portfolio-v3-intro-color": getPortfolioV3SectionDescriptionColor(settings),
    "--portfolio-v3-phone-bar-bg": settings.phoneBarBackgroundColor,
    "--portfolio-v3-phone-bar-color": settings.phoneBarTextColor,
  } as CSSProperties;
}

export function resolvePortfolioV3PhoneLabel(settings: PortfolioV3PreviewSettings): string {
  return settings.contentPhoneLabel?.trim() || defaultPortfolioV3PhoneLabel;
}

export function resolvePortfolioV3PhoneHref(
  settings: PortfolioV3PreviewSettings,
  label: string,
): string {
  const href = settings.contentPhoneHref?.trim();
  if (href) return href;
  const digits = label.replace(/\D/g, "");
  return digits ? `tel:+1${digits}` : "tel:";
}

export function resolvePortfolioV3CardModalImages(card: PortfolioV3Card): PortfolioV2ModalImage[] {
  if (card.modalImages && card.modalImages.length > 0) {
    return card.modalImages;
  }
  return [
    {
      id: `${card.id}-modal`,
      imageSrc: card.imageSrc,
      imageAlt: card.imageAlt,
    },
  ];
}

export function resolvePortfolioV3CardModalTitle(card: PortfolioV3Card): string {
  const title = card.title?.trim();
  if (title) return title;
  const alt = card.imageAlt.trim();
  if (alt) return alt;
  return "Photo";
}

export const portfolioV3WallStyleOptions: { value: PortfolioV3WallStyle; label: string }[] = [
  { value: "cube", label: "Cube grid" },
  { value: "masonry", label: "Masonry / brick" },
];

/** Merge gallery copy from committed config when Forge localStorage is stale. */
export function mergePortfolioV3FromCommitted(
  local: PortfolioV3PreviewSettings,
  disk: PortfolioV3PreviewSettings,
): PortfolioV3PreviewSettings {
  let changed = false;
  const next: PortfolioV3PreviewSettings = { ...local, cards: local.cards.map((card) => ({ ...card })) };

  if (disk.captionsVisible !== local.captionsVisible) {
    next.captionsVisible = disk.captionsVisible;
    changed = true;
  }

  if (disk.phoneBarVisible !== local.phoneBarVisible) {
    next.phoneBarVisible = disk.phoneBarVisible;
    changed = true;
  }
  if (disk.contentPhoneLabel !== local.contentPhoneLabel && disk.contentPhoneLabel?.trim()) {
    next.contentPhoneLabel = disk.contentPhoneLabel;
    changed = true;
  }
  if (disk.contentPhoneHref !== local.contentPhoneHref && disk.contentPhoneHref?.trim()) {
    next.contentPhoneHref = disk.contentPhoneHref;
    changed = true;
  }

  const diskById = new Map(disk.cards.map((card) => [card.id, card]));
  next.cards = local.cards.map((card) => {
    const diskCard = diskById.get(card.id);
    const diskCaption = diskCard?.caption?.trim();
    if (!diskCaption) return card;
    if (card.caption?.trim() === diskCaption) return card;
    changed = true;
    return { ...card, caption: diskCard!.caption };
  });

  return changed ? next : local;
}
