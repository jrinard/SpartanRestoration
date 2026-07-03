"use client";

import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import { ButtonPreviewControls } from "@/components/dev/ButtonPreviewControls";
import {
  defaultTextImagesV1Theme,
  getTextImageColorsForTheme,
  parseTextImageHeadlineDraft,
  shouldInvertTextImageForTheme,
  textImageEntranceSpeedOptions,
  textImagePhoneButtonMarginOptions,
  textImageSectionThemes,
  type TextImageSectionTheme,
} from "@/lib/text-image-preview";
import {
  defaultTextImagesPreviewSettings,
  textImagesCopyPaddingTopOptions,
  textImagesCopyVerticalAlignOptions,
  type TextImagesCopyVerticalAlign,
  resolveTextImagesContent,
  type TextImagesContent,
  type TextImagesPreviewSettings,
} from "@/lib/text-images-preview";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import { phoneTelHref } from "@/lib/phone";
import {
  loadTextImagesPreviewSettings,
  normalizeTextImagesPreviewSettings,
  saveTextImagesPreviewSettings,
} from "@/lib/text-images-preview-storage";

type TextImagesPreviewContextValue = {
  settings: TextImagesPreviewSettings;
  setSettings: (settings: TextImagesPreviewSettings) => void;
  contentEditingEnabled: boolean;
  getContent: (defaults: TextImagesContent) => TextImagesContent;
  setRow1Eyebrow: (value: string) => void;
  setRow1HeadlineLines: (lines: string[]) => void;
  setRow1Body: (value: string) => void;
  setRow1Image: (src: string, alt: string) => void;
  setRow2Title: (value: string) => void;
  setRow2Body: (value: string) => void;
  setRow2Image: (src: string, alt: string) => void;
  setRow3Title: (value: string) => void;
  setRow3Body: (value: string) => void;
  setRow3Phone: (label: string, href?: string) => void;
  setRow3Image: (src: string, alt: string) => void;
};

const TextImagesPreviewContext = createContext<TextImagesPreviewContextValue | null>(null);

type TextImagesPreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: TextImagesPreviewSettings;
  enableContentEditing?: boolean;
};

