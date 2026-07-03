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
  defaultNavBarPreviewSettings,
  navBarHeightOptions,
  navBarLayoutWidths,
  type NavBarLayoutWidth,
  type NavBarPreviewSettings,
} from "@/lib/nav-bar-preview";
import { playgroundNavSyncEvent } from "@/lib/playground-nav-sync";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import {
  loadNavBarPreviewSettings,
  normalizeNavBarPreviewSettings,
  saveNavBarPreviewSettings,
} from "@/lib/nav-bar-preview-storage";

type NavBarPreviewContextValue = {
  settings: NavBarPreviewSettings;
  setSettings: (settings: NavBarPreviewSettings) => void;
};

const NavBarPreviewContext = createContext<NavBarPreviewContextValue | null>(null);

type NavBarPreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: NavBarPreviewSettings;
};

function mergeNavBarLinksFromGlobal(settings: NavBarPreviewSettings): NavBarPreviewSettings {
  const global = loadNavBarPreviewSettings();
  return normalizeNavBarPreviewSettings({ ...settings, items: global.items });
}

export function NavBarPreviewProvider({
  children,
  instanceId,
  initialSettings,
}: NavBarPreviewProviderProps) {
  const { settings, setSettings, lockedToPublished, reload } = useInstancePreviewSettings({
    instanceId,
    field: "navBar",
    initialSettings,
    defaultSettings: defaultNavBarPreviewSettings,
    loadGlobal: loadNavBarPreviewSettings,
    saveGlobal: saveNavBarPreviewSettings,
    normalize: normalizeNavBarPreviewSettings,
    afterLoad: mergeNavBarLinksFromGlobal,
  });

  useEffect(() => {
    if (lockedToPublished) return;

    const handleNavSync = () => {
      setSettings(reload());
    };

    window.addEventListener(playgroundNavSyncEvent, handleNavSync);
    return () => window.removeEventListener(playgroundNavSyncEvent, handleNavSync);
  }, [lockedToPublished, reload, setSettings]);

  return (
    <NavBarPreviewContext.Provider value={{ settings, setSettings }}>
      {children}
    </NavBarPreviewContext.Provider>
  );
}

export function useNavBarPreview() {
  return useContext(NavBarPreviewContext);
}

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const selectClassName =
  "section-switcher-select rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

export function NavBarPreviewControls() {
  const context = useNavBarPreview();
  if (!context) return null;

  const update = (patch: Partial<NavBarPreviewSettings>) => {
    context.setSettings({ ...context.settings, ...patch });
  };

  return (
    <div className="contents">
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Width</span>
        <select
          value={context.settings.layoutWidth}
          onChange={(event) =>
            update({ layoutWidth: event.target.value as NavBarLayoutWidth })
          }
          className={selectClassName}
          aria-label="Nav bar layout width"
        >
          {navBarLayoutWidths.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Height</span>
        <select
          value={context.settings.heightPx}
          onChange={(event) => update({ heightPx: Number(event.target.value) })}
          className={selectClassName}
          aria-label="Nav bar height"
        >
          {navBarHeightOptions.map((height) => (
            <option key={height} value={height}>
              {height}px
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG</span>
        <input
          type="color"
          value={context.settings.backgroundColor}
          onChange={(event) => update({ backgroundColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Nav bar background color"
        />
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
            aria-label="Nav bar outer background color"
          />
        </label>
      )}
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Link</span>
        <input
          type="color"
          value={context.settings.linkColor}
          onChange={(event) => update({ linkColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Nav bar link color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Hover</span>
        <input
          type="color"
          value={context.settings.linkHoverColor}
          onChange={(event) => update({ linkHoverColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Nav bar link hover color"
        />
      </label>
      <button
        type="button"
        onClick={() => context.setSettings(defaultNavBarPreviewSettings)}
        className={buttonClassName}
        aria-label="Reset nav bar settings to defaults"
      >
        Reset
      </button>
    </div>
  );
}
