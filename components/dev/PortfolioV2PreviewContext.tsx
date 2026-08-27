"use client";

import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import {
  defaultPortfolioV2PreviewSettings,
  defaultPortfolioV2SectionDescription,
  defaultPortfolioV2SectionHeading,
  getPortfolioV2SectionDescriptionColor,
  defaultPortfolioV2SliceHeightPx,
  defaultPortfolioV2SliceWidthPx,
  defaultPortfolioV2GapPx,
  portfolioSectionThemes,
  type PortfolioV2PreviewSettings,
  type PortfolioV2Tab,
  type PortfolioSectionTheme,
} from "@/lib/portfolio-v2-preview";
import {
  loadPortfolioV2PreviewSettings,
  normalizePortfolioV2PreviewSettings,
  savePortfolioV2PreviewSettings,
} from "@/lib/portfolio-v2-preview-storage";
import { updatePortfolioV2Tab } from "@/lib/portfolio-v2-tabs";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import { siteLayoutWidthOptions } from "@/lib/site-layout";
import type { SiteLayoutWidth } from "@/lib/site-layout";
import { cn } from "@/lib/utils";

type PortfolioV2PreviewContextValue = {
  settings: PortfolioV2PreviewSettings;
  setSettings: (settings: PortfolioV2PreviewSettings) => void;
  contentEditingEnabled: boolean;
  updateTab: (tabId: string, patch: Partial<Omit<PortfolioV2Tab, "id">>) => void;
  getSectionHeading: (fallback: string) => string;
  setSectionHeading: (heading: string) => void;
  getSectionDescription: (fallback: string) => string;
  setSectionDescription: (description: string) => void;
};

const PortfolioV2PreviewContext = createContext<PortfolioV2PreviewContextValue | null>(null);

type PortfolioV2PreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: PortfolioV2PreviewSettings;
  enableContentEditing?: boolean;
};

export function PortfolioV2PreviewProvider({
  children,
  instanceId,
  initialSettings,
  enableContentEditing = false,
}: PortfolioV2PreviewProviderProps) {
  const { settings, setSettings: persistSettings } = useInstancePreviewSettings({
    instanceId,
    field: "portfolioV2",
    initialSettings,
    defaultSettings: defaultPortfolioV2PreviewSettings,
    loadGlobal: loadPortfolioV2PreviewSettings,
    saveGlobal: savePortfolioV2PreviewSettings,
    normalize: normalizePortfolioV2PreviewSettings,
  });

  const setSettings = useCallback(
    (next: PortfolioV2PreviewSettings) => {
      persistSettings(next);
    },
    [persistSettings],
  );

  const updateTab = useCallback(
    (tabId: string, patch: Partial<Omit<PortfolioV2Tab, "id">>) => {
      setSettings({
        ...settings,
        tabs: updatePortfolioV2Tab(settings.tabs, tabId, patch),
      });
    },
    [setSettings, settings],
  );

  const getSectionHeading = useCallback(
    (fallback: string): string => settings.sectionHeading ?? fallback,
    [settings.sectionHeading],
  );

  const setSectionHeading = useCallback(
    (heading: string) => {
      if (!enableContentEditing) return;
      const trimmed = heading.trim();
      if (!trimmed) return;
      setSettings({
        ...settings,
        sectionHeading: trimmed,
      });
    },
    [enableContentEditing, setSettings, settings],
  );

  const getSectionDescription = useCallback(
    (fallback: string): string => settings.sectionDescription ?? fallback,
    [settings.sectionDescription],
  );

  const setSectionDescription = useCallback(
    (description: string) => {
      if (!enableContentEditing) return;
      const trimmed = description.trim();
      if (!trimmed) return;
      setSettings({
        ...settings,
        sectionDescription: trimmed,
      });
    },
    [enableContentEditing, setSettings, settings],
  );

  return (
    <PortfolioV2PreviewContext.Provider
      value={{
        settings,
        setSettings,
        contentEditingEnabled: enableContentEditing,
        updateTab,
        getSectionHeading,
        setSectionHeading,
        getSectionDescription,
        setSectionDescription,
      }}
    >
      {children}
    </PortfolioV2PreviewContext.Provider>
  );
}

export function usePortfolioV2Preview() {
  return useContext(PortfolioV2PreviewContext);
}

const selectClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm";

const colorInputClassName =
  "h-8 w-10 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const contentInputClassName =
  "w-full min-w-[12rem] rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-foreground backdrop-blur-sm";

