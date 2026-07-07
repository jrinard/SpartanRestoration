"use client";

import { useState } from "react";
import { NavBarLinkEditor } from "@/components/dev/NavBarLinkEditor";
import { useNavBarPreview } from "@/components/dev/NavBarPreviewContext";
import {
  addNavBarLink,
  deleteNavBarLink,
  getNavBarLinkPillLabel,
  reorderNavBarLinks,
  updateNavBarLink,
} from "@/lib/nav-bar-preview";
import { cn } from "@/lib/utils";

function GripIcon() {
  return (
    <svg viewBox="0 0 8 14" className="h-3.5 w-2 shrink-0" aria-hidden="true">
      <circle cx="2" cy="2" r="1.1" fill="currentColor" />
      <circle cx="6" cy="2" r="1.1" fill="currentColor" />
      <circle cx="2" cy="7" r="1.1" fill="currentColor" />
      <circle cx="6" cy="7" r="1.1" fill="currentColor" />
      <circle cx="2" cy="12" r="1.1" fill="currentColor" />
      <circle cx="6" cy="12" r="1.1" fill="currentColor" />
    </svg>
  );
}

const pillClassName =
  "rounded-full border border-accent-purple/40 bg-background/90 px-3 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

const addButtonClassName =
  "rounded border border-dashed border-accent-purple/40 bg-background/90 px-3 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

/** Nav bar link list — reorder, add, edit, remove. */
export function NavBarLinksControls() {
  const nav = useNavBarPreview();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  if (!nav?.editingEnabled) return null;

  const links = nav.settings.items;
  const editingIndex = links.findIndex((link) => link.id === editingLinkId);
  const editingLink = editingIndex >= 0 ? links[editingIndex] : null;

  const updateLinks = (items: typeof links) => {
    nav.setSettings({ ...nav.settings, items });
  };

  return (
    <div className="flex w-full basis-full flex-col gap-2 border-t border-accent-purple/20 pt-2">
      <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Link order</span>

      <ul className="flex flex-wrap items-center gap-1.5">
        {links.map((link, index) => {
          const isDragging = dragIndex === index;
          const isDropTarget = overIndex === index && dragIndex !== null && dragIndex !== index;

          return (
            <li
              key={link.id}
              className={cn(
                "flex items-center gap-1 rounded border border-accent-purple/30 bg-background/90 px-1.5 py-1 transition-shadow",
                isDragging && "opacity-50",
                isDropTarget && "ring-2 ring-accent-purple/50",
              )}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setOverIndex(index);
              }}
              onDrop={(event) => {
                event.preventDefault();
                const fromIndex = Number(event.dataTransfer.getData("text/plain"));
                if (Number.isNaN(fromIndex)) return;
                updateLinks(reorderNavBarLinks(links, fromIndex, index));
                setDragIndex(null);
                setOverIndex(null);
              }}
            >
              <button
                type="button"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", String(index));
                  setDragIndex(index);
                }}
                onDragEnd={() => {
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                className="flex cursor-grab items-center justify-center px-0.5 text-accent-purple/70 active:cursor-grabbing"
                aria-label={`Drag to reorder ${link.label}`}
              >
                <GripIcon />
              </button>
              <button
                type="button"
                onClick={() => setEditingLinkId(link.id)}
                className={pillClassName}
                aria-expanded={editingLinkId === link.id}
              >
                {getNavBarLinkPillLabel(link, index)}
              </button>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={() => {
              const nextLinks = addNavBarLink(links);
              updateLinks(nextLinks);
              setEditingLinkId(nextLinks[nextLinks.length - 1]?.id ?? null);
            }}
            className={addButtonClassName}
          >
            + Add link
          </button>
        </li>
      </ul>

      {editingLink && editingIndex >= 0 && (
        <NavBarLinkEditor
          link={editingLink}
          linkIndex={editingIndex}
          onSave={(savedLink) => {
            updateLinks(updateNavBarLink(links, savedLink.id, savedLink));
          }}
          onDelete={() => {
            updateLinks(deleteNavBarLink(links, editingLink.id));
            setEditingLinkId(null);
          }}
          onClose={() => setEditingLinkId(null)}
        />
      )}
    </div>
  );
}
