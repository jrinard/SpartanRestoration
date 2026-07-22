"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import {
  analyticsPreviewUpdatedEvent,
  getActiveGaMeasurementId,
  normalizeAnalyticsPreviewSettings,
  type AnalyticsPreviewSettings,
} from "@/lib/analytics-preview";
import { loadAnalyticsPreviewSettings } from "@/lib/analytics-preview-storage";
import { getCommittedHomepagePreviewSettings } from "@/lib/homepage-settings";

type GoogleAnalyticsRuntimeProps = {
  initialSettings?: AnalyticsPreviewSettings | null;
};

function resolveRuntimeMeasurementId(
  pathname: string,
  initialSettings?: AnalyticsPreviewSettings | null,
): string | null {
  if (pathname.startsWith("/playground")) {
    return getActiveGaMeasurementId(loadAnalyticsPreviewSettings());
  }

  const committed = getCommittedHomepagePreviewSettings()?.analytics;
  if (committed) {
    return getActiveGaMeasurementId(committed);
  }

  return getActiveGaMeasurementId(initialSettings ?? undefined);
}

/** Loads GA from playground storage, preview bridge, or published homepage config. */
export function GoogleAnalyticsRuntime({ initialSettings }: GoogleAnalyticsRuntimeProps) {
  const pathname = usePathname();
  const [measurementId, setMeasurementId] = useState<string | null>(() =>
    getActiveGaMeasurementId(normalizeAnalyticsPreviewSettings(initialSettings ?? undefined)),
  );

  useEffect(() => {
    function sync() {
      setMeasurementId(resolveRuntimeMeasurementId(pathname, initialSettings));
    }

    sync();
    window.addEventListener(analyticsPreviewUpdatedEvent, sync);
    return () => window.removeEventListener(analyticsPreviewUpdatedEvent, sync);
  }, [pathname, initialSettings]);

  if (!measurementId) return null;

  return <GoogleAnalytics measurementId={measurementId} />;
}
