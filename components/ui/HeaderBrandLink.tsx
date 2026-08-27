"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { isForgePathname } from "@/lib/forge";

type HeaderBrandLinkProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/** Logo home link — disabled on /forge so editing isn't interrupted. */
export function HeaderBrandLink({ children, className, style }: HeaderBrandLinkProps) {
  const isPlayground = isForgePathname(usePathname());

  if (isPlayground) {
    return (
      <span
        className={cn(className, "cursor-default")}
        style={style}
        aria-label="Home logo (link disabled in Forge)"
      >
        {children}
      </span>
    );
  }

  return (
    <Link href="/" className={className} style={style}>
      {children}
    </Link>
  );
}
