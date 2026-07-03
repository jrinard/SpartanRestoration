"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ButtonPreviewControls } from "@/components/dev/ButtonPreviewControls";
import {
  defaultTextImagePreviewSettings,
  getTextImageColorsForTheme,
  parseTextImageHeadlineDraft,
  resolveTextImageContent,
  textImageEntranceSpeedOptions,
  textImagePhoneButtonMarginOptions,
  textImageSectionThemes,
  type TextImageContent,
  type TextImagePreviewSettings,
  type TextImageSectionTheme,
} from "@/lib/text-image-preview";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import { phoneTelHref } from "@/lib/phone";
import {
  loadTextImagePreviewSettings,
  normalizeTextImagePreviewSettings,
  saveTextImagePreviewSettings,
} from "@/lib/text-image-preview-storage";

type TextImagePreviewContextValue = {
  settings: TextImagePreviewSettings;
  setSettings: (settings: TextImagePreviewSettings) => void;
  contentEditingEnabled: boolean;
  getContent: (defaults: TextImageContent) => TextImageContent;
  setContentEyebrow: (value: string) => void;
  setContentHeadlineLines: (lines: string[]) => void;
  setContentBody: (value: string) => void;
  setContentSidebarText: (value: string) => void;
  setContentPhone: (label: string, href?: string) => void;
  setContentImage: (src: string, alt: string) => void;
};

const TextImagePreviewContext = createContext<TextImagePreviewContextValue | null>(null);

type TextImagePreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: TextImagePreviewSettings;
  enableContentEditing?: boolean;
};

export function TextImagePreviewProvider({
  children,
  instanceId,
  initialSettings,
  enableContentEditing = false,
}: TextImagePreviewProviderProps) {
  const { settings, setSettings: persistSettings } = useInstancePreviewSettings({
    instanceId,
    field: "textImage",
    initialSettings,
    defaultSettings: defaultTextImagePreviewSettings,
    loadGlobal: loadTextImagePreviewSettings,
    saveGlobal: saveTextImagePreviewSettings,
    normalize: normalizeTextImagePreviewSettings,
  });

  const setSettings = useCallback(
    (next: TextImagePreviewSettings) => {
      if (!enableContentEditing) return;
      persistSettings(next);
    },
    [enableContentEditing, persistSettings],
  );

  const getContent = useCallback(
    (defaults: TextImageContent) => resolveTextImageContent(defaults, settings),
    [settings],
  );

  const setContentEyebrow = useCallback(
    (value: string) => {
      if (!enableContentEditing) return;
      setSettings({ ...settings, contentEyebrow: value.trim() });
    },
    [enableContentEditing, settings, setSettings],
  );

  const setContentHeadlineLines = useCallback(
    (lines: string[]) => {
      if (!enableContentEditing) return;
      setSettings({ ...settings, contentHeadlineLines: lines });
    },
    [enableContentEditing, settings, setSettings],
  );

  const setContentBody = useCallback(
    (value: string) => {
      if (!enableContentEditing) return;
      setSettings({ ...settings, contentBody: value.trim() });
    },
    [enableContentEditing, settings, setSettings],
  );

  const setContentSidebarText = useCallback(
    (value: string) => {
      if (!enableContentEditing) return;
      setSettings({ ...settings, contentSidebarText: value.trim() });
    },
    [enableContentEditing, settings, setSettings],
  );

  const setContentPhone = useCallback(
    (label: string, href?: string) => {
      if (!enableContentEditing) return;
      const trimmedLabel = label.trim();
      setSettings({
        ...settings,
        contentPhoneLabel: trimmedLabel,
        contentPhoneHref: trimmedLabel
          ? href?.trim() || phoneTelHref(trimmedLabel)
          : "",
      });
    },
    [enableContentEditing, settings, setSettings],
  );

  const setContentImage = useCallback(
    (src: string, alt: string) => {
      if (!enableContentEditing) return;
      const trimmedSrc = src.trim();
      const trimmedAlt = alt.trim();
      if (!trimmedSrc || !trimmedAlt) return;
      setSettings({
        ...settings,
        contentImageSrc: trimmedSrc,
        contentImageAlt: trimmedAlt,
      });
    },
    [enableContentEditing, settings, setSettings],
  );

  return (
    <TextImagePreviewContext.Provider
      value={{
        settings,
        setSettings,
        contentEditingEnabled: enableContentEditing,
        getContent,
        setContentEyebrow,
        setContentHeadlineLines,
        setContentBody,
        setContentSidebarText,
        setContentPhone,
        setContentImage,
      }}
    >
      {children}
    </TextImagePreviewContext.Provider>
  );
}

