import "./globals.css";
import type { Metadata } from "next";

import Header from "@/components/Header";
import ClientStickyCallBar from "@/components/ClientStickyCallBar";

export const metadata: Metadata = {
  title: {
    default: "ConectaHomes | Internet y Servicios para el Hogar en EE.UU.",
    template: "%s | ConectaHomes",
  },
  description:
    "Compara planes de internet, cable y fibra en Estados Unidos. Ingresa tu ZIP code y habla con un asesor en español.",
  keywords: [
    "internet en español",
    "planes de internet USA",
    "internet por ZIP code",
    "fibra óptica Estados Unidos",
    "internet barato",
    "internet para familias",
    "hablar en español internet",
  ],
  metadataBase: new URL("https://conectahomes.com"),
  alternates: {
    canonical: "https://conectahomes.com",
    languages: {
      es: "https://conectahomes.com",
    },
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "ConectaHomes | Internet y Cable en EE.UU.",
    description:
      "Encuentra el mejor plan de internet disponible en tu zona. Atención en español.",
    url: "https://conectahomes.com",
    siteName: "ConectaHomes",
    locale: "es_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* ===== Spanish SEO: Organization + Phone (JSON-LD) ===== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "ConectaHomes",
              url: "https://conectahomes.com",
              telephone: "+1-800-220-5054",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+1-800-220-5054",
                contactType: "customer service",
                availableLanguage: ["Spanish"],
                areaServed: "US",
              },
            }),
          }}
        />
      </head>

      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Header />

        <main className="relative mx-auto w-full max-w-[1200px] px-4 py-8">
          {children}
        </main>

        <ClientStickyCallBar />
      </body>
    </html>
  );
}
