import {
  getPreviewGradientBackground,
  previewGradientDirections,
  type PreviewGradientDirection,
} from "@/lib/preview-gradient";
import type { CSSProperties } from "react";
import type { SiteLayoutWidth } from "@/lib/site-layout";
import type { SiteIconName } from "@/lib/site-icons";
import {
  defaultIconFrameShape,
  defaultIconFrameSize,
  type IconFramePreviewSettings,
} from "@/lib/icon-frame-preview";

export type TextIconsV3PreviewSettings = IconFramePreviewSettings & {
  backgroundFrom: string;
  backgroundTo: string;
  backgroundDirection: PreviewGradientDirection;
  /** Optional library image layered over the gradient background. */
  backgroundImageSrc?: string;
  layoutWidth: SiteLayoutWidth;
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
  itemTitles: Partial<Record<string, string>>;
  itemDescriptions: Partial<Record<string, string>>;
};

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

export function getTextIconsV3CssVariables(
  settings: TextIconsV3PreviewSettings,
): Record<string, string> {
  return {
    "--text-icons-v3-heading-color": settings.headingColor,
    "--text-icons-v3-subheading-color": settings.subheadingColor,
    "--text-icons-v3-icon-color": settings.iconColor,
    "--text-icons-v3-icon-border-color": settings.iconBorderColor,
    "--text-icons-v3-icon-background-color": settings.iconBackgroundColor,
  };
}
