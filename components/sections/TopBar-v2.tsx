"use client";

import { useState, type CSSProperties } from "react";
import { Pencil } from "lucide-react";
import { useTopBarV2Preview } from "@/components/dev/TopBarV2PreviewContext";
import { phoneTelHref } from "@/lib/phone";
import {
  defaultTopBarV2PreviewSettings,
  getTopBarV2LayoutWidthClassName,
  type TopBarV2PreviewSettings,
} from "@/lib/top-bar-v2-preview";
import {
  devEditButtonClassName,
  devEditIconSize,
  devPopoverZIndexClassName,
} from "@/lib/dev-overlay-controls";
import { cn } from "@/lib/utils";

const fieldClassName =
  "w-full rounded border border-accent-purple/40 bg-background px-2 py-1.5 text-sm text-foreground focus:border-accent-purple focus:outline-none";

function TopBarV2Editor({
  text1,
  text2,
  callText,
  phoneHref,
  onSave,
  onClose,
}: {
  text1: string;
  text2: string;
  callText: string;
  phoneHref: string;
  onSave: (patch: Pick<TopBarV2PreviewSettings, "text1" | "text2" | "callText" | "phoneHref">) => void;
  onClose: () => void;
}) {
  const [text1Draft, setText1Draft] = useState(text1);
  const [text2Draft, setText2Draft] = useState(text2);
  const [callDraft, setCallDraft] = useState(callText);
  const [hrefDraft, setHrefDraft] = useState(phoneHref);

  return (
    <div
      className={cn(
        "absolute top-full left-1/2 mt-2 w-80 -translate-x-1/2 rounded-md border border-accent-purple/50 bg-background/95 p-2 shadow-lg backdrop-blur-sm",
        devPopoverZIndexClassName,
      )}
      role="dialog"
      aria-label="Edit top bar center text"
    >
      <p className="mb-2 px-1 font-mono text-[10px] tracking-wide text-accent-purple uppercase">
        Center text
      </p>
      <p className="mb-1 px-1 font-mono text-[10px] tracking-wide text-accent-purple/80 uppercase">
        Text 1
      </p>
      <input
        type="text"
        value={text1Draft}
        autoFocus
        onChange={(event) => setText1Draft(event.target.value)}
        className={fieldClassName}
        aria-label="Edit top bar text 1"
      />
      <p className="mb-1 mt-3 px-1 font-mono text-[10px] tracking-wide text-accent-purple/80 uppercase">
        Text 2
      </p>
      <input
        type="text"
        value={text2Draft}
        onChange={(event) => setText2Draft(event.target.value)}
        className={fieldClassName}
        aria-label="Edit top bar text 2"
      />
      <p className="mb-1 mt-3 px-1 font-mono text-[10px] tracking-wide text-accent-purple/80 uppercase">
        Call
      </p>
      <input
        type="text"
        value={callDraft}
        onChange={(event) => setCallDraft(event.target.value)}
        className={fieldClassName}
        aria-label="Edit top bar call text"
      />
      <p className="mb-1 mt-3 px-1 font-mono text-[10px] tracking-wide text-accent-purple/80 uppercase">
        Link
      </p>
      <input
        type="text"
        value={hrefDraft}
        onChange={(event) => setHrefDraft(event.target.value)}
        className={fieldClassName}
        aria-label="Edit top bar call link"
        placeholder="tel:+13605678273"
      />
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-accent-purple/30 px-2 py-1 font-mono text-[10px] text-accent-purple/80"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            const nextCall = callDraft.trim();
            const typedHref = hrefDraft.trim();
            const derived = phoneTelHref(nextCall);
            const nextHref =
              typedHref ||
              (derived !== "tel:" ? derived : defaultTopBarV2PreviewSettings.phoneHref);
            onSave({
              text1: text1Draft,
              text2: text2Draft,
              callText: nextCall,
              phoneHref: nextHref,
            });
            onClose();
          }}
          className="rounded border border-accent-purple/50 bg-accent-purple/10 px-2 py-1 font-mono text-[10px] text-accent-purple"
        >
          Save
        </button>
      </div>
    </div>
  );
}

/** Centered announcement bar — phrase + call in one column. */
export function TopBarV2() {
  const preview = useTopBarV2Preview();
  const settings = preview?.settings ?? defaultTopBarV2PreviewSettings;
  const editingEnabled = preview?.contentEditingEnabled ?? false;
  const [editorOpen, setEditorOpen] = useState(false);

  const update = (patch: Partial<TopBarV2PreviewSettings>) => {
    if (!preview) return;
    preview.setSettings({ ...settings, ...patch });
  };

  const barStyle = {
    "--top-bar-height": `${settings.heightPx}px`,
    "--top-bar-text-size": `${settings.textSizePx}px`,
  } as CSSProperties;

  return (
    <section
      className="top-bar top-bar-v2"
      style={{ ...barStyle, backgroundColor: settings.outerBackgroundColor }}
      aria-label="Site announcement bar"
    >
      <div className={cn(getTopBarV2LayoutWidthClassName(settings.layoutWidth))}>
        <div
          className={cn("top-bar-v2-inner", editingEnabled && "relative")}
          style={{ backgroundColor: settings.backgroundColor }}
        >
          <p className="top-bar-v2-line">
            {settings.text1 ? (
              <span className="top-bar-v2-text" style={{ color: settings.text1Color }}>
                {settings.text1}
              </span>
            ) : null}
            {settings.text2 ? (
              <span className="top-bar-v2-text" style={{ color: settings.text2Color }}>
                {settings.text2}
              </span>
            ) : null}
            {settings.callText ? (
              <a
                href={settings.phoneHref}
                className="top-bar-v2-call"
                style={{ color: settings.callColor }}
              >
                {settings.callText}
              </a>
            ) : null}
          </p>
          {editingEnabled ? (
            <>
              <button
                type="button"
                onClick={() => setEditorOpen((open) => !open)}
                className={devEditButtonClassName}
                aria-label="Edit top bar center text"
                aria-expanded={editorOpen}
              >
                <Pencil size={devEditIconSize} strokeWidth={2} />
              </button>
              {editorOpen ? (
                <TopBarV2Editor
                  text1={settings.text1}
                  text2={settings.text2}
                  callText={settings.callText}
                  phoneHref={settings.phoneHref}
                  onSave={(patch) => update(patch)}
                  onClose={() => setEditorOpen(false)}
                />
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
