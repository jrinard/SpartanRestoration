import {
  defaultHeroButtonPreviewSettings,
  type ButtonPreviewSettings,
} from "@/lib/button-preview";
import {
  defaultHeroV21BackgroundSettings,
  type HeroV21BackgroundSettings,
} from "@/lib/hero-v21-background-preview";

export type HeroV21PreviewSettings = {
  button: ButtonPreviewSettings;
  background: HeroV21BackgroundSettings;
};

export const defaultHeroV21PreviewSettings: HeroV21PreviewSettings = {
  button: defaultHeroButtonPreviewSettings,
  background: defaultHeroV21BackgroundSettings,
};
