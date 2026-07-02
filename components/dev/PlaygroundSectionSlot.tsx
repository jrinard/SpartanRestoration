"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PlaygroundSectionSlotProps = {
  sectionId: string;
  label: string;
  compactControls?: boolean;
  previewChecked: boolean;
  onPreviewChange: (checked: boolean) => void;
  hiddenChecked: boolean;
  onHiddenChange: (checked: boolean) => void;
  onDuplicate?: () => void;
  isDragging: boolean;
  isDropTarget: boolean;
  onDragStart: (sectionId: string) => void;
  onDragEnd: () => void;
  onDragOver: (sectionId: string) => void;
  onDrop: (fromSectionId: string, toSectionId: string) => void;
  children: ReactNode;
};

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M2 5h16v1.5H2V5zm0 4.25h16v1.5H2V9.25zm0 4.25h16V15H2v-1.5z"
      />
    </svg>
  );
}

export function PlaygroundSectionSlot({
  sectionId,
  label,
  compactControls = false,
  previewChecked,
  onPreviewChange,
  hiddenChecked,
  onHiddenChange,
  onDuplicate,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  children,
}: PlaygroundSectionSlotProps) {
  return (
    <div
      className={cn(
        "playground-section-slot relative transition-shadow",
        compactControls && "playground-section-slot--spacer",
        isDragging && "opacity-60",
        isDropTarget && "ring-2 ring-inset ring-accent-purple/50",
      )}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        onDragOver(sectionId);
      }}
      onDrop={(event) => {
        event.preventDefault();
        const fromSectionId = event.dataTransfer.getData("text/plain");
        if (fromSectionId) {
          onDrop(fromSectionId, sectionId);
        }
      }}
    >
      <div
        className={cn(
          "absolute right-6 z-30 flex items-center gap-2 lg:right-8",
          compactControls ? "top-1.5" : "top-4",
        )}
      >
        {onDuplicate && (
          <button
            type="button"
            onClick={onDuplicate}
            className="rounded border border-accent-purple/40 bg-background/90 px-2 py-1.5 font-mono text-xs tracking-wide text-accent-purple uppercase backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10"
            aria-label={`Add another ${label} section`}
          >
            Add
          </button>
        )}
        <label className="flex cursor-pointer items-center gap-1.5 rounded border border-accent-purple/40 bg-background/90 px-2 py-1.5 backdrop-blur-sm">
          <input
            type="checkbox"
            checked={previewChecked}
            onChange={(event) => onPreviewChange(event.target.checked)}
            className="h-3.5 w-3.5 accent-accent-purple"
            aria-label={`Include ${label} on preview page`}
          />
          <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
            Preview
          </span>
        </label>
        <label className="flex cursor-pointer items-center gap-1.5 rounded border border-neutral-400/50 bg-background/90 px-2 py-1.5 backdrop-blur-sm">
          <input
            type="checkbox"
            checked={hiddenChecked}
            onChange={(event) => onHiddenChange(event.target.checked)}
            className="h-3.5 w-3.5 accent-accent-purple"
            aria-label={`Hide ${label} from playground`}
          />
          <span className="font-mono text-xs tracking-wide text-neutral-500 uppercase">Hide</span>
        </label>
        <button
          type="button"
          draggable
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", sectionId);
            onDragStart(sectionId);
          }}
          onDragEnd={onDragEnd}
          className="flex h-8 w-8 cursor-grab items-center justify-center rounded border border-accent-purple/40 bg-background/90 text-accent-purple backdrop-blur-sm active:cursor-grabbing"
          aria-label={`Drag to reorder ${label} section`}
        >
          <HamburgerIcon />
        </button>
      </div>
      {children}
    </div>
  );
}
