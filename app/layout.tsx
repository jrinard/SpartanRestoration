import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Open_Sans,
  Playfair_Display,
  Lora,
  Source_Sans_3,
  Source_Serif_4,
  Poppins,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalyticsRuntime } from "@/components/analytics/GoogleAnalyticsRuntime";
import { FaviconRuntime } from "@/components/seo/FaviconRuntime";
import { readPublishedAnalyticsSettings } from "@/lib/resolve-analytics.server";
import { readPublishedFaviconSettings } from "@/lib/resolve-favicon.server";
import { RecaptchaProvider } from "@/components/forms/RecaptchaProvider";
import { SiteRuntimeProvider } from "@/components/site/SiteRuntimeProvider";
import { SiteJsonLd } from "@/components/seo/JsonLd";
import { createMetadata } from "@/lib/seo";
import { pageSeo } from "@/lib/seo-content";
import { readCurrentOrgId, readOrgPolicies, readOrgSeo, readOrgSite } from "@/lib/org/read-org.server";
import { setRuntimeSite } from "@/lib/org/runtime-site";
import { setRuntimePolicies } from "@/lib/org/runtime-policies";
import "./globals.css";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const orgId = await readCurrentOrgId();
  const [site, seo, favicon] = await Promise.all([
    readOrgSite(orgId),
    readOrgSeo(orgId),
    readPublishedFaviconSettings(),
  ]);
  setRuntimeSite(site);

  const home = seo.routes.home;

  return createMetadata({
    title: home?.title ?? pageSeo.home.title,
    browserTitle: favicon.browserTitle || site.name,
    description: home?.description ?? pageSeo.home.description,
    path: home?.path ?? pageSeo.home.path,
    noIndex: home?.noIndex ?? pageSeo.home.noIndex,
    ogImage: site.assets.logo,
    ogImageAlt: home?.ogImageAlt ?? pageSeo.home.ogImageAlt,
    keywords: home?.keywords,
    favicon,
  });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgId = await readCurrentOrgId();
  const [publishedAnalytics, publishedFavicon, site, policies] = await Promise.all([
    readPublishedAnalyticsSettings(),
    readPublishedFaviconSettings(),
    readOrgSite(orgId),
    readOrgPolicies(orgId),
  ]);
  setRuntimeSite(site);
  setRuntimePolicies(policies);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${openSans.variable} ${playfair.variable} ${lora.variable} ${sourceSans.variable} ${sourceSerif.variable} ${poppins.variable} h-full antialiased`}
    >
      <body
        className="min-h-full bg-background text-foreground"
        suppressHydrationWarning
      >
        <SiteJsonLd />
        <SiteRuntimeProvider site={site} policies={policies}>
          <RecaptchaProvider>
            {children}
          </RecaptchaProvider>
        </SiteRuntimeProvider>
        <GoogleAnalyticsRuntime initialSettings={publishedAnalytics} />
        <FaviconRuntime initialSettings={publishedFavicon} />
        <Analytics />
      </body>
    </html>
  );
}
