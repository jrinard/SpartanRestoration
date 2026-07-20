"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { TopBarSocialLinkEditor } from "@/components/dev/TopBarSocialLinkEditor";
import {
  addTopBarSocialLink,
  deleteTopBarSocialLink,
  getTopBarSocialLinkPillLabel,
  updateTopBarSocialLink,
  type TopBarSocialLink,
} from "@/lib/top-bar-social";
import { cn } from "@/lib/utils";

type TopBarSocialLinksControlsProps = {
  links: TopBarSocialLink[];
  onChange: (links: TopBarSocialLink[]) => void;
  className?: string;
};

const pillClassName =
  "rounded-full border border-accent-purple/40 bg-background/90 px-3 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

const addButtonClassName =
  "inline-flex h-8 w-8 items-center justify-center rounded border border-dashed border-accent-purple/40 bg-background/90 text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

/** Pill list + popup editor for top bar social links. */
export function TopBarSocialLinksControls({
  links,
  onChange,
  className,
}: TopBarSocialLinksControlsProps) {
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const editingIndex = links.findIndex((link) => link.id === editingLinkId);
  const editingLink = editingIndex >= 0 ? links[editingIndex] : null;

  return (
    <div
      className={cn(
        "relative flex w-full basis-full flex-col gap-2 border-t border-accent-purple/20 pt-2",
        className,
      )}
    >
      <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
        Social Links
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
            {getTopBarSocialLinkPillLabel(link, index)}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            const nextLinks = addTopBarSocialLink(links);
            onChange(nextLinks);
            setEditingLinkId(nextLinks[nextLinks.length - 1]?.id ?? null);
          }}
          className={addButtonClassName}
          aria-label="Add social link"
          title="Add social link"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {editingLink && editingIndex >= 0 && (
        <div className="relative pt-1">
          <TopBarSocialLinkEditor
            link={editingLink}
            linkIndex={editingIndex}
            onSave={(savedLink) => {
              onChange(updateTopBarSocialLink(links, savedLink.id, savedLink));
            }}
            onDelete={() => {
              onChange(deleteTopBarSocialLink(links, editingLink.id));
              setEditingLinkId(null);
            }}
            onClose={() => setEditingLinkId(null)}
          />
        </div>
      )}
    </div>
  );
}
