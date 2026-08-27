import Link from "next/link";
import { notFound } from "next/navigation";
import { FooterV3 } from "@/components/layout/Footer-v3";
import { SiteShell } from "@/components/layout/SiteShell";
import { PolicyDocumentContent } from "@/components/legal/PolicyDocumentContent";
import { Container } from "@/components/ui/Container";
import { livePolicyMetadata, loadLiveOrgPage } from "@/lib/org/live-page.server";
import { getPublishedOrgPolicy } from "@/lib/org/policies";
import { readCurrentOrgId, readOrgPolicies } from "@/lib/org/read-org.server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return livePolicyMetadata("terms");
}

export default async function TermsPage() {
  const orgId = await readCurrentOrgId();
  const [page, policies] = await Promise.all([loadLiveOrgPage(), readOrgPolicies(orgId)]);
  const policy = getPublishedOrgPolicy(policies, "terms");
  if (!page || !policy) notFound();

  return (
    <SiteShell config={page.config}>
      <main id="main-content" className="py-16 lg:py-24">
        <Container className="max-w-3xl">
          <Link
            href="/"
            className="mb-8 inline-flex text-sm text-muted transition-colors hover:text-foreground"
          >
            ← Back to home
          </Link>
          <PolicyDocumentContent title={policy.title} body={policy.body} />
        </Container>
      </main>
      <FooterV3 />
    </SiteShell>
  );
}
