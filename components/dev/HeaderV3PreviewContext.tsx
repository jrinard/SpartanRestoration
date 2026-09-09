"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Images, X } from "lucide-react";
import { useOptionalOrg } from "@/components/dev/OrgProvider";
import { ImageLibraryPicker } from "@/components/dev/ImageLibraryPicker";
import { IconFramePreviewControls } from "@/components/dev/IconFramePreviewControls";
import {
  defaultHeaderV3PreviewSettings,
  getDefaultHeaderV3PreviewSettingsForVariant,
  headerHeightOptions,
  headerLogoHeightOptions,
  headerLogoMarginTopOptions,
  headerLogoSizeOptions,
  headerLogoVerticalAlignOptions,
  headerV1NavTextSizeOptions,
  formatHeaderV1NavTextSizeEm,
  getHeaderV1NavFontStyle,
  headerV1NavFontStyleOptions,
  headerV1NavIconsAreVisible,
  headerV1MobileNavIsOn,
  headerV1NavTiltIsOn,
  isHeaderV1NavFontStyle,
  headerV3LayoutWidths,
  headerV3LogoVariants,
  headerVariantUsesCustomBackground,
  headerV2MobileLogoAlignOptions,
  stepHeaderLogoSizePx,
  type HeaderV2MobileLogoAlign,
  type HeaderV3LayoutWidth,
  type HeaderV3LogoVariant,
  type HeaderLogoVerticalAlign,
  type HeaderV3PreviewSettings,
} from "@/lib/header-v3-gradient";
import { HeaderV1NavLinksControls } from "@/components/dev/HeaderV1NavLinksControls";
import { resolveHeaderV1NavLinkIcon, updateHeaderV1NavLink } from "@/lib/header-v1-nav";
import type { SiteIconName } from "@/lib/site-icons";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import {
  loadHeaderV3PreviewSettings,
  normalizeHeaderV3PreviewSettings,
  saveHeaderV3PreviewSettings,
} from "@/lib/header-v3-storage";
import {
  applyHeaderV1Preset,
  bundledHeaderV1Presets,
  isHeaderV1PresetId,
  listHeaderV1Presets,
  normalizeHeaderV1PresetLibrary,
  slugifyHeaderV1PresetId,
  type HeaderV1PresetId,
  type HeaderV1PresetLibrary,
} from "@/lib/header-v1-presets";
import { ButtonPreviewControls } from "@/components/dev/ButtonPreviewControls";
import {
  alphaPercentFromBackground,
  buttonBorderRadiusOptions,
  colorInputHexFromBackground,
  setBackgroundColorAlpha,
  setBackgroundColorRgb,
} from "@/lib/button-preview";
import { previewGradientDirections } from "@/lib/preview-gradient";
import type { PreviewGradientDirection } from "@/lib/preview-gradient";
import {
  devLibraryIconSize,
  devLibraryLabelClassName,
} from "@/lib/dev-overlay-controls";
import { cn } from "@/lib/utils";

type HeaderV3PreviewContextValue = {
  settings: HeaderV3PreviewSettings;
  setSettings: (settings: HeaderV3PreviewSettings) => void;
  contentEditingEnabled: boolean;
  getNavItemIcon: (itemId: string, fallback: SiteIconName) => SiteIconName;
  setNavItemIcon: (itemId: string, iconName: SiteIconName) => void;
};

const HeaderV3PreviewContext = createContext<HeaderV3PreviewContextValue | null>(null);

type HeaderV3PreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: HeaderV3PreviewSettings;
  enableContentEditing?: boolean;
};

