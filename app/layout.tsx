import "./globals.css";
import type { Metadata } from "next";

import Header from "@/components/Header";
import ClientStickyCallBar from "@/components/ClientStickyCallBar";

export const metadata: Metadata = {
  title: {
    default: "ConectaHomes | Internet y Cable en Estados Unidos",
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
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  metadataBase: new URL("https://conectahomes.com"),
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
