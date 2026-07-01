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
import { getDefaultSpacerStripeStyle } from "@/lib/spacer-defaults";
import type { SpacerInstanceSettings } from "@/lib/spacer-instance-storage";
import {
  loadSpacerGradientStyle,
  loadSpacerStripeStyle,
  saveSpacerGradientStyle,
  saveSpacerStripeStyle,
} from "@/lib/spacer-preview-storage";

type SpacerPreviewContextValue = {
  stripe: SpacerStripeStyle;
  setStripe: (stripe: SpacerStripeStyle) => void;
  gradient: SpacerGradientStyle;
  setGradient: (gradient: SpacerGradientStyle) => void;
  ready: boolean;
};

const SpacerPreviewContext = createContext<SpacerPreviewContextValue | null>(null);

type SpacerStripePreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: SpacerInstanceSettings;
};

export function SpacerStripePreviewProvider({
  children,
  instanceId,
  initialSettings,
}: SpacerStripePreviewProviderProps) {
  const { colorThemeId } = useCreativeTheme();
  const lockedToPublished = initialSettings !== undefined;

  const [stripe, setStripeState] = useState<SpacerStripeStyle>(() =>
    initialSettings?.stripe ?? getDefaultSpacerStripeStyle(colorThemeId),
  );
  const [gradient, setGradientState] = useState<SpacerGradientStyle>(
    () => initialSettings?.gradient ?? defaultSpacerGradientStyle,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (lockedToPublished) {
      setReady(true);
      return;
    }

    setStripeState(loadSpacerStripeStyle(colorThemeId, instanceId));
    setGradientState(loadSpacerGradientStyle(instanceId));
    setReady(true);
  }, [colorThemeId, instanceId, lockedToPublished]);

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

  return (
    <SpacerPreviewContext.Provider
      value={{ stripe, setStripe, gradient, setGradient, ready }}
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

export const spacerStripeHeightOptions = [1, 2, 3, 4, 5, 8, 12, 16, 24] as const;

export const spacerGradientHeightOptions = [24, 32, 40, 48, 64, 80, 96, 128] as const;

export function SpacerStripePreviewControls() {
  const context = useSpacerPreview();
  const { colorThemeId } = useCreativeTheme();
  if (!context) return null;

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
      <button
        type="button"
        onClick={() => context.setStripe(getDefaultSpacerStripeStyle(colorThemeId))}
        className={buttonClassName}
        aria-label="Reset spacer stripe to defaults"
      >
        Reset
      </button>
    </>
  );
}

export function SpacerGradientPreviewControls() {
  const context = useSpacerPreview();
  if (!context) return null;

  return (
    <>
      <select
        value={context.gradient.heightPx}
        onChange={(event) =>
          context.setGradient({
            ...context.gradient,
            heightPx: Number(event.target.value),
          })
        }
        className={selectClassName}
        aria-label="Spacer gradient height"
      >
        {spacerGradientHeightOptions.map((height) => (
          <option key={height} value={height}>
            {height}px
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => context.setGradient(defaultSpacerGradientStyle)}
        className={buttonClassName}
        aria-label="Reset spacer gradient to defaults"
      >
        Reset
      </button>
    </>
  );
}
