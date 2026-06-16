import Image from "next/image";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

/** Theme-aware logo — white on dark, black on light/stone. */
export function BrandLogo({
  className,
  width = 200,
  height = 70,
  priority,
}: BrandLogoProps) {
  const imgClass = cn("h-14 w-auto", className);

  return (
    <span className="relative inline-flex leading-none">
      <Image
        src={siteConfig.assets.logoWhite}
        alt={siteConfig.name}
        width={width}
        height={height}
        className={cn(imgClass, "brand-logo-light")}
        priority={priority}
      />
      <Image
        src={siteConfig.assets.logoBlack}
        alt={siteConfig.name}
        width={width}
        height={height}
        className={cn(imgClass, "brand-logo-dark")}
        priority={priority}
      />
    </span>
  );
}
