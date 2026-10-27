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
  defaultPortfolioV3PreviewSettings,
  defaultPortfolioV3SectionDescription,
  defaultPortfolioV3SectionHeading,
  defaultPortfolioV3PhoneLabel,
  defaultPortfolioV3IntroButtonSize,
  defaultPortfolioV3PhoneBarHoverBackground,
  getPortfolioV3SectionDescriptionColor,
  defaultPortfolioV3CardGapPx,
  defaultPortfolioV3ColumnCount,
  defaultPortfolioV3HoverScale,
  portfolioV3WallStyleOptions,
  type PortfolioV3PreviewSettings,
  type PortfolioV3Card,
  type PortfolioSectionTheme,
  type PortfolioV3WallStyle,
} from "@/lib/portfolio-v3-preview";
import {
  loadPortfolioV3PreviewSettings,
  normalizePortfolioV3PreviewSettings,
  savePortfolioV3PreviewSettings,
} from "@/lib/portfolio-v3-preview-storage";
import { updatePortfolioV3Card } from "@/lib/portfolio-v3-cards";
import {
  portfolioV3HasGalleryTabs,
  syncPortfolioV3CardsFromGalleryTabs,
} from "@/lib/portfolio-v3-gallery-tabs";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import { siteLayoutWidthOptions, type SiteLayoutWidth } from "@/lib/site-layout";
import { portfolioSectionThemes } from "@/lib/portfolio-v3-preview";
import { phoneTelHref } from "@/lib/phone";
import { buttonPreviewSizes, type ButtonPreviewSize } from "@/lib/button-preview";
import { cn } from "@/lib/utils";

type PortfolioV3PreviewContextValue = {
  settings: PortfolioV3PreviewSettings;
  setSettings: (settings: PortfolioV3PreviewSettings) => void;
  contentEditingEnabled: boolean;
  updateCard: (
    cardId: string,
    patch: Partial<Omit<PortfolioV3Card, "id">>,
    galleryTabId?: string,
  ) => void;
  activeGalleryTabId: string | null;
  setActiveGalleryTabId: (tabId: string | null) => void;
  getSectionHeading: (fallback: string) => string;
  setSectionHeading: (heading: string) => void;
  getSectionDescription: (fallback: string) => string;
  setSectionDescription: (description: string) => void;
  setContentPhone: (label: string, href?: string) => void;
};

const PortfolioV3PreviewContext = createContext<PortfolioV3PreviewContextValue | null>(null);

type PortfolioV3PreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: PortfolioV3PreviewSettings;
  enableContentEditing?: boolean;
};

