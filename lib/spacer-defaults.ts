import type { ColorThemeId } from "@/lib/color-themes";
import type { SpacerStripeStyle } from "@/components/sections/Spacer";

/** Solid divider grey per playground color theme */
const spacerStripeColorByTheme: Record<ColorThemeId, string> = {
  dark: "#8888A0",
  lifespring: "#4a4a4a",
  light: "#5C5C72",
  stone: "#8F684F",
  spartan: "#748B9F",
  ocean: "#56616A",
};

export function getDefaultSpacerStripeStyle(colorThemeId: ColorThemeId): SpacerStripeStyle {
  const color = spacerStripeColorByTheme[colorThemeId] ?? spacerStripeColorByTheme.dark;

  return {
    from: color,
    to: color,
    direction: "none",
    mode: "linear",
    heightPx: 3,
  };
}