export function HeaderV3PreviewProvider({
  children,
  instanceId,
  initialSettings,
  enableContentEditing = false,
}: HeaderV3PreviewProviderProps) {
  const { settings, setSettings: persistSettings, lockedToPublished } = useInstancePreviewSettings({
    instanceId,
    field: "headerV3",
    initialSettings,
    defaultSettings: defaultHeaderV3PreviewSettings,
    loadGlobal: loadHeaderV3PreviewSettings,
    saveGlobal: saveHeaderV3PreviewSettings,
    normalize: normalizeHeaderV3PreviewSettings,
    globalOnly: true,
  });

  const setSettings = useCallback(
    (next: HeaderV3PreviewSettings) => {
      persistSettings(next);
      if (!lockedToPublished) {
        saveHeaderV3PreviewSettings(normalizeHeaderV3PreviewSettings(next));
      }
    },
    [lockedToPublished, persistSettings],
  );

  const getNavItemIcon = useCallback(
    (itemId: string, fallback: SiteIconName): SiteIconName => {
      const link = settings.headerV1NavLinks.find((entry) => entry.id === itemId);
      if (!link) return fallback;
      return resolveHeaderV1NavLinkIcon(link, settings.headerV1NavIcons);
    },
    [settings.headerV1NavIcons, settings.headerV1NavLinks],
  );

  const setNavItemIcon = useCallback(
    (itemId: string, iconName: SiteIconName) => {
      if (!enableContentEditing) return;
      setSettings({
        ...settings,
        headerV1NavLinks: updateHeaderV1NavLink(settings.headerV1NavLinks, itemId, {
          icon: iconName,
        }),
      });
    },
    [enableContentEditing, setSettings, settings],
  );

  return (
    <HeaderV3PreviewContext.Provider
      value={{
        settings,
        setSettings,
        contentEditingEnabled: enableContentEditing,
        getNavItemIcon,
        setNavItemIcon,
      }}
    >
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

const checkboxClassName = "h-4 w-4 accent-accent-purple";

const alphaRangeClassName = "h-1.5 w-16 cursor-pointer accent-accent-purple";

function applyHeaderV1LibraryPayload(library: unknown): HeaderV1PresetLibrary | null {
  if (!library || typeof library !== "object") return null;
  return normalizeHeaderV1PresetLibrary(library);
}

function defaultOverwriteHeaderV1PresetId(
  library: HeaderV1PresetLibrary,
  presetId: HeaderV1PresetId | "",
  orgId: string | undefined,
): string {
  const entries = listHeaderV1Presets(library);
  if (presetId && entries.some((entry) => entry.id === presetId)) return presetId;
  if (orgId && entries.some((entry) => entry.id === orgId)) return orgId;
  return entries[0]?.id ?? "";
}

export function HeaderV3PreviewControls({ variantId }: { variantId?: string }) {
  const context = useHeaderV3Preview();
  const org = useOptionalOrg();
  const [headerV2BgImagePickerOpen, setHeaderV2BgImagePickerOpen] = useState(false);
  const [presetId, setPresetId] = useState<HeaderV1PresetId | "">("");
  const [library, setLibrary] = useState(bundledHeaderV1Presets);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/header-v1-presets")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { library?: unknown } | null) => {
        if (cancelled || !data?.library) return;
        const next = applyHeaderV1LibraryPayload(data.library);
        if (next) setLibrary(next);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!context) return null;

  const settings = normalizeHeaderV3PreviewSettings(context.settings);
  const presets = listHeaderV1Presets(library);
  const showCustomHeaderControls = variantId
    ? headerVariantUsesCustomBackground(variantId)
    : false;
  const isHeaderV1 = variantId === "header-v1";
  const isHeaderV2 = variantId === "header-v2";
  const showGradientBackgroundControls =
    isHeaderV1 || (isHeaderV2 && context.settings.headerV2UseGradientBackground);
  const showIconNavControls = isHeaderV1 || isHeaderV2;

  const update = (patch: Partial<HeaderV3PreviewSettings>) => {
    context.setSettings({ ...settings, ...patch });
  };

  async function savePreset(input: { id?: string; label?: string }) {
    setSaveState("saving");
    try {
      const response = await fetch("/api/header-v1-presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, settings }),
      });
      if (!response.ok) throw new Error("save failed");
      const data = (await response.json()) as { id?: unknown; library?: unknown };
      const next = applyHeaderV1LibraryPayload(data.library);
      if (next) setLibrary(next);
      if (typeof data.id === "string" && isHeaderV1PresetId(data.id)) {
        setPresetId(data.id);
      }
      setSaveOpen(false);
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1600);
    } catch {
      setSaveState("error");
    }
  }

  return (
    <div className="contents">
      {isHeaderV1 ? (
        <>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Preset</span>
            <select
              value={presetId}
              onChange={(event) => {
                const nextId = event.target.value;
                if (!isHeaderV1PresetId(nextId)) {
                  setPresetId("");
                  return;
                }
                setPresetId(nextId);
                context.setSettings(applyHeaderV1Preset(nextId, library));
              }}
              className={selectClassName}
              aria-label="Apply header starter"
            >
              <option value="">Custom</option>
              {presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => {
              setSaveState("idle");
              setSaveOpen(true);
            }}
            disabled={saveState === "saving"}
            className="rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs tracking-wide text-accent-purple uppercase backdrop-blur-sm hover:border-accent-purple disabled:opacity-40"
            aria-label="Save current header as a preset"
          >
            {saveState === "saving"
              ? "Saving"
              : saveState === "saved"
                ? "Saved"
                : saveState === "error"
                  ? "Retry"
                  : "Save preset"}
          </button>
          <HeaderV1SavePresetDialog
            open={saveOpen}
            busy={saveState === "saving"}
            error={saveState === "error"}
            library={library}
            defaultExistingId={defaultOverwriteHeaderV1PresetId(library, presetId, org?.orgId)}
            onClose={() => {
              if (saveState !== "saving") setSaveOpen(false);
            }}
            onSave={(input) => void savePreset(input)}
          />
        </>
      ) : null}
      {(!isHeaderV2 || context.settings.headerV2UseGradientBackground) && (
        <>
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
        </>
      )}
      {showCustomHeaderControls && (
        <>
          {isHeaderV2 && (
            <>
              <label className="flex items-center gap-2">
                <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
                  Nav
                </span>
                <input
                  type="checkbox"
                  checked={context.settings.headerV2NavVisible}
                  onChange={(event) => update({ headerV2NavVisible: event.target.checked })}
                  className="accent-accent-purple"
                  aria-label="Show header v2 navigation links"
                />
              </label>
              <label className="flex items-center gap-2">
                <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
                  Gradient
                </span>
                <input
                  type="checkbox"
                  checked={context.settings.headerV2UseGradientBackground}
                  onChange={(event) =>
                    update({ headerV2UseGradientBackground: event.target.checked })
                  }
                  className="accent-accent-purple"
                  aria-label="Use gradient header v2 background"
                />
              </label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
                  Bar BG
                </span>
                <input
                  type="color"
                  value={colorInputHexFromBackground(context.settings.headerV2BackgroundColor)}
                  onChange={(event) =>
                    update({
                      headerV2BackgroundColor: setBackgroundColorRgb(
                        context.settings.headerV2BackgroundColor,
                        event.target.value,
                      ),
                    })
                  }
                  className={colorInputClassName}
                  aria-label="Header v2 bar background color"
                />
                <label className="flex items-center gap-1.5">
                  <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
                    A
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={alphaPercentFromBackground(context.settings.headerV2BackgroundColor)}
                    onChange={(event) =>
                      update({
                        headerV2BackgroundColor: setBackgroundColorAlpha(
                          context.settings.headerV2BackgroundColor,
                          Number(event.target.value),
                        ),
                      })
                    }
                    className={alphaRangeClassName}
                    aria-label="Header v2 bar background alpha"
                  />
                  <span className="w-8 font-mono text-[0.65rem] text-accent-purple">
                    {alphaPercentFromBackground(context.settings.headerV2BackgroundColor)}%
                  </span>
                </label>
              </div>
              <div className="relative flex items-center gap-2">
                <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
                  Bar Image
                </span>
                <button
                  type="button"
                  onClick={() => setHeaderV2BgImagePickerOpen((open) => !open)}
                  className={cn(buttonClassName, "flex items-center gap-1.5")}
                  aria-label="Choose header v2 background image from library"
                  aria-expanded={headerV2BgImagePickerOpen}
                >
                  <Images size={devLibraryIconSize} strokeWidth={2} />
                  <span className={devLibraryLabelClassName}>Library</span>
                </button>
                {context.settings.headerV2BackgroundImageSrc ? (
                  <>
                    <span
                      className="max-w-28 truncate font-mono text-[0.65rem] text-accent-purple/80"
                      title={context.settings.headerV2BackgroundImageSrc}
                    >
                      {context.settings.headerV2BackgroundImageSrc.split("/").pop()}
                    </span>
                    <button
                      type="button"
                      onClick={() => update({ headerV2BackgroundImageSrc: "" })}
                      className={buttonClassName}
                      aria-label="Clear header v2 background image"
                    >
                      Clear
                    </button>
                  </>
                ) : (
                  <span className="font-mono text-[0.65rem] text-accent-purple/60">None</span>
                )}
                {headerV2BgImagePickerOpen && (
                  <div className="absolute top-full left-0 z-50 mt-2">
                    <ImageLibraryPicker
                      value={context.settings.headerV2BackgroundImageSrc || undefined}
                      onSelect={(entry) => {
                        update({ headerV2BackgroundImageSrc: entry.src });
                        setHeaderV2BgImagePickerOpen(false);
                      }}
                      onClose={() => setHeaderV2BgImagePickerOpen(false)}
                      className="w-[min(92vw,52rem)]"
                    />
                  </div>
                )}
              </div>
            </>
          )}
          {showGradientBackgroundControls && (
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
            </>
          )}
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
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
              Logo Size
            </span>
            {isHeaderV2 && (
              <button
                type="button"
                onClick={() =>
                  update({
                    logoSizePx: stepHeaderLogoSizePx(context.settings.logoSizePx, -1),
                  })
                }
                className={buttonClassName}
                aria-label="Decrease header logo size"
              >
                −
              </button>
            )}
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
                  {size === 0 ? "Auto (56px)" : `${size}px`}
                </option>
              ))}
            </select>
            {isHeaderV2 && (
              <button
                type="button"
                onClick={() =>
                  update({
                    logoSizePx: stepHeaderLogoSizePx(context.settings.logoSizePx, 1),
                  })
                }
                className={buttonClassName}
                aria-label="Increase header logo size"
              >
                +
              </button>
            )}
          </div>
          {isHeaderV2 && (
            <label className="flex items-center gap-2">
              <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
                Mobile Logo
              </span>
              <select
                value={context.settings.headerV2MobileLogoAlign}
                onChange={(event) =>
                  update({
                    headerV2MobileLogoAlign: event.target.value as HeaderV2MobileLogoAlign,
                  })
                }
                className={selectClassName}
                aria-label="Header v2 mobile logo alignment"
              >
                {headerV2MobileLogoAlignOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          )}
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
          {showIconNavControls && (
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
              {isHeaderV1 ? (
                <>
                  <label className="flex items-center gap-2">
                    <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
                      Radius
                    </span>
                    <select
                      value={context.settings.navButtonRadiusPx}
                      onChange={(event) =>
                        update({ navButtonRadiusPx: Number(event.target.value) })
                      }
                      className={selectClassName}
                      aria-label="Header nav button corner radius"
                    >
                      {buttonBorderRadiusOptions.map((radius) => (
                        <option key={radius} value={radius}>
                          {radius === 0 ? "Sharp" : `${radius}px`}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={headerV1NavTiltIsOn(context.settings)}
                      onChange={(event) =>
                        update({ headerV1NavTilt: event.target.checked })
                      }
                      className={checkboxClassName}
                      aria-label="Tilt header nav buttons"
                    />
                    <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
                      Tilt
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={headerV1MobileNavIsOn(context.settings)}
                      onChange={(event) =>
                        update({ headerV1IncludeMobileNav: event.target.checked })
                      }
                      className={checkboxClassName}
                      aria-label="Include menu items in mobile nav"
                    />
                    <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
                      Mobile Nav
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
                      Style
                    </span>
                    <select
                      value={getHeaderV1NavFontStyle(context.settings)}
                      onChange={(event) => {
                        if (!isHeaderV1NavFontStyle(event.target.value)) return;
                        update({ headerV1NavFontStyle: event.target.value });
                      }}
                      className={selectClassName}
                      aria-label="Header nav label font style"
                    >
                      {headerV1NavFontStyleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              ) : null}
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
                  aria-label="Header nav label text size"
                >
                  {headerV1NavTextSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {formatHeaderV1NavTextSizeEm(size)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={headerV1NavIconsAreVisible(context.settings)}
                  onChange={(event) =>
                    update({ headerV1ShowNavIcons: event.target.checked })
                  }
                  className={checkboxClassName}
                  aria-label="Show header nav icons"
                />
                <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
                  Icons
                </span>
              </label>
              {headerV1NavIconsAreVisible(context.settings) ? (
                <IconFramePreviewControls
                  settings={{
                    iconFrameShape: context.settings.headerV1NavIconFrameShape,
                    iconFrameSize: context.settings.headerV1NavIconFrameSize,
                    iconColor: context.settings.headerV1NavIconColor,
                    iconBorderColor: context.settings.headerV1NavIconBorderColor,
                    iconBackgroundColor: context.settings.headerV1NavIconBackgroundColor,
                  }}
                  onChange={(patch) => {
                    const mapped: Partial<HeaderV3PreviewSettings> = {};
                    if (patch.iconFrameShape !== undefined) {
                      mapped.headerV1NavIconFrameShape = patch.iconFrameShape;
                    }
                    if (patch.iconFrameSize !== undefined) {
                      mapped.headerV1NavIconFrameSize = patch.iconFrameSize;
                    }
                    if (patch.iconColor !== undefined) {
                      mapped.headerV1NavIconColor = patch.iconColor;
                    }
                    if (patch.iconBorderColor !== undefined) {
                      mapped.headerV1NavIconBorderColor = patch.iconBorderColor;
                    }
                    if (patch.iconBackgroundColor !== undefined) {
                      mapped.headerV1NavIconBackgroundColor = patch.iconBackgroundColor;
                    }
                    update(mapped);
                  }}
                  ariaPrefix="Header nav"
                />
              ) : null}
              <HeaderV1NavLinksControls
                links={context.settings.headerV1NavLinks}
                onChange={(headerV1NavLinks) => update({ headerV1NavLinks })}
                layout={isHeaderV2 ? "split" : "row"}
              />
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
      <ButtonPreviewControls target="header" hideRadius={isHeaderV1} />
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

const saveFieldClassName =
  "w-full rounded border border-white/10 bg-[#0d0d14] px-3 py-2.5 font-mono text-sm text-white placeholder:text-white/30 focus:border-accent-purple/50 focus:outline-none";

function HeaderV1SavePresetDialog({
  open,
  busy,
  error,
  library,
  defaultExistingId,
  onClose,
  onSave,
}: {
  open: boolean;
  busy: boolean;
  error: boolean;
  library: HeaderV1PresetLibrary;
  defaultExistingId: string;
  onClose: () => void;
  onSave: (input: { id?: string; label?: string }) => void;
}) {
  const presets = listHeaderV1Presets(library);
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [existingId, setExistingId] = useState(defaultExistingId);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (!open) return;
    setMode(defaultExistingId ? "existing" : "new");
    setExistingId(defaultExistingId);
    setNewName("");
  }, [defaultExistingId, open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [busy, onClose, open]);

  if (!open || typeof document === "undefined") return null;

  const newId = slugifyHeaderV1PresetId(newName);
  const newNameTaken = Boolean(newId && presets.some((preset) => preset.id === newId));
  const canSubmit =
    mode === "existing" ? Boolean(existingId) : Boolean(newName.trim()) && !newNameTaken;

  const dialog = (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close save preset dialog"
        disabled={busy}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="header-v1-save-preset-title"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-lg border border-white/15 bg-[#12121c] text-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2
              id="header-v1-save-preset-title"
              className="font-mono text-sm tracking-[0.2em] text-white/50 uppercase"
            >
              Save preset
            </h2>
            <p className="mt-1 text-sm text-white/70">
              Keep this header as-is. Choosing a starter here does not apply it.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded border border-white/15 p-2 text-white/70 transition-colors hover:border-white/30 hover:text-white disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form
          className="space-y-4 px-6 py-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (!canSubmit || busy) return;
            if (mode === "existing") {
              onSave({ id: existingId });
              return;
            }
            onSave({ id: newId, label: newName.trim() });
          }}
        >
          <fieldset className="space-y-3">
            <legend className="sr-only">Save destination</legend>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="header-v1-save-mode"
                checked={mode === "existing"}
                onChange={() => setMode("existing")}
                className="mt-1 accent-accent-purple"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[11px] tracking-wide text-accent-purple uppercase">
                  Overwrite existing
                </span>
                <select
                  value={existingId}
                  onChange={(event) => {
                    setExistingId(event.target.value);
                    setMode("existing");
                  }}
                  className={`${saveFieldClassName} mt-2`}
                  aria-label="Existing preset to overwrite"
                >
                  {presets.length === 0 ? (
                    <option value="">No presets yet</option>
                  ) : (
                    presets.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label}
                      </option>
                    ))
                  )}
                </select>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="header-v1-save-mode"
                checked={mode === "new"}
                onChange={() => setMode("new")}
                className="mt-1 accent-accent-purple"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[11px] tracking-wide text-accent-purple uppercase">
                  Save as new
                </span>
                <input
                  value={newName}
                  onChange={(event) => {
                    setNewName(event.target.value);
                    setMode("new");
                  }}
                  className={`${saveFieldClassName} mt-2`}
                  placeholder="Langham header"
                  autoComplete="off"
                  aria-label="New preset name"
                />
              </span>
            </label>
          </fieldset>

          {newNameTaken ? (
            <p className="text-sm text-red-400">
              That name already exists. Overwrite it above, or pick a different name.
            </p>
          ) : null}
          {error ? <p className="text-sm text-red-400">Could not save. Try again.</p> : null}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={busy}
              onClick={onClose}
              className="rounded border border-white/10 px-4 py-2.5 font-mono text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !canSubmit}
              className="rounded border border-accent-purple/60 bg-accent-purple/15 px-4 py-2.5 font-mono text-sm text-accent-purple transition-colors hover:bg-accent-purple/25 disabled:opacity-50"
            >
              {busy ? "Saving…" : mode === "existing" ? "Overwrite" : "Save new"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
