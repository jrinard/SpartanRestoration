"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeaderBrandLinkProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/** Logo home link — disabled on /playground so editing isn't interrupted. */
export function HeaderBrandLink({ children, className, style }: HeaderBrandLinkProps) {
  const isPlayground = usePathname() === "/playground";

  if (isPlayground) {
    return (
      <span
        className={cn(className, "cursor-default")}
        style={style}
        aria-label="Home logo (link disabled in playground)"
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
