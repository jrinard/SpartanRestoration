import { parseLeadInboxEmails } from "@/lib/contact-lead-inbox";
import { getContactLeadTo } from "@/lib/email-config";
import {
  readCurrentOrgId,
  readOrgContact,
  readOrgSite,
  readOrgWorkshopConfig,
} from "@/lib/org/read-org.server";

const LSD_INBOX = "josh@lifespringdesign.com";

function filterAllowedRecipients(orgId: string, emails: string[]): string[] {
  if (orgId === "lsd") return emails;
  return emails.filter((email) => email.toLowerCase() !== LSD_INBOX);
}

/**
 * Resolve lead inboxes for this org. Never uses another org's staging file.
 * Sandbox (or any non-lsd org) cannot send to the LifeSpring inbox.
 */
export async function resolveContactLeadToAddresses(
  clientOverride?: string,
): Promise<string[]> {
  const orgId = await readCurrentOrgId();
  const [contact, site, workshop] = await Promise.all([
    readOrgContact(orgId),
    readOrgSite(orgId),
    readOrgWorkshopConfig(orgId),
  ]);

  let addresses = parseLeadInboxEmails(
    contact.leadToEmail,
    contact.leadToEmail2,
  );

  if (addresses.length === 0) {
    addresses = parseLeadInboxEmails(workshop.previewSettings?.contact?.leadToEmail);
  }

  if (addresses.length === 0) {
    addresses = parseLeadInboxEmails(site.email);
  }

  const allowOrgSend = process.env.ALLOW_ORG_SEND?.trim();
  if (process.env.NODE_ENV === "development" && allowOrgSend) {
    if (allowOrgSend !== orgId) {
      return [];
    }
  } else if (process.env.NODE_ENV === "development" && clientOverride?.trim()) {
    const clientList = parseLeadInboxEmails(clientOverride);
    const client = clientList[0];
    if (client && addresses.length === 0) {
      addresses = clientList;
    }
  }

  if (addresses.length === 0) {
    addresses = parseLeadInboxEmails(getContactLeadTo());
  }

  return filterAllowedRecipients(orgId, addresses);
}

/** @deprecated Prefer resolveContactLeadToAddresses — first recipient only. */
export async function resolveContactLeadTo(clientOverride?: string): Promise<string> {
  const addresses = await resolveContactLeadToAddresses(clientOverride);
  return addresses[0] ?? "";
}
