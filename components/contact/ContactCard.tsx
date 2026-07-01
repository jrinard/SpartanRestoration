"use client";

import type { ReactNode } from "react";
import { ContactForm } from "@/components/forms/ContactForm";
import {
  defaultContactPreviewSettings,
  getContactCardStyle,
  type ContactPreviewSettings,
} from "@/lib/contact-preview";
import { cn } from "@/lib/utils";

type ContactCardProps = {
  title: string;
  subtext?: string;
  phonePrefix?: string;
  phone?: string;
  formDivider?: string;
  formIntro?: string;
  settings?: ContactPreviewSettings;
  className?: string;
  titleId?: string;
  onClose?: () => void;
  headerExtra?: ReactNode;
};

export function ContactCard({
  title,
  subtext,
  phonePrefix,
  phone,
  formDivider,
  formIntro,
  settings = defaultContactPreviewSettings,
  className,
  titleId,
  onClose,
  headerExtra,
}: ContactCardProps) {
  const cardStyle = getContactCardStyle(settings);

  return (
    <div
      className={cn("contact-card relative overflow-hidden p-8 sm:p-10", className)}
      style={cardStyle}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2
            id={titleId}
            className="contact-card-title font-serif text-2xl font-light tracking-tight sm:text-3xl"
          >
            {title}
          </h2>
          {subtext && (
            <p className="contact-card-body mt-2 text-sm leading-relaxed sm:text-base">{subtext}</p>
          )}
          {phone && phonePrefix && (
            <p className="contact-card-body mt-2 text-sm leading-relaxed sm:text-base">
              {phonePrefix}{" "}
              <a
                href={`tel:${phone.replace(/\D/g, "")}`}
                className="contact-card-phone font-bold text-accent-blue underline decoration-accent-blue/40 underline-offset-4 transition-colors hover:text-accent-blue-dark hover:decoration-accent-blue/70"
              >
                {phone}
              </a>
            </p>
          )}
        </div>

        {(onClose || headerExtra) && (
          <div className="flex shrink-0 items-center gap-2">
            {headerExtra}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="contact-card-close flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
                aria-label="Close contact form"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4l-6.29 6.31-1.42-1.42L9.17 12 2.88 5.71 4.3 4.29l6.29 6.3 6.29-6.3z"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {(formDivider || formIntro) && (
        <div className="relative mt-8">
          {formDivider && (
            <p className="contact-card-body text-sm uppercase tracking-widest">{formDivider}</p>
          )}
          {formIntro && (
            <p className="contact-card-body mt-2 text-sm font-medium sm:text-base">{formIntro}</p>
          )}
        </div>
      )}

      <ContactForm className="contact-card-form relative mt-6" />
    </div>
  );
}
