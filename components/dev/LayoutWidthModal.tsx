"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { siteLayoutWidthOptions, type SiteLayoutWidth } from "@/lib/site-layout";
import { cn } from "@/lib/utils";

type LayoutWidthModalProps = {
  open: boolean;
  desktop: SiteLayoutWidth;
  mobile?: SiteLayoutWidth;
  onSave: (next: { layoutWidth: SiteLayoutWidth; layoutWidthMobile?: SiteLayoutWidth }) => void;
  onClose: () => void;
  title?: string;
};

const selectClassName =
  "w-full rounded border border-accent-purple/40 bg-background px-2 py-1.5 font-mono text-sm text-foreground focus:border-accent-purple focus:outline-none";

export function LayoutWidthModal({
  open,
  desktop,
  mobile,
  onSave,
  onClose,
  title = "Layout width",
}: LayoutWidthModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [desktopDraft, setDesktopDraft] = useState(desktop);
  const [mobileDraft, setMobileDraft] = useState<SiteLayoutWidth | "inherit">(
    mobile ?? "inherit",
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setDesktopDraft(desktop);
    setMobileDraft(mobile ?? "inherit");
  }, [open, desktop, mobile]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) onClose();
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
  }, [open, onClose]);

  if (!open || !mounted) return null;

  function save() {
    const layoutWidthMobile =
      mobileDraft === "inherit" || mobileDraft === desktopDraft ? undefined : mobileDraft;
    onSave({ layoutWidth: desktopDraft, layoutWidthMobile });
    onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <div className="absolute inset-0 bg-black/25" aria-hidden="true" />
      <div
        ref={panelRef}
        className="relative z-[201] w-[min(92vw,36rem)] rounded-md border border-accent-purple/50 bg-background/95 p-4 shadow-lg backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <p className="mb-4 font-mono text-xs tracking-wide text-accent-purple uppercase">{title}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block font-mono text-[10px] tracking-wide text-accent-purple/80 uppercase">
              Desktop
            </span>
            <select
              value={desktopDraft}
              onChange={(event) =>
                setDesktopDraft(event.target.value as SiteLayoutWidth)
              }
              className={selectClassName}
              aria-label="Desktop layout width"
            >
              {siteLayoutWidthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-[10px] tracking-wide text-accent-purple/80 uppercase">
              Mobile
            </span>
            <select
              value={mobileDraft}
              onChange={(event) =>
                setMobileDraft(event.target.value as SiteLayoutWidth | "inherit")
              }
              className={selectClassName}
              aria-label="Mobile layout width"
            >
              <option value="inherit">Same as desktop</option>
              {siteLayoutWidthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-3 text-[11px] leading-snug text-muted">
          Mobile uses the desktop setting when not set — existing sites keep today&apos;s behavior.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-accent-purple/30 px-3 py-1.5 font-mono text-[10px] text-accent-purple/80"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            className="rounded border border-accent-purple/50 bg-accent-purple/10 px-3 py-1.5 font-mono text-[10px] text-accent-purple"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

function labelForWidth(width: SiteLayoutWidth): string {
  return width === "contained" ? "Contained" : "Full width";
}

type LayoutWidthControlProps = {
  layoutWidth: SiteLayoutWidth;
  layoutWidthMobile?: SiteLayoutWidth;
  onChange: (next: { layoutWidth: SiteLayoutWidth; layoutWidthMobile?: SiteLayoutWidth }) => void;
  ariaLabel?: string;
  className?: string;
};

/** Creative bar trigger — opens desktop / mobile width modal. */
export function LayoutWidthControl({
  layoutWidth,
  layoutWidthMobile,
  onChange,
  ariaLabel = "Layout width",
  className,
}: LayoutWidthControlProps) {
  const [open, setOpen] = useState(false);
  const mobile = layoutWidthMobile ?? layoutWidth;
  const summary =
    mobile === layoutWidth
      ? labelForWidth(layoutWidth)
      : `D: ${labelForWidth(layoutWidth)} · M: ${labelForWidth(mobile)}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(buttonClassName, className)}
        aria-label={ariaLabel}
        aria-expanded={open}
      >
        Layout width · {summary}
      </button>
      <LayoutWidthModal
        open={open}
        desktop={layoutWidth}
        mobile={layoutWidthMobile}
        onSave={onChange}
        onClose={() => setOpen(false)}
        title="Layout width"
      />
    </>
  );
}
