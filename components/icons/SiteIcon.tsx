import {
  defaultSiteIconName,
  resolveSiteIconName,
  siteIconCatalog,
  type SiteIconName,
} from "@/lib/site-icons";
import { cn } from "@/lib/utils";

type SiteIconProps = {
  name?: SiteIconName | string | null;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
};

/** Renders a curated Lucide icon by catalog id — reusable across sections. */
export function SiteIcon({
  name,
  size = 24,
  color = "currentColor",
  strokeWidth = 1.75,
  className,
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden,
}: SiteIconProps) {
  const resolvedName = resolveSiteIconName(name, defaultSiteIconName);
  const { Icon } = siteIconCatalog[resolvedName];

  return (
    <Icon
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={cn("shrink-0", className)}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden ?? (ariaLabel ? undefined : true)}
    />
  );
}
