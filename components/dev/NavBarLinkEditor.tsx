"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useOptionalPlaygroundSections } from "@/components/dev/PlaygroundSectionsProvider";
import { CONTACT_PAGE_HREF } from "@/lib/contact-modal";
import {
  buildNavBarLinkHref,
  isExternalNavHref,
  navBarExternalPageValue,
  parseNavBarLinkHref,
  type NavBarLink,
  type NavBarLinkTarget,
} from "@/lib/nav-bar-preview";
import {
  getPlaygroundNavPageOptions,
  isContactPopupPageHref,
} from "@/lib/playground-nav-page-options";
import { cn } from "@/lib/utils";

type NavBarLinkEditorProps = {
  link: NavBarLink;
  linkIndex: number;
  onSave: (link: NavBarLink) => void;
  onDelete: () => void;
  onClose: () => void;
};

type NavBarLinkDraft = NavBarLink & {
  pageHref: string;
  anchorId: string;
};

const fieldClassName =
  "w-full rounded border border-accent-purple/40 bg-background px-2 py-1.5 text-sm text-foreground focus:border-accent-purple focus:outline-none";

const selectClassName =
  "section-switcher-select w-full rounded border border-accent-purple/40 bg-background/90 px-2 py-1.5 font-mono text-sm text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

function toDraft(link: NavBarLink): NavBarLinkDraft {
  const { pageHref, anchorId } = parseNavBarLinkHref(link.href);
  return { ...link, pageHref, anchorId };
}

/** Playground popup for editing a single nav bar link. */
export function NavBarLinkEditor({
  link,
  linkIndex,
  onSave,
  onDelete,
  onClose,
}: NavBarLinkEditorProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const playground = useOptionalPlaygroundSections();
  const [draft, setDraft] = useState<NavBarLinkDraft>(() => toDraft(link));

  const pageOptions = useMemo(
    () => getPlaygroundNavPageOptions(playground?.pages, Boolean(playground?.ready)),
    [playground?.ready, playground?.pages],
  );

  const isExternalLink = isExternalNavHref(draft.pageHref);
  const isContactTarget = isContactPopupPageHref(draft.pageHref);
  const pageSelectValue = isExternalLink
    ? navBarExternalPageValue
    : pageOptions.some((option) => option.href === draft.pageHref)
      ? draft.pageHref
      : draft.pageHref || "/";
  const linkTarget = draft.target ?? "_self";

  useEffect(() => {
    setDraft(toDraft(link));
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
    const external = isExternalNavHref(pageHref);

    onSave({
      ...draft,
      label: draft.label.trim() || `Link ${linkIndex + 1}`,
      href: isContactPopupPageHref(pageHref)
        ? CONTACT_PAGE_HREF
        : buildNavBarLinkHref(pageHref, external ? "" : draft.anchorId),
      target: draft.target,
    });
    onClose();
  }

  const dialog = (
    <div className="fixed inset-0 z-[200] flex items-start justify-center px-4 pt-24 sm:pt-28">
      <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
      <div
        ref={panelRef}
        className="relative z-[201] w-[min(92vw,22rem)] rounded-md border border-accent-purple/50 bg-background/95 p-3 shadow-xl backdrop-blur-sm"
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
            <input
              type="text"
              value={draft.label}
              autoFocus
              onChange={(event) => setDraft((current) => ({ ...current, label: event.target.value }))}
              className={fieldClassName}
              aria-label="Nav link label"
              placeholder="Our Services"
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
                if (nextValue === navBarExternalPageValue) {
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
                  anchorId: isContactPopupPageHref(nextValue) ? "" : current.anchorId,
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
              <option value={navBarExternalPageValue}>External</option>
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

          {!isContactTarget && (
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[10px] tracking-wide text-accent-purple/80 uppercase">
                Target
              </span>
              <select
                value={linkTarget}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    target: event.target.value as NavBarLinkTarget,
                  }))
                }
                className={selectClassName}
                aria-label="Nav link target window"
              >
                <option value="_self">Same tab</option>
                <option value="_blank">New tab</option>
              </select>
            </label>
          )}

          {!isExternalLink && !isContactTarget && (
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
                placeholder="services"
              />
            </label>
          )}
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
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(dialog, document.body);
}
