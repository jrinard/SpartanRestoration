export type PortfolioSectionTheme = "dark" | "light";

export type PortfolioPreviewSettings = {
  theme: PortfolioSectionTheme;
};

export const defaultPortfolioPreviewSettings: PortfolioPreviewSettings = {
  theme: "dark",
};

export const portfolioSectionThemes: { value: PortfolioSectionTheme; label: string }[] = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];
