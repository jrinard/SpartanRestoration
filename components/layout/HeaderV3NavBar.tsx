"use client";

import type { CSSProperties, ReactNode } from "react";
import { useHeaderV3Preview } from "@/components/dev/HeaderV3PreviewContext";
import { getHeaderV3NavBarStyleRecord } from "@/lib/header-v3-gradient";
import { cn } from "@/lib/utils";

type HeaderV3NavBarProps = {
  className?: string;
  children: ReactNode;
};

export function HeaderV3NavBar({ className, children }: HeaderV3NavBarProps) {
  const preview = useHeaderV3Preview();

  const style: CSSProperties | undefined = preview
    ? getHeaderV3NavBarStyleRecord(preview.settings)
    : undefined;

  return (
    <div
      className={cn("header-v3-nav-bar", preview && "header-v3-nav-bar--custom", className)}
      style={style}
      data-nav-button-size={preview?.settings.navButtonSize}
    >
      {children}
    </div>
  );
}
