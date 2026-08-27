"use client";

import type { CSSProperties } from "react";
import { ContactForm } from "@/components/forms/ContactForm";
import type { ContactPreviewSettings } from "@/lib/contact-preview";
import { cn } from "@/lib/utils";

type HeroV4FormProps = {
  title: string;
  subtext?: string;
  trustNotes?: string[];
  settings: ContactPreviewSettings;
  className?: string;
};

export function HeroV4Form({ title, subtext, trustNotes, settings, className }: HeroV4FormProps) {
  return (
    <div
      id="hero-v4-form"
      className={cn("hero-v4-form-card", className)}
      style={
        {
          "--contact-title-color": settings.titleColor,
          "--contact-body-color": settings.bodyColor,
          "--contact-field-bg-color": "#ffffff",
          "--contact-field-text-color": "#12121c",
          "--contact-field-border-color": "#d1d5db",
          "--contact-field-placeholder-color": "#6b7280",
        } as CSSProperties
      }
    >
      <h2 className="hero-v4-form-title font-serif text-2xl font-light tracking-tight sm:text-3xl">
        {title}
      </h2>
      {subtext ? <p className="hero-v4-form-subtext mt-1 text-sm">{subtext}</p> : null}

      <ContactForm className="hero-v4-form contact-card-form mt-4" settings={settings} />

      {trustNotes && trustNotes.length > 0 ? (
        <ul className="hero-v4-form-trust mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {trustNotes.map((note) => (
            <li key={note} className="flex items-center gap-2">
              <span className="hero-v4-form-trust-dot" aria-hidden="true" />
              {note}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
