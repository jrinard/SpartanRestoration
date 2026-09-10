/** Site-wide contained content width. */
export const siteContainedMaxWidthClass = "max-w-[1600px]";

export const siteContainedPaddingClass = "px-6 lg:px-8";

export function getSiteContainedLayoutClassName(): string {
  return `mx-auto w-full ${siteContainedMaxWidthClass} ${siteContainedPaddingClass}`;
}

/** Contained column without horizontal padding — pairs with `siteContainedPaddingClass` on inner content. */
export function getSiteContainedShellClassName(): string {
  return `mx-auto w-full ${siteContainedMaxWidthClass}`;
}

export type SiteLayoutWidth = "contained" | "full";

export function isSiteLayoutWidth(value: unknown): value is SiteLayoutWidth {
  return value === "contained" || value === "full";
}

export function normalizeOptionalLayoutWidthMobile(
  value: unknown,
): SiteLayoutWidth | undefined {
  return isSiteLayoutWidth(value) ? value : undefined;
}

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

/** Mobile width when set; otherwise matches desktop (legacy org JSON). */
export function resolveLayoutWidthMobile(
  layoutWidth: SiteLayoutWidth,
  layoutWidthMobile?: SiteLayoutWidth,
): SiteLayoutWidth {
  return layoutWidthMobile ?? layoutWidth;
}

/** True when either breakpoint uses contained (outer-background chrome). */
export function layoutUsesContainedWidth(
  layoutWidth: SiteLayoutWidth,
  layoutWidthMobile?: SiteLayoutWidth,
): boolean {
  const mobile = resolveLayoutWidthMobile(layoutWidth, layoutWidthMobile);
  return layoutWidth === "contained" || mobile === "contained";
}

/**
 * Tailwind width classes for shell chrome (top bar, header, nav, spacer).
 * Desktop breakpoint: `lg` (1024px). Missing `layoutWidthMobile` = same as desktop.
 */
export function getResponsiveSiteLayoutWidthClassName(
  layoutWidth: SiteLayoutWidth,
  layoutWidthMobile?: SiteLayoutWidth,
): string {
  const mobile = resolveLayoutWidthMobile(layoutWidth, layoutWidthMobile);

  if (mobile === layoutWidth) {
    return getSiteLayoutWidthClassName(layoutWidth);
  }

  const base = "mx-auto w-full";

  if (mobile === "full" && layoutWidth === "contained") {
    return `${base} max-w-none px-0 lg:max-w-[1600px] lg:px-6 xl:px-8`;
  }

  if (mobile === "contained" && layoutWidth === "full") {
    return `${base} max-w-[1600px] px-6 xl:px-8 lg:max-w-none lg:px-0`;
  }

  return getSiteLayoutWidthClassName(layoutWidth);
}
