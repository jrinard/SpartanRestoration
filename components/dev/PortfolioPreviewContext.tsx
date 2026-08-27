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
  defaultPortfolioPreviewSettings,
  portfolioSectionThemes,
  type PortfolioPreviewSettings,
  type PortfolioSectionTheme,
} from "@/lib/portfolio-preview";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import {
  loadPortfolioPreviewSettings,
  savePortfolioPreviewSettings,
} from "@/lib/portfolio-preview-storage";

type PortfolioPreviewContextValue = {
  settings: PortfolioPreviewSettings;
  setSettings: (settings: PortfolioPreviewSettings) => void;
};

const PortfolioPreviewContext = createContext<PortfolioPreviewContextValue | null>(null);

type PortfolioPreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  /** Published homepage settings — skips localStorage on the live site. */
  initialSettings?: PortfolioPreviewSettings;
};

export function PortfolioPreviewProvider({
  children,
  instanceId,
  initialSettings,
}: PortfolioPreviewProviderProps) {
  const { settings, setSettings } = useInstancePreviewSettings({
    instanceId,
    field: "portfolio",
    initialSettings,
    defaultSettings: defaultPortfolioPreviewSettings,
    loadGlobal: loadPortfolioPreviewSettings,
    saveGlobal: savePortfolioPreviewSettings,
  });

  return (
    <PortfolioPreviewContext.Provider value={{ settings, setSettings }}>
      {children}
    </PortfolioPreviewContext.Provider>
  );
}

export function usePortfolioPreview() {
  return useContext(PortfolioPreviewContext);
}

const selectClassName =
  "section-switcher-select rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

export function PortfolioPreviewControls() {
  const context = usePortfolioPreview();
  if (!context) return null;

  return (
    <label className="flex items-center gap-2">
      <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Theme</span>
      <select
        value={context.settings.theme}
        onChange={(event) =>
          context.setSettings({
            ...context.settings,
            theme: event.target.value as PortfolioSectionTheme,
          })
        }
        className={selectClassName}
        aria-label="Portfolio section theme"
      >
        {portfolioSectionThemes.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
