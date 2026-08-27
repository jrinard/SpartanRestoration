import { heroDemo } from "@/lib/demo-content";

export type HeroV1PreviewSettings = {
  headline: string;
  subtext: string;
  ctaLabel: string;
  buttonColor: string;
};

export const defaultHeroV1PreviewSettings: HeroV1PreviewSettings = {
  get headline() {
    return heroDemo.headline;
  },
  get subtext() {
    return heroDemo.subtext;
  },
  get ctaLabel() {
    return heroDemo.ctaLabel;
  },
  buttonColor: "#c9a227",
};
