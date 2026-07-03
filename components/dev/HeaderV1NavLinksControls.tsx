"use client";

import { useState } from "react";
import { HeaderV1NavLinkEditor } from "@/components/dev/HeaderV1NavLinkEditor";
import {
  addHeaderV1NavLink,
  deleteHeaderV1NavLink,
  getHeaderV1NavLinkPillLabel,
  updateHeaderV1NavLink,
  type HeaderV1NavLink,
} from "@/lib/header-v1-nav";
import { cn } from "@/lib/utils";

type HeaderV1NavLinksControlsProps = {
  links: HeaderV1NavLink[];
  onChange: (links: HeaderV1NavLink[]) => void;
  className?: string;
};

const pillClassName =
  "rounded-full border border-accent-purple/40 bg-background/90 px-3 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

const addButtonClassName =
  "rounded border border-dashed border-accent-purple/40 bg-background/90 px-3 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

/** Pill list + popup editor for header v1 nav links. */
export function HeaderV1NavLinksControls({
  links,
  onChange,
  className,
}: HeaderV1NavLinksControlsProps) {
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const editingIndex = links.findIndex((link) => link.id === editingLinkId);
  const editingLink = editingIndex >= 0 ? links[editingIndex] : null;

  return (
    <div className={cn("relative col-span-full flex w-full flex-col gap-2 border-t border-accent-purple/20 pt-2", className)}>
      <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
        Nav Links
      </span>

      <div className="flex flex-wrap items-center gap-2">
        {links.map((link, index) => (
          <button
            key={link.id}
            type="button"
            onClick={() => setEditingLinkId(link.id)}
            className={pillClassName}
            aria-expanded={editingLinkId === link.id}
          >
            {getHeaderV1NavLinkPillLabel(link, index)}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            const nextLinks = addHeaderV1NavLink(links);
            onChange(nextLinks);
            setEditingLinkId(nextLinks[nextLinks.length - 1]?.id ?? null);
          }}
          className={addButtonClassName}
        >
          + Add link
        </button>
      </div>

      {editingLink && editingIndex >= 0 && (
        <div className="relative pt-1">
          <HeaderV1NavLinkEditor
            link={editingLink}
            linkIndex={editingIndex}
            onSave={(savedLink) => {
              onChange(updateHeaderV1NavLink(links, savedLink.id, savedLink));
            }}
            onDelete={() => {
              onChange(deleteHeaderV1NavLink(links, editingLink.id));
              setEditingLinkId(null);
            }}
            onClose={() => setEditingLinkId(null)}
          />
        </div>
      )}
    </div>
  );
}