export function TextImagesPreviewProvider({
  children,
  instanceId,
  initialSettings,
  enableContentEditing = false,
}: TextImagesPreviewProviderProps) {
  const { settings, setSettings: persistSettings } = useInstancePreviewSettings({
    instanceId,
    field: "textImages",
    initialSettings,
    defaultSettings: defaultTextImagesPreviewSettings,
    loadGlobal: loadTextImagesPreviewSettings,
    saveGlobal: saveTextImagesPreviewSettings,
    normalize: normalizeTextImagesPreviewSettings,
  });

  const setSettings = useCallback(
    (next: TextImagesPreviewSettings) => {
      if (!enableContentEditing) return;
      persistSettings(next);
    },
    [enableContentEditing, persistSettings],
  );

  const getContent = useCallback(
    (defaults: TextImagesContent) => resolveTextImagesContent(defaults, settings),
    [settings],
  );

  const setRow1Eyebrow = useCallback(
    (value: string) => {
      if (!enableContentEditing) return;
      setSettings({ ...settings, contentRow1Eyebrow: value.trim() });
    },
    [enableContentEditing, settings, setSettings],
  );

  const setRow1HeadlineLines = useCallback(
    (lines: string[]) => {
      if (!enableContentEditing) return;
      setSettings({ ...settings, contentRow1HeadlineLines: lines });
    },
    [enableContentEditing, settings, setSettings],
  );

  const setRow1Body = useCallback(
    (value: string) => {
      if (!enableContentEditing) return;
      setSettings({ ...settings, contentRow1Body: value.trim() });
    },
    [enableContentEditing, settings, setSettings],
  );

  const setRow3Phone = useCallback(
    (label: string, href?: string) => {
      if (!enableContentEditing) return;
      const trimmedLabel = label.trim();
      setSettings({
        ...settings,
        contentRow3PhoneLabel: trimmedLabel,
        contentRow3PhoneHref: trimmedLabel
          ? href?.trim() || phoneTelHref(trimmedLabel)
          : "",
      });
    },
    [enableContentEditing, settings, setSettings],
  );

  const setRow1Image = useCallback(
    (src: string, alt: string) => {
      if (!enableContentEditing) return;
      const trimmedSrc = src.trim();
      const trimmedAlt = alt.trim();
      if (!trimmedSrc || !trimmedAlt) return;
      setSettings({
        ...settings,
        contentRow1ImageSrc: trimmedSrc,
        contentRow1ImageAlt: trimmedAlt,
      });
    },
    [enableContentEditing, settings, setSettings],
  );

  const setRow2Title = useCallback(
    (value: string) => {
      if (!enableContentEditing) return;
      setSettings({ ...settings, contentRow2Title: value.trim() });
    },
    [enableContentEditing, settings, setSettings],
  );

  const setRow2Body = useCallback(
    (value: string) => {
      if (!enableContentEditing) return;
      setSettings({ ...settings, contentRow2Body: value.trim() });
    },
    [enableContentEditing, settings, setSettings],
  );

  const setRow2Image = useCallback(
    (src: string, alt: string) => {
      if (!enableContentEditing) return;
      const trimmedSrc = src.trim();
      const trimmedAlt = alt.trim();
      if (!trimmedSrc || !trimmedAlt) return;
      setSettings({
        ...settings,
        contentRow2ImageSrc: trimmedSrc,
        contentRow2ImageAlt: trimmedAlt,
      });
    },
    [enableContentEditing, settings, setSettings],
  );

  const setRow3Title = useCallback(
    (value: string) => {
      if (!enableContentEditing) return;
      setSettings({ ...settings, contentRow3Title: value.trim() });
    },
    [enableContentEditing, settings, setSettings],
  );

  const setRow3Body = useCallback(
    (value: string) => {
      if (!enableContentEditing) return;
      setSettings({ ...settings, contentRow3Body: value.trim() });
    },
    [enableContentEditing, settings, setSettings],
  );

  const setRow3Image = useCallback(
    (src: string, alt: string) => {
      if (!enableContentEditing) return;
      const trimmedSrc = src.trim();
      const trimmedAlt = alt.trim();
      if (!trimmedSrc || !trimmedAlt) return;
      setSettings({
        ...settings,
        contentRow3ImageSrc: trimmedSrc,
        contentRow3ImageAlt: trimmedAlt,
      });
    },
    [enableContentEditing, settings, setSettings],
  );

  return (
    <TextImagesPreviewContext.Provider
      value={{
        settings,
        setSettings,
        contentEditingEnabled: enableContentEditing,
        getContent,
        setRow1Eyebrow,
        setRow1HeadlineLines,
        setRow1Body,
        setRow1Image,
        setRow2Title,
        setRow2Body,
        setRow2Image,
        setRow3Title,
        setRow3Body,
        setRow3Phone,
        setRow3Image,
      }}
    >
      {children}
    </TextImagesPreviewContext.Provider>
  );
}

export function useTextImagesPreview() {
  return useContext(TextImagesPreviewContext);
}

export { parseTextImageHeadlineDraft as parseTextImagesHeadlineDraft };

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const selectClassName =
  "section-switcher-select rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

