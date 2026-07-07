"use client";

import {
  iconFrameShapeOptions,
  iconFrameSizeOptions,
  type IconFramePreviewSettings,
  type IconFrameShape,
  type IconFrameSize,
} from "@/lib/icon-frame-preview";

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const selectClassName =
  "section-switcher-select rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

type IconFramePreviewControlsProps = {
  settings: IconFramePreviewSettings;
  onChange: (patch: Partial<IconFramePreviewSettings>) => void;
  ariaPrefix: string;
};

function colorInputValue(value: string, fallback: string): string {
  return value.startsWith("#") ? value : fallback;
}

export function IconFramePreviewControls({
  settings,
  onChange,
  ariaPrefix,
}: IconFramePreviewControlsProps) {
  return (
    <>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Size</span>
        <select
          value={settings.iconFrameSize}
          onChange={(event) =>
            onChange({ iconFrameSize: event.target.value as IconFrameSize })
          }
          className={selectClassName}
          aria-label={`${ariaPrefix} icon size`}
        >
          {iconFrameSizeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Shape</span>
        <select
          value={settings.iconFrameShape}
          onChange={(event) =>
            onChange({ iconFrameShape: event.target.value as IconFrameShape })
          }
          className={selectClassName}
          aria-label={`${ariaPrefix} icon frame shape`}
        >
          {iconFrameShapeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          Icon BG
        </span>
        <input
          type="color"
          value={colorInputValue(settings.iconBackgroundColor, "#f3c35d")}
          onChange={(event) => onChange({ iconBackgroundColor: event.target.value })}
          className={colorInputClassName}
          aria-label={`${ariaPrefix} icon frame background color`}
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          Icon Line
        </span>
        <input
          type="color"
          value={colorInputValue(settings.iconBorderColor, "#f3c35d")}
          onChange={(event) => onChange({ iconBorderColor: event.target.value })}
          className={colorInputClassName}
          aria-label={`${ariaPrefix} icon frame border color`}
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Icon</span>
        <input
          type="color"
          value={colorInputValue(settings.iconColor, "#f3c35d")}
          onChange={(event) => onChange({ iconColor: event.target.value })}
          className={colorInputClassName}
          aria-label={`${ariaPrefix} icon color`}
        />
      </label>
    </>
  );
}
