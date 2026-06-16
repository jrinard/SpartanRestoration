import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { createMetadata } from "@/lib/seo";
import { pageSeo } from "@/lib/seo-content";

export const metadata = createMetadata({
  title: pageSeo.blog.title,
  description: pageSeo.blog.description,
  path: pageSeo.blog.path,
});

export default function BlogPage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <section className="py-24">
          <Container>
            <h1 className="font-serif text-4xl font-light text-foreground">Blog</h1>
            <p className="mt-4 text-muted">
              Blog posts coming soon. This is a placeholder for v1-lite.
            </p>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
