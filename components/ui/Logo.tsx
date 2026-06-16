import Image from "next/image";
import { siteConfig } from "@/config/site";
import { getAssetUrl } from "@/lib/assets";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  width: number;
  height: number;
  style?: React.CSSProperties;
  priority?: boolean;
};

export function Logo({ className, width, height, style, priority }: LogoProps) {
  const src = getAssetUrl(siteConfig.assets.logo);

  return (
    <Image
      src={src}
      alt={siteConfig.name}
      width={width}
      height={height}
      className={cn(className)}
      style={style}
      priority={priority}
    />
  );
}
