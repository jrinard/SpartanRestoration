"use client";

import type { ImageLibraryEntry, ImageLibraryScope } from "@/lib/image-library";

/** Vision pack stub — Forge editor removed in Phase 5. */
export function ImageLibraryPicker(_props: {
  value?: string;
  onSelect: (entry: ImageLibraryEntry) => void;
  onClose: () => void;
  className?: string;
  scope?: ImageLibraryScope;
  thumbnailSize?: "default" | "large";
  folder?: string;
}): null {
  return null;
}
