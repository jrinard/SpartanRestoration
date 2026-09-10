"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { Pencil } from "lucide-react";
import { useTopBarPreview } from "@/components/dev/TopBarPreviewContext";
import {
  defaultTopBarPreviewSettings,
  getTopBarLayoutWidthClassName,
  type TopBarPreviewSettings,
} from "@/lib/top-bar-preview";
import { phoneTelHref } from "@/lib/phone";
import { SocialIcon } from "@/lib/social-icons";
import {
  devEditButtonClassName,
  devEditIconSize,
  devPopoverZIndexClassName,
} from "@/lib/dev-overlay-controls";
import { cn } from "@/lib/utils";

const fieldClassName =
  "w-full rounded border border-accent-purple/40 bg-background px-2 py-1.5 text-sm text-foreground focus:border-accent-purple focus:outline-none";

function TopBarSideEditor({
  title,
  ariaLabel,
  children,
  onSave,
  onClose,
}: {
  title: string;
  ariaLabel: string;
  children: ReactNode;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className={cn(
        "absolute top-full left-1/2 mt-2 w-72 -translate-x-1/2 rounded-md border border-accent-purple/50 bg-background/95 p-2 shadow-lg backdrop-blur-sm",
        devPopoverZIndexClassName,
      )}
      role="dialog"
      aria-label={ariaLabel}
    >
      <p className="mb-2 px-1 font-mono text-[10px] tracking-wide text-accent-purple uppercase">
        {title}
      </p>
      {children}
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
          onClick={onSave}
          className="rounded border border-accent-purple/50 bg-accent-purple/10 px-2 py-1 font-mono text-[10px] text-accent-purple"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function TopBarLeftEditor({
  leftLabel,
  leftAccent,
  onSave,
  onClose,
}: {
  leftLabel: string;
  leftAccent: string;
  onSave: (patch: { leftLabel: string; leftAccent: string }) => void;
  onClose: () => void;
}) {
  const [labelDraft, setLabelDraft] = useState(leftLabel);
  const [accentDraft, setAccentDraft] = useState(leftAccent);

  return (
    <TopBarSideEditor
      title="Left text"
      ariaLabel="Edit top bar left text"
      onClose={onClose}
      onSave={() => {
        onSave({ leftLabel: labelDraft.trim(), leftAccent: accentDraft.trim() });
        onClose();
      }}
    >
      <p className="mb-1 px-1 font-mono text-[10px] tracking-wide text-accent-purple/80 uppercase">
        Label
      </p>
      <input
        type="text"
        value={labelDraft}
        autoFocus
        onChange={(event) => setLabelDraft(event.target.value)}
        className={fieldClassName}
        aria-label="Edit top bar left label"
      />
      <p className="mb-1 mt-3 px-1 font-mono text-[10px] tracking-wide text-accent-purple/80 uppercase">
        Accent
      </p>
      <input
        type="text"
        value={accentDraft}
        onChange={(event) => setAccentDraft(event.target.value)}
        className={fieldClassName}
        aria-label="Edit top bar left accent"
      />
    </TopBarSideEditor>
  );
}

function TopBarRightEditor({
  rightText,
  phoneHref,
  onSave,
  onClose,
}: {
  rightText: string;
  phoneHref: string;
  onSave: (patch: { rightText: string; phoneHref: string }) => void;
  onClose: () => void;
}) {
  const [textDraft, setTextDraft] = useState(rightText);
  const [hrefDraft, setHrefDraft] = useState(phoneHref);

  return (
    <TopBarSideEditor
      title="Right text"
      ariaLabel="Edit top bar right text"
      onClose={onClose}
      onSave={() => {
        const nextText = textDraft.trim();
        const typedHref = hrefDraft.trim();
        const derived = phoneTelHref(nextText);
        const nextHref =
          typedHref ||
          (derived !== "tel:" ? derived : defaultTopBarPreviewSettings.phoneHref);
        onSave({ rightText: nextText, phoneHref: nextHref });
        onClose();
      }}
    >
      <p className="mb-1 px-1 font-mono text-[10px] tracking-wide text-accent-purple/80 uppercase">
        Text
      </p>
      <input
        type="text"
        value={textDraft}
        autoFocus
        onChange={(event) => setTextDraft(event.target.value)}
        className={fieldClassName}
        aria-label="Edit top bar right text"
      />
      <p className="mb-1 mt-3 px-1 font-mono text-[10px] tracking-wide text-accent-purple/80 uppercase">
        Link
      </p>
      <input
        type="text"
        value={hrefDraft}
        onChange={(event) => setHrefDraft(event.target.value)}
        className={fieldClassName}
        aria-label="Edit top bar right link"
        placeholder="tel:+13605678273"
      />
    </TopBarSideEditor>
  );
}

/** Split announcement bar — hours on the left, call CTA on the right. */
export function TopBarV1() {
  const preview = useTopBarPreview();
  const settings = preview?.settings ?? defaultTopBarPreviewSettings;
  const editingEnabled = preview?.contentEditingEnabled ?? false;
  const rightWidthPercent = 100 - settings.leftWidthPercent;
  const socialLinkCount = settings.socialLinks.length;
  const [leftEditorOpen, setLeftEditorOpen] = useState(false);
  const [rightEditorOpen, setRightEditorOpen] = useState(false);

  const update = (patch: Partial<TopBarPreviewSettings>) => {
    if (!preview) return;
    preview.setSettings({ ...settings, ...patch });
  };

  const barStyle = {
    "--top-bar-height": `${settings.heightPx}px`,
    "--top-bar-left-width": `${settings.leftWidthPercent}%`,
    "--top-bar-right-width": `${rightWidthPercent}%`,
    "--top-bar-text-size": `${settings.textSizePx}px`,
    "--top-bar-social-inset": `${settings.socialLinksInsetPx}px`,
    "--top-bar-social-color": settings.socialIconColor,
  } as CSSProperties;

  return (
    <section
      className="top-bar"
      style={{ ...barStyle, backgroundColor: settings.outerBackgroundColor }}
      aria-label="Site announcement bar"
    >
      <div
        className={cn(
          getTopBarLayoutWidthClassName(settings.layoutWidth, settings.layoutWidthMobile),
        )}
      >
        <div className={cn("top-bar-split", settings.inverted && "top-bar-split--inverted")}>
          <div
            className={cn(
              "top-bar-segment top-bar-segment--left",
              editingEnabled && "relative",
            )}
            style={{
              backgroundColor: settings.leftBackgroundColor,
              color: settings.leftLabelColor,
            }}
          >
            <p className="top-bar-text">
              {settings.leftLabel}
              {settings.leftLabel && settings.leftAccent ? " " : null}
              {settings.leftAccent ? (
                <span className="top-bar-accent" style={{ color: settings.leftAccentColor }}>
                  {settings.leftAccent}
                </span>
              ) : null}
            </p>
            {editingEnabled ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setLeftEditorOpen((open) => !open);
                    setRightEditorOpen(false);
                  }}
                  className={devEditButtonClassName}
                  aria-label="Edit top bar left text"
                  aria-expanded={leftEditorOpen}
                >
                  <Pencil size={devEditIconSize} strokeWidth={2} />
                </button>
                {leftEditorOpen ? (
                  <TopBarLeftEditor
                    leftLabel={settings.leftLabel}
                    leftAccent={settings.leftAccent}
                    onSave={(patch) => update(patch)}
                    onClose={() => setLeftEditorOpen(false)}
                  />
                ) : null}
              </>
            ) : null}
          </div>
          <div
            className={cn(
              "top-bar-segment top-bar-segment--right",
              editingEnabled && "relative",
            )}
            style={{
              backgroundColor: settings.rightBackgroundColor,
              color: settings.rightTextColor,
            }}
          >
            <div className="top-bar-right-inner">
              <a href={settings.phoneHref} className="top-bar-call">
                {settings.rightText}
              </a>
              {socialLinkCount > 0 && (
                <div className="top-bar-social">
                  {settings.socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.href}
                      className="top-bar-social-link"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label?.trim() || undefined}
                    >
                      <SocialIcon name={link.icon} className="top-bar-social-icon" aria-hidden />
                    </a>
                  ))}
                </div>
              )}
            </div>
            {editingEnabled ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setRightEditorOpen((open) => !open);
                    setLeftEditorOpen(false);
                  }}
                  className={devEditButtonClassName}
                  aria-label="Edit top bar right text"
                  aria-expanded={rightEditorOpen}
                >
                  <Pencil size={devEditIconSize} strokeWidth={2} />
                </button>
                {rightEditorOpen ? (
                  <TopBarRightEditor
                    rightText={settings.rightText}
                    phoneHref={settings.phoneHref}
                    onSave={(patch) => update(patch)}
                    onClose={() => setRightEditorOpen(false)}
                  />
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
