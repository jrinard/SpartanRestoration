"use client";

import { useEffect, useRef } from "react";
import { ContactCard } from "@/components/contact/ContactCard";
import { useContactModal } from "@/components/contact/ContactModalContext";
import { useContactV1Preview } from "@/components/dev/ContactV1PreviewContext";
import { defaultContactPreviewSettings } from "@/lib/contact-preview";
import { contactContent } from "@/lib/demo-content";
import { phoneTelHref } from "@/lib/phone";
import { siteConfig } from "@/config/site";

export function ContactModal() {
  const modal = useContactModal();
  const preview = useContactV1Preview();
  const panelRef = useRef<HTMLDivElement>(null);
  const settings = preview?.settings ?? defaultContactPreviewSettings;
  const content = preview?.getContent({
    title: contactContent.title,
    subtext: contactContent.subtext,
    phonePrefix: contactContent.phonePrefix,
    phoneLabel: siteConfig.phone,
    phoneHref: siteConfig.phone ? phoneTelHref(siteConfig.phone) : "",
  }) ?? {
    title: contactContent.title,
    subtext: contactContent.subtext,
    phonePrefix: contactContent.phonePrefix,
    phoneLabel: siteConfig.phone,
    phoneHref: siteConfig.phone ? phoneTelHref(siteConfig.phone) : "",
  };

  useEffect(() => {
    if (!modal?.isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        modal.closeContact();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modal]);

  if (!modal?.isOpen) return null;

  return (
    <div className="contact-modal fixed inset-0 z-[100]">
      <button
        type="button"
        className="contact-modal-backdrop fixed inset-0 z-0 bg-black/65 backdrop-blur-sm"
        aria-label="Close contact form"
        onClick={modal.closeContact}
      />

      <div className="contact-modal-viewport fixed inset-0 z-10 overflow-y-auto overscroll-contain p-4 sm:p-6">
        <div className="contact-modal-align flex min-h-full items-center justify-center">
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
            tabIndex={-1}
            className="contact-modal-panel relative z-10 w-full max-w-lg shrink-0 outline-none"
          >
            <ContactCard
              title={content.title}
              subtext={content.subtext}
              phonePrefix={content.phonePrefix}
              phone={content.phoneLabel}
              formDivider={contactContent.formDivider}
              formIntro={contactContent.formIntro}
              settings={settings}
              className="contact-card--in-modal"
              titleId="contact-modal-title"
              formKey={modal.formKey}
              initialFormValues={modal.initialFormValues ?? undefined}
              onClose={modal.closeContact}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
