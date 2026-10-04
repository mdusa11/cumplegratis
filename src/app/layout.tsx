import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Bricolage_Grotesque, Space_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Cursor } from "@/components/Cursor";
import { SITE } from "@/lib/site";

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
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#c6ff00" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <Providers>
          <Cursor />
          <Nav />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
