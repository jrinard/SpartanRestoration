import { siteConfig } from "@/config/site";
import type { HeaderV3LogoVariant } from "@/lib/header-v3-gradient";

export function getLifeSpringLogoSrc(variant: HeaderV3LogoVariant): string {
  switch (variant) {
    case "white":
      return siteConfig.assets.logoWhite;
    case "black":
      return siteConfig.assets.logoBlack;
    case "color":
      return siteConfig.assets.logoColor;
  }
}
