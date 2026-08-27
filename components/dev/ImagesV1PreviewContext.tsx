"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Images } from "lucide-react";
import { ImageLibraryPicker } from "@/components/dev/ImageLibraryPicker";
import {
  defaultImagesV1PreviewSettings,
  imagesV1GradientDirections,
  type ImagesV1Card,
  type ImagesV1PreviewSettings,
} from "@/lib/images-v1-preview";
import { updateImagesV1Card } from "@/lib/images-v1-cards";
import type { PreviewGradientDirection } from "@/lib/preview-gradient";
import { siteLayoutWidthOptions } from "@/lib/site-layout";
import type { SiteLayoutWidth } from "@/lib/site-layout";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import {
  loadImagesV1PreviewSettings,
  normalizeImagesV1PreviewSettings,
  saveImagesV1PreviewSettings,
} from "@/lib/images-v1-preview-storage";
import {
  devLibraryIconSize,
  devLibraryLabelClassName,
} from "@/lib/dev-overlay-controls";
import { cn } from "@/lib/utils";

type ImagesV1PreviewContextValue = {
  settings: ImagesV1PreviewSettings;
  setSettings: (settings: ImagesV1PreviewSettings) => void;
  contentEditingEnabled: boolean;
  getCards: (fallback: readonly ImagesV1Card[]) => ImagesV1Card[];
  updateCard: (
    cardId: string,
    patch: Partial<Pick<ImagesV1Card, "imageSrc" | "imageAlt" | "linkHref" | "linkTarget">>,
  ) => void;
  getSectionHeading: (fallback: string) => string;
  setSectionHeading: (heading: string) => void;
  getSectionSeoDescription: (fallback: string) => string;
  setSectionSeoDescription: (description: string) => void;
};

const ImagesV1PreviewContext = createContext<ImagesV1PreviewContextValue | null>(null);

type ImagesV1PreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: ImagesV1PreviewSettings;
  enableContentEditing?: boolean;
};

