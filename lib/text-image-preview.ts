import {
  defaultButtonBorderRadiusPx,
  defaultButtonPreviewSettings,
  type ButtonPreviewSettings,
} from "@/lib/button-preview";
import { phoneTelHref } from "@/lib/phone";

export type TextImageSectionTheme = "light" | "dark";

export type TextImageTextColors = {
  backgroundColor: string;
  eyebrowColor: string;
  headlineColor: string;
  bodyColor: string;
  sidebarTextColor: string;
};

export type TextImagePreviewSettings = TextImageTextColors &
  ButtonPreviewSettings & {
    theme: TextImageSectionTheme;
    /** Fade-in animation for the image. */
    entranceAnimationEnabled: boolean;
    /** Entrance animation duration (ms). */
    entranceAnimationSpeedMs: number;
    /** When true, image column is left and text column is right. */
    layoutInverted: boolean;
    /** Space above the phone CTA on the text column. */
    phoneButtonMarginTopPx: number;
    /** Playground copy overrides. */
    contentEyebrow?: string;
    contentHeadlineLines?: string[];
    contentBody?: string;
    contentSidebarText?: string;
    contentPhoneLabel?: string;
    contentPhoneHref?: string;
    contentImageSrc?: string;
    contentImageAlt?: string;
  };

export type TextImageContent = {
  eyebrow: string;
  headlineLines: string[];
  body: string;
  sidebarText: string;
  phoneLabel: string;
  phoneHref: string;
  imageSrc: string;
  imageAlt: string;
};

export function normalizeTextImageHeadlineLines(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  if (value.length === 0) return [];

  const lines = value
    .filter((line): line is string => typeof line === "string")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines;
}

export function parseTextImageHeadlineDraft(draft: string): string[] {
  return draft
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function resolveContentString(override: string | undefined, defaultValue: string): string {
  return override !== undefined ? override : defaultValue;
}

export function resolveTextImageContent(
  defaults: TextImageContent,
  settings: TextImagePreviewSettings,
): TextImageContent {
  const phoneLabel = resolveContentString(settings.contentPhoneLabel, defaults.phoneLabel);

  return {
    eyebrow: resolveContentString(settings.contentEyebrow, defaults.eyebrow),
    headlineLines:
      settings.contentHeadlineLines !== undefined
        ? settings.contentHeadlineLines
        : defaults.headlineLines,
    body: resolveContentString(settings.contentBody, defaults.body),
    sidebarText: resolveContentString(settings.contentSidebarText, defaults.sidebarText),
    phoneLabel,
    phoneHref:
      settings.contentPhoneLabel !== undefined
        ? settings.contentPhoneHref?.trim() ||
          (phoneLabel ? phoneTelHref(phoneLabel) : "")
        : defaults.phoneHref,
    imageSrc: settings.contentImageSrc?.trim() || defaults.imageSrc,
    imageAlt: settings.contentImageAlt?.trim() || defaults.imageAlt,
  };
}

export const textImageEntranceSpeedOptions = [
  { value: 500, label: "Fast" },
  { value: 800, label: "Medium" },
  { value: 1200, label: "Slow" },
  { value: 1600, label: "Very Slow" },
] as const;

export type TextImageEntranceSpeedMs = (typeof textImageEntranceSpeedOptions)[number]["value"];

export const textImageEntranceSpeedValues = textImageEntranceSpeedOptions.map(
  (option) => option.value,
);

export const textImageLightTheme: TextImageTextColors = {
  backgroundColor: "#ffffff",
  eyebrowColor: "#56616A",
  headlineColor: "#000000",
  bodyColor: "#333333",
  sidebarTextColor: "#333333",
};

export const textImageDarkTheme: TextImageTextColors = {
  backgroundColor: "#12121c",
  eyebrowColor: "rgba(255, 255, 255, 0.65)",
  headlineColor: "#ffffff",
  bodyColor: "rgba(255, 255, 255, 0.78)",
  sidebarTextColor: "rgba(255, 255, 255, 0.78)",
};

export const textImageSectionThemes: { value: TextImageSectionTheme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export function getTextImageColorsForTheme(theme: TextImageSectionTheme): TextImageTextColors {
  return theme === "dark" ? textImageDarkTheme : textImageLightTheme;
}

export const defaultTextImageV1Theme: TextImageSectionTheme = "light";
export const defaultTextImagesV1Theme: TextImageSectionTheme = "dark";

/** When the active theme differs from the section default, sample images are CSS-inverted. */
export function shouldInvertTextImageForTheme(
  theme: TextImageSectionTheme,
  defaultTheme: TextImageSectionTheme,
): boolean {
  return theme !== defaultTheme;
}

export const textImagePhoneButtonMarginOptions = [
  0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128,
] as const;

export type TextImagePhoneButtonMarginPx = (typeof textImagePhoneButtonMarginOptions)[number];

export const defaultTextImagePhoneButtonMarginTopPx: TextImagePhoneButtonMarginPx = 32;

export const defaultTextImageButtonSettings: ButtonPreviewSettings = {
  ...defaultButtonPreviewSettings,
  navBackground: "#2C73B5",
  navTextColor: "#ffffff",
  navTextHoverColor: "#ffffff",
  navHoverBackground: "#243348",
  navButtonSize: "large",
  navButtonRadiusPx: defaultButtonBorderRadiusPx,
};

export const defaultTextImagePreviewSettings: TextImagePreviewSettings = {
  theme: "light",
  ...textImageLightTheme,
  ...defaultTextImageButtonSettings,
  entranceAnimationEnabled: true,
  entranceAnimationSpeedMs: 800,
  layoutInverted: false,
  phoneButtonMarginTopPx: defaultTextImagePhoneButtonMarginTopPx,
};

export function pickTextImageButtonSettings(
  settings: TextImagePreviewSettings,
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
