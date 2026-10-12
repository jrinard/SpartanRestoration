import { fallbackSiteConfig, type SiteConfigData, type TeamContact } from "@/config/site-data";

export function emptyTeamContact(): TeamContact {
  return { name: "", phone: "", email: "" };
}

export function normalizeContactPerson(value: TeamContact | undefined): TeamContact | undefined {
  if (!value) return undefined;
  const name = value.name.trim();
  const phone = value.phone.trim();
  const email = value.email.trim();
  if (!name && !phone && !email) return undefined;
  return { name, phone, email };
}

function teamContactKey(contact: TeamContact): string {
  return `${contact.name.trim()}|${contact.phone.trim()}|${contact.email.trim()}`;
}

/** LifeSpring workshop defaults copied into new orgs by mistake — not client contacts. */
export function isWorkshopDefaultTeamContacts(contacts: TeamContact[]): boolean {
  if (contacts.length !== fallbackSiteConfig.teamContacts.length) return false;
  const defaults = new Set(fallbackSiteConfig.teamContacts.map(teamContactKey));
  return contacts.every((contact) => defaults.has(teamContactKey(contact)));
}

/** Normalize site.json contact fields for org settings + under-construction. */
export function migrateSiteContactFields(site: SiteConfigData): SiteConfigData {
  const person = normalizeContactPerson(site.contactPerson);
  const stripDefaults = isWorkshopDefaultTeamContacts(site.teamContacts);
  const teamContacts = stripDefaults ? [] : site.teamContacts;

  if (person) {
    if (!stripDefaults && site.contactPerson === person) return site;
    return { ...site, contactPerson: person, teamContacts };
  }

  if (teamContacts.length === 1) {
    const migrated = normalizeContactPerson(teamContacts[0]);
    if (migrated) {
      return { ...site, contactPerson: migrated, teamContacts: [] };
    }
  }

  if (stripDefaults) {
    return { ...site, teamContacts: [] };
  }

  return site;
}

/** Contacts shown on the under-construction page (org settings → Contact person only). */
export function getUnderConstructionContacts(site: SiteConfigData): TeamContact[] {
  const migrated = migrateSiteContactFields(site);
  const person = normalizeContactPerson(migrated.contactPerson);
  if (person) return [person];

  if (!migrated.phone && !migrated.email) {
    return [];
  }

  return [
    {
      name: migrated.name,
      phone: migrated.phone,
      email: migrated.email,
    },
  ];
}
