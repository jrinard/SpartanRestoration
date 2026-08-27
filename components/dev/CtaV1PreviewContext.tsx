"use client";

import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import { ButtonPreviewControls } from "@/components/dev/ButtonPreviewControls";
import {
  ctaV1CardBorderRadiusOptions,
  ctaV1CardBackgroundModes,
  ctaV1LayoutWidths,
  defaultCtaV1PreviewSettings,
  resolveCtaV1Content,
  type CtaV1CardBackgroundMode,
  type CtaV1Content,
  type CtaV1LayoutWidth,
  type CtaV1PreviewSettings,
} from "@/lib/cta-v1-preview";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import { phoneTelHref } from "@/lib/phone";
import {
  loadCtaV1PreviewSettings,
  normalizeCtaV1PreviewSettings,
  saveCtaV1PreviewSettings,
} from "@/lib/cta-v1-preview-storage";

type CtaV1PreviewContextValue = {
  settings: CtaV1PreviewSettings;
  setSettings: (settings: CtaV1PreviewSettings) => void;
  contentEditingEnabled: boolean;
  getContent: (defaults: CtaV1Content) => CtaV1Content;
  setContentHeadlineLines: (lines: string[]) => void;
  setContentPhone: (label: string, href?: string) => void;
};

const CtaV1PreviewContext = createContext<CtaV1PreviewContextValue | null>(null);

type CtaV1PreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: CtaV1PreviewSettings;
  enableContentEditing?: boolean;
};

export function CtaV1PreviewProvider({
  children,
  instanceId,
  initialSettings,
  enableContentEditing = false,
}: CtaV1PreviewProviderProps) {
  const { settings, setSettings: persistSettings } = useInstancePreviewSettings({
    instanceId,
    field: "ctaV1",
    initialSettings,
    defaultSettings: defaultCtaV1PreviewSettings,
    loadGlobal: loadCtaV1PreviewSettings,
    saveGlobal: saveCtaV1PreviewSettings,
    normalize: normalizeCtaV1PreviewSettings,
  });

  const setSettings = useCallback(
    (next: CtaV1PreviewSettings) => {
      persistSettings(next);
    },
    [persistSettings],
  );

  const getContent = useCallback(
    (defaults: CtaV1Content) => resolveCtaV1Content(defaults, settings),
    [settings],
  );

  const setContentHeadlineLines = useCallback(
    (lines: string[]) => {
      if (!enableContentEditing) return;
      setSettings({ ...settings, contentHeadlineLines: lines });
    },
    [enableContentEditing, settings, setSettings],
  );

  const setContentPhone = useCallback(
    (label: string, href?: string) => {
      if (!enableContentEditing) return;
      const trimmed = label.trim();
      setSettings({
        ...settings,
        contentPhoneLabel: trimmed,
        contentPhoneHref: href?.trim() || (trimmed ? phoneTelHref(trimmed) : ""),
      });
    },
    [enableContentEditing, settings, setSettings],
  );

  return (
    <CtaV1PreviewContext.Provider
      value={{
        settings,
        setSettings,
        contentEditingEnabled: enableContentEditing,
        getContent,
        setContentHeadlineLines,
        setContentPhone,
      }}
    >
      {children}
    </CtaV1PreviewContext.Provider>
  );
}

export function useCtaV1Preview() {
  return useContext(CtaV1PreviewContext);
}

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const selectClassName =
  "section-switcher-select rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const rangeClassName = "h-1.5 w-20 cursor-pointer accent-accent-purple";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

