import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroV1 } from "@/components/sections/Hero-v1";
import { Container } from "@/components/ui/Container";
import { createMetadata } from "@/lib/seo";
import { pageSeo } from "@/lib/seo-content";

export const metadata = createMetadata({
  title: pageSeo.about.title,
  description: pageSeo.about.description,
  path: pageSeo.about.path,
});

export default function AboutPage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <HeroV1
          headline="About Us"
          subtext="We're building something great. Check back soon for our full story."
        />
        <Container className="pb-24">
          <p className="text-center text-muted">
            This page is a placeholder. Content coming soon.
          </p>
        </Container>
      </main>
      <Footer />
    </>
  );
}
