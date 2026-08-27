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
  defaultFooterV1PreviewSettings,
  footerUsesGlobalNav,
  footerV1ContactTextSizeOptions,
  footerV1ContentInsetOptions,
  footerV1GradientDirections,
  footerV1LayoutWidthOptions,
  footerV1LogoSizeOptions,
  formatFooterV1ContactTextSizeEm,
  resolveFooterV1Content,
  seedFooterV1ContentContacts,
  stepFooterV1LogoSizePx,
  type FooterV1Content,
  type FooterV1ContentOverrides,
  type FooterV1PreviewSettings,
} from "@/lib/footer-v1-preview";
import { getFooterV1TeamContacts } from "@/lib/footer-v1-seo";
import type { PreviewGradientDirection } from "@/lib/preview-gradient";
import type { SiteLayoutWidth } from "@/lib/site-layout";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import { playgroundNavSyncEvent } from "@/lib/playground-nav-sync";
import {
  applyFooterV1PreviewLoadTransform,
  footerV1GlobalNavSyncEvent,
  loadFooterV1PreviewSettings,
  normalizeFooterV1PreviewSettings,
  saveFooterV1ContentOverrides,
  saveFooterV1PreviewSettings,
  notifyFooterV1GlobalNavUpdated,
} from "@/lib/footer-v1-preview-storage";
import { loadNavBarPreviewSettings } from "@/lib/nav-bar-preview-storage";
import { useOptionalPlaygroundSections } from "@/components/dev/PlaygroundSectionsProvider";
import { ImageLibraryPicker } from "@/components/dev/ImageLibraryPicker";
import { Images } from "lucide-react";
import {
  devLibraryIconSize,
  devLibraryLabelClassName,
} from "@/lib/dev-overlay-controls";
import { cn } from "@/lib/utils";

type FooterV1PreviewContextValue = {
  settings: FooterV1PreviewSettings;
  setSettings: (settings: FooterV1PreviewSettings) => void;
  contentEditingEnabled: boolean;
  getContent: (defaults: FooterV1Content) => FooterV1Content;
  setContentBrandName: (value: string) => void;
  setContentTagline: (value: string) => void;
  setContentServiceArea: (value: string) => void;
  setContentContactName: (index: number, value: string) => void;
  setContentContactPhone: (index: number, value: string) => void;
  setContentCopyright: (value: string) => void;
  setContentLogo: (src: string) => void;
};

const FooterV1PreviewContext = createContext<FooterV1PreviewContextValue | null>(null);

type FooterV1PreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: FooterV1PreviewSettings;
  enableContentEditing?: boolean;
};

