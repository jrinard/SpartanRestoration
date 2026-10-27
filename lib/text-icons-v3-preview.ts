import {
  getPreviewGradientBackground,
  previewGradientDirections,
  type PreviewGradientDirection,
} from "@/lib/preview-gradient";
import type { CSSProperties } from "react";
import {
  getResponsiveSiteLayoutWidthClassName,
  getSiteContainedShellClassName,
  resolveLayoutWidthMobile,
  type SiteLayoutWidth,
} from "@/lib/site-layout";
import type { SiteIconName } from "@/lib/site-icons";
import {
  defaultIconFrameShape,
  defaultIconFrameSize,
  type IconFramePreviewSettings,
} from "@/lib/icon-frame-preview";

export type TextIconsV3Item = {
  id: string;
  title: string;
  description: string;
  icon?: SiteIconName;
};

export type TextIconsV3PreviewSettings = IconFramePreviewSettings & {
  backgroundFrom: string;
  backgroundTo: string;
  backgroundDirection: PreviewGradientDirection;
  /** Optional library image layered over the gradient background. */
  backgroundImageSrc?: string;
  layoutWidth: SiteLayoutWidth;
  /** When unset, mobile matches `layoutWidth` (legacy org JSON). */
  layoutWidthMobile?: SiteLayoutWidth;
  /** Full-width background behind the section (visible in contained mode). */
  outerBackgroundColor: string;
  headingColor: string;
  subheadingColor: string;
  iconColor: string;
  iconBorderColor: string;
  iconBackgroundColor: string;
  /** Playground icon overrides keyed by item id. */
  itemIcons: Partial<Record<string, SiteIconName>>;
  /** Playground copy overrides. */
  contentHeading?: string;
  contentSubheading?: string;
  /** Optional section `id` for footer/nav hash links (e.g. warranty). */
  anchorId?: string;
  itemTitles: Partial<Record<string, string>>;
  itemDescriptions: Partial<Record<string, string>>;
  /**
   * Optional card list. Missing keeps the section's built-in items.
   * Explicit `[]` is a saved empty grid.
   */
  items?: TextIconsV3Item[];
  /** When true, each item renders in a bordered card (legacy orgs omit this). */
  itemBoxBorderEnabled?: boolean;
  itemBoxBorderColor?: string;
  itemBoxBorderRadiusPx?: number;
  /** Caps grid width (px) — useful with boxed items on wide layouts. */
  itemsGridMaxWidthPx?: number;
  /** Auto-fit columns across full section width; wrap only when cells hit min width. */
  itemsGridFluid?: boolean;
  /** Min column width (px) when `itemsGridFluid` is on. */
  itemsGridFluidMinPx?: number;
};

export const defaultTextIconsV3ItemBoxBorderColor = "rgba(255, 255, 255, 0.35)";
export const defaultTextIconsV3ItemBoxBorderRadiusPx = 12;

export const defaultTextIconsV3OuterBackgroundColor = "#ffffff";

export const defaultTextIconsV3IconColor = "#f3c35d";
export const defaultTextIconsV3IconBorderColor = "rgba(243, 195, 93, 0.55)";
export const defaultTextIconsV3IconBackgroundColor = "rgba(243, 195, 93, 0.12)";

export const defaultTextIconsV3PreviewSettings: TextIconsV3PreviewSettings = {
  backgroundFrom: "#000000",
  backgroundTo: "#000000",
  backgroundDirection: "none",
  backgroundImageSrc: "",
  layoutWidth: "full",
  outerBackgroundColor: defaultTextIconsV3OuterBackgroundColor,
  headingColor: "#ffffff",
  subheadingColor: "#bfbfbf",
  iconColor: defaultTextIconsV3IconColor,
  iconBorderColor: defaultTextIconsV3IconBorderColor,
  iconBackgroundColor: defaultTextIconsV3IconBackgroundColor,
  iconFrameShape: defaultIconFrameShape,
  iconFrameSize: defaultIconFrameSize,
  itemIcons: {},
  itemTitles: {},
  itemDescriptions: {},
};

export { previewGradientDirections as textIconsV3GradientDirections };

/** Shell width for the section — inner content carries horizontal padding. */
export function getTextIconsV3ShellClassName(
  layoutWidth: SiteLayoutWidth,
  layoutWidthMobile?: SiteLayoutWidth,
): string {
  const mobile = resolveLayoutWidthMobile(layoutWidth, layoutWidthMobile);

  if (layoutWidth === "contained" && mobile === "contained") {
    return getSiteContainedShellClassName();
  }

  return getResponsiveSiteLayoutWidthClassName(layoutWidth, layoutWidthMobile);
}

