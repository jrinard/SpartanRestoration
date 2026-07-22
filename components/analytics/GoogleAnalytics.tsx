import Script from "next/script";
import { isValidGaMeasurementId, normalizeGaMeasurementId } from "@/lib/analytics-preview";

type GoogleAnalyticsProps = {
  measurementId: string;
};

/** Injects the Google tag (gtag.js) once per page when enabled. */
export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const normalizedId = normalizeGaMeasurementId(measurementId);
  if (!isValidGaMeasurementId(normalizedId)) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${normalizedId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${normalizedId}');
        `}
      </Script>
    </>
  );
}