export function FooterV1PreviewProvider({
  children,
  instanceId,
  initialSettings,
  enableContentEditing = false,
}: FooterV1PreviewProviderProps) {
  const {
    settings,
    setSettings: persistSettings,
    lockedToPublished,
    refreshFromStorage,
  } = useInstancePreviewSettings({
    instanceId,
    field: "footerV1",
    initialSettings,
    defaultSettings: defaultFooterV1PreviewSettings,
    loadGlobal: loadFooterV1PreviewSettings,
    saveGlobal: saveFooterV1PreviewSettings,
    normalize: normalizeFooterV1PreviewSettings,
    // Published/preview routes pass fully resolved settings — skip client-only reload merge.
    afterLoad: initialSettings ? undefined : applyFooterV1PreviewLoadTransform,
    getGlobalOnly: () => footerUsesGlobalNav(loadFooterV1PreviewSettings()),
    settingsUseGlobal: footerUsesGlobalNav,
    onGlobalSave: () => notifyFooterV1GlobalNavUpdated(),
  });

  useEffect(() => {
    if (lockedToPublished) return;

    const onSync = () => {
      refreshFromStorage();
    };

    window.addEventListener(footerV1GlobalNavSyncEvent, onSync);
    window.addEventListener(playgroundNavSyncEvent, onSync);
    return () => {
      window.removeEventListener(footerV1GlobalNavSyncEvent, onSync);
      window.removeEventListener(playgroundNavSyncEvent, onSync);
    };
  }, [lockedToPublished, refreshFromStorage]);

  const setSettings = useCallback(
    (next: FooterV1PreviewSettings) => {
      persistSettings(next);
    },
    [persistSettings],
  );

  const getContent = useCallback(
    (defaults: FooterV1Content) => resolveFooterV1Content(defaults, settings),
    [settings],
  );

  const applyContentPatch = useCallback(
    (patch: FooterV1ContentOverrides) => {
      if (!enableContentEditing) return;
      saveFooterV1ContentOverrides(patch);
      setSettings(normalizeFooterV1PreviewSettings({ ...settings, ...patch }));
    },
    [enableContentEditing, settings, setSettings],
  );

  const setContentBrandName = useCallback(
    (value: string) => {
      applyContentPatch({ contentBrandName: value.trim() });
    },
    [applyContentPatch],
  );

  const setContentTagline = useCallback(
    (value: string) => {
      applyContentPatch({ contentTagline: value.replace(/^\s+|\s+$/g, "") });
    },
    [applyContentPatch],
  );

  const setContentServiceArea = useCallback(
    (value: string) => {
      applyContentPatch({ contentServiceArea: value.trim() });
    },
    [applyContentPatch],
  );

  const setContentContactName = useCallback(
    (index: number, value: string) => {
      if (!enableContentEditing) return;
      const defaults = getFooterV1TeamContacts();
      const contacts = seedFooterV1ContentContacts(defaults, settings);
      const nextContacts = contacts.map((contact, contactIndex) =>
        contactIndex === index ? { ...contact, name: value.trim() } : contact,
      );
      applyContentPatch({
        contentContacts: nextContacts,
        contentContactName: undefined,
        contentContactPhone: undefined,
      });
    },
    [applyContentPatch, settings],
  );

  const setContentContactPhone = useCallback(
    (index: number, value: string) => {
      if (!enableContentEditing) return;
      const defaults = getFooterV1TeamContacts();
      const contacts = seedFooterV1ContentContacts(defaults, settings);
      const nextContacts = contacts.map((contact, contactIndex) =>
        contactIndex === index ? { ...contact, phone: value.trim() } : contact,
      );
      applyContentPatch({
        contentContacts: nextContacts,
        contentContactName: undefined,
        contentContactPhone: undefined,
      });
    },
    [applyContentPatch, enableContentEditing, settings],
  );

  const setContentCopyright = useCallback(
    (value: string) => {
      applyContentPatch({ contentCopyright: value.trim() });
    },
    [applyContentPatch],
  );

  const setContentLogo = useCallback(
    (src: string) => {
      applyContentPatch({ contentLogoSrc: src.trim() });
    },
    [applyContentPatch],
  );

  return (
    <FooterV1PreviewContext.Provider
      value={{
        settings,
        setSettings,
        contentEditingEnabled: enableContentEditing,
        getContent,
        setContentBrandName,
        setContentTagline,
        setContentServiceArea,
        setContentContactName,
        setContentContactPhone,
        setContentCopyright,
        setContentLogo,
      }}
    >
      {children}
    </FooterV1PreviewContext.Provider>
  );
}

export function useFooterV1Preview() {
  return useContext(FooterV1PreviewContext);
}

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const selectClassName =
  "section-switcher-select rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

