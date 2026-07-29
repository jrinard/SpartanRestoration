"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ImageLibraryPicker } from "@/components/dev/ImageLibraryPicker";
import {
  defaultFaviconPreviewSettings,
  faviconPreviewUpdatedEvent,
  normalizeFaviconPreviewSettings,
  notifyFaviconPreviewUpdated,
  type FaviconPreviewSettings,
} from "@/lib/favicon-preview";
import {
  loadFaviconPreviewSettings,
  saveFaviconPreviewSettings,
} from "@/lib/favicon-preview-storage";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-3 py-1.5 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

type FaviconSlotProps = {
  label: string;
  helper: string;
  sizeLabel: string;
  previewSizePx: number;
  value: string;
  pickerOpen: boolean;
  onTogglePicker: () => void;
  onClosePicker: () => void;
  onSelect: (src: string) => void;
};

function FaviconSlot({
  label,
  helper,
  sizeLabel,
  previewSizePx,
  value,
  pickerOpen,
  onTogglePicker,
  onClosePicker,
  onSelect,
}: FaviconSlotProps) {
  return (
    <div className="relative flex min-w-[min(100%,20rem)] flex-1 flex-col gap-3 rounded border border-white/10 bg-black/20 p-4">
      <div>
        <p className="font-mono text-[10px] tracking-wide text-accent-purple/80 uppercase">
          {label}
        </p>
        <p className="mt-1 font-mono text-[11px] leading-relaxed text-white/50">{helper}</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          className="mx-auto flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/15 bg-white/5 sm:mx-0"
          style={{ width: previewSizePx, height: previewSizePx }}
        >
          <Image
            src={value}
            alt={`${label} preview`}
            width={previewSizePx}
            height={previewSizePx}
            className="h-full w-full object-contain p-1"
          />
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="font-mono text-[10px] text-white/40 uppercase">{sizeLabel}</p>
          <p className="mt-1 truncate font-mono text-[11px] text-white/70">{value}</p>
          <button type="button" onClick={onTogglePicker} className={`${buttonClassName} mt-3`}>
            Choose from library
          </button>
        </div>
      </div>

      {pickerOpen && (
        <div className="absolute top-full left-0 z-50 mt-2">
          <ImageLibraryPicker
            scope="theme"
            thumbnailSize="large"
            value={value}
            onSelect={(entry) => onSelect(entry.src)}
            onClose={onClosePicker}
            className="w-[min(92vw,52rem)]"
          />
        </div>
      )}
    </div>
  );
}

/** Playground panel for tab and Apple touch favicons — saved on publish. */
export function FaviconEditorPanel() {
  const [settings, setSettings] = useState<FaviconPreviewSettings>(() =>
    loadFaviconPreviewSettings(),
  );
  const [openPicker, setOpenPicker] = useState<"32" | "180" | null>(null);

  useEffect(() => {
    function handleUpdated() {
      setSettings(loadFaviconPreviewSettings());
    }

    window.addEventListener(faviconPreviewUpdatedEvent, handleUpdated);
    return () => window.removeEventListener(faviconPreviewUpdatedEvent, handleUpdated);
  }, []);

  function persist(patch: Partial<FaviconPreviewSettings>) {
    const normalized = normalizeFaviconPreviewSettings({ ...settings, ...patch });
    setSettings(normalized);
    saveFaviconPreviewSettings(normalized);
    notifyFaviconPreviewUpdated();
  }

  return (
    <section className="border-b border-accent-purple/20 bg-[#12121c]/95 px-6 py-5 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <h2 className="font-mono text-xs tracking-[0.2em] text-accent-purple uppercase">
          Favicon
        </h2>

        <div className="flex flex-wrap gap-4">
          <FaviconSlot
            label="Tab icon"
            helper="Shown in the browser tab. Export a square PNG at 32×32 for best results."
            sizeLabel="32 × 32 PNG"
            previewSizePx={72}
            value={settings.favicon32}
            pickerOpen={openPicker === "32"}
            onTogglePicker={() => setOpenPicker((current) => (current === "32" ? null : "32"))}
            onClosePicker={() => setOpenPicker(null)}
            onSelect={(src) => {
              persist({ favicon32: src });
              setOpenPicker(null);
            }}
          />

          <FaviconSlot
            label="Apple touch icon"
            helper="Used when someone saves the site to an iPhone or iPad home screen. Use 180×180."
            sizeLabel="180 × 180 PNG"
            previewSizePx={112}
            value={settings.favicon180}
            pickerOpen={openPicker === "180"}
            onTogglePicker={() => setOpenPicker((current) => (current === "180" ? null : "180"))}
            onClosePicker={() => setOpenPicker(null)}
            onSelect={(src) => {
              persist({ favicon180: src });
              setOpenPicker(null);
            }}
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() => {
              const normalized = normalizeFaviconPreviewSettings(defaultFaviconPreviewSettings);
              setSettings(normalized);
              saveFaviconPreviewSettings(normalized);
              notifyFaviconPreviewUpdated();
              setOpenPicker(null);
            }}
            className={buttonClassName}
          >
            Reset to site defaults
          </button>
        </div>
      </div>
    </section>
  );
}
