import {
  defaultSocialIconName,
  resolveSocialIconName,
  socialIconCatalog,
  type SocialIconName,
} from "@/lib/social-icons";

export type TopBarSocialLink = {
  id: string;
  icon: SocialIconName;
  href: string;
  label?: string;
};

export const defaultTopBarFacebookUrl =
  "https://www.facebook.com/profile.php?id=61575772472164";

export const defaultTopBarSocialLinks: ReadonlyArray<TopBarSocialLink> = [
  {
    id: "top-bar-social-facebook",
    icon: "facebook",
    href: defaultTopBarFacebookUrl,
    label: "Facebook",
  },
];

export function createTopBarSocialLinkId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `top-bar-social-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `top-bar-social-${Date.now().toString(36)}`;
}

export function createTopBarSocialLink(
  partial: Partial<TopBarSocialLink> = {},
): TopBarSocialLink {
  const icon = resolveSocialIconName(partial.icon, defaultSocialIconName);
  const { label: iconLabel } = socialIconCatalog[icon];

  return {
    id: partial.id ?? createTopBarSocialLinkId(),
    icon,
    href: partial.href?.trim() || "#",
    label: partial.label?.trim() || iconLabel,
  };
}

export function normalizeTopBarSocialLinks(value: unknown): TopBarSocialLink[] {
  if (!Array.isArray(value)) return [...defaultTopBarSocialLinks];

  const normalized = value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const record = entry as Partial<TopBarSocialLink>;
      if (typeof record.id !== "string" || !record.id.trim()) return null;

      return createTopBarSocialLink({
        id: record.id,
        icon: record.icon,
        href: typeof record.href === "string" ? record.href : "#",
        label: typeof record.label === "string" ? record.label : undefined,
      });
    })
    .filter((link): link is TopBarSocialLink => link !== null);

  return normalized;
}

export function getTopBarSocialLinkPillLabel(link: TopBarSocialLink, index: number): string {
  const label = link.label?.trim();
  if (label) return label;
  return socialIconCatalog[link.icon]?.label ?? `Social ${index + 1}`;
}

export function addTopBarSocialLink(links: TopBarSocialLink[]): TopBarSocialLink[] {
  return [...links, createTopBarSocialLink({ icon: "facebook", href: defaultTopBarFacebookUrl })];
}

export function updateTopBarSocialLink(
  links: TopBarSocialLink[],
  linkId: string,
  patch: Partial<TopBarSocialLink>,
): TopBarSocialLink[] {
  return links.map((link) =>
    link.id === linkId
      ? createTopBarSocialLink({
          ...link,
          ...patch,
          id: link.id,
        })
      : link,
  );
}

export function deleteTopBarSocialLink(links: TopBarSocialLink[], linkId: string): TopBarSocialLink[] {
  return links.filter((link) => link.id !== linkId);
}
