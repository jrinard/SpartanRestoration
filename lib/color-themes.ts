export type ColorThemeId =
  | "dark"
  | "lifespring"
  | "light"
  | "stone"
  | "spartan"
  | "ocean"
  | "langham";

export type ThemeColorSwatch = {
  label: string;
  hex: string;
};

export type ColorTheme = {
  id: ColorThemeId;
  label: string;
  colors: ThemeColorSwatch[];
  /** Canvas color behind sections when no page-background override is set. */
  pageBackground: string;
  /** Optional override; defaults to theme label when not LifeSpring. */
  headerWordmark?: string;
  /** Fallback folder when an org has no themeFolder — e.g. stone → public/stone/images/ */
  assetFolder?: string;
};

export const colorThemes: ColorTheme[] = [
  {
    id: "dark",
    label: "Dark-Space",
    pageBackground: "#06060e",
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
    assetFolder: "lsd",
    pageBackground: "#030303",
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
    pageBackground: "#f6f5fa",
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
    pageBackground: "#faf0e0",
    colors: [
      { label: "Cream", hex: "#FAF0E0" },
      { label: "Sand", hex: "#FAD6AC" },
      { label: "Peach", hex: "#DEA48A" },
      { label: "Coral", hex: "#C7635B" },
      { label: "Amber", hex: "#E88E3B" },
      { label: "Brown", hex: "#8F684F" },
      { label: "Charcoal", hex: "#232525" },
    ],
  },
  {
    id: "spartan",
    label: "Spartan",
    pageBackground: "#edded8",
    colors: [
      { label: "Navy", hex: "#2E4359" },
      { label: "Black", hex: "#000000" },
      { label: "Gold", hex: "#F3C35D" },
      { label: "Bronze", hex: "#B48130" },
      { label: "Blue", hex: "#2C73B5" },
    ],
  },
  {
    id: "ocean",
    label: "Ocean",
    pageBackground: "#e2e6e7",
    colors: [
      { label: "Light grey", hex: "#E2E6E7" },
      { label: "Cyan", hex: "#78E7FD" },
      { label: "Blue", hex: "#006ECA" },
      { label: "Navy", hex: "#003C90" },
      { label: "Medium grey", hex: "#777A7C" },
      { label: "Dark grey", hex: "#56616A" },
    ],
  },
  {
    id: "langham",
    label: "Langham",
    headerWordmark: "Langham Construction",
    pageBackground: "#f8f8f6",
    colors: [
      { label: "Yellow", hex: "#F7AA0A" },
      { label: "Yellow light", hex: "#FFC233" },
      { label: "Black", hex: "#171718" },
      { label: "Charcoal", hex: "#101011" },
      { label: "Grey", hex: "#535353" },
      { label: "Off white", hex: "#F8F8F6" },
    ],
  },
];

export const defaultColorThemeId: ColorThemeId = "spartan";

export function getColorTheme(id: ColorThemeId | string): ColorTheme {
  const normalizedId = id === "washing" ? "ocean" : id;
  return colorThemes.find((theme) => theme.id === normalizedId) ?? colorThemes[0];
}

export function getThemeColors(id: ColorThemeId | string): ThemeColorSwatch[] {
  return getColorTheme(id).colors;
}

export function getThemePageBackground(id: ColorThemeId | string): string {
  return getColorTheme(id).pageBackground;
}

const pageBackgroundHex = /^#[0-9a-fA-F]{6}$/;

/** `#rrggbb` page-canvas override, or undefined to use the theme default. */
export function normalizePageBackgroundColor(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return pageBackgroundHex.test(trimmed) ? trimmed.toLowerCase() : undefined;
}

/** Fallback folder when an org has no themeFolder — e.g. stone → public/stone/images/ */
export function getImageLibraryFolderForColorTheme(id: ColorThemeId | string): string {
  const theme = getColorTheme(id);
  return theme.assetFolder ?? theme.id;
}