export function PortfolioV3PreviewProvider({
  children,
  instanceId,
  initialSettings,
  enableContentEditing = false,
}: PortfolioV3PreviewProviderProps) {
  const { settings, setSettings: persistSettings } = useInstancePreviewSettings({
    instanceId,
    field: "portfolioV3",
    initialSettings,
    defaultSettings: defaultPortfolioV3PreviewSettings,
    loadGlobal: loadPortfolioV3PreviewSettings,
    saveGlobal: savePortfolioV3PreviewSettings,
    normalize: normalizePortfolioV3PreviewSettings,
  });

  const [activeGalleryTabId, setActiveGalleryTabId] = useState<string | null>(null);

  useEffect(() => {
    if (!portfolioV3HasGalleryTabs(settings)) {
      setActiveGalleryTabId(null);
      return;
    }
    setActiveGalleryTabId((current) => {
      if (current && settings.galleryTabs!.some((tab) => tab.id === current)) return current;
      return settings.galleryTabs![0]?.id ?? null;
    });
  }, [settings]);

  const setSettings = useCallback(
    (next: PortfolioV3PreviewSettings) => {
      const normalized = normalizePortfolioV3PreviewSettings(
        portfolioV3HasGalleryTabs(next) ? syncPortfolioV3CardsFromGalleryTabs(next) : next,
      );
      persistSettings(normalized);
    },
    [persistSettings],
  );

  const updateCard = useCallback(
    (
      cardId: string,
      patch: Partial<Omit<PortfolioV3Card, "id">>,
      galleryTabId?: string,
    ) => {
      if (portfolioV3HasGalleryTabs(settings) && galleryTabId) {
        setSettings({
          ...settings,
          galleryTabs: settings.galleryTabs!.map((tab) =>
            tab.id === galleryTabId
              ? { ...tab, cards: updatePortfolioV3Card(tab.cards, cardId, patch) }
              : tab,
          ),
        });
        return;
      }

      setSettings({
        ...settings,
        cards: updatePortfolioV3Card(settings.cards, cardId, patch),
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
      setSettings({ ...settings, sectionHeading: trimmed });
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
      setSettings({ ...settings, sectionDescription: trimmed });
    },
    [enableContentEditing, setSettings, settings],
  );

  const setContentPhone = useCallback(
    (label: string, href?: string) => {
      if (!enableContentEditing) return;
      const trimmedLabel = label.trim();
      setSettings({
        ...settings,
        contentPhoneLabel: trimmedLabel,
        contentPhoneHref:
          href !== undefined ? href.trim() || phoneTelHref(trimmedLabel) : settings.contentPhoneHref,
      });
    },
    [enableContentEditing, setSettings, settings],
  );

  return (
    <PortfolioV3PreviewContext.Provider
      value={{
        settings,
        setSettings,
        contentEditingEnabled: enableContentEditing,
        updateCard,
        activeGalleryTabId,
        setActiveGalleryTabId,
        getSectionHeading,
        setSectionHeading,
        getSectionDescription,
        setSectionDescription,
        setContentPhone,
      }}
    >
      {children}
    </PortfolioV3PreviewContext.Provider>
  );
}

export function usePortfolioV3Preview() {
  return useContext(PortfolioV3PreviewContext);
}

const selectClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm";

const colorInputClassName =
  "h-8 w-10 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const contentInputClassName =
  "w-full min-w-[12rem] rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-foreground backdrop-blur-sm";

export function PortfolioV3PreviewControls() {
  const context = usePortfolioV3Preview();
  if (!context) return null;

  const update = (patch: Partial<PortfolioV3PreviewSettings>) => {
    context.setSettings({ ...context.settings, ...patch });
  };

  return (
    <div className="contents">
      <label className="flex min-w-[12rem] flex-col gap-1">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Title</span>
        <input
          type="text"
          value={context.settings.sectionHeading ?? defaultPortfolioV3SectionHeading}
          onChange={(event) => update({ sectionHeading: event.target.value })}
          className={contentInputClassName}
          aria-label="Gallery section title"
        />
      </label>
      <label className="flex min-w-[16rem] flex-col gap-1">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Intro</span>
        <textarea
          value={context.settings.sectionDescription ?? defaultPortfolioV3SectionDescription}
          onChange={(event) => update({ sectionDescription: event.target.value })}
          className={cn(contentInputClassName, "min-h-[3rem] resize-y")}
          rows={2}
          aria-label="Gallery section intro text"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Intro color</span>
        <input
          type="color"
          value={getPortfolioV3SectionDescriptionColor(context.settings)}
          onChange={(event) => update({ sectionDescriptionColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Gallery intro text color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Theme</span>
        <select
          value={context.settings.theme}
          onChange={(event) => update({ theme: event.target.value as PortfolioSectionTheme })}
          className={selectClassName}
          aria-label="Gallery section theme"
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
          aria-label="Gallery layout width"
        >
          {siteLayoutWidthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Style</span>
        <select
          value={context.settings.wallStyle}
          onChange={(event) => update({ wallStyle: event.target.value as PortfolioV3WallStyle })}
          className={selectClassName}
          aria-label="Gallery wall style"
        >
          {portfolioV3WallStyleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Gap</span>
        <input
          type="number"
          min={0}
          max={48}
          value={context.settings.cardGapPx}
          onChange={(event) =>
            update({ cardGapPx: Number(event.target.value) || defaultPortfolioV3CardGapPx })
          }
          className={cn(selectClassName, "w-14")}
          aria-label="Gap between gallery cards in pixels"
        />
        <span className="font-mono text-[0.65rem] text-accent-purple/70">px</span>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Radius</span>
        <input
          type="number"
          min={0}
          max={48}
          value={context.settings.cardBorderRadiusPx}
          onChange={(event) => update({ cardBorderRadiusPx: Number(event.target.value) || 0 })}
          className={cn(selectClassName, "w-14")}
          aria-label="Gallery card corner radius in pixels"
        />
        <span className="font-mono text-[0.65rem] text-accent-purple/70">px</span>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Cols</span>
        <input
          type="number"
          min={1}
          max={6}
          value={context.settings.columnCount}
          onChange={(event) =>
            update({ columnCount: Number(event.target.value) || defaultPortfolioV3ColumnCount })
          }
          className={cn(selectClassName, "w-14")}
          aria-label="Gallery column count"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Hover</span>
        <input
          type="number"
          min={1}
          max={1.12}
          step={0.01}
          value={context.settings.cardHoverScale}
          onChange={(event) =>
            update({ cardHoverScale: Number(event.target.value) || defaultPortfolioV3HoverScale })
          }
          className={cn(selectClassName, "w-14")}
          aria-label="Gallery card hover scale"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Copy left</span>
        <input
          type="checkbox"
          checked={context.settings.copyOnLeft}
          onChange={(event) => update({ copyOnLeft: event.target.checked })}
          className="accent-accent-purple"
          aria-label="Show intro copy in a left column on large screens"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Captions</span>
        <input
          type="checkbox"
          checked={context.settings.captionsVisible}
          onChange={(event) => update({ captionsVisible: event.target.checked })}
          className="accent-accent-purple"
          aria-label="Show captions under gallery thumbnails"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Button</span>
        <input
          type="checkbox"
          checked={context.settings.phoneBarVisible}
          onChange={(event) => {
            const enabled = event.target.checked;
            const patch: Partial<PortfolioV3PreviewSettings> = { phoneBarVisible: enabled };
            if (enabled && !context.settings.contentPhoneLabel?.trim()) {
              patch.contentPhoneLabel = defaultPortfolioV3PhoneLabel;
            }
            update(patch);
          }}
          className="accent-accent-purple"
          aria-label="Show CTA button under gallery intro copy"
        />
      </label>
      {context.settings.phoneBarVisible && (
        <>
          <label className="flex min-w-[10rem] flex-col gap-1">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Label</span>
            <input
              type="text"
              value={context.settings.contentPhoneLabel ?? ""}
              placeholder="Contact us — (503) 975-9082"
              onChange={(event) => update({ contentPhoneLabel: event.target.value })}
              className={contentInputClassName}
              aria-label="Intro button label"
            />
          </label>
          <label className="flex min-w-[10rem] flex-col gap-1">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Link</span>
            <input
              type="text"
              value={context.settings.contentPhoneHref ?? ""}
              placeholder="tel: or /contact"
              onChange={(event) =>
                update({ contentPhoneHref: event.target.value.trim() || undefined })
              }
              className={contentInputClassName}
              aria-label="Intro button link (optional; tel: inferred from label)"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Bg</span>
            <input
              type="color"
              value={context.settings.phoneBarBackgroundColor}
              onChange={(event) => update({ phoneBarBackgroundColor: event.target.value })}
              className={colorInputClassName}
              aria-label="Intro button background color"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Text</span>
            <input
              type="color"
              value={context.settings.phoneBarTextColor}
              onChange={(event) => update({ phoneBarTextColor: event.target.value })}
              className={colorInputClassName}
              aria-label="Intro button text color"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Hover bg</span>
            <input
              type="color"
              value={
                context.settings.phoneBarHoverBackgroundColor ??
                defaultPortfolioV3PhoneBarHoverBackground
              }
              onChange={(event) =>
                update({ phoneBarHoverBackgroundColor: event.target.value })
              }
              className={colorInputClassName}
              aria-label="Intro button hover background"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Hover text</span>
            <input
              type="color"
              value={context.settings.phoneBarTextHoverColor ?? context.settings.phoneBarTextColor}
              onChange={(event) => update({ phoneBarTextHoverColor: event.target.value })}
              className={colorInputClassName}
              aria-label="Intro button hover text color"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Size</span>
            <select
              value={context.settings.introButtonSize ?? defaultPortfolioV3IntroButtonSize}
              onChange={(event) =>
                update({ introButtonSize: event.target.value as ButtonPreviewSize })
              }
              className={selectClassName}
              aria-label="Intro button size (hero-v4 CTA sizes)"
            >
              {buttonPreviewSizes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Radius</span>
            <input
              type="number"
              min={0}
              max={48}
              value={context.settings.introButtonRadiusPx ?? 4}
              onChange={(event) =>
                update({ introButtonRadiusPx: Number(event.target.value) || 0 })
              }
              className={cn(selectClassName, "w-14")}
              aria-label="Intro button corner radius in pixels"
            />
            <span className="font-mono text-[0.65rem] text-accent-purple/70">px</span>
          </label>
        </>
      )}
    </div>
  );
}
