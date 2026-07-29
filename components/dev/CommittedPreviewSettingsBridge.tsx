"use client";

import { useLayoutEffect, type ReactNode } from "react";
import { notifyAnalyticsPreviewUpdated } from "@/lib/analytics-preview";
import { notifyFaviconPreviewUpdated } from "@/lib/favicon-preview";
import {
  setCommittedHomepagePreviewSettings,
  type HomepagePreviewSettings,
} from "@/lib/homepage-settings";

/** Hydrates published preview settings on the client for the live homepage. */
export function CommittedPreviewSettingsBridge({
  settings,
  children,
}: {
  settings: HomepagePreviewSettings | null;
  children: ReactNode;
}) {
  useLayoutEffect(() => {
    setCommittedHomepagePreviewSettings(settings);
    notifyAnalyticsPreviewUpdated();
    notifyFaviconPreviewUpdated();
    return () => {
      setCommittedHomepagePreviewSettings(null);
      notifyAnalyticsPreviewUpdated();
      notifyFaviconPreviewUpdated();
    };
  }, [settings]);

  return children;
}
