export type PortfolioSectionTheme = "dark" | "light";

export type PortfolioProject = {
  title: string;
  tags: string;
  description?: string;
  stack?: string;
  href?: string;
  imageSrc?: string;
  imageAlt?: string;
};

export type PortfolioPreviewSettings = {
  theme: PortfolioSectionTheme;
  heading?: string;
  projects?: PortfolioProject[];
  brandingProjects?: PortfolioProject[];
  ctaLabel?: string;
  ctaHref?: string;
};

export const defaultPortfolioPreviewSettings: PortfolioPreviewSettings = {
  theme: "dark",
  heading: "Projects",
  projects: [],
  brandingProjects: [],
};

export const portfolioSectionThemes: { value: PortfolioSectionTheme; label: string }[] = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];
