import {
  defaultTextImageButtonSettings,
  defaultTextImagesV1Theme,
  getTextImageColorsForTheme,
  normalizeTextImageHeadlineLines,
  textImageDarkTheme,
  type TextImagePreviewSettings,
  type TextImageSectionTheme,
  type TextImageTextColors,
} from "@/lib/text-image-preview";
import type { ButtonPreviewSettings } from "@/lib/button-preview";
import { phoneTelHref } from "@/lib/phone";

export type TextImagesRow1Content = {
  eyebrow: string;
  headlineLines: string[];
  body: string;
  imageSrc: string;
  imageAlt: string;
};

export type TextImagesStandardRowContent = {
  title: string;
  body: string;
  imageSrc: string;
  imageAlt: string;
};

export type TextImagesRow3Content = TextImagesStandardRowContent & {
  phoneLabel: string;
  phoneHref: string;
};

export type TextImagesContent = {
  row1: TextImagesRow1Content;
  row2: TextImagesStandardRowContent;
  row3: TextImagesRow3Content;
};

export type TextImagesPreviewSettings = TextImageTextColors &
  Pick<
    TextImagePreviewSettings,
    | "theme"
    | "entranceAnimationEnabled"
    | "entranceAnimationSpeedMs"
    | "phoneButtonMarginTopPx"
    | "navBackground"
    | "navTextColor"
    | "navTextHoverColor"
    | "navHoverBackground"
    | "navButtonSize"
    | "navButtonRadiusPx"
  > & {
    /** Top padding on row 1 text column (px). */
    row1CopyPaddingTopPx: number;
    /** Top padding on row 2 text column (px). */
    row2CopyPaddingTopPx: number;
    /** Top padding on row 3 text column (px). */
    row3CopyPaddingTopPx: number;
    /** Section outer padding top (px). */
    sectionPaddingTopPx: number;
    /** Section outer padding bottom (px). */
    sectionPaddingBottomPx: number;
    /** Vertical alignment of row 1 text vs image (desktop side-by-side). */
    row1CopyVerticalAlign: TextImagesCopyVerticalAlign;
    row2CopyVerticalAlign: TextImagesCopyVerticalAlign;
    row3CopyVerticalAlign: TextImagesCopyVerticalAlign;
    contentRow1Eyebrow?: string;
    contentRow1HeadlineLines?: string[];
    contentRow1Body?: string;
    contentRow1ImageSrc?: string;
    contentRow1ImageAlt?: string;
    contentRow2Title?: string;
    contentRow2Body?: string;
    contentRow2ImageSrc?: string;
    contentRow2ImageAlt?: string;
    contentRow3Title?: string;
    contentRow3Body?: string;
    contentRow3PhoneLabel?: string;
    contentRow3PhoneHref?: string;
    contentRow3ImageSrc?: string;
    contentRow3ImageAlt?: string;
    /** @deprecated Use contentRow3PhoneLabel */
    contentRow1PhoneLabel?: string;
    /** @deprecated Use contentRow3PhoneHref */
    contentRow1PhoneHref?: string;
  };

function resolveContentString(override: string | undefined, defaultValue: string): string {
  return override !== undefined ? override : defaultValue;
}

function resolveImageSrc(override: string | undefined, defaultValue: string): string {
  const trimmed = override?.trim();
  return trimmed || defaultValue;
}

function resolveImageAlt(override: string | undefined, defaultValue: string): string {
  const trimmed = override?.trim();
  return trimmed || defaultValue;
}