export function TextImagesPreviewControls() {
  const context = useTextImagesPreview();
  if (!context?.contentEditingEnabled) return null;

  const update = (patch: Partial<TextImagesPreviewSettings>) => {
    context.setSettings({ ...context.settings, ...patch });
  };

  const imageInverted = shouldInvertTextImageForTheme(
    context.settings.theme,
    defaultTextImagesV1Theme,
  );

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
          aria-label="Text and images section theme"
        >
          {textImageSectionThemes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <span
        className="font-mono text-[0.65rem] tracking-wide text-accent-purple/80 uppercase"
        aria-live="polite"
      >
        Img {imageInverted ? "inv" : "std"}
      </span>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG</span>
        <input
          type="color"
          value={
            context.settings.backgroundColor.startsWith("#")
              ? context.settings.backgroundColor
              : "#12121c"
          }
          onChange={(event) => update({ backgroundColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Text and images section background color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Eyebrow</span>
        <input
          type="color"
          value={
            context.settings.eyebrowColor.startsWith("#")
              ? context.settings.eyebrowColor
              : "#ffffff"
          }
          onChange={(event) => update({ eyebrowColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Text and images eyebrow text color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Headline</span>
        <input
          type="color"
          value={
            context.settings.headlineColor.startsWith("#")
              ? context.settings.headlineColor
              : "#ffffff"
          }
          onChange={(event) => update({ headlineColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Text and images headline text color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Body</span>
        <input
          type="color"
          value={
            context.settings.bodyColor.startsWith("#") ? context.settings.bodyColor : "#ffffff"
          }
          onChange={(event) => update({ bodyColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Text and images body text color"
        />
      </label>
      <ButtonPreviewControls target="textImages" />
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Sec Top</span>
        <select
          value={context.settings.sectionPaddingTopPx}
          onChange={(event) => update({ sectionPaddingTopPx: Number(event.target.value) })}
          className={selectClassName}
          aria-label="Text and images section top padding"
        >
          {textImagesCopyPaddingTopOptions.map((padding) => (
            <option key={padding} value={padding}>
              {padding}px
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Sec Bot</span>
        <select
          value={context.settings.sectionPaddingBottomPx}
          onChange={(event) => update({ sectionPaddingBottomPx: Number(event.target.value) })}
          className={selectClassName}
          aria-label="Text and images section bottom padding"
        >
          {textImagesCopyPaddingTopOptions.map((padding) => (
            <option key={padding} value={padding}>
              {padding}px
            </option>
          ))}
        </select>
      </label>
      {(
        [
          { row: 1, alignKey: "row1CopyVerticalAlign", padKey: "row1CopyPaddingTopPx" },
          { row: 2, alignKey: "row2CopyVerticalAlign", padKey: "row2CopyPaddingTopPx" },
          { row: 3, alignKey: "row3CopyVerticalAlign", padKey: "row3CopyPaddingTopPx" },
        ] as const
      ).flatMap(({ row, alignKey, padKey }) => [
        <label key={`${row}-align`} className="flex items-center gap-2">
          <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
            R{row} Align
          </span>
          <select
            value={context.settings[alignKey]}
            onChange={(event) =>
              update({ [alignKey]: event.target.value as TextImagesCopyVerticalAlign })
            }
            className={selectClassName}
            aria-label={`Text and images row ${row} text vertical alignment`}
          >
            {textImagesCopyVerticalAlignOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>,
        <label key={`${row}-pad`} className="flex items-center gap-2">
          <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
            R{row} Text Top
          </span>
          <select
            value={context.settings[padKey]}
            onChange={(event) => update({ [padKey]: Number(event.target.value) })}
            className={selectClassName}
            aria-label={`Text and images row ${row} text top padding`}
          >
            {textImagesCopyPaddingTopOptions.map((padding) => (
              <option key={padding} value={padding}>
                {padding}px
              </option>
            ))}
          </select>
        </label>,
      ])}
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Btn Top</span>
        <select
          value={context.settings.phoneButtonMarginTopPx}
          onChange={(event) => update({ phoneButtonMarginTopPx: Number(event.target.value) })}
          className={selectClassName}
          aria-label="Text and images phone button top margin"
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
          aria-label="Enable text and images entrance animation"
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
          aria-label="Text and images entrance animation speed"
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
        onClick={() => context.setSettings(defaultTextImagesPreviewSettings)}
        className={buttonClassName}
        aria-label="Reset text and images settings to defaults"
      >
        Reset
      </button>
    </div>
  );
}
