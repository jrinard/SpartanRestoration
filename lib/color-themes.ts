export type ColorThemeId = "dark" | "lifespring" | "light" | "stone" | "spartan" | "ocean";

export type ThemeColorSwatch = {
  label: string;
  hex: string;
};

export type ColorTheme = {
  id: ColorThemeId;
  label: string;
  colors: ThemeColorSwatch[];
  /** Optional override; defaults to theme label when not LifeSpring. */
  headerWordmark?: string;
};

export const colorThemes: ColorTheme[] = [
  {
    id: "dark",
    label: "Dark-Space",
    colors: [
      { label: "Background", hex: "#06060E" },
      { label: "Surface", hex: "#0F0F1A" },
      { label: "Foreground", hex: "#E8E8F0" },
      { label: "Muted", hex: "#8888A0" },
      { label: "Purple", hex: "#A855F7" },
      { label: "Blue", hex: "#3A8BD0" },
      { label: "Green", hex: "#5A9E3F" },
    ],
  },
  {
    id: "lifespring",
    label: "LifeSpring",
    colors: [
      { label: "Base", hex: "#030303" },
      { label: "Surface", hex: "#1B1B1B" },
      { label: "Text", hex: "#FFFFFF" },
      { label: "Subtext", hex: "#4D82B8" },
      { label: "Blue", hex: "#0955A3" },
      { label: "Blue light", hex: "#4D82B8" },
      { label: "Green", hex: "#2D6500" },
      { label: "Green light", hex: "#85A33F" },
    ],
  },
  {
    id: "light",
    label: "Light",
    colors: [
      { label: "Background", hex: "#F6F5FA" },
      { label: "Surface", hex: "#FFFFFF" },
      { label: "Foreground", hex: "#12121C" },
      { label: "Muted", hex: "#5C5C72" },
      { label: "Accent", hex: "#2563EB" },
      { label: "Accent deep", hex: "#1E5799" },
      { label: "Footer", hex: "#EEF4FA" },
    ],
  },
  {
    id: "stone",
    label: "Stone",
    colors: [
      { label: "Cream", hex: "#FAF0E0" },
      { label: "Blush", hex: "#F4E0CD" },
      { label: "Tan", hex: "#E7CAB2" },
      { label: "Sand", hex: "#E6D5B5" },
      { label: "Terracotta", hex: "#C48564" },
      { label: "Brown", hex: "#8F684F" },
    ],
  },
  {
    id: "spartan",
    label: "Spartan",
    colors: [
      { label: "Light", hex: "#EDDED8" },
      { label: "Tan", hex: "#CCA384" },
      { label: "Slate", hex: "#748B9F" },
      { label: "Slate mid", hex: "#5D7894" },
      { label: "Navy", hex: "#243348" },
      { label: "Black", hex: "#000000" },
      { label: "Gold", hex: "#F3C35D" },
      { label: "Bronze", hex: "#B48130" },
      { label: "Blue", hex: "#2C73B5" },
    ],
  },
  {
    id: "ocean",
    label: "Ocean",
    colors: [
      { label: "Light grey", hex: "#E2E6E7" },
      { label: "Cyan", hex: "#78E7FD" },
      { label: "Blue", hex: "#006ECA" },
      { label: "Navy", hex: "#003C90" },
      { label: "Medium grey", hex: "#777A7C" },
      { label: "Dark grey", hex: "#56616A" },
    ],
  },
];

export const defaultColorThemeId: ColorThemeId = "dark";

export function getColorTheme(id: ColorThemeId | string): ColorTheme {
  const normalizedId = id === "washing" ? "ocean" : id;
  return colorThemes.find((theme) => theme.id === normalizedId) ?? colorThemes[0];
}

export function getThemeColors(id: ColorThemeId | string): ThemeColorSwatch[] {
  return getColorTheme(id).colors;
}
