"use client";

import { useState } from "react";
import { useNavBarPreview } from "@/components/dev/NavBarPreviewContext";
import { useOptionalPlaygroundSections } from "@/components/dev/PlaygroundSectionsProvider";
import { getNavLinksFromPlaygroundPages } from "@/lib/playground-pages";
import type { NavBarLink } from "@/lib/nav-bar-preview";
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

function reorderNavLinks(links: NavBarLink[], fromIndex: number, toIndex: number): NavBarLink[] {
  if (fromIndex === toIndex) return links;

  const next = [...links];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function NavBarLinkOrderControls() {
  const nav = useNavBarPreview();
  const playground = useOptionalPlaygroundSections();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  if (!nav) return null;

  const links = playground?.ready
    ? getNavLinksFromPlaygroundPages(playground.pages)
    : nav.settings.items;

  if (links.length === 0) return null;

  const handleReorder = (fromIndex: number, toIndex: number) => {
    if (playground?.ready) {
      playground.reorderPages(fromIndex, toIndex);
      return;
    }

    nav.setSettings({
      ...nav.settings,
      items: reorderNavLinks(nav.settings.items, fromIndex, toIndex),
    });
  };

  return (
    <div className="flex w-full basis-full flex-wrap items-center gap-2 border-t border-accent-purple/20 pt-2">
      <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Link order</span>
      <ul className="flex flex-wrap items-center gap-1.5">
        {links.map((link, index) => {
          const isDragging = dragIndex === index;
          const isDropTarget = overIndex === index && dragIndex !== null && dragIndex !== index;

          return (
            <li
              key={`${link.href}-${index}`}
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
                handleReorder(fromIndex, index);
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
              <span className="font-mono text-xs text-accent-purple">{link.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
