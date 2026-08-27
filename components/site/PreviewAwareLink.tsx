"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import {
  useHashNavigationClick,
  useResolvePlaygroundHref,
} from "@/components/dev/useHashNavigation";

type PreviewAwareLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

/** Internal links that should stay under /preview while browsing staging. */
export function PreviewAwareLink({ href, onClick, ...props }: PreviewAwareLinkProps) {
  const resolveHref = useResolvePlaygroundHref();
  const handleHashNavigation = useHashNavigationClick();

  return (
    <Link
      {...props}
      href={resolveHref(href)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          handleHashNavigation(href, event);
        }
      }}
    />
  );
}
