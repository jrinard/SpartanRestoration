import type { CSSProperties } from "react";

export type ContactBackgroundMode = "solid" | "gradient";

export type ContactPreviewSettings = {
  backgroundMode: ContactBackgroundMode;
  solidColor: string;
  gradientFrom: string;
  gradientTo: string;
  /** Gradient angle in degrees. */
  gradientAngle: number;
  /** Corner radius in pixels. */
  borderRadius: number;
  titleColor: string;
  bodyColor: string;
};

export const defaultContactPreviewSettings: ContactPreviewSettings = {
  backgroundMode: "solid",
  solidColor: "#0f0f12",
  gradientFrom: "#0f0f12",
  gradientTo: "#4d82b8",
  gradientAngle: 135,
  borderRadius: 28,
  titleColor: "#ffffff",
  bodyColor: "#a8a8b8",
};

export const contactBackgroundModes: { value: ContactBackgroundMode; label: string }[] = [
  { value: "solid", label: "Solid" },
  { value: "gradient", label: "Gradient" },
];

export function getContactCardStyle(settings: ContactPreviewSettings): CSSProperties {
  const background =
    settings.backgroundMode === "gradient"
      ? `linear-gradient(${settings.gradientAngle}deg, ${settings.gradientFrom}, ${settings.gradientTo})`
      : settings.solidColor;

  return {
    background,
    borderRadius: `${settings.borderRadius}px`,
    "--contact-title-color": settings.titleColor,
    "--contact-body-color": settings.bodyColor,
  } as CSSProperties;
}
