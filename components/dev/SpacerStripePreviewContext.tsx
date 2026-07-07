"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useCreativeTheme } from "@/components/dev/CreativeProvider";
import {
  defaultSpacerGradientStyle,
  type SpacerGradientStyle,
  type SpacerStripeStyle,
} from "@/components/sections/Spacer";
import { previewGradientDirections } from "@/lib/preview-gradient";
import type { PreviewGradientDirection } from "@/lib/preview-gradient";
import { siteLayoutWidthOptions } from "@/lib/site-layout";
import type { SiteLayoutWidth } from "@/lib/site-layout";
import { getDefaultSpacerStripeStyleForVariant } from "@/lib/spacer-defaults";
import type { SpacerInstanceSettings } from "@/lib/spacer-instance-storage";
import {
  ensureSpacerStripeInstance,
  loadSpacerGradientStyle,
  loadSpacerLayoutWidth,
  loadSpacerOuterBackgroundColor,
  loadSpacerStripeStyle,
  normalizeSpacerLayoutWidth,
  normalizeSpacerOuterBackgroundColor,
  saveSpacerGradientStyle,
  saveSpacerLayoutWidth,
  saveSpacerOuterBackgroundColor,
  saveSpacerStripeStyle,
} from "@/lib/spacer-preview-storage";
import {
  defaultSpacerLayoutWidth,
} from "@/lib/spacer-instance-storage";

type SpacerPreviewContextValue = {
  stripe: SpacerStripeStyle;
  setStripe: (stripe: SpacerStripeStyle) => void;
  gradient: SpacerGradientStyle;
  setGradient: (gradient: SpacerGradientStyle) => void;
  layoutWidth: SiteLayoutWidth;
  setLayoutWidth: (layoutWidth: SiteLayoutWidth) => void;
  outerBackgroundColor: string;
  setOuterBackgroundColor: (color: string) => void;
  ready: boolean;
};

const SpacerPreviewContext = createContext<SpacerPreviewContextValue | null>(null);

type SpacerStripePreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: SpacerInstanceSettings;
  variantId?: string;
};

export function SpacerStripePreviewProvider({
  children,
  instanceId,
  initialSettings,
  variantId,
}: SpacerStripePreviewProviderProps) {
  const { colorThemeId } = useCreativeTheme();
  const lockedToPublished = initialSettings !== undefined;

  const [stripe, setStripeState] = useState<SpacerStripeStyle>(() =>
    initialSettings?.stripe ??
      getDefaultSpacerStripeStyleForVariant(variantId, colorThemeId),
  );
  const [gradient, setGradientState] = useState<SpacerGradientStyle>(
    () => initialSettings?.gradient ?? defaultSpacerGradientStyle,
  );
  const [layoutWidth, setLayoutWidthState] = useState<SiteLayoutWidth>(() =>
    initialSettings
      ? normalizeSpacerLayoutWidth(initialSettings)
      : defaultSpacerLayoutWidth,
  );
  const [outerBackgroundColor, setOuterBackgroundColorState] = useState<string>(() =>
    normalizeSpacerOuterBackgroundColor(initialSettings?.outerBackgroundColor),
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (lockedToPublished) {
      setReady(true);
      return;
    }

    const stripe = instanceId
      ? ensureSpacerStripeInstance(instanceId, colorThemeId, variantId)
      : loadSpacerStripeStyle(colorThemeId, instanceId, variantId);
    const gradient = loadSpacerGradientStyle(instanceId);
    const layoutWidth = loadSpacerLayoutWidth(instanceId, variantId);
    const outerBackground = loadSpacerOuterBackgroundColor(instanceId);

    setStripeState(stripe);
    setGradientState(gradient);
    setLayoutWidthState(layoutWidth);
    setOuterBackgroundColorState(outerBackground);
    setReady(true);
  }, [colorThemeId, instanceId, lockedToPublished, variantId]);

  const setStripe = useCallback(
    (next: SpacerStripeStyle) => {
      setStripeState(next);
      saveSpacerStripeStyle(next, instanceId);
    },
    [instanceId],
  );

  const setGradient = useCallback(
    (next: SpacerGradientStyle) => {
      setGradientState(next);
      saveSpacerGradientStyle(next, instanceId);
    },
    [instanceId],
  );

  const setLayoutWidth = useCallback(
    (next: SiteLayoutWidth) => {
      setLayoutWidthState(next);
      saveSpacerLayoutWidth(next, instanceId);
    },
    [instanceId],
  );

  const setOuterBackgroundColor = useCallback(
    (next: string) => {
      setOuterBackgroundColorState(next);
      saveSpacerOuterBackgroundColor(next, instanceId);
    },
    [instanceId],
  );

  return (
    <SpacerPreviewContext.Provider
      value={{
        stripe,
        setStripe,
        gradient,
        setGradient,
        layoutWidth,
        setLayoutWidth,
        outerBackgroundColor,
        setOuterBackgroundColor,
        ready,
      }}
    >
      {children}
    </SpacerPreviewContext.Provider>
  );
}

