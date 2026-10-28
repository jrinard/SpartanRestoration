import { resolveContactLeadEmailLogoSrc } from "@/lib/contact-preview";
import {
  readCurrentOrgId,
  readOrgContact,
  readOrgWorkshopConfig,
} from "@/lib/org/read-org.server";

export async function resolveContactLeadEmailLogoSrcForOrg(): Promise<string> {
  const orgId = await readCurrentOrgId();
  const [contact, workshop] = await Promise.all([
    readOrgContact(orgId),
    readOrgWorkshopConfig(orgId),
  ]);

  return resolveContactLeadEmailLogoSrc({
    orgLeadEmailLogoSrc: contact.leadEmailLogoSrc,
    sectionLeadEmailLogoSrc: workshop.previewSettings?.contact?.leadEmailLogoSrc,
  });
}
