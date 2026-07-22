"use client";

import { useEffect, useState } from "react";
import {
  analyticsPreviewUpdatedEvent,
  defaultSpartanGaMeasurementId,
  isValidGaMeasurementId,
  normalizeAnalyticsPreviewSettings,
  notifyAnalyticsPreviewUpdated,
  type AnalyticsPreviewSettings,
} from "@/lib/analytics-preview";
import {
  loadAnalyticsPreviewSettings,
  saveAnalyticsPreviewSettings,
} from "@/lib/analytics-preview-storage";

const fieldClassName =
  "w-full max-w-md rounded border border-accent-purple/40 bg-background px-3 py-2 text-sm text-foreground focus:border-accent-purple focus:outline-none";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-3 py-1.5 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

/** Playground panel for Google Analytics measurement ID and on/off toggle. */
export function AnalyticsEditorPanel() {
  const [settings, setSettings] = useState<AnalyticsPreviewSettings>(() =>
    loadAnalyticsPreviewSettings(),
  );

  useEffect(() => {
    function handleUpdated() {
      setSettings(loadAnalyticsPreviewSettings());
    }

    window.addEventListener(analyticsPreviewUpdatedEvent, handleUpdated);
    return () => window.removeEventListener(analyticsPreviewUpdatedEvent, handleUpdated);
  }, []);

  function persist(next: AnalyticsPreviewSettings) {
    const normalized = normalizeAnalyticsPreviewSettings(next);
    setSettings(normalized);
    saveAnalyticsPreviewSettings(normalized);
    notifyAnalyticsPreviewUpdated();
  }

  const idLooksValid = isValidGaMeasurementId(settings.measurementId);

  return (
    <section className="border-b border-accent-purple/20 bg-[#12121c]/95 px-6 py-5 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <div>
          <h2 className="font-mono text-xs tracking-[0.2em] text-accent-purple uppercase">
            Google Analytics
          </h2>
          <p className="mt-1 max-w-2xl font-mono text-[11px] leading-relaxed text-white/50">
            Sets the Google tag (gtag.js) site-wide after you publish. Default ID for Spartan:{" "}
            <span className="text-white/70">{defaultSpartanGaMeasurementId}</span>
          </p>
        </div>

        <label className="inline-flex items-center gap-2 font-mono text-sm text-white/80">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(event) => persist({ ...settings, enabled: event.target.checked })}
            className="h-4 w-4 rounded border-white/20 bg-black accent-accent-purple"
          />
          Enable Google Analytics
        </label>

        <label className="flex max-w-md flex-col gap-1.5">
          <span className="font-mono text-[10px] tracking-wide text-accent-purple/80 uppercase">
            Measurement ID
          </span>
          <input
            type="text"
            value={settings.measurementId}
            onChange={(event) =>
              persist({ ...settings, measurementId: event.target.value.toUpperCase() })
            }
            className={fieldClassName}
            placeholder={defaultSpartanGaMeasurementId}
            aria-invalid={!idLooksValid}
          />
          {!idLooksValid && (
            <span className="font-mono text-[11px] text-red-300">
              Use a GA4 ID like G-XXXXXXXXXX
            </span>
          )}
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => persist({ enabled: true, measurementId: defaultSpartanGaMeasurementId })}
            className={buttonClassName}
          >
            Reset to Spartan default
          </button>
        </div>
      </div>
    </section>
  );
}
