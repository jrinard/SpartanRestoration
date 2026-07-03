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
  getDefaultHeaderV3PreviewSettingsForVariant,
  getDefaultHeaderHeightPx,
  headerHeightOptions,
  headerLogoHeightOptions,
  headerLogoMarginTopOptions,
  headerLogoSizeOptions,
  headerLogoVerticalAlignOptions,
  headerV1NavTextSizeOptions,
  formatHeaderV1NavTextSizeEm,
  headerV3LayoutWidths,
  headerV3LogoVariants,
  headerVariantUsesCustomBackground,
  type HeaderV3LayoutWidth,
  type HeaderV3LogoVariant,
  type HeaderLogoVerticalAlign,
  type HeaderV3PreviewSettings,
} from "@/lib/header-v3-gradient";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import {
  loadHeaderV3PreviewSettings,
  normalizeHeaderV3PreviewSettings,
  saveHeaderV3PreviewSettings,
} from "@/lib/header-v3-storage";
import { ButtonPreviewControls } from "@/components/dev/ButtonPreviewControls";
import {
  alphaPercentFromBackground,
  colorInputHexFromBackground,
  setBackgroundColorAlpha,
  setBackgroundColorRgb,
} from "@/lib/button-preview";
import { previewGradientDirections } from "@/lib/preview-gradient";
import type { PreviewGradientDirection } from "@/lib/preview-gradient";

type HeaderV3PreviewContextValue = {
  settings: HeaderV3PreviewSettings;
  setSettings: (settings: HeaderV3PreviewSettings) => void;
};

const HeaderV3PreviewContext = createContext<HeaderV3PreviewContextValue | null>(null);

type HeaderV3PreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: HeaderV3PreviewSettings;
};

export function HeaderV3PreviewProvider({
  children,
  instanceId,
  initialSettings,
}: HeaderV3PreviewProviderProps) {
  const { settings, setSettings } = useInstancePreviewSettings({
    instanceId,
    field: "headerV3",
    initialSettings,
    defaultSettings: defaultHeaderV3PreviewSettings,
    loadGlobal: loadHeaderV3PreviewSettings,
    saveGlobal: saveHeaderV3PreviewSettings,
    normalize: normalizeHeaderV3PreviewSettings,
  });

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

const alphaRangeClassName = "h-1.5 w-16 cursor-pointer accent-accent-purple";

export function HeaderV3PreviewControls({ variantId }: { variantId?: string }) {
  const context = useHeaderV3Preview();
  if (!context) return null;

  const showCustomHeaderControls = variantId
    ? headerVariantUsesCustomBackground(variantId)
    : false;

  const update = (patch: Partial<HeaderV3PreviewSettings>) => {
    context.setSettings({ ...context.settings, ...patch });
  };

  return (
    <div className="contents">
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
      {showCustomHeaderControls && (
        <>
          <select
            value={context.settings.backgroundMode}
            onChange={(event) =>
              update({
                backgroundMode: event.target.value as HeaderV3PreviewSettings["backgroundMode"],
                backgroundDirection:
                  event.target.value === "center-fade" &&
                  context.settings.backgroundDirection === "none"
                    ? "to right"
                    : context.settings.backgroundDirection,
              })
            }
            className={selectClassName}
            aria-label="Header background gradient style"
          >
            <option value="linear">Linear</option>
            <option value="center-fade">Center fade</option>
          </select>
          <select
            value={context.settings.backgroundDirection}
            onChange={(event) =>
              update({
                backgroundDirection: event.target.value as PreviewGradientDirection,
              })
            }
            className={selectClassName}
            aria-label="Header background gradient direction"
          >
            {previewGradientDirections
              .filter(
                (option) =>
                  context.settings.backgroundMode === "linear" || option.value !== "none",
              )
              .map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </select>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
              Height
            </span>
            <select
              value={context.settings.headerHeightPx}
              onChange={(event) =>
                update({ headerHeightPx: Number(event.target.value) })
              }
              className={selectClassName}
              aria-label="Header height"
            >
              {headerHeightOptions.map((height) => (
                <option key={height} value={height}>
                  {height}px
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
              Logo
            </span>
            <select
              value={context.settings.logoSizePx}
              onChange={(event) =>
                update({ logoSizePx: Number(event.target.value) })
              }
              className={selectClassName}
              aria-label="Header logo image size"
            >
              {headerLogoSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size === 0 ? "Auto" : `${size}px`}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
              Zone H
            </span>
            <select
              value={context.settings.logoHeightPx}
              onChange={(event) =>
                update({ logoHeightPx: Number(event.target.value) })
              }
              className={selectClassName}
              aria-label="Header logo overflow zone height"
            >
              {headerLogoHeightOptions.map((height) => (
                <option key={height} value={height}>
                  {height === 0 ? "Auto" : `${height}px`}
                </option>
              ))}
            </select>
          </label>
          {variantId === "header-v1" && (
            <>
              <label className="flex items-center gap-2">
                <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
                  Logo V
                </span>
                <select
                  value={context.settings.logoVerticalAlign}
                  onChange={(event) =>
                    update({
                      logoVerticalAlign: event.target.value as HeaderLogoVerticalAlign,
                    })
                  }
                  className={selectClassName}
                  aria-label="Header logo vertical alignment"
                >
                  {headerLogoVerticalAlignOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2">
                <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
                  Nav Text
                </span>
                <select
                  value={context.settings.headerV1NavTextSizeEm}
                  onChange={(event) =>
                    update({ headerV1NavTextSizeEm: Number(event.target.value) })
                  }
                  className={selectClassName}
                  aria-label="Header v1 nav label text size"
                >
                  {headerV1NavTextSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {formatHeaderV1NavTextSizeEm(size)}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
              Logo Top
            </span>
            <select
              value={context.settings.logoMarginTopPx}
              onChange={(event) =>
                update({ logoMarginTopPx: Number(event.target.value) })
              }
              className={selectClassName}
              aria-label="Header logo top margin"
            >
              {headerLogoMarginTopOptions.map((margin) => (
                <option key={margin} value={margin}>
                  {margin}px
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
              Logo BG
            </span>
            <input
              type="color"
              value={colorInputHexFromBackground(context.settings.logoBackgroundColor)}
              onChange={(event) =>
                update({
                  logoBackgroundColor: setBackgroundColorRgb(
                    context.settings.logoBackgroundColor,
                    event.target.value,
                  ),
                })
              }
              className={colorInputClassName}
              aria-label="Header logo background color"
            />
            <label className="flex items-center gap-1.5">
              <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">A</span>
              <input
                type="range"
                min={0}
                max={100}
                value={alphaPercentFromBackground(context.settings.logoBackgroundColor)}
                onChange={(event) =>
                  update({
                    logoBackgroundColor: setBackgroundColorAlpha(
                      context.settings.logoBackgroundColor,
                      Number(event.target.value),
                    ),
                  })
                }
                className={alphaRangeClassName}
                aria-label="Header logo background alpha"
              />
              <span className="w-8 font-mono text-[0.65rem] text-accent-purple">
                {alphaPercentFromBackground(context.settings.logoBackgroundColor)}%
              </span>
            </label>
          </div>
        </>
      )}
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
        onClick={() =>
          context.setSettings(getDefaultHeaderV3PreviewSettingsForVariant(variantId))
        }
        className={buttonClassName}
        aria-label="Reset header settings to defaults"
      >
        Reset
      </button>
    </div>
  );
}
