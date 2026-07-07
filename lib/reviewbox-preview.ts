import {
  defaultHeroV21BackgroundSettings,
  type HeroV21BackgroundSettings,
} from "@/lib/hero-v21-background-preview";

export type ReviewboxSectionTheme = "dark" | "light";

export type ReviewboxTextColors = {
  titleColor: string;
  bodyColor: string;
};

export type ReviewboxPreviewSettings = {
  theme: ReviewboxSectionTheme;
  background: HeroV21BackgroundSettings;
  titleColor: string;
  bodyColor: string;
};

export const reviewboxDarkTextColors: ReviewboxTextColors = {
  titleColor: "#ffffff",
  bodyColor: "#4d82b8",
};

export const reviewboxLightTextColors: ReviewboxTextColors = {
  titleColor: "#12121c",
  bodyColor: "#5c5c72",
};

export function getReviewboxTextColorsForTheme(theme: ReviewboxSectionTheme): ReviewboxTextColors {
  return theme === "light" ? reviewboxLightTextColors : reviewboxDarkTextColors;
}

export const defaultReviewboxPreviewSettings: ReviewboxPreviewSettings = {
  theme: "dark",
  background: defaultHeroV21BackgroundSettings,
  ...reviewboxDarkTextColors,
};

export const reviewboxSectionThemes: { value: ReviewboxSectionTheme; label: string }[] = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];
