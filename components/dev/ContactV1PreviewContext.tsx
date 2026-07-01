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
  contactBackgroundModes,
  defaultContactPreviewSettings,
  type ContactBackgroundMode,
  type ContactPreviewSettings,
} from "@/lib/contact-preview";
import {
  loadContactPreviewSettings,
  saveContactPreviewSettings,
} from "@/lib/contact-preview-storage";

type ContactV1PreviewContextValue = {
  settings: ContactPreviewSettings;
  setSettings: (settings: ContactPreviewSettings) => void;
};

const ContactV1PreviewContext = createContext<ContactV1PreviewContextValue | null>(null);

export function ContactV1PreviewProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<ContactPreviewSettings>(
    defaultContactPreviewSettings,
  );

  useEffect(() => {
    setSettingsState(loadContactPreviewSettings());
  }, []);

  const setSettings = useCallback((next: ContactPreviewSettings) => {
    setSettingsState(next);
    saveContactPreviewSettings(next);
  }, []);

  return (
    <ContactV1PreviewContext.Provider value={{ settings, setSettings }}>
      {children}
    </ContactV1PreviewContext.Provider>
  );
}

export function useContactV1Preview() {
  return useContext(ContactV1PreviewContext);
}

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const selectClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const rangeClassName = "h-1.5 w-20 cursor-pointer accent-accent-purple";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

export function ContactV1PreviewControls() {
  const context = useContactV1Preview();
  if (!context) return null;

  const update = (patch: Partial<ContactPreviewSettings>) => {
    context.setSettings({ ...context.settings, ...patch });
  };

  const isGradient = context.settings.backgroundMode === "gradient";

  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Fill</span>
        <select
          value={context.settings.backgroundMode}
          onChange={(event) =>
            update({ backgroundMode: event.target.value as ContactBackgroundMode })
          }
          className={selectClassName}
          aria-label="Contact card background mode"
        >
          {contactBackgroundModes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {!isGradient ? (
        <label className="flex items-center gap-2">
          <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Color</span>
          <input
            type="color"
            value={context.settings.solidColor}
            onChange={(event) => update({ solidColor: event.target.value })}
            className={colorInputClassName}
            aria-label="Contact card solid color"
          />
        </label>
      ) : (
        <>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">From</span>
            <input
              type="color"
              value={context.settings.gradientFrom}
              onChange={(event) => update({ gradientFrom: event.target.value })}
              className={colorInputClassName}
              aria-label="Contact card gradient start color"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">To</span>
            <input
              type="color"
              value={context.settings.gradientTo}
              onChange={(event) => update({ gradientTo: event.target.value })}
              className={colorInputClassName}
              aria-label="Contact card gradient end color"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Angle</span>
            <input
              type="range"
              min={0}
              max={360}
              value={context.settings.gradientAngle}
              onChange={(event) => update({ gradientAngle: Number(event.target.value) })}
              className={rangeClassName}
              aria-label="Contact card gradient angle"
            />
          </label>
        </>
      )}

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Radius</span>
        <input
          type="range"
          min={8}
          max={48}
          value={context.settings.borderRadius}
          onChange={(event) => update({ borderRadius: Number(event.target.value) })}
          className={rangeClassName}
          aria-label="Contact card border radius"
        />
      </label>

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Title</span>
        <input
          type="color"
          value={context.settings.titleColor}
          onChange={(event) => update({ titleColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Contact card title color"
        />
      </label>

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Body</span>
        <input
          type="color"
          value={context.settings.bodyColor}
          onChange={(event) => update({ bodyColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Contact card body color"
        />
      </label>

      <button
        type="button"
        onClick={() => context.setSettings(defaultContactPreviewSettings)}
        className={buttonClassName}
      >
        Reset
      </button>
    </div>
  );
}
