import "@/lib/env";
import "./globals.css";
import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SkipLink } from "@/components/SkipLink";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { buildRootMetadata } from "@/lib/seo";
import { resolveGaMeasurementId } from "@/lib/analytics";

export const metadata: Metadata = buildRootMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaMeasurementId = resolveGaMeasurementId();
  return (
    <html lang="vi">
      <body>
        <SkipLink />
        <Header />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <SpeedInsights />
        {gaMeasurementId && <GoogleAnalytics measurementId={gaMeasurementId} />}
      </body>
    </html>
  );
}