export function resolveTextImagesContent(
  defaults: TextImagesContent,
  settings: TextImagesPreviewSettings,
): TextImagesContent {
  const row3PhoneLabel = resolveContentString(
    settings.contentRow3PhoneLabel ?? settings.contentRow1PhoneLabel,
    defaults.row3.phoneLabel,
  );

  return {
    row1: {
      eyebrow: resolveContentString(settings.contentRow1Eyebrow, defaults.row1.eyebrow),
      headlineLines:
        settings.contentRow1HeadlineLines !== undefined
          ? settings.contentRow1HeadlineLines
          : defaults.row1.headlineLines,
      body: resolveContentString(settings.contentRow1Body, defaults.row1.body),
      imageSrc: resolveImageSrc(settings.contentRow1ImageSrc, defaults.row1.imageSrc),
      imageAlt: resolveImageAlt(settings.contentRow1ImageAlt, defaults.row1.imageAlt),
    },
    row2: {
      title: resolveContentString(settings.contentRow2Title, defaults.row2.title),
      body: resolveContentString(settings.contentRow2Body, defaults.row2.body),
      imageSrc: resolveImageSrc(settings.contentRow2ImageSrc, defaults.row2.imageSrc),
      imageAlt: resolveImageAlt(settings.contentRow2ImageAlt, defaults.row2.imageAlt),
    },
    row3: {
      title: resolveContentString(settings.contentRow3Title, defaults.row3.title),
      body: resolveContentString(settings.contentRow3Body, defaults.row3.body),
      phoneLabel: row3PhoneLabel,
      phoneHref:
        settings.contentRow3PhoneLabel !== undefined ||
        settings.contentRow1PhoneLabel !== undefined
          ? (settings.contentRow3PhoneHref ?? settings.contentRow1PhoneHref)?.trim() ||
            (row3PhoneLabel ? phoneTelHref(row3PhoneLabel) : "")
          : defaults.row3.phoneHref,
      imageSrc: resolveImageSrc(settings.contentRow3ImageSrc, defaults.row3.imageSrc),
      imageAlt: resolveImageAlt(settings.contentRow3ImageAlt, defaults.row3.imageAlt),
    },
  };
}

export const defaultTextImagesPreviewSettings: TextImagesPreviewSettings = {
  theme: defaultTextImagesV1Theme,
  ...textImageDarkTheme,
  ...defaultTextImageButtonSettings,
  entranceAnimationEnabled: true,
  entranceAnimationSpeedMs: 800,
  phoneButtonMarginTopPx: 32,
  row1CopyPaddingTopPx: 0,
  row2CopyPaddingTopPx: 0,
  row3CopyPaddingTopPx: 0,
  sectionPaddingTopPx: 80,
  sectionPaddingBottomPx: 65,
  row1CopyVerticalAlign: "top",
  row2CopyVerticalAlign: "center",
  row3CopyVerticalAlign: "top",
};

export function getDefaultTextImagesColorsForTheme(
  theme: TextImageSectionTheme,
): TextImageTextColors {
  return getTextImageColorsForTheme(theme);
}

export function pickTextImagesButtonSettings(
  settings: TextImagesPreviewSettings,
): ButtonPreviewSettings {
  return {
    navBackground: settings.navBackground,
    navTextColor: settings.navTextColor,
    navTextHoverColor: settings.navTextHoverColor,
    navHoverBackground: settings.navHoverBackground,
    navButtonSize: settings.navButtonSize,
    navButtonRadiusPx: settings.navButtonRadiusPx,
  };
}

export { defaultTextImagesV1Theme } from "@/lib/text-image-preview";

export { normalizeTextImageHeadlineLines as normalizeTextImagesHeadlineLines };

export type TextImagesCopyVerticalAlign = "top" | "center" | "bottom";

export const textImagesCopyVerticalAlignOptions: {
  value: TextImagesCopyVerticalAlign;
  label: string;
}[] = [
  { value: "top", label: "Top" },
  { value: "center", label: "Center" },
  { value: "bottom", label: "Bottom" },
];

export function isTextImagesCopyVerticalAlign(
  value: unknown,
): value is TextImagesCopyVerticalAlign {
  return value === "top" || value === "center" || value === "bottom";
}

/** Grid cross-axis alignment for text + image rows (desktop). */
export function getTextImagesRowAlignClassName(align: TextImagesCopyVerticalAlign): string {
  switch (align) {
    case "center":
      return "items-start lg:items-center";
    case "bottom":
      return "items-start lg:items-end";
    default:
      return "items-start";
  }
}

/** Shared px steps for section / row spacing in Text and Images. */
export const textImagesCopyPaddingTopOptions = [
  0, 8, 16, 24, 32, 40, 41, 48, 56, 64, 65, 72, 80, 96, 112, 128, 144, 160,
] as const;

export type TextImagesCopyPaddingTopPx = (typeof textImagesCopyPaddingTopOptions)[number];

export function snapTextImagesCopyPaddingTopPx(value: number): TextImagesCopyPaddingTopPx {
  if (
    textImagesCopyPaddingTopOptions.includes(
      value as TextImagesCopyPaddingTopPx,
    )
  ) {
    return value as TextImagesCopyPaddingTopPx;
  }

  return textImagesCopyPaddingTopOptions.reduce((closest, option) =>
    Math.abs(option - value) < Math.abs(closest - value) ? option : closest,
  );
}