export function FooterV1PreviewControls() {
  const context = useFooterV1Preview();
  const playground = useOptionalPlaygroundSections();
  const [backgroundImagePickerOpen, setBackgroundImagePickerOpen] = useState(false);
  if (!context) return null;

  const isHome = playground?.activePage?.isHome ?? true;
  const useGlobalNav = footerUsesGlobalNav(context.settings);
  const stylingLocked = !isHome && useGlobalNav;

  const update = (patch: Partial<FooterV1PreviewSettings>) => {
    if (stylingLocked) return;
    context.setSettings({ ...context.settings, ...patch });
  };

  return (
    <div className="contents">
      {!isHome && context.contentEditingEnabled && (
        <span className="w-full basis-full font-mono text-xs tracking-wide text-accent-purple/70 italic">
          Footer copy — site-wide (edit text in the footer below)
        </span>
      )}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={useGlobalNav}
          disabled={!isHome}
          onChange={(event) => {
            if (!isHome) return;

            if (event.target.checked) {
              update({ useGlobalNav: true, navItems: undefined });
              return;
            }

            update({
              useGlobalNav: false,
              navItems: loadNavBarPreviewSettings().items.map((link) => ({ ...link })),
            });
          }}
          className="h-3.5 w-3.5 accent-accent-purple disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Use global navigation links"
        />
        <span
          className={cn(
            "font-mono text-xs tracking-wide uppercase",
            !isHome ? "text-accent-purple/70" : "text-accent-purple",
          )}
        >
          Global
        </span>
        {!isHome && useGlobalNav && (
          <span className="font-mono text-xs tracking-wide text-accent-purple/70 italic">
            — styling locked; edit on Home
          </span>
        )}
      </label>
      <div
        className={cn(
          "contents",
          stylingLocked && "pointer-events-none opacity-45 saturate-50",
        )}
        aria-hidden={stylingLocked || undefined}
      >
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          Logo Size
        </span>
        <button
          type="button"
          onClick={() =>
            update({
              logoSizePx: stepFooterV1LogoSizePx(context.settings.logoSizePx, -1),
            })
          }
          className={buttonClassName}
          aria-label="Decrease footer logo size"
        >
          −
        </button>
        <select
          value={context.settings.logoSizePx}
          onChange={(event) => update({ logoSizePx: Number(event.target.value) })}
          className={selectClassName}
          aria-label="Footer logo size"
        >
          {footerV1LogoSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() =>
            update({
              logoSizePx: stepFooterV1LogoSizePx(context.settings.logoSizePx, 1),
            })
          }
          className={buttonClassName}
          aria-label="Increase footer logo size"
        >
          +
        </button>
      </div>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Width</span>
        <select
          value={context.settings.layoutWidth}
          onChange={(event) =>
            update({ layoutWidth: event.target.value as SiteLayoutWidth })
          }
          className={selectClassName}
          aria-label="Footer layout width"
        >
          {footerV1LayoutWidthOptions.map((option) => (
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
            aria-label="Footer outer background color"
          />
        </label>
      )}
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          Padding
        </span>
        <select
          value={context.settings.contentInsetPx}
          onChange={(event) => update({ contentInsetPx: Number(event.target.value) })}
          className={selectClassName}
          aria-label="Footer content horizontal padding"
        >
          {footerV1ContentInsetOptions.map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Name</span>
        <input
          type="color"
          value={context.settings.brandNameColor}
          onChange={(event) => update({ brandNameColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer business name color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Blurb</span>
        <input
          type="color"
          value={context.settings.taglineColor}
          onChange={(event) => update({ taglineColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer tagline color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Nav</span>
        <input
          type="color"
          value={context.settings.navColor}
          onChange={(event) => update({ navColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer nav link color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          Nav hover
        </span>
        <input
          type="color"
          value={context.settings.navHoverColor}
          onChange={(event) => update({ navHoverColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer nav link hover color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          Contact
        </span>
        <input
          type="color"
          value={context.settings.contactHeadingColor}
          onChange={(event) => update({ contactHeadingColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer contact heading color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          Contact text
        </span>
        <input
          type="color"
          value={context.settings.contactTextColor}
          onChange={(event) => update({ contactTextColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer contact text color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          Phone hover
        </span>
        <input
          type="color"
          value={context.settings.contactLinkHoverColor}
          onChange={(event) => update({ contactLinkHoverColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer phone link hover color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          Contact sz
        </span>
        <select
          value={context.settings.contactTextSizeEm}
          onChange={(event) => update({ contactTextSizeEm: Number(event.target.value) })}
          className={selectClassName}
          aria-label="Footer contact text size"
        >
          {footerV1ContactTextSizeOptions.map((size) => (
            <option key={size} value={size}>
              {formatFooterV1ContactTextSizeEm(size)}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Btn BG</span>
        <input
          type="color"
          value={context.settings.contactButtonBgColor}
          onChange={(event) => update({ contactButtonBgColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer contact button background color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          Btn hover
        </span>
        <input
          type="color"
          value={context.settings.contactButtonHoverBgColor}
          onChange={(event) => update({ contactButtonHoverBgColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer contact button hover background color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Btn text</span>
        <input
          type="color"
          value={context.settings.contactButtonTextColor}
          onChange={(event) => update({ contactButtonTextColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer contact button text color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG 1</span>
        <input
          type="color"
          value={context.settings.mainBackgroundFrom}
          onChange={(event) => update({ mainBackgroundFrom: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer main background gradient start color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG 2</span>
        <input
          type="color"
          value={context.settings.mainBackgroundTo}
          onChange={(event) => update({ mainBackgroundTo: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer main background gradient end color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Dir</span>
        <select
          value={context.settings.mainBackgroundDirection}
          onChange={(event) =>
            update({ mainBackgroundDirection: event.target.value as PreviewGradientDirection })
          }
          className={selectClassName}
          aria-label="Footer main background gradient direction"
        >
          {footerV1GradientDirections.map((option) => (
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
          disabled={stylingLocked}
          className={cn(buttonClassName, "flex items-center gap-1.5")}
          aria-label="Choose footer background image from library"
          aria-expanded={backgroundImagePickerOpen}
        >
          <Images size={devLibraryIconSize} strokeWidth={2} />
          <span className={devLibraryLabelClassName}>Library</span>
        </button>
        {context.settings.mainBackgroundImageSrc ? (
          <>
            <span
              className="max-w-28 truncate font-mono text-[0.65rem] text-accent-purple/80"
              title={context.settings.mainBackgroundImageSrc}
            >
              {context.settings.mainBackgroundImageSrc.split("/").pop()}
            </span>
            <button
              type="button"
              onClick={() => update({ mainBackgroundImageSrc: "" })}
              disabled={stylingLocked}
              className={buttonClassName}
              aria-label="Clear footer background image"
            >
              Clear
            </button>
          </>
        ) : (
          <span className="font-mono text-[0.65rem] text-accent-purple/60">None</span>
        )}
        {backgroundImagePickerOpen && !stylingLocked && (
          <div className="absolute top-full left-0 z-50 mt-2">
            <ImageLibraryPicker
              value={context.settings.mainBackgroundImageSrc || undefined}
              onSelect={(entry) => {
                update({ mainBackgroundImageSrc: entry.src });
                setBackgroundImagePickerOpen(false);
              }}
              onClose={() => setBackgroundImagePickerOpen(false)}
              className="w-[min(92vw,52rem)]"
            />
          </div>
        )}
      </div>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Bar BG</span>
        <input
          type="color"
          value={context.settings.bottomBarBackgroundColor}
          onChange={(event) => update({ bottomBarBackgroundColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer bottom bar background color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          Bar text
        </span>
        <input
          type="color"
          value={context.settings.bottomBarTextColor}
          onChange={(event) => update({ bottomBarTextColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer bottom bar text color"
        />
      </label>
      <button
        type="button"
        onClick={() => context.setSettings(defaultFooterV1PreviewSettings)}
        className={buttonClassName}
        disabled={stylingLocked}
      >
        Reset
      </button>
      </div>
    </div>
  );
}
