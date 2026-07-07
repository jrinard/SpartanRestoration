/** Site-wide contained content width. */
export const siteContainedMaxWidthClass = "max-w-[1600px]";

export const siteContainedPaddingClass = "px-6 lg:px-8";

export function getSiteContainedLayoutClassName(): string {
  return `mx-auto w-full ${siteContainedMaxWidthClass} ${siteContainedPaddingClass}`;
}

export type SiteLayoutWidth = "contained" | "full";

export const siteLayoutWidthOptions: { value: SiteLayoutWidth; label: string }[] = [
  { value: "contained", label: "Contained" },
  { value: "full", label: "Full width" },
];

export function getSiteLayoutWidthClassName(layoutWidth: SiteLayoutWidth): string {
  const base = "mx-auto w-full";

  if (layoutWidth === "full") {
    return `${base} max-w-none`;
  }

  return getSiteContainedLayoutClassName();
}
