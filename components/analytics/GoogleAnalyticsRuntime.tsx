"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import {
  analyticsPreviewUpdatedEvent,
  getActiveGaMeasurementId,
  shouldInjectGoogleAnalytics,
  type AnalyticsPreviewSettings,
} from "@/lib/analytics-preview";
import { getCommittedHomepagePreviewSettings } from "@/lib/homepage-settings";

type GoogleAnalyticsRuntimeProps = {
  initialSettings?: AnalyticsPreviewSettings | null;
  /** Workshop / Forge never send. Vision production sets this true. */
  allowTracking?: boolean;
};

function currentHostname(): string | null {
  if (typeof window === "undefined") return null;
  return window.location.hostname;
}

function resolveRuntimeMeasurementId(
  pathname: string,
  allowTracking: boolean,
  initialSettings?: AnalyticsPreviewSettings | null,
): string | null {
  if (
    !shouldInjectGoogleAnalytics({
      allowTracking,
      pathname,
      hostname: currentHostname(),
    })
  ) {
    return null;
  }

  const committed = getCommittedHomepagePreviewSettings()?.analytics;
  if (committed) {
    return getActiveGaMeasurementId(committed);
  }

  return getActiveGaMeasurementId(initialSettings ?? undefined);
}

/** Loads GA on Vision production only. Workshop, Forge, and localhost never send. */
export function GoogleAnalyticsRuntime({
  initialSettings,
  allowTracking = false,
}: GoogleAnalyticsRuntimeProps) {
  const pathname = usePathname();
  const [measurementId, setMeasurementId] = useState<string | null>(() =>
    resolveRuntimeMeasurementId(pathname, allowTracking, initialSettings),
  );

  useEffect(() => {
    function sync() {
      setMeasurementId(resolveRuntimeMeasurementId(pathname, allowTracking, initialSettings));
    }

    sync();
    window.addEventListener(analyticsPreviewUpdatedEvent, sync);
    return () => window.removeEventListener(analyticsPreviewUpdatedEvent, sync);
  }, [pathname, allowTracking, initialSettings]);

  if (!measurementId) return null;

  return <GoogleAnalytics measurementId={measurementId} />;
}
