"use client";

import {
  alphaPercentFromBackground,
  buttonBorderRadiusOptions,
  buttonPreviewSizes,
  colorInputHexFromBackground,
  defaultHeaderButtonPreviewSettings,
  defaultHeroButtonPreviewSettings,
  mergeButtonPreviewSettings,
  pickButtonPreviewSettings,
  setBackgroundColorAlpha,
  setBackgroundColorRgb,
  type ButtonPreviewSettings,
  type ButtonPreviewSize,
} from "@/lib/button-preview";
import { useHeaderV3Preview } from "@/components/dev/HeaderV3PreviewContext";
import { useHeroV21Preview } from "@/components/dev/HeroV21PreviewContext";
import { useTextImagePreview } from "@/components/dev/TextImagePreviewContext";
import { useTextImagesPreview } from "@/components/dev/TextImagesPreviewContext";
import {
  defaultTextImageButtonSettings,
  pickTextImageButtonSettings,
} from "@/lib/text-image-preview";
import { pickTextImagesButtonSettings } from "@/lib/text-images-preview";

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const selectClassName =
  "section-switcher-select rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

const alphaRangeClassName =
  "h-1.5 w-16 cursor-pointer accent-accent-purple";

type ButtonPreviewTarget = "header" | "hero" | "textImage" | "textImages";

type ButtonPreviewControlsProps = {
  target: ButtonPreviewTarget;
  /** When true, show a reset that only restores button fields for this target. */
  buttonOnlyReset?: boolean;
};

type BackgroundColorControlProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  colorAriaLabel: string;
};

function BackgroundColorControl({
  label,
  value,
  onChange,
  colorAriaLabel,
}: BackgroundColorControlProps) {
  const alphaPercent = alphaPercentFromBackground(value);

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">{label}</span>
      <input
        type="color"
        value={colorInputHexFromBackground(value)}
        onChange={(event) => onChange(setBackgroundColorRgb(value, event.target.value))}
        className={colorInputClassName}
        aria-label={colorAriaLabel}
      />
      <label className="flex items-center gap-1.5">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">A</span>
        <input
          type="range"
          min={0}
          max={100}
          value={alphaPercent}
          onChange={(event) =>
            onChange(setBackgroundColorAlpha(value, Number(event.target.value)))
          }
          className={alphaRangeClassName}
          aria-label={`${colorAriaLabel} alpha`}
        />
        <span className="w-8 font-mono text-[0.65rem] text-accent-purple">{alphaPercent}%</span>
      </label>
    </div>
  );
};

export function ButtonPreviewControls({
  target,
  buttonOnlyReset = false,
}: ButtonPreviewControlsProps) {
  const headerPreview = useHeaderV3Preview();
  const heroPreview = useHeroV21Preview();
  const textImagePreview = useTextImagePreview();
  const textImagesPreview = useTextImagesPreview();

  const settings: ButtonPreviewSettings | undefined =
    target === "header"
      ? headerPreview
        ? pickButtonPreviewSettings(headerPreview.settings)
        : undefined
      : target === "textImage"
        ? textImagePreview
          ? pickTextImageButtonSettings(textImagePreview.settings)
          : undefined
        : target === "textImages"
          ? textImagesPreview
            ? pickTextImagesButtonSettings(textImagesPreview.settings)
            : undefined
          : heroPreview
            ? heroPreview.settings.button
            : undefined;

  const updateSettings = (patch: Partial<ButtonPreviewSettings>) => {
    if (target === "header") {
      if (!headerPreview) return;
      headerPreview.setSettings(mergeButtonPreviewSettings(headerPreview.settings, patch));
      return;
    }

    if (target === "textImage") {
      if (!textImagePreview) return;
      textImagePreview.setSettings(mergeButtonPreviewSettings(textImagePreview.settings, patch));
      return;
    }

    if (target === "textImages") {
      if (!textImagesPreview) return;
      textImagesPreview.setSettings(mergeButtonPreviewSettings(textImagesPreview.settings, patch));
      return;
    }

    if (!heroPreview) return;
    heroPreview.setSettings({
      ...heroPreview.settings,
      button: mergeButtonPreviewSettings(heroPreview.settings.button, patch),
    });
  };

  const handleReset = () => {
    const defaults =
      target === "header"
        ? defaultHeaderButtonPreviewSettings
        : target === "textImage" || target === "textImages"
          ? defaultTextImageButtonSettings
          : defaultHeroButtonPreviewSettings;
    updateSettings(defaults);
  };

  if (!settings) return null;

  const radiusIndex = buttonBorderRadiusOptions.indexOf(
    settings.navButtonRadiusPx as (typeof buttonBorderRadiusOptions)[number],
  );
  const sliderIndex = radiusIndex >= 0 ? radiusIndex : 1;

  return (
    <div className="contents">
      <BackgroundColorControl
        label="btn-bg"
        value={settings.navBackground}
        onChange={(navBackground) => updateSettings({ navBackground })}
        colorAriaLabel={`${target} button background color`}
      />
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">btn-text</span>
        <input
          type="color"
          value={settings.navTextColor}
          onChange={(event) => updateSettings({ navTextColor: event.target.value })}
          className={colorInputClassName}
          aria-label={`${target} button text color`}
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">btn-hover</span>
        <input
          type="color"
          value={settings.navTextHoverColor}
          onChange={(event) => updateSettings({ navTextHoverColor: event.target.value })}
          className={colorInputClassName}
          aria-label={`${target} button text hover color`}
        />
      </label>
      <BackgroundColorControl
        label="btn-hover-bg"
        value={settings.navHoverBackground}
        onChange={(navHoverBackground) => updateSettings({ navHoverBackground })}
        colorAriaLabel={`${target} button hover background color`}
      />
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Size</span>
        <select
          value={settings.navButtonSize}
          onChange={(event) =>
            updateSettings({ navButtonSize: event.target.value as ButtonPreviewSize })
          }
          className={selectClassName}
          aria-label={`${target} button size`}
        >
          {buttonPreviewSizes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          btn-radius
        </span>
        <input
          type="range"
          min={0}
          max={buttonBorderRadiusOptions.length - 1}
          step={1}
          value={sliderIndex}
          onChange={(event) =>
            updateSettings({
              navButtonRadiusPx: buttonBorderRadiusOptions[Number(event.target.value)],
            })
          }
          className={alphaRangeClassName}
          aria-label={`${target} button border radius`}
          aria-valuemin={buttonBorderRadiusOptions[0]}
          aria-valuemax={buttonBorderRadiusOptions[buttonBorderRadiusOptions.length - 1]}
          aria-valuenow={settings.navButtonRadiusPx}
        />
        <span className="w-8 font-mono text-[0.65rem] text-accent-purple">
          {settings.navButtonRadiusPx}px
        </span>
      </label>
      {buttonOnlyReset && (
        <button
          type="button"
          onClick={handleReset}
          className={buttonClassName}
          aria-label={`Reset ${target} button settings to defaults`}
        >
          Reset
        </button>
      )}
    </div>
  );
}