export function useSpacerPreview() {
  return useContext(SpacerPreviewContext);
}

/** @deprecated Use useSpacerPreview */
export function useSpacerStripePreview() {
  return useSpacerPreview();
}

const selectClassName =
  "section-switcher-select rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

export const spacerStripeHeightOptions = [
  1, 2, 3, 4, 5, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 128,
] as const;

export function SpacerLayoutWidthControl() {
  const context = useSpacerPreview();
  if (!context) return null;

  return (
    <select
      value={context.layoutWidth}
      onChange={(event) =>
        context.setLayoutWidth(event.target.value as SiteLayoutWidth)
      }
      className={selectClassName}
      aria-label="Spacer layout width"
    >
      {siteLayoutWidthOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function SpacerOuterBackgroundControl() {
  const context = useSpacerPreview();
  if (!context || context.layoutWidth !== "contained") return null;

  return (
    <label className="flex items-center gap-1.5">
      <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
        Outer BG
      </span>
      <input
        type="color"
        value={context.outerBackgroundColor}
        onChange={(event) => context.setOuterBackgroundColor(event.target.value)}
        className={colorInputClassName}
        aria-label="Spacer outer background color"
      />
    </label>
  );
}

export function SpacerContainedLayoutControls() {
  const context = useSpacerPreview();
  if (!context) return null;

  return (
    <>
      <SpacerLayoutWidthControl />
      <SpacerOuterBackgroundControl />
    </>
  );
}

export function SpacerStripePreviewControls({ variantId }: { variantId?: string }) {
  const context = useSpacerPreview();
  const { colorThemeId } = useCreativeTheme();
  if (!context) return null;

  const resetDefaults = getDefaultSpacerStripeStyleForVariant(variantId, colorThemeId);

  return (
    <>
      <label className="flex items-center gap-1.5">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG 1</span>
        <input
          type="color"
          value={context.stripe.from}
          onChange={(event) =>
            context.setStripe({ ...context.stripe, from: event.target.value })
          }
          className={colorInputClassName}
          aria-label="Spacer stripe start color"
        />
      </label>
      <label className="flex items-center gap-1.5">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG 2</span>
        <input
          type="color"
          value={context.stripe.to}
          onChange={(event) =>
            context.setStripe({ ...context.stripe, to: event.target.value })
          }
          className={colorInputClassName}
          aria-label="Spacer stripe end color"
        />
      </label>
      <select
        value={context.stripe.mode}
        onChange={(event) =>
          context.setStripe({
            ...context.stripe,
            mode: event.target.value as SpacerStripeStyle["mode"],
            direction:
              event.target.value === "center-fade" && context.stripe.direction === "none"
                ? "to right"
                : context.stripe.direction,
          })
        }
        className={selectClassName}
        aria-label="Spacer stripe gradient style"
      >
        <option value="linear">Linear</option>
        <option value="center-fade">Center fade</option>
      </select>
      <select
        value={context.stripe.direction}
        onChange={(event) =>
          context.setStripe({
            ...context.stripe,
            direction: event.target.value as PreviewGradientDirection,
          })
        }
        className={selectClassName}
        aria-label="Spacer stripe gradient direction"
      >
        {previewGradientDirections
          .filter((option) => context.stripe.mode === "linear" || option.value !== "none")
          .map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
      </select>
      <SpacerLayoutWidthControl />
      <SpacerOuterBackgroundControl />
      <select
        value={context.stripe.heightPx}
        onChange={(event) =>
          context.setStripe({
            ...context.stripe,
            heightPx: Number(event.target.value),
          })
        }
        className={selectClassName}
        aria-label="Spacer stripe height"
      >
        {spacerStripeHeightOptions.map((height) => (
          <option key={height} value={height}>
            {height}px
          </option>
        ))}
      </select>
      <label className="flex items-center gap-1.5">
        <input
          type="checkbox"
          checked={context.stripe.overlap === true}
          onChange={(event) =>
            context.setStripe({ ...context.stripe, overlap: event.target.checked })
          }
          className="h-3.5 w-3.5 cursor-pointer accent-accent-purple"
          aria-label="Spacer overlap adjacent sections"
        />
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Overlap</span>
      </label>
      <button
        type="button"
        onClick={() => context.setStripe(resetDefaults)}
        className={buttonClassName}
        aria-label="Reset spacer stripe to defaults"
      >
        Reset
      </button>
    </>
  );
}

/** @deprecated Spacer-v2 uses SpacerStripePreviewControls */
export function SpacerGradientPreviewControls() {
  return <SpacerStripePreviewControls variantId="spacer-v2" />;
}
