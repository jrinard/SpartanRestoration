import {
  getPreviewGradientBackground,
  previewGradientDirections,
  type PreviewGradientDirection,
} from "@/lib/preview-gradient";
import type { CSSProperties } from "react";
import type { SiteLayoutWidth } from "@/lib/site-layout";

export type ImagesV1CardLinkTarget = "_self" | "_blank";

export type ImagesV1Card = {
  id: string;
  imageSrc: string;
  imageAlt: string;
  /** Optional external or internal URL — card image becomes a link when set. */
  linkHref?: string;
  linkTarget?: ImagesV1CardLinkTarget;
};

export type ImagesV1CardWidthMode = "natural" | "uniform";

export type ImagesV1PreviewSettings = {
  backgroundFrom: string;
  backgroundTo: string;
  backgroundDirection: PreviewGradientDirection;
  /** Optional library image layered over the gradient background. */
  backgroundImageSrc?: string;
  layoutWidth: SiteLayoutWidth;
  /** Full-width background behind the section (visible in contained mode). */
  outerBackgroundColor: string;
  cardBorderColor: string;
  cardBorderWidthPx: number;
  /** Natural = each card fits its image width; uniform = fixed width on every card. */
  cardWidthMode: ImagesV1CardWidthMode;
  cardUniformWidthPx: number;
  /** Shared height for every card row — images scale with object-contain. */
  cardUniformHeightPx: number;
  cardGapPx: number;
  topBorderEnabled: boolean;
  topBorderColor: string;
  topBorderHeightPx: number;
  bottomBorderEnabled: boolean;
  bottomBorderColor: string;
  bottomBorderHeightPx: number;
  sectionPaddingTopPx: number;
  sectionPaddingBottomPx: number;
  /** Total min-height of the section inner area; 0 = auto (padding + cards). */
  sectionHeightPx: number;
  /** Screen-reader heading and JSON-LD list name — improves section context for SEO. */
  sectionHeading?: string;
  /** Screen-reader description and JSON-LD list description. */
  sectionSeoDescription?: string;
  cards: ImagesV1Card[];
};

export const defaultImagesV1OuterBackgroundColor = "#ffffff";
export const defaultImagesV1CardBorderColor = "#000000";
export const defaultImagesV1CardBorderWidthPx = 0;
export const defaultImagesV1CardUniformWidthPx = 240;
export const defaultImagesV1CardUniformHeightPx = 180;
export const defaultImagesV1CardGapPx = 48;
export const defaultImagesV1SectionBorderColor = "#000000";
export const defaultImagesV1SectionBorderHeightPx = 2;

const stoneSampleContentImage = "/stone/library/Sample-Content-Image.png";

export const defaultImagesV1Cards: ImagesV1Card[] = [
  {
    id: "images-v1-card-1",
    imageSrc: stoneSampleContentImage,
    imageAlt: "Project photo 1",
  },
  {
    id: "images-v1-card-2",
    imageSrc: stoneSampleContentImage,
    imageAlt: "Project photo 2",
  },
  {
    id: "images-v1-card-3",
    imageSrc: stoneSampleContentImage,
    imageAlt: "Project photo 3",
  },
];

export const defaultImagesV1PreviewSettings: ImagesV1PreviewSettings = {
  backgroundFrom: "#ffffff",
  backgroundTo: "#ffffff",
  backgroundDirection: "none",
  backgroundImageSrc: "",
  layoutWidth: "full",
  outerBackgroundColor: defaultImagesV1OuterBackgroundColor,
  cardBorderColor: defaultImagesV1CardBorderColor,
  cardBorderWidthPx: defaultImagesV1CardBorderWidthPx,
  cardWidthMode: "natural",
  cardUniformWidthPx: defaultImagesV1CardUniformWidthPx,
  cardUniformHeightPx: defaultImagesV1CardUniformHeightPx,
  cardGapPx: defaultImagesV1CardGapPx,
  topBorderEnabled: false,
  topBorderColor: defaultImagesV1SectionBorderColor,
  topBorderHeightPx: defaultImagesV1SectionBorderHeightPx,
  bottomBorderEnabled: false,
  bottomBorderColor: defaultImagesV1SectionBorderColor,
  bottomBorderHeightPx: defaultImagesV1SectionBorderHeightPx,
  sectionPaddingTopPx: 2,
  sectionPaddingBottomPx: 2,
  sectionHeightPx: 0,
  cards: defaultImagesV1Cards,
};

export { previewGradientDirections as imagesV1GradientDirections };

export function getImagesV1BackgroundStyle(settings: ImagesV1PreviewSettings): string {
  return getPreviewGradientBackground(
    settings.backgroundFrom,
    settings.backgroundTo,
    settings.backgroundDirection,
  );
}

export function getImagesV1InnerBackgroundStyle(
  settings: ImagesV1PreviewSettings,
): CSSProperties {
  const gradient = getImagesV1BackgroundStyle(settings);
  const imageSrc = settings.backgroundImageSrc?.trim() ?? "";

  if (imageSrc) {
    return {
      backgroundColor: settings.backgroundFrom,
      backgroundImage: `url("${imageSrc}"), ${gradient}`,
      backgroundSize: "cover, auto",
      backgroundPosition: "center, center",
      backgroundRepeat: "no-repeat, no-repeat",
    };
  }

  return { background: gradient };
}

export function getImagesV1CardBorderStyle(
  settings: ImagesV1PreviewSettings,
): CSSProperties | undefined {
  if (settings.cardBorderWidthPx <= 0) return undefined;
  return {
    border: `${settings.cardBorderWidthPx}px solid ${settings.cardBorderColor}`,
  };
}

export function getImagesV1EffectiveCardHeightPx(settings: ImagesV1PreviewSettings): number {
  const cardHeight = settings.cardUniformHeightPx;

  if (settings.sectionHeightPx <= 0) {
    return cardHeight;
  }

  const available =
    settings.sectionHeightPx - settings.sectionPaddingTopPx - settings.sectionPaddingBottomPx;

  // Keep full card height until the section can no longer fit it — scale only as a last resort.
  if (available >= cardHeight) {
    return cardHeight;
  }

  return Math.max(1, available);
}

export function getImagesV1CssVariables(
  settings: ImagesV1PreviewSettings,
): Record<string, string> {
  return {
    "--images-v1-card-border-color": settings.cardBorderColor,
    "--images-v1-card-border-width": `${settings.cardBorderWidthPx}px`,
    "--images-v1-card-uniform-width": `${settings.cardUniformWidthPx}px`,
    "--images-v1-card-uniform-height": `${getImagesV1EffectiveCardHeightPx(settings)}px`,
    "--images-v1-card-gap": `${settings.cardGapPx}px`,
  };
}
