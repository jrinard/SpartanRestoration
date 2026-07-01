"use client";

import { ContactCard } from "@/components/contact/ContactCard";
import { useContactV1Preview } from "@/components/dev/ContactV1PreviewContext";
import { Container } from "@/components/ui/Container";
import { defaultContactPreviewSettings } from "@/lib/contact-preview";
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

  return (
    <section
      id="contact"
      className={cn(
        "contact-v1 scroll-mt-24 py-[calc(5rem-15px)] lg:py-[calc(6rem-15px)]",
        preview && "contact-v1--preview",
      )}
      aria-labelledby="contact-heading"
    >
      <Container className="max-w-xl">
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
      </Container>
    </section>
  );
}
