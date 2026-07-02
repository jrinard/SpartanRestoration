import { siteConfig } from "@/config/site";
import type { ColorThemeId } from "@/lib/color-themes";
import type { HeaderV3LogoVariant } from "@/lib/header-v3-gradient";
import { getLifeSpringLogoSrc } from "@/lib/lifespring-logo";

export const spartanLogoSrc = "/spartan/SpartanLogo2.png";

export function usesLifeSpringLogo(themeId: ColorThemeId): boolean {
  return themeId === "lifespring";
}

export function getBrandLogoSrc(
  themeId: ColorThemeId,
  variant: HeaderV3LogoVariant = "color",
): string {
  if (usesLifeSpringLogo(themeId)) {
    return getLifeSpringLogoSrc(variant);
  }

  return siteConfig.assets.logo;
}
