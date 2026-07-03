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
  footerV1ContactTextSizeOptions,
  footerV1ContentInsetOptions,
  footerV1GradientDirections,
  footerV1LayoutWidthOptions,
  formatFooterV1ContactTextSizeEm,
  type FooterV1PreviewSettings,
} from "@/lib/footer-v1-preview";
import type { PreviewGradientDirection } from "@/lib/preview-gradient";
import type { SiteLayoutWidth } from "@/lib/site-layout";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import {
  loadFooterV1PreviewSettings,
  normalizeFooterV1PreviewSettings,
  saveFooterV1PreviewSettings,
} from "@/lib/footer-v1-preview-storage";

type FooterV1PreviewContextValue = {
  settings: FooterV1PreviewSettings;
  setSettings: (settings: FooterV1PreviewSettings) => void;
};

const FooterV1PreviewContext = createContext<FooterV1PreviewContextValue | null>(null);

type FooterV1PreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: FooterV1PreviewSettings;
};

export function FooterV1PreviewProvider({
  children,
  instanceId,
  initialSettings,
}: FooterV1PreviewProviderProps) {
  const { settings, setSettings } = useInstancePreviewSettings({
    instanceId,
    field: "footerV1",
    initialSettings,
    defaultSettings: defaultFooterV1PreviewSettings,
    loadGlobal: loadFooterV1PreviewSettings,
    saveGlobal: saveFooterV1PreviewSettings,
    normalize: normalizeFooterV1PreviewSettings,
  });

  return (
    <FooterV1PreviewContext.Provider value={{ settings, setSettings }}>
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
  if (!context) return null;

  const update = (patch: Partial<FooterV1PreviewSettings>) => {
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
      >
        Reset
      </button>
    </div>
  );
}
