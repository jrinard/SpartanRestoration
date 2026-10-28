"use client";

import { ContactCard } from "@/components/contact/ContactCard";
import { ContactLeadEmailPreviewPanel } from "@/components/dev/ContactLeadEmailPreviewPanel";
import { useContactV1Preview } from "@/components/dev/ContactV1PreviewContext";
import { Container } from "@/components/ui/Container";
import {
  defaultContactPreviewSettings,
  getContactSectionStyle,
} from "@/lib/contact-preview";
import { cn } from "@/lib/utils";

type ContactV1Props = {
  title: string;
  subtext?: string;
  phonePrefix?: string;
  phone?: string;
  formDivider?: string;
  formIntro?: string;
};

/**
 * Contact section — rounded card with form fields; background customizable in playground.
 */
export function ContactV1({
  title,
  subtext,
  phonePrefix,
  phone,
  formDivider,
  formIntro,
}: ContactV1Props) {
  const preview = useContactV1Preview();
  const settings = preview?.settings ?? defaultContactPreviewSettings;
  const showLeadEmailPreview = preview?.contentEditingEnabled ?? false;

  return (
    <section
      id="contact"
      className={cn(
        "contact-v1 scroll-mt-24 py-[calc(5rem-15px)] lg:py-[calc(6rem-15px)]",
        preview && "contact-v1--preview",
      )}
      style={getContactSectionStyle(settings)}
      aria-labelledby="contact-heading"
    >
      <Container className={showLeadEmailPreview ? "max-w-5xl" : "max-w-xl"}>
        <div
          className={cn(
            showLeadEmailPreview &&
              "grid items-start gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(240px,1fr)] lg:gap-8 xl:grid-cols-[minmax(0,28rem)_minmax(260px,320px)]",
          )}
        >
          <ContactCard
            title={title}
            subtext={subtext}
            phonePrefix={phonePrefix}
            phone={phone}
            formDivider={formDivider}
            formIntro={formIntro}
            settings={settings}
            titleId="contact-heading"
          />
          {showLeadEmailPreview ? <ContactLeadEmailPreviewPanel /> : null}
        </div>
      </Container>
    </section>
  );
}
