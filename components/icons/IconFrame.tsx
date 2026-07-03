import type { CSSProperties } from "react";
import { SiteIcon } from "@/components/icons/SiteIcon";
import {
  getIconFrameBorderRadiusPx,
  getIconFrameBoxSizePx,
  getIconFrameIconSizePx,
  resolveIconFrameShape,
  resolveIconFrameSize,
  type IconFrameContext,
  type IconFrameShape,
  type IconFrameSize,
} from "@/lib/icon-frame-preview";
import type { SiteIconName } from "@/lib/site-icons";
import { cn } from "@/lib/utils";

type IconFrameProps = {
  iconName: SiteIconName;
  shape: IconFrameShape;
  size?: IconFrameSize;
  iconColor: string;
  borderColor: string;
  backgroundColor: string;
  context: IconFrameContext;
  className?: string;
  strokeWidth?: number;
};

export function IconFrame({
  iconName,
  shape,
  size,
  iconColor,
  borderColor,
  backgroundColor,
  context,
  className,
  strokeWidth = 1.75,
}: IconFrameProps) {
  const resolvedShape = resolveIconFrameShape(shape);
  const resolvedSize = resolveIconFrameSize(size);
  const iconSizePx = getIconFrameIconSizePx(context, resolvedShape, resolvedSize);

  if (resolvedShape === "none") {
    return (
      <SiteIcon
        name={iconName}
        size={iconSizePx}
        color={iconColor}
        strokeWidth={strokeWidth}
        className={className}
        aria-hidden
      />
    );
  }

  const boxSizePx = getIconFrameBoxSizePx(context, resolvedShape, resolvedSize);
  const frameStyle: CSSProperties = {
    width: `${boxSizePx}px`,
    height: `${boxSizePx}px`,
    borderRadius: `${getIconFrameBorderRadiusPx(resolvedShape)}px`,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor,
    backgroundColor,
    color: iconColor,
  };

  return (
    <span
      className={cn("icon-frame flex shrink-0 items-center justify-center", className)}
      style={frameStyle}
      aria-hidden="true"
    >
      <SiteIcon
        name={iconName}
        size={iconSizePx}
        color={iconColor}
        strokeWidth={strokeWidth}
        aria-hidden
      />
    </span>
  );
}
