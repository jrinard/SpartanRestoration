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
import { readPublishedAnalyticsSettings } from "@/lib/resolve-analytics.server";
import { RecaptchaProvider } from "@/components/forms/RecaptchaProvider";
import { SiteJsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo";
import { pageSeo } from "@/lib/seo-content";
import "./globals.css";

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

export const metadata: Metadata = createMetadata({
  title: pageSeo.home.title,
  description: pageSeo.home.description,
  path: pageSeo.home.path,
  ogImage: siteConfig.assets.logo,
  ogImageAlt: pageSeo.home.ogImageAlt,
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishedAnalytics = await readPublishedAnalyticsSettings();

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
        <RecaptchaProvider>
          {children}
        </RecaptchaProvider>
        <GoogleAnalyticsRuntime initialSettings={publishedAnalytics} />
        <Analytics />
      </body>
    </html>
  );
}
