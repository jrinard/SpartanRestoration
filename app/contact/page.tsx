import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/forms/ContactForm";
import { createMetadata } from "@/lib/seo";
import { pageSeo } from "@/lib/seo-content";

export const metadata = createMetadata({
  title: pageSeo.contact.title,
  description: pageSeo.contact.description,
  path: pageSeo.contact.path,
  noIndex: pageSeo.contact.noIndex,
});

export default function ContactPage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <section className="py-24">
          <Container className="max-w-xl">
            <h1 className="font-serif text-4xl font-light text-foreground">Contact Us</h1>
            <p className="mt-4 text-muted">
              Have a question or ready to get started? Send us a message.
            </p>
            <ContactForm className="mt-10" />
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
