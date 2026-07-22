"use client";

import { useLayoutEffect, type ReactNode } from "react";
import { notifyAnalyticsPreviewUpdated } from "@/lib/analytics-preview";
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
    return () => {
      setCommittedHomepagePreviewSettings(null);
      notifyAnalyticsPreviewUpdated();
    };
  }, [settings]);

  return children;
}
