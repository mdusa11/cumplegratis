import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { SearchDialog } from "@/components/Search";
import { CookieBanner } from "@/components/Ads";
import { Big_Shoulders, Bricolage_Grotesque, Space_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Cursor } from "@/components/Cursor";
import { FloatingCTA, ScrollProgress } from "@/components/fx";
import { PwaInstall } from "@/components/PwaInstall";
import { ACCENT, ADS, CF_BEACON, SITE, STUDIO, WHATSAPP, jsonLd } from "@/lib/site";

const display = Big_Shoulders({ subsets: ["latin"], variable: "--font-big-shoulders", display: "swap", adjustFontFallback: false });
const sans = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-space-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Cumplegratis · Promos y regalos gratis en tu cumpleaños en México",
    template: "%s · Cumplegratis",
  },
  description: SITE.description,
  openGraph: { siteName: SITE.name, locale: "es_MX", type: "website" },
  twitter: { card: "summary_large_image" },
  applicationName: "Cumplegratis",
  authors: [{ name: STUDIO.name, url: STUDIO.url }],
  creator: STUDIO.name,
  publisher: STUDIO.name,
  appleWebApp: { capable: true, title: "Cumplegratis", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  // Search Console / Bing: pega el código en .env (o verifica el dominio por DNS en Cloudflare y deja esto vacío).
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_VERIFICATION ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION } : undefined,
  },
  // AdSense verifica el sitio con esta etiqueta (el script solo carga tras el aviso de cookies, y el robot no lo acepta).
  ...(ADS.client && { other: { "google-adsense-account": ADS.client } }),
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: ACCENT };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <Providers>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={jsonLd([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: SITE.name,
                url: SITE.url,
                logo: `${SITE.url}/icons/icon-512.png`,
                parentOrganization: { "@type": "Organization", name: STUDIO.name, url: STUDIO.url },
                contactPoint: { "@type": "ContactPoint", telephone: `+${WHATSAPP}`, contactType: "customer support", areaServed: "MX", availableLanguage: "es" },
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: SITE.name,
                url: SITE.url,
                inLanguage: "es-MX",
                description: SITE.description,
                publisher: { "@type": "Organization", name: STUDIO.name, url: STUDIO.url },
                potentialAction: { "@type": "SearchAction", target: `${SITE.url}/promos/?q={search_term_string}`, "query-input": "required name=search_term_string" },
              },
            ])}
          />
          <ScrollProgress />
          <FloatingCTA />
          <PwaInstall />
          <CookieBanner />
          <SearchDialog />
          <Cursor />
          <Nav />
          {/* El recorte va aquí y no en <body>: en móvil, overflow en body se propaga al viewport y no evita que la página se ensanche. */}
          <div className="overflow-x-clip">
            <main>{children}</main>
            <Footer />
          </div>
        </Providers>
        {CF_BEACON && (
          <Script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={JSON.stringify({ token: CF_BEACON })} strategy="afterInteractive" />
        )}
      </body>
    </html>
  );
}
