import {
  defaultHeroButtonPreviewSettings,
  type ButtonPreviewSettings,
} from "@/lib/button-preview";
import { sandboxHeroV21Demo } from "@/lib/demo-content";
import {
  defaultHeroV21BackgroundSettings,
  type HeroV21BackgroundSettings,
} from "@/lib/hero-v21-background-preview";

export type HeroV21Highlight = {
  title: string;
  description: string;
  href?: string;
};

export type HeroV21Copy = {
  headlineLines: string[];
  subtextLines: string[];
  highlights: HeroV21Highlight[];
  ctaLabel: string;
  ctaHref: string;
};

export type HeroV21PreviewSettings = {
  button: ButtonPreviewSettings;
  background: HeroV21BackgroundSettings;
} & HeroV21Copy;

export const defaultHeroV21Copy: HeroV21Copy = {
  headlineLines: [...sandboxHeroV21Demo.headlineLines],
  subtextLines: [...sandboxHeroV21Demo.subtextLines],
  highlights: sandboxHeroV21Demo.highlights.map((item) => ({ ...item })),
  ctaLabel: sandboxHeroV21Demo.ctaLabel,
  ctaHref: sandboxHeroV21Demo.ctaHref,
};

export const defaultHeroV21PreviewSettings: HeroV21PreviewSettings = {
  button: defaultHeroButtonPreviewSettings,
  background: defaultHeroV21BackgroundSettings,
  ...defaultHeroV21Copy,
};
