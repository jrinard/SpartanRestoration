"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import {
  defaultFooterV4PreviewSettings,
  footerV4LogoSizeOptions,
  resolveFooterV4Content,
  stepFooterV4LogoSizePx,
  type FooterV4Content,
  type FooterV4ContentOverrides,
  type FooterV4PreviewSettings,
} from "@/lib/footer-v4-preview";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import {
  loadFooterV4PreviewSettings,
  normalizeFooterV4PreviewSettings,
  saveFooterV4ContentOverrides,
  saveFooterV4PreviewSettings,
} from "@/lib/footer-v4-preview-storage";
import { siteConfig } from "@/config/site";

type FooterV4PreviewContextValue = {
  settings: FooterV4PreviewSettings;
  setSettings: (settings: FooterV4PreviewSettings) => void;
  contentEditingEnabled: boolean;
  getContent: (defaults: FooterV4Content) => FooterV4Content;
  saveContentOverrides: (patch: FooterV4ContentOverrides) => void;
};

const FooterV4PreviewContext = createContext<FooterV4PreviewContextValue | null>(null);

type FooterV4PreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: FooterV4PreviewSettings;
  enableContentEditing?: boolean;
};

export function FooterV4PreviewProvider({
  children,
  instanceId,
  initialSettings,
  enableContentEditing = false,
}: FooterV4PreviewProviderProps) {
  const { settings, setSettings } = useInstancePreviewSettings({
    instanceId,
    field: "footerV4",
    initialSettings,
    defaultSettings: defaultFooterV4PreviewSettings,
    loadGlobal: loadFooterV4PreviewSettings,
    saveGlobal: saveFooterV4PreviewSettings,
    normalize: normalizeFooterV4PreviewSettings,
  });

  const getContent = useCallback(
    (defaults: FooterV4Content) =>
      resolveFooterV4Content(defaults, settings, siteConfig.name),
    [settings],
  );

  const saveContentOverrides = useCallback(
    (patch: FooterV4ContentOverrides) => {
      saveFooterV4ContentOverrides(patch);
      setSettings(normalizeFooterV4PreviewSettings({ ...settings, ...patch }));
    },
    [setSettings, settings],
  );

  return (
    <FooterV4PreviewContext.Provider
      value={{
        settings,
        setSettings,
        contentEditingEnabled: enableContentEditing,
        getContent,
        saveContentOverrides,
      }}
    >
      {children}
    </FooterV4PreviewContext.Provider>
  );
}

export function useFooterV4Preview() {
  return useContext(FooterV4PreviewContext);
}

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const selectClassName =
  "section-switcher-select rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

const checkboxClassName = "h-4 w-4 accent-accent-purple";

export function FooterV4PreviewControls() {
  const context = useFooterV4Preview();
  if (!context) return null;

  const update = (patch: Partial<FooterV4PreviewSettings>) => {
    context.setSettings({ ...context.settings, ...patch });
  };

  return (
    <div className="contents">
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Banner L</span>
        <input
          type="color"
          value={context.settings.bannerFrom}
          onChange={(event) => update({ bannerFrom: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer banner left color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Banner R</span>
        <input
          type="color"
          value={context.settings.bannerTo}
          onChange={(event) => update({ bannerTo: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer banner right color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Heading</span>
        <input
          type="color"
          value={context.settings.headingColor}
          onChange={(event) => update({ headingColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer heading color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Text</span>
        <input
          type="color"
          value={context.settings.textColor}
          onChange={(event) => update({ textColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer text color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Links</span>
        <input
          type="color"
          value={context.settings.linkColor}
          onChange={(event) => update({ linkColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer link color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Link hover</span>
        <input
          type="color"
          value={context.settings.linkHoverColor}
          onChange={(event) => update({ linkHoverColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer link hover color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Social</span>
        <input
          type="color"
          value={context.settings.socialColor}
          onChange={(event) => update({ socialColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer social color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Social hover</span>
        <input
          type="color"
          value={context.settings.socialHoverColor}
          onChange={(event) => update({ socialHoverColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer social hover color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Bottom bg</span>
        <input
          type="color"
          value={context.settings.bottomBarBackgroundColor}
          onChange={(event) => update({ bottomBarBackgroundColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer bottom bar background"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Bottom text</span>
        <input
          type="color"
          value={context.settings.bottomBarTextColor}
          onChange={(event) => update({ bottomBarTextColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer bottom bar text color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Logo</span>
        <button
          type="button"
          onClick={() =>
            update({
              logoSizePx: stepFooterV4LogoSizePx(context.settings.logoSizePx, -1),
            })
          }
          className={buttonClassName}
          aria-label="Decrease footer logo size"
        >
          −
        </button>
        <select
          value={context.settings.logoSizePx}
          onChange={(event) => update({ logoSizePx: Number.parseInt(event.target.value, 10) })}
          className={selectClassName}
          aria-label="Footer logo size"
        >
          {footerV4LogoSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() =>
            update({
              logoSizePx: stepFooterV4LogoSizePx(context.settings.logoSizePx, 1),
            })
          }
          className={buttonClassName}
          aria-label="Increase footer logo size"
        >
          +
        </button>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={context.settings.showFacebook}
          onChange={(event) => update({ showFacebook: event.target.checked })}
          className={checkboxClassName}
        />
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Facebook</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={context.settings.showInstagram}
          onChange={(event) => update({ showInstagram: event.target.checked })}
          className={checkboxClassName}
        />
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Instagram</span>
      </label>
      <button
        type="button"
        onClick={() => context.setSettings(defaultFooterV4PreviewSettings)}
        className={buttonClassName}
      >
        Reset
      </button>
    </div>
  );
}

export function FooterV4SocialControls() {
  const context = useFooterV4Preview();
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");

  if (!context?.contentEditingEnabled) return null;

  const commitFacebook = () => {
    context.saveContentOverrides({ contentFacebookUrl: facebookUrl.trim() });
  };

  const commitInstagram = () => {
    context.saveContentOverrides({ contentInstagramUrl: instagramUrl.trim() });
  };

  return (
    <div className="flex w-full basis-full flex-wrap items-end gap-3 border-t border-accent-purple/20 pt-2">
      {context.settings.showFacebook ? (
        <label className="flex min-w-[220px] flex-1 flex-col gap-1">
          <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
            Facebook URL
          </span>
          <input
            className="rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple focus:border-accent-purple focus:outline-none"
            defaultValue={context.settings.contentFacebookUrl ?? ""}
            onFocus={(event) => setFacebookUrl(event.target.value)}
            onChange={(event) => setFacebookUrl(event.target.value)}
            onBlur={commitFacebook}
            placeholder="https://facebook.com/..."
          />
        </label>
      ) : null}
      {context.settings.showInstagram ? (
        <label className="flex min-w-[220px] flex-1 flex-col gap-1">
          <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
            Instagram URL
          </span>
          <input
            className="rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple focus:border-accent-purple focus:outline-none"
            defaultValue={context.settings.contentInstagramUrl ?? ""}
            onFocus={(event) => setInstagramUrl(event.target.value)}
            onChange={(event) => setInstagramUrl(event.target.value)}
            onBlur={commitInstagram}
            placeholder="https://instagram.com/..."
          />
        </label>
      ) : null}
    </div>
  );
}
