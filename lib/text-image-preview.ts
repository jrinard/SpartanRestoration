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
  };

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
