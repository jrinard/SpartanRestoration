"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useCreativeThemeOptional } from "@/components/dev/CreativeProvider";
import { defaultFontThemeId, getFontTheme } from "@/lib/creative-themes";
import type { PortfolioV2ModalImage } from "@/lib/portfolio-v2-preview";
import { defaultPortfolioV2SampleImage } from "@/lib/portfolio-v2-preview";
import type { PortfolioSectionTheme } from "@/lib/portfolio-preview";
import type { CSSProperties } from "react";

export function PortfolioGalleryModal({
  title,
  images,
  caption,
  theme,
  onClose,
}: {
  title: string;
  images: PortfolioV2ModalImage[];
  /** When set with a single image, caption is shown beside the photo in the modal. */
  caption?: string;
  theme: PortfolioSectionTheme;
  onClose: () => void;
}) {
  const resolved = images.map((image) => ({
    ...image,
    imageSrc: image.imageSrc.trim() || defaultPortfolioV2SampleImage,
  }));
  const captionText = caption?.trim() ?? "";
  const showCaptionBesideImage = resolved.length === 1 && captionText.length > 0;
  const creative = useCreativeThemeOptional();
  const fontTheme = getFontTheme(creative?.fontThemeId ?? defaultFontThemeId);
  const fontStyle = {
    "--font-sans": fontTheme.sans,
    "--font-serif": fontTheme.serif,
  } as CSSProperties;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const dialog = (
    <div
      className="portfolio-v2-modal fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
      style={fontStyle}
      role="presentation"
    >
      <button
        type="button"
        className="portfolio-v2-modal-backdrop absolute inset-0"
        aria-label="Close gallery"
        onClick={onClose}
      />
      <div
        className={`portfolio-v2-modal-panel relative z-[121] w-full rounded-xl p-5 shadow-2xl sm:p-6 ${showCaptionBesideImage ? "max-w-6xl" : "max-w-4xl"}`}
        data-portfolio-theme={theme}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mb-4 flex shrink-0 items-start justify-between gap-4">
          <h2 className="portfolio-v2-modal-title text-xl font-semibold tracking-wide uppercase sm:text-2xl">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="portfolio-v2-modal-close rounded-full p-1.5 transition-colors"
            aria-label="Close gallery"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {resolved.length > 0 ? (
          <div className="portfolio-v2-modal-body">
            {showCaptionBesideImage ? (
              <div className="portfolio-v2-modal-split">
                <div className="portfolio-v2-modal-split-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolved[0].imageSrc}
                    alt={resolved[0].imageAlt || title}
                    className="portfolio-v2-modal-split-image block h-auto w-full object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <p className="portfolio-v2-modal-caption m-0 text-sm leading-relaxed sm:text-base">
                  {captionText}
                </p>
              </div>
            ) : (
              <ul className="portfolio-v2-modal-grid m-0 list-none p-0">
                {resolved.map((image) => (
                  <li key={image.id} className="portfolio-v2-modal-grid-item">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.imageSrc}
                      alt={image.imageAlt || title}
                      className="portfolio-v2-modal-image block h-auto w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p className="portfolio-v2-modal-empty text-sm">No gallery images yet.</p>
        )}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(dialog, document.body);
}
