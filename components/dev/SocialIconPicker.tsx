"use client";

import { useEffect, useRef } from "react";
import { SocialIcon } from "@/lib/social-icons";
import {
  socialIconCatalog,
  socialIconNames,
  type SocialIconName,
} from "@/lib/social-icons";
import { cn } from "@/lib/utils";
import { devPopoverZIndexClassName } from "@/lib/dev-overlay-controls";

type SocialIconPickerProps = {
  value: SocialIconName;
  onChange: (iconName: SocialIconName) => void;
  onClose: () => void;
  className?: string;
};

/** Playground-only compact grid for choosing a brand social icon. */
export function SocialIconPicker({ value, onChange, onClose, className }: SocialIconPickerProps) {
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
        devPopoverZIndexClassName,
        "w-56 rounded-md border border-accent-purple/50 bg-background/95 p-2 shadow-lg backdrop-blur-sm",
        className,
      )}
      role="dialog"
      aria-label="Choose social icon"
    >
      <p className="mb-2 px-1 font-mono text-[10px] tracking-wide text-accent-purple uppercase">
        Pick icon
      </p>
      <div className="grid grid-cols-4 gap-1">
        {socialIconNames.map((iconName) => {
          const isSelected = iconName === value;
          const { label } = socialIconCatalog[iconName];

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
              <SocialIcon name={iconName} className="h-[18px] w-[18px] fill-current" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
