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
  defaultTopBarPreviewSettings,
  topBarLayoutWidths,
  topBarTextSizeOptions,
  type TopBarLayoutWidth,
  type TopBarPreviewSettings,
} from "@/lib/top-bar-preview";
import {
  loadTopBarPreviewSettings,
  normalizeTopBarPreviewSettings,
  saveTopBarPreviewSettings,
} from "@/lib/top-bar-preview-storage";

type TopBarPreviewContextValue = {
  settings: TopBarPreviewSettings;
  setSettings: (settings: TopBarPreviewSettings) => void;
};

const TopBarPreviewContext = createContext<TopBarPreviewContextValue | null>(null);

type TopBarPreviewProviderProps = {
  children: ReactNode;
  initialSettings?: TopBarPreviewSettings;
};

export function TopBarPreviewProvider({
  children,
  initialSettings,
}: TopBarPreviewProviderProps) {
  const lockedToPublished = initialSettings !== undefined;

  const [settings, setSettingsState] = useState<TopBarPreviewSettings>(() =>
    initialSettings
      ? normalizeTopBarPreviewSettings(initialSettings)
      : defaultTopBarPreviewSettings,
  );

  useEffect(() => {
    if (lockedToPublished) return;
    setSettingsState(loadTopBarPreviewSettings());
  }, [lockedToPublished]);

  const setSettings = useCallback(
    (next: TopBarPreviewSettings) => {
      if (lockedToPublished) return;
      setSettingsState(next);
      saveTopBarPreviewSettings(next);
    },
    [lockedToPublished],
  );

  return (
    <TopBarPreviewContext.Provider value={{ settings, setSettings }}>
      {children}
    </TopBarPreviewContext.Provider>
  );
}

export function useTopBarPreview() {
  return useContext(TopBarPreviewContext);
}

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const selectClassName =
  "section-switcher-select rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

export function TopBarPreviewControls() {
  const context = useTopBarPreview();
  if (!context) return null;

  const update = (patch: Partial<TopBarPreviewSettings>) => {
    context.setSettings({ ...context.settings, ...patch });
  };

  return (
    <div className="contents">
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Width</span>
        <select
          value={context.settings.layoutWidth}
          onChange={(event) =>
            update({ layoutWidth: event.target.value as TopBarLayoutWidth })
          }
          className={selectClassName}
          aria-label="Top bar layout width"
        >
          {topBarLayoutWidths.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Left BG</span>
        <input
          type="color"
          value={context.settings.leftBackgroundColor}
          onChange={(event) => update({ leftBackgroundColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Top bar left background color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Right BG</span>
        <input
          type="color"
          value={context.settings.rightBackgroundColor}
          onChange={(event) => update({ rightBackgroundColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Top bar right background color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Outer BG</span>
        <input
          type="color"
          value={context.settings.outerBackgroundColor}
          onChange={(event) => update({ outerBackgroundColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Top bar full-width outer background color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Hours</span>
        <input
          type="color"
          value={context.settings.leftLabelColor}
          onChange={(event) => update({ leftLabelColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Top bar open hours text color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">24/7</span>
        <input
          type="color"
          value={context.settings.leftAccentColor}
          onChange={(event) => update({ leftAccentColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Top bar 24/7 text color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Call</span>
        <input
          type="color"
          value={context.settings.rightTextColor}
          onChange={(event) => update({ rightTextColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Top bar call text color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Text</span>
        <select
          value={context.settings.textSizePx}
          onChange={(event) => update({ textSizePx: Number(event.target.value) })}
          className={selectClassName}
          aria-label="Top bar text size"
        >
          {topBarTextSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={() => context.setSettings(defaultTopBarPreviewSettings)}
        className={buttonClassName}
        aria-label="Reset top bar settings to defaults"
      >
        Reset
      </button>
    </div>
  );
}
