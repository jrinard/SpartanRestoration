"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  faviconPreviewUpdatedEvent,
  getEffectiveBrowserTitle,
  normalizeFaviconPreviewSettings,
  type FaviconPreviewSettings,
} from "@/lib/favicon-preview";
import { loadFaviconPreviewSettings } from "@/lib/favicon-preview-storage";
import { isForgePathname } from "@/lib/forge";

type FaviconRuntimeProps = {
  initialSettings?: FaviconPreviewSettings | null;
};

function upsertLink(rel: string, href: string, sizes?: string) {
  const selector = sizes
    ? `link[rel="${rel}"][sizes="${sizes}"]`
    : `link[rel="${rel}"]:not([sizes])`;
  let link = document.head.querySelector<HTMLLinkElement>(selector);

  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    if (sizes) link.sizes = sizes;
    document.head.appendChild(link);
  }

  link.type = "image/png";
  link.href = href;
}

function applyFaviconSettings(settings: FaviconPreviewSettings) {
  const normalized = normalizeFaviconPreviewSettings(settings);
  upsertLink("icon", normalized.favicon32, "32x32");
  upsertLink("apple-touch-icon", normalized.favicon180, "180x180");
}

function shouldApplyBrowserTitle(pathname: string): boolean {
  return (
    pathname === "/" ||
    isForgePathname(pathname) ||
    pathname === "/preview" ||
    pathname.startsWith("/preview/")
  );
}

export function FaviconRuntime({ initialSettings }: FaviconRuntimeProps) {
  const pathname = usePathname();
  const [settings, setSettings] = useState(() =>
    normalizeFaviconPreviewSettings(initialSettings ?? undefined),
  );

  useEffect(() => {
    function syncFromStorage() {
      setSettings(loadFaviconPreviewSettings());
    }

    syncFromStorage();
    window.addEventListener(faviconPreviewUpdatedEvent, syncFromStorage);
    return () => window.removeEventListener(faviconPreviewUpdatedEvent, syncFromStorage);
  }, []);

  useEffect(() => {
    applyFaviconSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (!shouldApplyBrowserTitle(pathname)) return;
    document.title = getEffectiveBrowserTitle(settings);
  }, [pathname, settings]);

  return null;
}
