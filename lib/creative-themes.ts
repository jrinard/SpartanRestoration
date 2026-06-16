export type FontThemeId = "open-sans" | "editorial" | "solid" | "impact";

export type FontTheme = {
  id: FontThemeId;
  label: string;
  sans: string;
  serif: string;
};

/** Body copy uses --font-sans; headings with font-serif use --font-serif. */
export const fontThemes: FontTheme[] = [
  {
    id: "open-sans",
    label: "Open Sans",
    sans: "var(--font-open-sans)",
    serif: "var(--font-open-sans)",
  },
  {
    id: "editorial",
    label: "Editorial",
    sans: "var(--font-lora)",
    serif: "var(--font-playfair)",
  },
  {
    id: "solid",
    label: "Solid",
    sans: "var(--font-source-sans)",
    serif: "var(--font-source-serif)",
  },
  {
    id: "impact",
    label: "Impact",
    sans: "Arial, Helvetica, system-ui, sans-serif",
    serif: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
  },
];

export const defaultFontThemeId: FontThemeId = "editorial";

const legacyThemeIds: Record<string, FontThemeId> = {
  default: "editorial",
  "clean-sans": "open-sans",
  "classic-serif": "editorial",
  "modern-inter": "open-sans",
};

export function getFontTheme(id: FontThemeId | string): FontTheme {
  const resolved = legacyThemeIds[id] ?? id;
  return fontThemes.find((theme) => theme.id === resolved) ?? fontThemes[0];
}

export const creativeStorageKeys = {
  fontTheme: "lifespring-creative-font-theme",
  colorTheme: "lifespring-creative-color-theme",
} as const;
