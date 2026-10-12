import { isContactRecaptchaRequired } from "@/lib/contact-preview";
import { isRecaptchaVerificationConfigured } from "@/lib/recaptcha-server";
import { readCurrentOrgId, readOrgWorkshopConfig } from "@/lib/org/read-org.server";

/** Org contact settings + env — used by POST /api/leads (not client payload). */
export async function resolveContactRecaptchaRequiredForOrg(): Promise<boolean> {
  const orgId = await readCurrentOrgId();
  const workshop = await readOrgWorkshopConfig(orgId);
  const contact = workshop.previewSettings?.contact;

  if (!isContactRecaptchaRequired(contact)) return false;

  return isRecaptchaVerificationConfigured();
}