export function PortfolioV2PreviewControls() {
  const context = usePortfolioV2Preview();
  if (!context) return null;

  const update = (patch: Partial<PortfolioV2PreviewSettings>) => {
    context.setSettings({ ...context.settings, ...patch });
  };

  return (
    <div className="contents">
      <label className="flex min-w-[12rem] flex-col gap-1">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Title</span>
        <input
          type="text"
          value={context.settings.sectionHeading ?? defaultPortfolioV2SectionHeading}
          onChange={(event) => update({ sectionHeading: event.target.value })}
          className={contentInputClassName}
          aria-label="Portfolio section title"
        />
      </label>
      <label className="flex min-w-[16rem] flex-col gap-1">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Intro</span>
        <textarea
          value={context.settings.sectionDescription ?? defaultPortfolioV2SectionDescription}
          onChange={(event) => update({ sectionDescription: event.target.value })}
          className={cn(contentInputClassName, "min-h-[3rem] resize-y")}
          rows={2}
          aria-label="Portfolio section intro text"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Intro color</span>
        <input
          type="color"
          value={getPortfolioV2SectionDescriptionColor(context.settings)}
          onChange={(event) => update({ sectionDescriptionColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Portfolio intro text color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Theme</span>
        <select
          value={context.settings.theme}
          onChange={(event) =>
            update({ theme: event.target.value as PortfolioSectionTheme })
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
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Width</span>
        <select
          value={context.settings.layoutWidth}
          onChange={(event) => update({ layoutWidth: event.target.value as SiteLayoutWidth })}
          className={selectClassName}
          aria-label="Portfolio layout width"
        >
          {siteLayoutWidthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Slice W</span>
        <input
          type="number"
          min={24}
          max={120}
          value={context.settings.sliceWidthPx}
          onChange={(event) => update({ sliceWidthPx: Number(event.target.value) || defaultPortfolioV2SliceWidthPx })}
          className={cn(selectClassName, "w-14")}
          aria-label="Portfolio slice width in pixels"
        />
        <span className="font-mono text-[0.65rem] text-accent-purple/70">px</span>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Slice H</span>
        <input
          type="number"
          min={120}
          max={480}
          value={context.settings.sliceHeightPx}
          onChange={(event) => update({ sliceHeightPx: Number(event.target.value) || defaultPortfolioV2SliceHeightPx })}
          className={cn(selectClassName, "w-14")}
          aria-label="Portfolio slice height in pixels"
        />
        <span className="font-mono text-[0.65rem] text-accent-purple/70">px</span>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Gap</span>
        <input
          type="number"
          min={0}
          max={32}
          value={context.settings.gapPx}
          onChange={(event) => update({ gapPx: Number(event.target.value) || defaultPortfolioV2GapPx })}
          className={cn(selectClassName, "w-14")}
          aria-label="Portfolio slice gap in pixels"
        />
        <span className="font-mono text-[0.65rem] text-accent-purple/70">px</span>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Section H</span>
        <input
          type="number"
          min={0}
          max={800}
          value={context.settings.sectionHeightPx}
          onChange={(event) =>
            update({ sectionHeightPx: Number(event.target.value) || 0 })
          }
          className={cn(selectClassName, "w-14")}
          aria-label="Portfolio section height in pixels (0 = auto)"
        />
        <span className="font-mono text-[0.65rem] text-accent-purple/70">px</span>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Hover</span>
        <input
          type="color"
          value={context.settings.sliceHoverColor}
          onChange={(event) => update({ sliceHoverColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Portfolio slice hover tint color"
        />
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(context.settings.sliceHoverOpacity * 100)}
          onChange={(event) =>
            update({ sliceHoverOpacity: Number(event.target.value) / 100 })
          }
          className="w-16 accent-accent-purple"
          aria-label="Portfolio slice hover tint strength"
        />
        <span className="font-mono text-[0.65rem] text-accent-purple/70">
          {Math.round(context.settings.sliceHoverOpacity * 100)}%
        </span>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Angled</span>
        <input
          type="checkbox"
          checked={context.settings.angledLabels}
          onChange={(event) => update({ angledLabels: event.target.checked })}
          className="size-3.5 accent-accent-purple"
          aria-label="Angled slice cut and labels"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Pad T</span>
        <input
          type="number"
          min={0}
          max={120}
          value={context.settings.sectionPaddingTopPx}
          onChange={(event) =>
            update({ sectionPaddingTopPx: Number(event.target.value) || 0 })
          }
          className={cn(selectClassName, "w-14")}
          aria-label="Portfolio section top padding"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Pad B</span>
        <input
          type="number"
          min={0}
          max={120}
          value={context.settings.sectionPaddingBottomPx}
          onChange={(event) =>
            update({ sectionPaddingBottomPx: Number(event.target.value) || 0 })
          }
          className={cn(selectClassName, "w-14")}
          aria-label="Portfolio section bottom padding"
        />
      </label>
    </div>
  );
}
