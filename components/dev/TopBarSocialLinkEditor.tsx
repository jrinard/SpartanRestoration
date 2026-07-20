"use client";

import { useEffect, useRef, useState } from "react";
import { SocialIconPicker } from "@/components/dev/SocialIconPicker";
import {
  defaultSocialIconName,
  resolveSocialIconName,
  socialIconCatalog,
  SocialIcon,
  type SocialIconName,
} from "@/lib/social-icons";
import type { TopBarSocialLink } from "@/lib/top-bar-social";
import { cn } from "@/lib/utils";
import { devPopoverZIndexClassName } from "@/lib/dev-overlay-controls";

type TopBarSocialLinkEditorProps = {
  link: TopBarSocialLink;
  linkIndex: number;
  onSave: (link: TopBarSocialLink) => void;
  onDelete: () => void;
  onClose: () => void;
  className?: string;
};

const fieldClassName =
  "w-full rounded border border-accent-purple/40 bg-background px-2 py-1.5 text-sm text-foreground focus:border-accent-purple focus:outline-none";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

/** Playground popup for editing a single top bar social link. */
export function TopBarSocialLinkEditor({
  link,
  linkIndex,
  onSave,
  onDelete,
  onClose,
  className,
}: TopBarSocialLinkEditorProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState(link);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  useEffect(() => {
    setDraft(link);
  }, [link]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function save() {
    const icon = resolveSocialIconName(draft.icon, defaultSocialIconName);
    onSave({
      ...draft,
      icon,
      href: draft.href.trim() || "#",
      label: draft.label?.trim() || socialIconCatalog[icon].label,
    });
    onClose();
  }

  const iconName = resolveSocialIconName(draft.icon, defaultSocialIconName);

  return (
    <div
      ref={panelRef}
      className={cn(
        devPopoverZIndexClassName,
        "w-[min(92vw,22rem)] rounded-md border border-accent-purple/50 bg-background/95 p-3 shadow-xl backdrop-blur-sm",
        className,
      )}
      role="dialog"
      aria-label={`Edit social link ${linkIndex + 1}`}
    >
      <p className="mb-3 font-mono text-[10px] tracking-wide text-accent-purple uppercase">
        Social {linkIndex + 1}
      </p>

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] tracking-wide text-accent-purple/80 uppercase">
            URL
          </span>
          <input
            type="url"
            value={draft.href}
            autoFocus
            onChange={(event) => setDraft((current) => ({ ...current, href: event.target.value }))}
            className={fieldClassName}
            aria-label="Social link URL"
            placeholder="https://www.facebook.com/..."
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] tracking-wide text-accent-purple/80 uppercase">
            Label
          </span>
          <input
            type="text"
            value={draft.label ?? ""}
            onChange={(event) => setDraft((current) => ({ ...current, label: event.target.value }))}
            className={fieldClassName}
            aria-label="Social link accessible label"
            placeholder={socialIconCatalog[iconName].label}
          />
        </label>

        <div className="relative flex flex-col gap-1">
          <span className="font-mono text-[10px] tracking-wide text-accent-purple/80 uppercase">
            Icon
          </span>
          <button
            type="button"
            onClick={() => setIconPickerOpen((open) => !open)}
            className={cn(buttonClassName, "inline-flex items-center gap-2 self-start")}
            aria-expanded={iconPickerOpen}
          >
            <SocialIcon name={iconName} className="h-4 w-4 fill-current" />
            {socialIconCatalog[iconName].label}
          </button>
          {iconPickerOpen && (
            <div className={cn("absolute top-full left-0 mt-2", devPopoverZIndexClassName)}>
              <SocialIconPicker
                value={iconName}
                onChange={(nextIcon: SocialIconName) => {
                  setDraft((current) => ({
                    ...current,
                    icon: nextIcon,
                    label: current.label?.trim() ? current.label : socialIconCatalog[nextIcon].label,
                  }));
                  setIconPickerOpen(false);
                }}
                onClose={() => setIconPickerOpen(false)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={onDelete} className={cn(buttonClassName, "text-red-400")}>
          Delete
        </button>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className={buttonClassName}>
            Cancel
          </button>
          <button type="button" onClick={save} className={buttonClassName}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
