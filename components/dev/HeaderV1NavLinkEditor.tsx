"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LucideIconPicker } from "@/components/dev/LucideIconPicker";
import {
  headerV1NavExternalPageValue,
  isExternalNavHref,
  type HeaderV1NavLink,
  type HeaderV1NavLinkTarget,
} from "@/lib/header-v1-nav";
import { getPlaygroundPageHref } from "@/lib/playground-pages";
import { useOptionalPlaygroundSections } from "@/components/dev/PlaygroundSectionsProvider";
import { defaultSiteIconName, resolveSiteIconName, type SiteIconName } from "@/lib/site-icons";
import { cn } from "@/lib/utils";
import { devPopoverZIndexClassName } from "@/lib/dev-overlay-controls";

type HeaderV1NavLinkEditorProps = {
  link: HeaderV1NavLink;
  linkIndex: number;
  onSave: (link: HeaderV1NavLink) => void;
  onDelete: () => void;
  onClose: () => void;
  className?: string;
};

const fieldClassName =
  "w-full rounded border border-accent-purple/40 bg-background px-2 py-1.5 text-sm text-foreground focus:border-accent-purple focus:outline-none";

const selectClassName =
  "section-switcher-select w-full rounded border border-accent-purple/40 bg-background/90 px-2 py-1.5 font-mono text-sm text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

/** Playground popup for editing a single header v1 nav link. */
export function HeaderV1NavLinkEditor({
  link,
  linkIndex,
  onSave,
  onDelete,
  onClose,
  className,
}: HeaderV1NavLinkEditorProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const playground = useOptionalPlaygroundSections();
  const [draft, setDraft] = useState(link);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const pageOptions = useMemo(() => {
    const home = { label: "Home", href: "/" };
    if (!playground?.ready) return [home];

    const extras = playground.pages
      .filter((page) => !page.isHome)
      .map((page) => ({
        label: page.name,
        href: getPlaygroundPageHref(page),
      }));

    return [home, ...extras];
  }, [playground?.ready, playground?.pages]);

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
    const pageHref = draft.pageHref.trim() || "/";
    const isExternal = isExternalNavHref(pageHref);

    onSave({
      ...draft,
      label: draft.label,
      pageHref,
      anchorId: isExternal ? "" : draft.anchorId.trim().replace(/^#/, ""),
      target: draft.target,
    });
    onClose();
  }

  const iconName = resolveSiteIconName(draft.icon, defaultSiteIconName);
  const isExternalLink = isExternalNavHref(draft.pageHref);
  const pageSelectValue = isExternalLink
    ? headerV1NavExternalPageValue
    : pageOptions.some((option) => option.href === draft.pageHref)
      ? draft.pageHref
      : draft.pageHref || "/";
  const linkTarget = draft.target ?? "_self";

  return (
    <div
      ref={panelRef}
      className={cn(
        "z-40 w-[min(92vw,22rem)] rounded-md border border-accent-purple/50 bg-background/95 p-3 shadow-xl backdrop-blur-sm",
        className,
      )}
      role="dialog"
      aria-label={`Edit nav link ${linkIndex + 1}`}
    >
      <p className="mb-3 font-mono text-[10px] tracking-wide text-accent-purple uppercase">
        Link {linkIndex + 1}
      </p>

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] tracking-wide text-accent-purple/80 uppercase">
            Label
          </span>
          <textarea
            value={draft.label}
            rows={3}
            autoFocus
            onChange={(event) => setDraft((current) => ({ ...current, label: event.target.value }))}
            className={cn(fieldClassName, "resize-y")}
            aria-label="Nav link label"
            placeholder={"Water Damage\nRestoration"}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] tracking-wide text-accent-purple/80 uppercase">
            Page
          </span>
          <select
            value={pageSelectValue}
            onChange={(event) => {
              const nextValue = event.target.value;
              if (nextValue === headerV1NavExternalPageValue) {
                setDraft((current) => ({
                  ...current,
                  pageHref: isExternalNavHref(current.pageHref) ? current.pageHref : "https://",
                  anchorId: "",
                  target: current.target ?? "_blank",
                }));
                return;
              }

              setDraft((current) => ({
                ...current,
                pageHref: nextValue,
              }));
            }}
            className={selectClassName}
            aria-label="Nav link target page"
          >
            {pageOptions.map((option) => (
              <option key={option.href} value={option.href}>
                {option.label} ({option.href})
              </option>
            ))}
            <option value={headerV1NavExternalPageValue}>External</option>
          </select>

          {isExternalLink ? (
            <input
              type="url"
              value={draft.pageHref}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  pageHref: event.target.value,
                }))
              }
              className={fieldClassName}
              aria-label="External site URL"
              placeholder="https://www.stonepillarcontractors.com/"
            />
          ) : (
            <input
              type="text"
              value={draft.pageHref}
              onChange={(event) =>
                setDraft((current) => ({ ...current, pageHref: event.target.value }))
              }
              className={fieldClassName}
              aria-label="Nav link custom page path"
              placeholder="/"
            />
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] tracking-wide text-accent-purple/80 uppercase">
            Target
          </span>
          <select
            value={linkTarget}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                target: event.target.value as HeaderV1NavLinkTarget,
              }))
            }
            className={selectClassName}
            aria-label="Nav link target window"
          >
            <option value="_self">Same tab</option>
            <option value="_blank">New tab</option>
          </select>
        </label>

        {!isExternalLink && (
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[10px] tracking-wide text-accent-purple/80 uppercase">
              Anchor
            </span>
            <input
              type="text"
              value={draft.anchorId}
              onChange={(event) =>
                setDraft((current) => ({ ...current, anchorId: event.target.value }))
              }
              className={fieldClassName}
              aria-label="Nav link anchor id"
              placeholder="water-damage-restoration"
            />
          </label>
        )}

        <div className="relative flex flex-col gap-1">
          <span className="font-mono text-[10px] tracking-wide text-accent-purple/80 uppercase">
            Icon
          </span>
          <button
            type="button"
            onClick={() => setIconPickerOpen((open) => !open)}
            className={cn(buttonClassName, "self-start")}
            aria-expanded={iconPickerOpen}
          >
            {iconName}
          </button>
          {iconPickerOpen && (
            <div className={cn("absolute top-full left-0 mt-2", devPopoverZIndexClassName)}>
              <LucideIconPicker
                value={iconName}
                onChange={(nextIcon: SiteIconName) => {
                  setDraft((current) => ({ ...current, icon: nextIcon }));
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