export function useTextImagePreview() {
  return useContext(TextImagePreviewContext);
}

export { parseTextImageHeadlineDraft };

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const selectClassName =
  "section-switcher-select rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

export function TextImagePreviewControls() {
  const context = useTextImagePreview();
  if (!context?.contentEditingEnabled) return null;

  const update = (patch: Partial<TextImagePreviewSettings>) => {
    context.setSettings({ ...context.settings, ...patch });
  };

  return (
    <div className="contents">
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Theme</span>
        <select
          value={context.settings.theme}
          onChange={(event) => {
            const theme = event.target.value as TextImageSectionTheme;
            update({
              theme,
              ...getTextImageColorsForTheme(theme),
            });
          }}
          className={selectClassName}
          aria-label="Text and image section theme"
        >
          {textImageSectionThemes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex cursor-pointer items-center gap-1.5 rounded border border-accent-purple/40 bg-background/90 px-2 py-1.5 backdrop-blur-sm">
        <input
          type="checkbox"
          checked={context.settings.layoutInverted}
          onChange={(event) => update({ layoutInverted: event.target.checked })}
          className="h-3.5 w-3.5 accent-accent-purple"
          aria-label="Invert text and image layout"
        />
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Invert</span>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG</span>
        <input
          type="color"
          value={
            context.settings.backgroundColor.startsWith("#")
              ? context.settings.backgroundColor
              : "#ffffff"
          }
          onChange={(event) => update({ backgroundColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Text and image section background color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Eyebrow</span>
        <input
          type="color"
          value={
            context.settings.eyebrowColor.startsWith("#")
              ? context.settings.eyebrowColor
              : "#56616A"
          }
          onChange={(event) => update({ eyebrowColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Text and image eyebrow text color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Headline</span>
        <input
          type="color"
          value={
            context.settings.headlineColor.startsWith("#")
              ? context.settings.headlineColor
              : "#000000"
          }
          onChange={(event) => update({ headlineColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Text and image headline text color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Body</span>
        <input
          type="color"
          value={
            context.settings.bodyColor.startsWith("#") ? context.settings.bodyColor : "#333333"
          }
          onChange={(event) => update({ bodyColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Text and image body text color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Sidebar</span>
        <input
          type="color"
          value={
            context.settings.sidebarTextColor.startsWith("#")
              ? context.settings.sidebarTextColor
              : "#333333"
          }
          onChange={(event) => update({ sidebarTextColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Text and image sidebar text color"
        />
      </label>
      <ButtonPreviewControls target="textImage" />
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Btn Top</span>
        <select
          value={context.settings.phoneButtonMarginTopPx}
          onChange={(event) => update({ phoneButtonMarginTopPx: Number(event.target.value) })}
          className={selectClassName}
          aria-label="Text and image phone button top margin"
        >
          {textImagePhoneButtonMarginOptions.map((margin) => (
            <option key={margin} value={margin}>
              {margin}px
            </option>
          ))}
        </select>
      </label>
      <label className="flex cursor-pointer items-center gap-1.5 rounded border border-accent-purple/40 bg-background/90 px-2 py-1.5 backdrop-blur-sm">
        <input
          type="checkbox"
          checked={context.settings.entranceAnimationEnabled}
          onChange={(event) => update({ entranceAnimationEnabled: event.target.checked })}
          className="h-3.5 w-3.5 accent-accent-purple"
          aria-label="Enable text and image entrance animation"
        />
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Anim</span>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Anim Spd</span>
        <select
          value={context.settings.entranceAnimationSpeedMs}
          onChange={(event) =>
            update({ entranceAnimationSpeedMs: Number(event.target.value) })
          }
          disabled={!context.settings.entranceAnimationEnabled}
          className={selectClassName}
          aria-label="Text and image entrance animation speed"
        >
          {textImageEntranceSpeedOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={() => context.setSettings(defaultTextImagePreviewSettings)}
        className={buttonClassName}
        aria-label="Reset text and image settings to defaults"
      >
        Reset
      </button>
    </div>
  );
}