export function CtaV1PreviewControls() {
  const context = useCtaV1Preview();
  if (!context) return null;

  const update = (patch: Partial<CtaV1PreviewSettings>) => {
    context.setSettings({ ...context.settings, ...patch });
  };

  const cardRadiusIndex = ctaV1CardBorderRadiusOptions.indexOf(
    context.settings.cardBorderRadiusPx as (typeof ctaV1CardBorderRadiusOptions)[number],
  );
  const cardRadiusSliderIndex = cardRadiusIndex >= 0 ? cardRadiusIndex : 3;
  const isGradient = context.settings.cardBackgroundMode === "gradient";

  return (
    <div className="contents">
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Width</span>
        <select
          value={context.settings.layoutWidth}
          onChange={(event) => update({ layoutWidth: event.target.value as CtaV1LayoutWidth })}
          className={selectClassName}
          aria-label="CTA layout width"
        >
          {ctaV1LayoutWidths.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Outer BG</span>
        <input
          type="color"
          value={context.settings.outerBackgroundColor}
          onChange={(event) => update({ outerBackgroundColor: event.target.value })}
          className={colorInputClassName}
          aria-label="CTA outer background color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Card fill</span>
        <select
          value={context.settings.cardBackgroundMode}
          onChange={(event) =>
            update({ cardBackgroundMode: event.target.value as CtaV1CardBackgroundMode })
          }
          className={selectClassName}
          aria-label="CTA card background mode"
        >
          {ctaV1CardBackgroundModes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      {!isGradient ? (
        <label className="flex items-center gap-2">
          <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Card BG</span>
          <input
            type="color"
            value={context.settings.cardBackgroundColor}
            onChange={(event) => update({ cardBackgroundColor: event.target.value })}
            className={colorInputClassName}
            aria-label="CTA card solid background color"
          />
        </label>
      ) : (
        <>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">From</span>
            <input
              type="color"
              value={context.settings.cardGradientFrom}
              onChange={(event) => update({ cardGradientFrom: event.target.value })}
              className={colorInputClassName}
              aria-label="CTA card gradient start color"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">To</span>
            <input
              type="color"
              value={context.settings.cardGradientTo}
              onChange={(event) => update({ cardGradientTo: event.target.value })}
              className={colorInputClassName}
              aria-label="CTA card gradient end color"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Angle</span>
            <input
              type="range"
              min={0}
              max={360}
              value={context.settings.cardGradientAngle}
              onChange={(event) => update({ cardGradientAngle: Number(event.target.value) })}
              className={rangeClassName}
              aria-label="CTA card gradient angle"
            />
            <span className="w-8 font-mono text-[0.65rem] text-accent-purple">
              {context.settings.cardGradientAngle}°
            </span>
          </label>
        </>
      )}
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Card radius</span>
        <input
          type="range"
          min={0}
          max={ctaV1CardBorderRadiusOptions.length - 1}
          step={1}
          value={cardRadiusSliderIndex}
          onChange={(event) =>
            update({
              cardBorderRadiusPx: ctaV1CardBorderRadiusOptions[Number(event.target.value)],
            })
          }
          className={rangeClassName}
          aria-label="CTA card border radius"
          aria-valuemin={ctaV1CardBorderRadiusOptions[0]}
          aria-valuemax={ctaV1CardBorderRadiusOptions[ctaV1CardBorderRadiusOptions.length - 1]}
          aria-valuenow={context.settings.cardBorderRadiusPx}
        />
        <span className="w-8 font-mono text-[0.65rem] text-accent-purple">
          {context.settings.cardBorderRadiusPx}px
        </span>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Headline</span>
        <input
          type="color"
          value={context.settings.headlineColor}
          onChange={(event) => update({ headlineColor: event.target.value })}
          className={colorInputClassName}
          aria-label="CTA headline color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Button</span>
        <input
          type="checkbox"
          checked={context.settings.buttonVisible}
          onChange={(event) => update({ buttonVisible: event.target.checked })}
          className="accent-accent-purple"
          aria-label="Show CTA phone button"
        />
      </label>
      {context.settings.buttonVisible && (
        <ButtonPreviewControls target="ctaV1" buttonOnlyReset />
      )}
      <button
        type="button"
        onClick={() => context.setSettings(defaultCtaV1PreviewSettings)}
        className={buttonClassName}
        aria-label="Reset CTA settings to defaults"
      >
        Reset
      </button>
    </div>
  );
}
