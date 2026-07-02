import {
  getPreviewGradientBackground,
  previewGradientDirections,
  type PreviewGradientDirection,
} from "@/lib/preview-gradient";
import type { SiteLayoutWidth } from "@/lib/site-layout";

export type TextIconsV3PreviewSettings = {
  backgroundFrom: string;
  backgroundTo: string;
  backgroundDirection: PreviewGradientDirection;
  layoutWidth: SiteLayoutWidth;
  /** Full-width background behind the section (visible in contained mode). */
  outerBackgroundColor: string;
  headingColor: string;
  subheadingColor: string;
};

export const defaultTextIconsV3OuterBackgroundColor = "#ffffff";

export const defaultTextIconsV3PreviewSettings: TextIconsV3PreviewSettings = {
  backgroundFrom: "#000000",
  backgroundTo: "#000000",
  backgroundDirection: "none",
  layoutWidth: "full",
  outerBackgroundColor: defaultTextIconsV3OuterBackgroundColor,
  headingColor: "#ffffff",
  subheadingColor: "#bfbfbf",
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

export function getTextIconsV3CssVariables(
  settings: TextIconsV3PreviewSettings,
): Record<string, string> {
  return {
    "--text-icons-v3-heading-color": settings.headingColor,
    "--text-icons-v3-subheading-color": settings.subheadingColor,
  };
}
