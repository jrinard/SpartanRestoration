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
  defaultHeaderV3PreviewSettings,
  headerV3LayoutWidths,
  headerV3LogoVariants,
  type HeaderV3LayoutWidth,
  type HeaderV3LogoVariant,
  type HeaderV3PreviewSettings,
} from "@/lib/header-v3-gradient";
import {
  loadHeaderV3PreviewSettings,
  saveHeaderV3PreviewSettings,
} from "@/lib/header-v3-storage";
import { ButtonPreviewControls } from "@/components/dev/ButtonPreviewControls";

type HeaderV3PreviewContextValue = {
  settings: HeaderV3PreviewSettings;
  setSettings: (settings: HeaderV3PreviewSettings) => void;
};

const HeaderV3PreviewContext = createContext<HeaderV3PreviewContextValue | null>(null);

export function HeaderV3PreviewProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<HeaderV3PreviewSettings>(
    defaultHeaderV3PreviewSettings,
  );

  useEffect(() => {
    setSettingsState(loadHeaderV3PreviewSettings());
  }, []);

  const setSettings = useCallback((next: HeaderV3PreviewSettings) => {
    setSettingsState(next);
    saveHeaderV3PreviewSettings(next);
  }, []);

  return (
    <HeaderV3PreviewContext.Provider value={{ settings, setSettings }}>
      {children}
    </HeaderV3PreviewContext.Provider>
  );
}

export function useHeaderV3Preview() {
  return useContext(HeaderV3PreviewContext);
}

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const selectClassName =
  "section-switcher-select rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

export function HeaderV3PreviewControls() {
  const context = useHeaderV3Preview();
  if (!context) return null;

  const update = (patch: Partial<HeaderV3PreviewSettings>) => {
    context.setSettings({ ...context.settings, ...patch });
  };

  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG 1</span>
        <input
          type="color"
          value={context.settings.from}
          onChange={(event) => update({ from: event.target.value })}
          className={colorInputClassName}
          aria-label="Header nav gradient start color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG 2</span>
        <input
          type="color"
          value={context.settings.to}
          onChange={(event) => update({ to: event.target.value })}
          className={colorInputClassName}
          aria-label="Header nav gradient end color"
        />
      </label>
      <ButtonPreviewControls target="header" />
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Logo</span>
        <select
          value={context.settings.logoVariant}
          onChange={(event) =>
            update({ logoVariant: event.target.value as HeaderV3LogoVariant })
          }
          className={selectClassName}
          aria-label="LifeSpring header logo variant"
        >
          {headerV3LogoVariants.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Width</span>
        <select
          value={context.settings.layoutWidth}
          onChange={(event) =>
            update({ layoutWidth: event.target.value as HeaderV3LayoutWidth })
          }
          className={selectClassName}
          aria-label="Header layout width"
        >
          {headerV3LayoutWidths.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={() => context.setSettings(defaultHeaderV3PreviewSettings)}
        className={buttonClassName}
        aria-label="Reset header settings to defaults"
      >
        Reset
      </button>
    </div>
  );
}
