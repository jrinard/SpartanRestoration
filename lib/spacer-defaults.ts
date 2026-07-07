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
    overlap: false,
  };
}

/** Spacer-v2 — horizontal gradient band, light grey left to black right. */
export function getDefaultSpacerV2StripeStyle(colorThemeId: ColorThemeId): SpacerStripeStyle {
  const from =
    colorThemeId === "spartan"
      ? "#748B9F"
      : colorThemeId === "dark"
        ? "#8888A0"
        : "#56616A";

  return {
    from,
    to: "#000000",
    direction: "to right",
    mode: "linear",
    heightPx: 40,
    overlap: false,
  };
}

export function getDefaultSpacerStripeStyleForVariant(
  variantId: string | undefined,
  colorThemeId: ColorThemeId,
): SpacerStripeStyle {
  if (variantId === "spacer-v2") {
    return getDefaultSpacerV2StripeStyle(colorThemeId);
  }

  return getDefaultSpacerStripeStyle(colorThemeId);
}
