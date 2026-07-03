import {
  defaultButtonBorderRadiusPx,
  defaultButtonPreviewSettings,
  type ButtonPreviewSettings,
} from "@/lib/button-preview";

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
  const lines = value
    .filter((line): line is string => typeof line === "string")
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length > 0 ? lines : undefined;
}

export function parseTextImageHeadlineDraft(draft: string): string[] {
  return draft
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function resolveTextImageContent(
  defaults: TextImageContent,
  settings: TextImagePreviewSettings,
): TextImageContent {
  return {
    eyebrow: settings.contentEyebrow?.trim() || defaults.eyebrow,
    headlineLines:
      settings.contentHeadlineLines && settings.contentHeadlineLines.length > 0
        ? settings.contentHeadlineLines
        : defaults.headlineLines,
    body: settings.contentBody?.trim() || defaults.body,
    sidebarText: settings.contentSidebarText?.trim() || defaults.sidebarText,
    phoneLabel: settings.contentPhoneLabel?.trim() || defaults.phoneLabel,
    phoneHref: settings.contentPhoneHref?.trim() || defaults.phoneHref,
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
