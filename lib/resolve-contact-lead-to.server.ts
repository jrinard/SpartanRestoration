import { isValidLeadToEmail } from "@/lib/contact-preview";
import { getContactLeadTo } from "@/lib/email-config";
import {
  readCurrentOrgId,
  readOrgContact,
  readOrgSite,
  readOrgWorkshopConfig,
} from "@/lib/org/read-org.server";

const LSD_INBOX = "josh@lifespringdesign.com";

function normalizeEmail(value: string | undefined): string | undefined {
  const email = value?.trim();
  if (!email || !isValidLeadToEmail(email)) return undefined;
  return email;
}

/**
 * Resolve this org's lead inbox. Never uses another org's staging file.
 * Sandbox (or any non-lsd org) cannot send to the LifeSpring inbox.
 */
export async function resolveContactLeadTo(clientOverride?: string): Promise<string> {
  const orgId = await readCurrentOrgId();
  const [contact, site, workshop] = await Promise.all([
    readOrgContact(orgId),
    readOrgSite(orgId),
    readOrgWorkshopConfig(orgId),
  ]);

  const fromContact = normalizeEmail(contact.leadToEmail);
  const fromWorkshop = normalizeEmail(workshop.previewSettings?.contact?.leadToEmail);
  const fromSite = normalizeEmail(site.email);

  let to = fromContact ?? fromWorkshop ?? fromSite;

  const allowOrgSend = process.env.ALLOW_ORG_SEND?.trim();
  if (process.env.NODE_ENV === "development" && allowOrgSend) {
    if (allowOrgSend !== orgId) {
      return "";
    }
  } else if (process.env.NODE_ENV === "development") {
    const client = normalizeEmail(clientOverride);
    if (client && (!to || client.toLowerCase() === to.toLowerCase())) {
      to = client;
    }
  }

  if (!to) {
    to = normalizeEmail(getContactLeadTo());
  }

  if (!to) return "";

  if (orgId !== "lsd" && to.toLowerCase() === LSD_INBOX) {
    return "";
  }

  return to;
}
