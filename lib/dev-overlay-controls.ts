import { cn } from "@/lib/utils";

const devOverlayControlBaseClassName =
  "z-20 border border-accent-purple/50 bg-background/95 text-accent-purple shadow-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

/** Circular edit / shuffle buttons on section content in the playground. */
export const devEditButtonClassName = cn(
  devOverlayControlBaseClassName,
  "absolute -top-1 -right-1 z-20 flex h-7 w-7 items-center justify-center rounded-full",
);

/** Popovers (icon pickers, anchor editors) that must sit above section chrome. */
export const devPopoverZIndexClassName = "z-[200]";

/** Image library pill on section media blocks. */
export const devLibraryPillClassName = cn(
  devOverlayControlBaseClassName,
  "absolute top-2 right-2 flex h-8 items-center gap-2 rounded-full px-3",
);

export const devEditIconSize = 14;
export const devLibraryIconSize = 16;
export const devLibraryLabelClassName = "font-mono text-xs tracking-wide uppercase";
