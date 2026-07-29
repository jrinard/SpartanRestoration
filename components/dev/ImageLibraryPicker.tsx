"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  defaultImageLibraryEntries,
  imageLibraryFolderPublicPrefix,
  imageLibraryPublicPrefix,
  type ImageLibraryEntry,
  type ImageLibraryScope,
} from "@/lib/image-library";
import { cn } from "@/lib/utils";

type ImageLibraryPickerProps = {
  value?: string;
  onSelect: (entry: ImageLibraryEntry) => void;
  onClose: () => void;
  className?: string;
  /** Scan public/{themeFolder}/library (default) or the whole theme folder. */
  scope?: ImageLibraryScope;
  thumbnailSize?: "default" | "large";
};

/** Playground-only grid for choosing an image from the project asset library. */
export function ImageLibraryPicker({
  value,
  onSelect,
  onClose,
  className,
  scope = "library",
  thumbnailSize = "default",
}: ImageLibraryPickerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<ImageLibraryEntry[]>(defaultImageLibraryEntries);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isLarge = thumbnailSize === "large";

  useEffect(() => {
    let cancelled = false;

    async function loadLibrary() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/image-library?scope=${scope}`);
        if (!response.ok) throw new Error("Could not load image library");

        const data = (await response.json()) as { images?: ImageLibraryEntry[] };
        if (!cancelled) {
          setImages(data.images?.length ? data.images : defaultImageLibraryEntries);
        }
      } catch {
        if (!cancelled) {
          setError("Using fallback library list.");
          setImages(defaultImageLibraryEntries);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadLibrary();
    return () => {
      cancelled = true;
    };
  }, [scope]);

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
        "z-40 rounded-md border border-accent-purple/50 bg-background/95 p-3 shadow-xl backdrop-blur-sm",
        isLarge ? "w-[min(92vw,52rem)]" : "w-[min(92vw,42rem)]",
        className,
      )}
      role="dialog"
      aria-label="Choose image from library"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-wide text-accent-purple uppercase">
            Image library
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose from{" "}
            <code className="text-foreground">
              public{scope === "theme" ? imageLibraryPublicPrefix : imageLibraryFolderPublicPrefix}/
            </code>
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-accent-purple/30 px-2 py-1 font-mono text-[10px] text-accent-purple/80 transition-colors hover:border-accent-purple/50"
        >
          Close
        </button>
      </div>

      {loading ? (
        <p className="px-1 py-8 text-center text-sm text-muted-foreground">Loading library…</p>
      ) : images.length === 0 ? (
        <p className="px-1 py-8 text-center text-sm text-muted-foreground">
          No images found in public
          {scope === "theme" ? imageLibraryPublicPrefix : imageLibraryFolderPublicPrefix} yet.
        </p>
      ) : (
        <div
          className={cn(
            "grid gap-3 overflow-y-auto",
            isLarge
              ? "max-h-[min(70vh,36rem)] grid-cols-2 sm:grid-cols-3"
              : "max-h-[min(60vh,28rem)] grid-cols-2 sm:grid-cols-3",
          )}
        >
          {images.map((image) => {
            const isSelected = value === image.src;

            return (
              <button
                key={image.src}
                type="button"
                onClick={() => {
                  onSelect(image);
                  onClose();
                }}
                className={cn(
                  "overflow-hidden rounded-md border text-left transition-colors",
                  isSelected
                    ? "border-accent-purple bg-accent-purple/10"
                    : "border-border/60 hover:border-accent-purple/40 hover:bg-accent-purple/5",
                )}
                aria-pressed={isSelected}
              >
                <div
                  className={cn(
                    "relative bg-muted/20",
                    isLarge ? "aspect-square min-h-28" : "aspect-[4/3]",
                  )}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className={cn(isLarge ? "object-contain p-2" : "object-cover")}
                    sizes={isLarge ? "280px" : "200px"}
                  />
                </div>
                <span className="block truncate px-2 py-2 font-mono text-[10px] text-foreground/80">
                  {image.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="mt-2 px-1 text-xs text-muted-foreground">{error}</p>}
    </div>
  );
}
