"use client";

import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import { ContactFormFieldsControls } from "@/components/dev/ContactFormFieldsControls";
import {
  contactBackgroundModes,
  contactButtonBorderRadiusOptions,
  defaultContactButtonSettings,
  defaultContactPreviewSettings,
  type ContactBackgroundMode,
  type ContactContent,
  type ContactPreviewSettings,
} from "@/lib/contact-preview";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import {
  loadContactPreviewSettings,
  normalizeContactPreviewSettings,
  saveContactPreviewSettings,
} from "@/lib/contact-preview-storage";
import { resolveContactContent } from "@/lib/contact-preview";
import { phoneTelHref } from "@/lib/phone";

type ContactV1PreviewContextValue = {
  settings: ContactPreviewSettings;
  setSettings: (settings: ContactPreviewSettings) => void;
  contentEditingEnabled: boolean;
  getContent: (defaults: ContactContent) => ContactContent;
  setContentTitle: (value: string) => void;
  setContentSubtext: (value: string) => void;
  setContentPhoneLine: (phonePrefix: string, phoneLabel: string) => void;
};

const ContactV1PreviewContext = createContext<ContactV1PreviewContextValue | null>(null);

type ContactV1PreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: ContactPreviewSettings;
  enableContentEditing?: boolean;
};

export function ContactV1PreviewProvider({
  children,
  instanceId,
  initialSettings,
  enableContentEditing = false,
}: ContactV1PreviewProviderProps) {
  const { settings, setSettings: persistSettings } = useInstancePreviewSettings({
    instanceId,
    field: "contact",
    initialSettings,
    defaultSettings: defaultContactPreviewSettings,
    loadGlobal: loadContactPreviewSettings,
    saveGlobal: saveContactPreviewSettings,
    normalize: normalizeContactPreviewSettings,
  });

  const setSettings = useCallback(
    (next: ContactPreviewSettings) => {
      persistSettings(next);
    },
    [persistSettings],
  );

  const getContent = useCallback(
    (defaults: ContactContent) => resolveContactContent(defaults, settings),
    [settings],
  );

  const setContentTitle = useCallback(
    (value: string) => {
      if (!enableContentEditing) return;
      setSettings({ ...settings, contentTitle: value });
    },
    [enableContentEditing, settings, setSettings],
  );

  const setContentSubtext = useCallback(
    (value: string) => {
      if (!enableContentEditing) return;
      setSettings({ ...settings, contentSubtext: value });
    },
    [enableContentEditing, settings, setSettings],
  );

  const setContentPhoneLine = useCallback(
    (phonePrefix: string, phoneLabel: string) => {
      if (!enableContentEditing) return;
      setSettings({
        ...settings,
        contentPhonePrefix: phonePrefix,
        contentPhoneLabel: phoneLabel,
        contentPhoneHref: phoneLabel ? phoneTelHref(phoneLabel) : "",
      });
    },
    [enableContentEditing, settings, setSettings],
  );

  return (
    <ContactV1PreviewContext.Provider
      value={{
        settings,
        setSettings,
        contentEditingEnabled: enableContentEditing,
        getContent,
        setContentTitle,
        setContentSubtext,
        setContentPhoneLine,
      }}
    >
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

const textInputClassName =
  "w-28 rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

export function ContactV1PreviewControls() {
  const context = useContactV1Preview();
  if (!context) return null;

  const update = (patch: Partial<ContactPreviewSettings>) => {
    context.setSettings({ ...context.settings, ...patch });
  };

  const isGradient = context.settings.backgroundMode === "gradient";

  return (
    <div className="contents">
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Section</span>
        <input
          type="color"
          value={context.settings.sectionBackgroundColor ?? "#ffffff"}
          onChange={(event) => update({ sectionBackgroundColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Contact section background color"
        />
      </label>

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

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Submit</span>
        <input
          type="text"
          value={context.settings.submitText ?? defaultContactButtonSettings.submitText}
          onChange={(event) => update({ submitText: event.target.value })}
          className={textInputClassName}
          aria-label="Contact form submit button text"
        />
      </label>

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Btn</span>
        <input
          type="color"
          value={context.settings.buttonBackground ?? defaultContactButtonSettings.buttonBackground}
          onChange={(event) => update({ buttonBackground: event.target.value })}
          className={colorInputClassName}
          aria-label="Contact form submit button background"
        />
      </label>

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Btn text</span>
        <input
          type="color"
          value={context.settings.buttonTextColor ?? defaultContactButtonSettings.buttonTextColor}
          onChange={(event) => update({ buttonTextColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Contact form submit button text color"
        />
      </label>

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Btn radius</span>
        <select
          value={context.settings.buttonRadiusPx ?? defaultContactButtonSettings.buttonRadiusPx}
          onChange={(event) => update({ buttonRadiusPx: Number(event.target.value) })}
          className={selectClassName}
          aria-label="Contact form submit button border radius"
        >
          {contactButtonBorderRadiusOptions.map((option) => (
            <option key={option} value={option}>
              {option}px
            </option>
          ))}
        </select>
      </label>

      <ContactFormFieldsControls />

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
