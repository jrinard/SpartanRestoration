import type { ColorThemeId } from "@/lib/color-themes";
import type { FontThemeId } from "@/lib/creative-themes";
import type { HomepageConfig } from "@/lib/homepage-config";
import type { ContactFormField } from "@/lib/contact-form-fields";
import type { TeamContact } from "@/config/site-data";
import type { SiteConfigData } from "@/config/site-data";
import type { OrgPoliciesFile } from "@/lib/org/policies";

export type { SiteConfigData, TeamContact };

export const orgSchemaVersion = 1;

export type OrgPublishSettings = {
  remoteUrl: string;
  remoteName: string;
  branch: string;
  /** Absolute path to the customer git checkout. Send writes pack source here. */
  localPath: string;
};

export type OrgMeta = {
  schemaVersion: number;
  /** Folder slug — used for paths, storage keys, and Create. */
  id: string;
  /** Permanent unique integer. LifeSpring is 1, Sandbox is 2, never reused. */
  number: number;
  name: string;
  publish: OrgPublishSettings;
};

export type OrgThemeFile = {
  schemaVersion: number;
  colorThemeId: ColorThemeId;
  fontThemeId: FontThemeId;
  /** Solid canvas color behind sections. Omit to use the color theme default. */
  pageBackgroundColor?: string;
};

export type OrgSeoRoute = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  ogImageAlt?: string;
  keywords?: string[];
};

export type OrgSeoFile = {
  schemaVersion: number;
  routes: Record<string, OrgSeoRoute>;
};

export type OrgListItem = {
  id: string;
  number: number;
  name: string;
};

export type OrgPillar = {
  org: OrgMeta;
  site: SiteConfigData;
  seo: OrgSeoFile;
  theme: OrgThemeFile;
  homepageConfig: HomepageConfig;
  workshopConfig: HomepageConfig;
  contact: OrgContactFile;
  policies: OrgPoliciesFile;
};

export type OrgCurrentFile = {
  orgId: string;
};

export type OrgContactFile = {
  schemaVersion: number;
  /** Inbox for contact form submissions. Empty = do not send. */
  leadToEmail: string;
  formFields?: ContactFormField[];
};
