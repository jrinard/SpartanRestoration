"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  defaultTextIconsV3PreviewSettings,
  textIconsV3GradientDirections,
  type TextIconsV3PreviewSettings,
} from "@/lib/text-icons-v3-preview";
import type { PreviewGradientDirection } from "@/lib/preview-gradient";
import { siteLayoutWidthOptions } from "@/lib/site-layout";
import type { SiteLayoutWidth } from "@/lib/site-layout";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import {
  loadTextIconsV3PreviewSettings,
  normalizeTextIconsV3PreviewSettings,
  saveTextIconsV3PreviewSettings,
} from "@/lib/text-icons-v3-preview-storage";

type TextIconsV3PreviewContextValue = {
  settings: TextIconsV3PreviewSettings;
  setSettings: (settings: TextIconsV3PreviewSettings) => void;
};

const TextIconsV3PreviewContext = createContext<TextIconsV3PreviewContextValue | null>(null);

type TextIconsV3PreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: TextIconsV3PreviewSettings;
};

export function TextIconsV3PreviewProvider({
  children,
  instanceId,
  initialSettings,
}: TextIconsV3PreviewProviderProps) {
  const { settings, setSettings } = useInstancePreviewSettings({
    instanceId,
    field: "textIconsV3",
    initialSettings,
    defaultSettings: defaultTextIconsV3PreviewSettings,
    loadGlobal: loadTextIconsV3PreviewSettings,
    saveGlobal: saveTextIconsV3PreviewSettings,
    normalize: normalizeTextIconsV3PreviewSettings,
  });

  return (
    <TextIconsV3PreviewContext.Provider value={{ settings, setSettings }}>
      {children}
    </TextIconsV3PreviewContext.Provider>
  );
}

export function useTextIconsV3Preview() {
  return useContext(TextIconsV3PreviewContext);
}

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const selectClassName =
  "section-switcher-select rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

export function TextIconsV3BackgroundControls() {
  const context = useTextIconsV3Preview();
  if (!context) return null;

  const update = (patch: Partial<TextIconsV3PreviewSettings>) => {
    context.setSettings({ ...context.settings, ...patch });
  };

  return (
    <div className="contents">
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Width</span>
        <select
          value={context.settings.layoutWidth}
          onChange={(event) =>
            update({ layoutWidth: event.target.value as SiteLayoutWidth })
          }
          className={selectClassName}
          aria-label="Text-icons v3 layout width"
        >
          {siteLayoutWidthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      {context.settings.layoutWidth === "contained" && (
        <label className="flex items-center gap-2">
          <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
            Outer BG
          </span>
          <input
            type="color"
            value={context.settings.outerBackgroundColor}
            onChange={(event) => update({ outerBackgroundColor: event.target.value })}
            className={colorInputClassName}
            aria-label="Text-icons v3 outer background color"
          />
        </label>
      )}
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Title</span>
        <input
          type="color"
          value={context.settings.headingColor}
          onChange={(event) => update({ headingColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Text-icons v3 heading color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          Subtitle
        </span>
        <input
          type="color"
          value={context.settings.subheadingColor}
          onChange={(event) => update({ subheadingColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Text-icons v3 subheading color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG 1</span>
        <input
          type="color"
          value={context.settings.backgroundFrom}
          onChange={(event) => update({ backgroundFrom: event.target.value })}
          className={colorInputClassName}
          aria-label="Text-icons v3 background gradient start color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG 2</span>
        <input
          type="color"
          value={context.settings.backgroundTo}
          onChange={(event) => update({ backgroundTo: event.target.value })}
          className={colorInputClassName}
          aria-label="Text-icons v3 background gradient end color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Dir</span>
        <select
          value={context.settings.backgroundDirection}
          onChange={(event) =>
            update({ backgroundDirection: event.target.value as PreviewGradientDirection })
          }
          className={selectClassName}
          aria-label="Text-icons v3 background gradient direction"
        >
          {textIconsV3GradientDirections.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={() => context.setSettings(defaultTextIconsV3PreviewSettings)}
        className={buttonClassName}
        aria-label="Reset Text-icons v3 background to defaults"
      >
        Reset BG
      </button>
    </div>
  );
}
