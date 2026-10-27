"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ensureOpenAiPixelInitialized,
  isOpenAiPixelCtaClickTarget,
  measureOpenAiCtaClicked,
  measureOpenAiPageViewed,
  setOpenAiPixelFakeMode,
} from "@/lib/openai-pixel-client";
import {
  openAiPixelPreviewUpdatedEvent,
  resolveOpenAiPixelRuntimeMode,
  type OpenAiPixelPreviewSettings,
  type OpenAiPixelRuntimeMode,
} from "@/lib/openai-pixel-preview";
import { getCommittedHomepagePreviewSettings } from "@/lib/homepage-settings";
import { getRuntimeSite } from "@/lib/org/runtime-site";

type OpenAiPixelRuntimeProps = {
  initialSettings?: OpenAiPixelPreviewSettings | null;
  allowTracking?: boolean;
};

type RuntimeState = {
  mode: OpenAiPixelRuntimeMode;
  pixelId: string | null;
};

function currentHostname(): string | null {
  if (typeof window === "undefined") return null;
  return window.location.hostname;
}

function resolveRuntime(
  pathname: string,
  allowTracking: boolean,
  initialSettings?: OpenAiPixelPreviewSettings | null,
): RuntimeState {
  const committed = getCommittedHomepagePreviewSettings()?.openaiPixel;
  const settings = committed ?? initialSettings;

  return resolveOpenAiPixelRuntimeMode({
    allowTracking,
    pathname,
    hostname: currentHostname(),
    orgDomain: getRuntimeSite().domain,
    settings,
  });
}

/** OpenAI Ads Measurement Pixel — page views, form leads, tel: CTA clicks. */
export function OpenAiPixelRuntime({
  initialSettings,
  allowTracking = false,
}: OpenAiPixelRuntimeProps) {
  const pathname = usePathname();
  const [runtime, setRuntime] = useState<RuntimeState>(() =>
    resolveRuntime(pathname, allowTracking, initialSettings),
  );
  const lastPagePathRef = useRef<string | null>(null);

  useEffect(() => {
    function sync() {
      setRuntime(resolveRuntime(pathname, allowTracking, initialSettings));
    }

    sync();
    window.addEventListener(openAiPixelPreviewUpdatedEvent, sync);
    return () => window.removeEventListener(openAiPixelPreviewUpdatedEvent, sync);
  }, [pathname, allowTracking, initialSettings]);

  useLayoutEffect(() => {
    if (runtime.mode === "fake" && runtime.pixelId) {
      setOpenAiPixelFakeMode(true, runtime.pixelId);
    } else {
      setOpenAiPixelFakeMode(false);
    }
    return () => setOpenAiPixelFakeMode(false);
  }, [runtime.mode, runtime.pixelId]);

  useEffect(() => {
    const { mode, pixelId } = runtime;
    if (mode === "off" || !pixelId) return;

    let cancelled = false;

    const trackPage = () => {
      if (lastPagePathRef.current === pathname) return;
      lastPagePathRef.current = pathname;
      measureOpenAiPageViewed(pathname);
    };

    if (mode === "fake") {
      trackPage();
      return;
    }

    void ensureOpenAiPixelInitialized(pixelId).then((ready) => {
      if (cancelled || !ready) return;
      trackPage();
    });

    return () => {
      cancelled = true;
    };
  }, [runtime, pathname]);

  useEffect(() => {
    const { mode, pixelId } = runtime;
    if (mode === "off" || !pixelId) return;
    const activePixelId: string = pixelId;

    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!isOpenAiPixelCtaClickTarget(target)) return;

      if (mode === "fake") {
        measureOpenAiCtaClicked();
        return;
      }

      void ensureOpenAiPixelInitialized(activePixelId).then((ready) => {
        if (ready) measureOpenAiCtaClicked();
      });
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [runtime]);

  return null;
}
