import {
  defaultHeaderButtonPreviewSettings,
  getButtonPreviewStyleRecord,
  pickButtonPreviewSettings,
  type ButtonPreviewSize,
} from "@/lib/button-preview";

export type HeaderV3NavButtonSize = ButtonPreviewSize;

export type HeaderV3LogoVariant = "white" | "black" | "color";

export type HeaderV3LayoutWidth = "contained" | "full";

export type HeaderV3PreviewSettings = {
  from: string;
  to: string;
  navBackground: string;
  navTextColor: string;
  navTextHoverColor: string;
  navHoverBackground: string;
  navButtonSize: HeaderV3NavButtonSize;
  logoVariant: HeaderV3LogoVariant;
  layoutWidth: HeaderV3LayoutWidth;
};

/** Matches LifeSpring header-v3 defaults. */
export const defaultHeaderV3PreviewSettings: HeaderV3PreviewSettings = {
  from: "#1b1b1b",
  to: "#030303",
  ...defaultHeaderButtonPreviewSettings,
  logoVariant: "color",
  layoutWidth: "contained",
};

export const headerV3NavButtonSizes: { value: HeaderV3NavButtonSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

export const headerV3LogoVariants: { value: HeaderV3LogoVariant; label: string }[] = [
  { value: "white", label: "White" },
  { value: "black", label: "Black" },
  { value: "color", label: "Color" },
];

export const headerV3LayoutWidths: { value: HeaderV3LayoutWidth; label: string }[] = [
  { value: "contained", label: "Contained" },
  { value: "full", label: "Full width" },
];

export function getHeaderV3InnerClassName(layoutWidth: HeaderV3LayoutWidth): string {
  const base = "mx-auto w-full pt-5 pb-2.5 lg:pt-6 lg:pb-3";

  if (layoutWidth === "full") {
    return `${base} max-w-none px-10 lg:px-16 xl:px-20`;
  }

  return `${base} max-w-6xl px-6 lg:px-8`;
}

/** @deprecated Use HeaderV3PreviewSettings */
export type HeaderV3NavGradient = Pick<HeaderV3PreviewSettings, "from" | "to">;

/** @deprecated Use defaultHeaderV3PreviewSettings */
export const defaultHeaderV3NavGradient: HeaderV3NavGradient = {
  from: defaultHeaderV3PreviewSettings.from,
  to: defaultHeaderV3PreviewSettings.to,
};

export function getHeaderV3NavBackground({ from, to }: Pick<HeaderV3PreviewSettings, "from" | "to">): string {
  return `linear-gradient(to left, color-mix(in srgb, white 14%, ${from}) 0%, color-mix(in srgb, white 5%, ${from}) 28%, ${from} 72%, ${to} 100%)`;
}

export function getHeaderV3NavBarStyleRecord(
  settings: HeaderV3PreviewSettings,
): Record<string, string> {
  return {
    background: getHeaderV3NavBackground(settings),
    ...getButtonPreviewStyleRecord(pickButtonPreviewSettings(settings)),
  };
}
