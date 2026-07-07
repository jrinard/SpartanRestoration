import {
  defaultHeroV21BackgroundSettings,
  type HeroV21BackgroundSettings,
} from "@/lib/hero-v21-background-preview";
import { washingHero } from "@/lib/demo-content";

export type HeroBannerTransition = "fade" | "slide";

export type HeroBannerSlide = {
  type: "image" | "color";
  value: string;
};

export type HeroBannerPreviewSettings = {
  background: HeroV21BackgroundSettings;
  intervalMs: number;
  transition: HeroBannerTransition;
  slides: HeroBannerSlide[];
  /** Banner section height (px). */
  heightPx: number;
};

export const defaultHeroBannerHeightPx = 520;

export const heroBannerHeightOptions = [
  240, 280, 320, 360, 400, 440, 480, 520, 560, 600, 640, 720, 800,
] as const;

export const defaultHeroBannerSlides: HeroBannerSlide[] = [
  { type: "image", value: washingHero.backgroundImage },
  { type: "color", value: "#000000" },
  { type: "color", value: "#4d82b8" },
];

export const defaultHeroBannerPreviewSettings: HeroBannerPreviewSettings = {
  background: defaultHeroV21BackgroundSettings,
  intervalMs: 5000,
  transition: "fade",
  slides: defaultHeroBannerSlides,
  heightPx: defaultHeroBannerHeightPx,
};

export const heroBannerTransitions: { value: HeroBannerTransition; label: string }[] = [
  { value: "fade", label: "Fade" },
  { value: "slide", label: "Slide" },
];
