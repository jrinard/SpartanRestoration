"use client";

import { useEffect, useRef } from "react";
import { SiteIcon } from "@/components/icons/SiteIcon";
import { siteIconCatalog, siteIconNames, type SiteIconName } from "@/lib/site-icons";
import { cn } from "@/lib/utils";

type LucideIconPickerProps = {
  value: SiteIconName;
  onChange: (iconName: SiteIconName) => void;
  onClose: () => void;
  className?: string;
};

/** Playground-only compact grid for choosing a Lucide icon. */
export function LucideIconPicker({ value, onChange, onClose, className }: LucideIconPickerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={panelRef}
      className={cn(
        "z-30 w-56 rounded-md border border-accent-purple/50 bg-background/95 p-2 shadow-lg backdrop-blur-sm",
        className,
      )}
      role="dialog"
      aria-label="Choose icon"
    >
      <p className="mb-2 px-1 font-mono text-[10px] tracking-wide text-accent-purple uppercase">
        Pick icon
      </p>
      <div className="grid grid-cols-5 gap-1">
        {siteIconNames.map((iconName) => {
          const isSelected = iconName === value;
          const { label } = siteIconCatalog[iconName];

          return (
            <button
              key={iconName}
              type="button"
              title={label}
              aria-label={label}
              aria-pressed={isSelected}
              onClick={() => {
                onChange(iconName);
                onClose();
              }}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded border transition-colors",
                isSelected
                  ? "border-accent-purple bg-accent-purple/20 text-accent-purple"
                  : "border-transparent text-foreground/80 hover:border-accent-purple/40 hover:bg-accent-purple/10",
              )}
            >
              <SiteIcon name={iconName} size={18} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
