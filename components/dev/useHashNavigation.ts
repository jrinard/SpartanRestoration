"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useOptionalPlaygroundSections } from "@/components/dev/PlaygroundSectionsProvider";
import {
  findPlaygroundPageByHref,
  getPlaygroundPreviewPath,
  loadPlaygroundPagesState,
  setActivePlaygroundPageInStorage,
} from "@/lib/playground-pages";
import {
  navPathsMatch,
  parseNavHref,
  requestScrollToHash,
  scrollToHashHref,
  setPendingScrollHash,
} from "@/lib/scroll-to-hash";
import { usePlaygroundNavLinkHref } from "@/components/dev/usePlaygroundPageLink";

export function useResolvePlaygroundHref() {
  const resolveNavHref = usePlaygroundNavLinkHref();

  return useCallback(
    (href: string) => {
      const { pathname, hash } = parseNavHref(href);
      const resolvedPath = pathname ? resolveNavHref(pathname) : "";
      return `${resolvedPath}${hash}`;
    },
    [resolveNavHref],
  );
}

export function useHashNavigationClick() {
  const pathname = usePathname();
  const router = useRouter();
  const resolveHref = useResolvePlaygroundHref();
  const playground = useOptionalPlaygroundSections();

  return useCallback(
    (rawHref: string, event: React.MouseEvent<HTMLAnchorElement>) => {
      const href = resolveHref(rawHref);
      const { pathname: targetPath, hash } = parseNavHref(href);

      if (scrollToHashHref(href)) {
        event.preventDefault();
        return;
      }

      const isPlayground = pathname === "/playground";
      const isPreview = pathname === "/preview" || pathname.startsWith("/preview/");

      if (isPreview) {
        if (hash) {
          event.preventDefault();
          setPendingScrollHash(hash);
          if (!navPathsMatch(targetPath, pathname)) {
            router.push(`${targetPath}${hash}`);
          } else {
            requestScrollToHash(hash);
          }
          return;
        }

        if (targetPath && !navPathsMatch(targetPath, pathname)) {
          event.preventDefault();
          router.push(targetPath);
          return;
        }
      }

      if ((isPlayground || isPreview) && hash) {
        const pages =
          playground?.ready && playground.pages.length > 0
            ? playground.pages
            : loadPlaygroundPagesState().pages;

        const page = targetPath
          ? findPlaygroundPageByHref(pages, targetPath)
          : pages.find((entry) => entry.isHome);

        if (page) {
          event.preventDefault();
          setPendingScrollHash(hash);

          if (isPlayground && playground?.ready) {
            if (playground.activePageId !== page.id) {
              playground.setActivePageId(page.id);
            } else {
              requestScrollToHash(hash);
            }
            return;
          }

          const previewPath = getPlaygroundPreviewPath(page);
          setActivePlaygroundPageInStorage(page.id);
          if (!navPathsMatch(previewPath, pathname)) {
            router.push(`${previewPath}${hash}`);
          } else {
            requestScrollToHash(hash);
          }
          return;
        }
      }

      if (isPlayground && playground?.ready && targetPath && !hash) {
        const pages = playground.pages;
        const page = findPlaygroundPageByHref(pages, targetPath);
        if (page) {
          event.preventDefault();
          playground.setActivePageId(page.id);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
      }

      if (hash && targetPath && !navPathsMatch(targetPath, pathname)) {
        event.preventDefault();
        setPendingScrollHash(hash);
        router.push(href);
      }
    },
    [pathname, playground, resolveHref, router],
  );
}