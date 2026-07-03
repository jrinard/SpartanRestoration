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
  defaultFooterV3PreviewSettings,
  footerV3LayoutWidths,
  footerV3LogoVariants,
  footerV3Themes,
  type FooterV3LayoutWidth,
  type FooterV3LogoVariant,
  type FooterV3PreviewSettings,
  type FooterV3Theme,
} from "@/lib/footer-v3-preview";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import {
  loadFooterV3PreviewSettings,
  normalizeFooterV3PreviewSettings,
  saveFooterV3PreviewSettings,
} from "@/lib/footer-v3-preview-storage";

type FooterV3PreviewContextValue = {
  settings: FooterV3PreviewSettings;
  setSettings: (settings: FooterV3PreviewSettings) => void;
};

const FooterV3PreviewContext = createContext<FooterV3PreviewContextValue | null>(null);

type FooterV3PreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: FooterV3PreviewSettings;
};

export function FooterV3PreviewProvider({
  children,
  instanceId,
  initialSettings,
}: FooterV3PreviewProviderProps) {
  const { settings, setSettings } = useInstancePreviewSettings({
    instanceId,
    field: "footerV3",
    initialSettings,
    defaultSettings: defaultFooterV3PreviewSettings,
    loadGlobal: loadFooterV3PreviewSettings,
    saveGlobal: saveFooterV3PreviewSettings,
    normalize: normalizeFooterV3PreviewSettings,
  });

  return (
    <FooterV3PreviewContext.Provider value={{ settings, setSettings }}>
      {children}
    </FooterV3PreviewContext.Provider>
  );
}

export function useFooterV3Preview() {
  return useContext(FooterV3PreviewContext);
}

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const selectClassName =
  "section-switcher-select rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

export function FooterV3PreviewControls() {
  const context = useFooterV3Preview();
  if (!context) return null;

  const update = (patch: Partial<FooterV3PreviewSettings>) => {
    context.setSettings({ ...context.settings, ...patch });
  };

  return (
    <div className="contents">
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Subtext</span>
        <input
          type="color"
          value={context.settings.subtextColor}
          onChange={(event) => update({ subtextColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer subtext color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Extra text</span>
        <input
          type="color"
          value={context.settings.extraTextColor}
          onChange={(event) => update({ extraTextColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer extra text color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Links</span>
        <input
          type="color"
          value={context.settings.linkColor}
          onChange={(event) => update({ linkColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer link text color"
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
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Accent</span>
        <input
          type="color"
          value={context.settings.accentColor}
          onChange={(event) => update({ accentColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer Start a project label color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">©</span>
        <input
          type="color"
          value={context.settings.copyrightColor}
          onChange={(event) => update({ copyrightColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer copyright text color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Domain</span>
        <input
          type="color"
          value={context.settings.domainColor}
          onChange={(event) => update({ domainColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer domain text color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Social</span>
        <input
          type="color"
          value={context.settings.socialColor}
          onChange={(event) => update({ socialColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer social icon color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Social hover</span>
        <input
          type="color"
          value={context.settings.socialHoverColor}
          onChange={(event) => update({ socialHoverColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer social icon hover color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Logo</span>
        <select
          value={context.settings.logoVariant}
          onChange={(event) =>
            update({ logoVariant: event.target.value as FooterV3LogoVariant })
          }
          className={selectClassName}
          aria-label="Footer logo variant"
        >
          {footerV3LogoVariants.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Theme</span>
        <select
          value={context.settings.theme}
          onChange={(event) => update({ theme: event.target.value as FooterV3Theme })}
          className={selectClassName}
          aria-label="Footer theme"
        >
          {footerV3Themes.map((option) => (
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
            update({ layoutWidth: event.target.value as FooterV3LayoutWidth })
          }
          className={selectClassName}
          aria-label="Footer layout width"
        >
          {footerV3LayoutWidths.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={() => context.setSettings(defaultFooterV3PreviewSettings)}
        className={buttonClassName}
      >
        Reset
      </button>
    </div>
  );
}
