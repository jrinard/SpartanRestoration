import { heroDemo } from "@/lib/demo-content";

export type HeroV1PreviewSettings = {
  headline: string;
  subtext: string;
  ctaLabel: string;
  buttonColor: string;
};

export const defaultHeroV1PreviewSettings: HeroV1PreviewSettings = {
  headline: heroDemo.headline,
  subtext: heroDemo.subtext,
  ctaLabel: heroDemo.ctaLabel,
  buttonColor: "#c9a227",
};
