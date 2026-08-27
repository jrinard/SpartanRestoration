import type { CSSProperties } from "react";

export type HeroV21BackgroundSettings = {
  from: string;
  to: string;
  /** 0–100 — scales the default gradient wash strength. */
  intensity: number;
};

/** Matches the built-in hero-v21-bg CSS at 50% intensity. */
export const defaultHeroV21BackgroundSettings: HeroV21BackgroundSettings = {
  from: "#ffffff",
  to: "#4d82b8",
  intensity: 50,
};

/** Gradient shape — shared by default CSS and preview controls. */
export const heroV21BackgroundGradientStops = {
  radialEllipse: "95% 85%",
  radialCenter: "50% 0%",
  radialFade: "82%",
  linearMid: "38%",
  linearFade: "88%",
} as const;

/** Max color-mix % at intensity 100. At 50% intensity, mix is 20% of these values. */
const HERO_V21_GRADIENT_MIX_MAX = {
  radial: 15,
  start: 12.5,
  mid: 7.5,
} as const;

/** Maps slider 0–100 to mix % — subtle 0–50, stronger headroom 50–100. */
function heroV21GradientMix(intensity: number, max: number): string {
  if (intensity <= 0) return "0";
  if (intensity <= 50) {
    return (max * 0.2 * (intensity / 50)).toFixed(2);
  }
  return (max * (0.2 + 0.8 * ((intensity - 50) / 50))).toFixed(2);
}

export function getHeroV21BackgroundStyle(
  settings: HeroV21BackgroundSettings,
): CSSProperties | undefined {
  const { from, to, intensity } = settings;
  if (intensity <= 0) {
    return { background: "none" };
  }

  const radialMix = heroV21GradientMix(intensity, HERO_V21_GRADIENT_MIX_MAX.radial);
  const startMix = heroV21GradientMix(intensity, HERO_V21_GRADIENT_MIX_MAX.start);
  const midMix = heroV21GradientMix(intensity, HERO_V21_GRADIENT_MIX_MAX.mid);
  const { radialEllipse, radialCenter, radialFade, linearMid, linearFade } =
    heroV21BackgroundGradientStops;

  return {
    background: `radial-gradient(ellipse ${radialEllipse} at ${radialCenter}, color-mix(in srgb, ${to} ${radialMix}%, transparent) 0%, transparent ${radialFade}), linear-gradient(to bottom, color-mix(in srgb, ${from} ${startMix}%, transparent) 0%, color-mix(in srgb, ${to} ${midMix}%, transparent) ${linearMid}, transparent ${linearFade})`,
  };
}