export function getTextIconsV3BackgroundStyle(
  settings: TextIconsV3PreviewSettings,
): string {
  return getPreviewGradientBackground(
    settings.backgroundFrom,
    settings.backgroundTo,
    settings.backgroundDirection,
  );
}

/** Section fill — gradient and/or library image (matches header v2 bar layering). */
export function getTextIconsV3InnerBackgroundStyle(
  settings: TextIconsV3PreviewSettings,
): CSSProperties {
  const gradient = getTextIconsV3BackgroundStyle(settings);
  const imageSrc = settings.backgroundImageSrc?.trim() ?? "";

  if (imageSrc) {
    return {
      backgroundColor: settings.backgroundFrom,
      backgroundImage: `url("${imageSrc}"), ${gradient}`,
      backgroundSize: "cover, auto",
      backgroundPosition: "center, center",
      backgroundRepeat: "no-repeat, no-repeat",
    };
  }

  return { background: gradient };
}

export function getTextIconsV3SectionId(
  settings: TextIconsV3PreviewSettings,
): string | undefined {
  const id = settings.anchorId?.trim().replace(/^#/, "") ?? "";
  return id || undefined;
}

export function getTextIconsV3CssVariables(
  settings: TextIconsV3PreviewSettings,
): Record<string, string> {
  const vars: Record<string, string> = {
    "--text-icons-v3-heading-color": settings.headingColor,
    "--text-icons-v3-subheading-color": settings.subheadingColor,
    "--text-icons-v3-icon-color": settings.iconColor,
    "--text-icons-v3-icon-border-color": settings.iconBorderColor,
    "--text-icons-v3-icon-background-color": settings.iconBackgroundColor,
  };

  if (settings.itemBoxBorderEnabled) {
    vars["--text-icons-v3-item-box-border-color"] =
      settings.itemBoxBorderColor?.trim() || defaultTextIconsV3ItemBoxBorderColor;
    vars["--text-icons-v3-item-box-radius"] = `${settings.itemBoxBorderRadiusPx ?? defaultTextIconsV3ItemBoxBorderRadiusPx}px`;
  }

  if (settings.itemsGridMaxWidthPx && settings.itemsGridMaxWidthPx > 0) {
    vars["--text-icons-v3-grid-max-width"] = `${Math.round(settings.itemsGridMaxWidthPx)}px`;
  }

  if (settings.itemsGridFluid) {
    const minPx =
      settings.itemsGridFluidMinPx && settings.itemsGridFluidMinPx > 0
        ? Math.round(settings.itemsGridFluidMinPx)
        : 176;
    vars["--text-icons-v3-fluid-min"] = `${minPx}px`;
  }

  return vars;
}

/** Settings `items` when present; otherwise the section's built-in cards. */
export function resolveTextIconsV3Items(
  settings: TextIconsV3PreviewSettings,
  fallback: readonly TextIconsV3Item[],
): TextIconsV3Item[] {
  const source = settings.items !== undefined ? settings.items : fallback;
  return source.map((item, index) => {
    const id = item.id.trim() || `item-${index + 1}`;
    return {
      id,
      title: settings.itemTitles?.[id] ?? item.title,
      description: settings.itemDescriptions?.[id] ?? item.description,
      icon: settings.itemIcons?.[id] ?? item.icon,
    };
  });
}

export function patchTextIconsV3Item(
  settings: TextIconsV3PreviewSettings,
  itemId: string,
  patch: Partial<Pick<TextIconsV3Item, "title" | "description" | "icon">>,
): TextIconsV3PreviewSettings {
  const items = settings.items?.map((item) =>
    item.id === itemId ? { ...item, ...patch } : item,
  );

  return {
    ...settings,
    ...(items ? { items } : {}),
    ...(patch.icon
      ? { itemIcons: { ...settings.itemIcons, [itemId]: patch.icon } }
      : {}),
    ...(patch.title !== undefined
      ? { itemTitles: { ...settings.itemTitles, [itemId]: patch.title } }
      : {}),
    ...(patch.description !== undefined
      ? {
          itemDescriptions: {
            ...settings.itemDescriptions,
            [itemId]: patch.description,
          },
        }
      : {}),
  };
}
