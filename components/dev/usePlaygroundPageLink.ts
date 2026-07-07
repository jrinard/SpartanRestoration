"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useOptionalPlaygroundSections } from "@/components/dev/PlaygroundSectionsProvider";
import {
  findPlaygroundPageByHref,
  getPlaygroundPreviewPath,
  loadPlaygroundPagesState,
  resolvePreviewNavHref,
  setActivePlaygroundPageInStorage,
} from "@/lib/playground-pages";
import { scrollToHashHref } from "@/lib/scroll-to-hash";

export function usePreviewPathSlug(): string | undefined {
  const pathname = usePathname();
  if (pathname === "/preview") return undefined;
  if (pathname.startsWith("/preview/")) {
    return pathname.slice("/preview/".length).split("/")[0] || undefined;
  }
  return undefined;
}

export function usePlaygroundPageLink() {
  const pathname = usePathname();
  const router = useRouter();
  const playground = useOptionalPlaygroundSections();

  return useCallback(
    (href: string, event: React.MouseEvent<HTMLAnchorElement>) => {
      if (scrollToHashHref(href)) {
        event.preventDefault();
        return;
      }

      const isPlayground = pathname === "/playground";
      const isPreview = pathname === "/preview" || pathname.startsWith("/preview/");
      if (!isPlayground && !isPreview) return;

      const pages =
        playground?.ready && playground.pages.length > 0
          ? playground.pages
          : loadPlaygroundPagesState().pages;

      const page = findPlaygroundPageByHref(pages, href);
      if (!page) return;

      event.preventDefault();

      if (isPlayground && playground?.ready) {
        playground.setActivePageId(page.id);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const targetPath = getPlaygroundPreviewPath(page);
      setActivePlaygroundPageInStorage(page.id);
      if (pathname !== targetPath) {
        router.push(targetPath);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [pathname, playground, router],
  );
}

export function usePlaygroundNavLinkHref() {
  const pathname = usePathname();

  return useCallback(
    (href: string) => {
      const isPreview = pathname === "/preview" || pathname.startsWith("/preview/");
      if (!isPreview) return href;

      return resolvePreviewNavHref(href);
    },
    [pathname],
  );
}
