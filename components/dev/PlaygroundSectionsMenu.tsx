"use client";

import { useEffect, useRef, useState } from "react";
import { usePlaygroundSections } from "@/components/dev/PlaygroundSectionsProvider";
import { getPlaygroundSectionLabel } from "@/lib/playground-sections";
import { cn } from "@/lib/utils";

const triggerClassName =
  "rounded border border-white/10 bg-[#12121c] px-3 py-2.5 font-mono text-sm text-white focus:border-accent-purple/50 focus:outline-none";

export function PlaygroundSectionsMenu() {
  const { sections, updateSection } = usePlaygroundSections();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hiddenCount = sections.filter((section) => section.hidden).length;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={cn(triggerClassName, "cursor-pointer")}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((current) => !current)}
      >
        Sections{hiddenCount > 0 ? ` (${hiddenCount} hidden)` : ""}
      </button>

      {open && (
        <div className="absolute top-[calc(100%+0.5rem)] left-0 z-[60] min-w-[14rem] rounded border border-white/10 bg-[#12121c] p-3 shadow-xl">
          <p className="mb-2 font-mono text-[0.65rem] tracking-wide text-white/40 uppercase">
            Show in playground
          </p>
          <ul className="max-h-72 space-y-1 overflow-y-auto">
            {sections.map((section) => {
              const label = getPlaygroundSectionLabel(sections, section);
              const visible = section.hidden !== true;

              return (
                <li key={section.id}>
                  <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-white/5">
                    <input
                      type="checkbox"
                      checked={visible}
                      onChange={(event) =>
                        updateSection(section.id, { hidden: !event.target.checked })
                      }
                      className="h-3.5 w-3.5 accent-accent-purple"
                    />
                    <span className="font-mono text-xs text-white/85">{label}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