export function ImagesV1PreviewProvider({
  children,
  instanceId,
  initialSettings,
  enableContentEditing = false,
}: ImagesV1PreviewProviderProps) {
  const { settings, setSettings: persistSettings } = useInstancePreviewSettings({
    instanceId,
    field: "imagesV1",
    initialSettings,
    defaultSettings: defaultImagesV1PreviewSettings,
    loadGlobal: loadImagesV1PreviewSettings,
    saveGlobal: saveImagesV1PreviewSettings,
    normalize: normalizeImagesV1PreviewSettings,
  });

  const setSettings = useCallback(
    (next: ImagesV1PreviewSettings) => {
      persistSettings(next);
    },
    [persistSettings],
  );

  const getCards = useCallback(
    (fallback: readonly ImagesV1Card[]) => {
      if (settings.cards.length > 0) return settings.cards;
      return [...fallback];
    },
    [settings.cards],
  );

  const updateCard = useCallback(
    (
      cardId: string,
      patch: Partial<Pick<ImagesV1Card, "imageSrc" | "imageAlt" | "linkHref" | "linkTarget">>,
    ) => {
      setSettings({
        ...settings,
        cards: updateImagesV1Card(settings.cards, cardId, patch),
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

  const getSectionSeoDescription = useCallback(
    (fallback: string): string => settings.sectionSeoDescription ?? fallback,
    [settings.sectionSeoDescription],
  );

  const setSectionSeoDescription = useCallback(
    (description: string) => {
      if (!enableContentEditing) return;
      const trimmed = description.trim();
      if (!trimmed) return;
      setSettings({
        ...settings,
        sectionSeoDescription: trimmed,
      });
    },
    [enableContentEditing, setSettings, settings],
  );

  return (
    <ImagesV1PreviewContext.Provider
      value={{
        settings,
        setSettings,
        contentEditingEnabled: enableContentEditing,
        getCards,
        updateCard,
        getSectionHeading,
        setSectionHeading,
        getSectionSeoDescription,
        setSectionSeoDescription,
      }}
    >
      {children}
    </ImagesV1PreviewContext.Provider>
  );
}

export function useImagesV1Preview() {
  return useContext(ImagesV1PreviewContext);
}

const selectClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm";

const colorInputClassName =
  "h-7 w-10 cursor-pointer rounded border border-accent-purple/40 bg-background/90";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

export function ImagesV1PreviewControls() {
  const context = useImagesV1Preview();
  const [backgroundImagePickerOpen, setBackgroundImagePickerOpen] = useState(false);
  if (!context) return null;

  const update = (patch: Partial<ImagesV1PreviewSettings>) => {
    context.setSettings({ ...context.settings, ...patch });
  };

  return (
    <div className="contents">
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Width</span>
        <select
          value={context.settings.layoutWidth}
          onChange={(event) =>
            update({ layoutWidth: event.target.value as SiteLayoutWidth })
          }
          className={selectClassName}
          aria-label="Images layout width"
        >
          {siteLayoutWidthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      {context.settings.layoutWidth === "contained" && (
        <label className="flex items-center gap-2">
          <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
            Outer BG
          </span>
          <input
            type="color"
            value={context.settings.outerBackgroundColor}
            onChange={(event) => update({ outerBackgroundColor: event.target.value })}
            className={colorInputClassName}
            aria-label="Images outer background color"
          />
        </label>
      )}
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG 1</span>
        <input
          type="color"
          value={context.settings.backgroundFrom}
          onChange={(event) => update({ backgroundFrom: event.target.value })}
          className={colorInputClassName}
          aria-label="Images background gradient start color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG 2</span>
        <input
          type="color"
          value={context.settings.backgroundTo}
          onChange={(event) => update({ backgroundTo: event.target.value })}
          className={colorInputClassName}
          aria-label="Images background gradient end color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Dir</span>
        <select
          value={context.settings.backgroundDirection}
          onChange={(event) =>
            update({ backgroundDirection: event.target.value as PreviewGradientDirection })
          }
          className={selectClassName}
          aria-label="Images background gradient direction"
        >
          {imagesV1GradientDirections.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <div className="relative flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          BG Image
        </span>
        <button
          type="button"
          onClick={() => setBackgroundImagePickerOpen((open) => !open)}
          className={cn(buttonClassName, "flex items-center gap-1.5")}
          aria-label="Choose images section background from library"
          aria-expanded={backgroundImagePickerOpen}
        >
          <Images size={devLibraryIconSize} strokeWidth={2} />
          <span className={devLibraryLabelClassName}>Library</span>
        </button>
        {context.settings.backgroundImageSrc ? (
          <>
            <span
              className="max-w-28 truncate font-mono text-[0.65rem] text-accent-purple/80"
              title={context.settings.backgroundImageSrc}
            >
              {context.settings.backgroundImageSrc.split("/").pop()}
            </span>
            <button
              type="button"
              onClick={() => update({ backgroundImageSrc: "" })}
              className={buttonClassName}
              aria-label="Clear images section background image"
            >
              Clear
            </button>
          </>
        ) : null}
        {backgroundImagePickerOpen && (
          <div className="absolute top-full left-0 z-50 mt-2">
            <ImageLibraryPicker
              value={context.settings.backgroundImageSrc ?? ""}
              onSelect={(entry) => {
                update({ backgroundImageSrc: entry.src });
                setBackgroundImagePickerOpen(false);
              }}
              onClose={() => setBackgroundImagePickerOpen(false)}
            />
          </div>
        )}
      </div>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          Section H
        </span>
        <input
          type="number"
          min={0}
          max={800}
          value={context.settings.sectionHeightPx || ""}
          placeholder="Auto"
          onChange={(event) => {
            const raw = event.target.value.trim();
            update({ sectionHeightPx: raw ? Number(raw) || 0 : 0 });
          }}
          className={cn(selectClassName, "w-16")}
          aria-label="Section height in pixels (0 for auto)"
        />
        <span className="font-mono text-[0.65rem] text-accent-purple/70">px</span>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          Section pad
        </span>
        <input
          type="number"
          min={0}
          max={128}
          value={context.settings.sectionPaddingTopPx}
          onChange={(event) => {
            const pad = Number(event.target.value) || 0;
            update({ sectionPaddingTopPx: pad, sectionPaddingBottomPx: pad });
          }}
          className={cn(selectClassName, "w-16")}
          aria-label="Vertical padding above and below image row in pixels"
        />
        <span className="font-mono text-[0.65rem] text-accent-purple/70">px</span>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          Card height
        </span>
        <input
          type="number"
          min={80}
          max={640}
          value={context.settings.cardUniformHeightPx}
          onChange={(event) =>
            update({ cardUniformHeightPx: Number(event.target.value) || 180 })
          }
          className={cn(selectClassName, "w-16")}
          aria-label="Uniform image card height in pixels"
        />
        <span className="font-mono text-[0.65rem] text-accent-purple/70">px</span>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Gap</span>
        <input
          type="number"
          min={0}
          max={128}
          value={context.settings.cardGapPx}
          onChange={(event) => update({ cardGapPx: Number(event.target.value) || 0 })}
          className={cn(selectClassName, "w-16")}
          aria-label="Space between image cards in pixels"
        />
        <span className="font-mono text-[0.65rem] text-accent-purple/70">px</span>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          Card width
        </span>
        <select
          value={context.settings.cardWidthMode}
          onChange={(event) =>
            update({ cardWidthMode: event.target.value as "natural" | "uniform" })
          }
          className={selectClassName}
          aria-label="Image card width mode"
        >
          <option value="natural">Natural</option>
          <option value="uniform">Uniform</option>
        </select>
        {context.settings.cardWidthMode === "uniform" && (
          <>
            <input
              type="number"
              min={80}
              max={640}
              value={context.settings.cardUniformWidthPx}
              onChange={(event) =>
                update({ cardUniformWidthPx: Number(event.target.value) || 240 })
              }
              className={cn(selectClassName, "w-16")}
              aria-label="Uniform image card width in pixels"
            />
            <span className="font-mono text-[0.65rem] text-accent-purple/70">px</span>
          </>
        )}
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          Card border
        </span>
        <input
          type="color"
          value={context.settings.cardBorderColor}
          onChange={(event) => update({ cardBorderColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Image card border color"
        />
        <input
          type="number"
          min={0}
          max={12}
          value={context.settings.cardBorderWidthPx}
          onChange={(event) =>
            update({ cardBorderWidthPx: Number(event.target.value) || 0 })
          }
          className={cn(selectClassName, "w-14")}
          aria-label="Image card border width in pixels"
        />
        <span className="font-mono text-[0.65rem] text-accent-purple/70">px</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={context.settings.topBorderEnabled}
          onChange={(event) => update({ topBorderEnabled: event.target.checked })}
          className="accent-accent-purple"
          aria-label="Enable top section border"
        />
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Top</span>
        <input
          type="color"
          value={context.settings.topBorderColor}
          onChange={(event) => update({ topBorderColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Top section border color"
          disabled={!context.settings.topBorderEnabled}
        />
        <input
          type="number"
          min={0}
          max={32}
          value={context.settings.topBorderHeightPx}
          onChange={(event) =>
            update({ topBorderHeightPx: Number(event.target.value) || 0 })
          }
          className={cn(selectClassName, "w-14")}
          aria-label="Top section border height in pixels"
          disabled={!context.settings.topBorderEnabled}
        />
        <span className="font-mono text-[0.65rem] text-accent-purple/70">px</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={context.settings.bottomBorderEnabled}
          onChange={(event) => update({ bottomBorderEnabled: event.target.checked })}
          className="accent-accent-purple"
          aria-label="Enable bottom section border"
        />
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          Bottom
        </span>
        <input
          type="color"
          value={context.settings.bottomBorderColor}
          onChange={(event) => update({ bottomBorderColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Bottom section border color"
          disabled={!context.settings.bottomBorderEnabled}
        />
        <input
          type="number"
          min={0}
          max={32}
          value={context.settings.bottomBorderHeightPx}
          onChange={(event) =>
            update({ bottomBorderHeightPx: Number(event.target.value) || 0 })
          }
          className={cn(selectClassName, "w-14")}
          aria-label="Bottom section border height in pixels"
          disabled={!context.settings.bottomBorderEnabled}
        />
        <span className="font-mono text-[0.65rem] text-accent-purple/70">px</span>
      </label>
    </div>
  );
}
