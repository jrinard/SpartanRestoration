import {
  getPreviewGradientBackground,
  previewGradientDirections,
  type PreviewGradientDirection,
} from "@/lib/preview-gradient";
import {
  siteContainedMaxWidthClass,
  siteLayoutWidthOptions,
  type SiteLayoutWidth,
} from "@/lib/site-layout";

export type FooterV1PreviewSettings = {
  /** Business name under the logo. */
  brandNameColor: string;
  /** Tagline / description blurb. */
  taglineColor: string;
  navColor: string;
  navHoverColor: string;
  /** "Contact" heading and team member names. */
  contactHeadingColor: string;
  /** Phone numbers and service area. */
  contactTextColor: string;
  contactLinkHoverColor: string;
  contactButtonBgColor: string;
  contactButtonHoverBgColor: string;
  contactButtonTextColor: string;
  mainBackgroundFrom: string;
  mainBackgroundTo: string;
  mainBackgroundDirection: PreviewGradientDirection;
  bottomBarBackgroundColor: string;
  bottomBarTextColor: string;
  /** Contact heading, names, and phone numbers. */
  contactTextSizeEm: number;
  layoutWidth: SiteLayoutWidth;
  /** Extra horizontal inset for contained content. */
  contentInsetPx: number;
  /** Full-width background behind the main area (visible in contained mode). */
  outerBackgroundColor: string;
};

export const defaultFooterV1OuterBackgroundColor = "#e8ecf0";

export const footerV1ContentInsetOptions = [0, 16, 24, 32, 48, 64, 80, 96, 128] as const;

export type FooterV1ContentInsetPx = (typeof footerV1ContentInsetOptions)[number];

export function snapFooterV1ContentInsetPx(value: number): FooterV1ContentInsetPx {
  if (footerV1ContentInsetOptions.some((option) => option === value)) {
    return value as FooterV1ContentInsetPx;
  }

  return footerV1ContentInsetOptions.reduce((closest, option) =>
    Math.abs(option - value) < Math.abs(closest - value) ? option : closest,
  );
}

export { siteLayoutWidthOptions as footerV1LayoutWidthOptions };

export const defaultFooterV1ContactTextSizeEm = 1.25;

export const footerV1ContactTextSizeOptions = [0.5, 0.65, 0.75, 0.85, 1, 1.2, 1.25, 1.5, 1.75, 2] as const;

export type FooterV1ContactTextSizeEm = (typeof footerV1ContactTextSizeOptions)[number];

export function isFooterV1ContactTextSizeEm(value: number): value is FooterV1ContactTextSizeEm {
  return footerV1ContactTextSizeOptions.some((option) => Math.abs(option - value) < 0.001);
}

export function snapFooterV1ContactTextSizeEm(value: number): FooterV1ContactTextSizeEm {
  if (isFooterV1ContactTextSizeEm(value)) return value;

  return footerV1ContactTextSizeOptions.reduce((closest, option) =>
    Math.abs(option - value) < Math.abs(closest - value) ? option : closest,
  );
}

export function formatFooterV1ContactTextSizeEm(value: number): string {
  return `${value}em`;
}

export const defaultFooterV1PreviewSettings: FooterV1PreviewSettings = {
  brandNameColor: "#243348",
  taglineColor: "#5d7894",
  navColor: "#243348",
  navHoverColor: "#000000",
  contactHeadingColor: "#243348",
  contactTextColor: "#5d7894",
  contactLinkHoverColor: "#243348",
  contactButtonBgColor: "#f3c35d",
  contactButtonHoverBgColor: "#efc25b",
  contactButtonTextColor: "#243348",
  mainBackgroundFrom: "#ffffff",
  mainBackgroundTo: "#ffffff",
  mainBackgroundDirection: "none",
  bottomBarBackgroundColor: "#f3c35d",
  bottomBarTextColor: "#243348",
  contactTextSizeEm: defaultFooterV1ContactTextSizeEm,
  layoutWidth: "contained",
  contentInsetPx: 48,
  outerBackgroundColor: defaultFooterV1OuterBackgroundColor,
};

export { previewGradientDirections as footerV1GradientDirections };

export function getFooterV1MainBackground(settings: FooterV1PreviewSettings): string {
  return getPreviewGradientBackground(
    settings.mainBackgroundFrom,
    settings.mainBackgroundTo,
    settings.mainBackgroundDirection,
  );
}

export function getFooterV1CssVariables(
  settings: FooterV1PreviewSettings,
): Record<string, string> {
  return {
    "--footer-v1-brand-name-color": settings.brandNameColor,
    "--footer-v1-tagline-color": settings.taglineColor,
    "--footer-v1-nav-color": settings.navColor,
    "--footer-v1-nav-hover": settings.navHoverColor,
    "--footer-v1-contact-heading-color": settings.contactHeadingColor,
    "--footer-v1-contact-text-color": settings.contactTextColor,
    "--footer-v1-contact-link-hover": settings.contactLinkHoverColor,
    "--footer-v1-contact-btn-bg": settings.contactButtonBgColor,
    "--footer-v1-contact-btn-hover-bg": settings.contactButtonHoverBgColor,
    "--footer-v1-contact-btn-color": settings.contactButtonTextColor,
    "--footer-v1-bottom-bg": settings.bottomBarBackgroundColor,
    "--footer-v1-bottom-color": settings.bottomBarTextColor,
    "--footer-v1-contact-text-size": formatFooterV1ContactTextSizeEm(
      snapFooterV1ContactTextSizeEm(settings.contactTextSizeEm),
    ),
  };
}

export function getFooterV1LayoutWidthClassName(layoutWidth: SiteLayoutWidth): string {
  if (layoutWidth === "full") {
    return "mx-auto w-full max-w-none";
  }

  return `mx-auto w-full ${siteContainedMaxWidthClass}`;
}
