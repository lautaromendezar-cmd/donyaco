import type { Metadata, Viewport } from "next";
import { Fraunces, Nunito } from "next/font/google";
import "./globals.css";
import { SCRIPT_MOVIMIENTO } from "@/lib/motion-script";
import { DoorTransition } from "@/components/scene/DoorTransition";
import { HotspotPanelProvider } from "@/components/scene/HotspotPanel";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { DirectionsButton } from "@/components/ui/DirectionsButton";

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const URL_SITIO = process.env.NEXT_PUBLIC_SITE_URL || "https://donyaco.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITIO),
  title: {
    default: "Don Yaco Golosinería · El Bosque Urbano de Belgrano",
    template: "%s · Don Yaco Golosinería",
  },
  description:
    "Golosinería en Belgrano y Villa Urquiza. Chocolates importados, el sector Kinder más grande de Capital, más de 200 alfajores y un bosque encantado para recorrer.",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Don Yaco Golosinería",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "El árbol del Bosque Urbano de Don Yaco" }],
  },
  // Demo privada: no se indexa hasta que el sitio sea oficial (Fase 3 arma el SEO completo).
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#1a2a17",
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" className={`${fraunces.variable} ${nunito.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_MOVIMIENTO }} />
      </head>
      <body className="antialiased">
        <a href="#contenido" className="sr-only z-[200] rounded-full bg-crema px-4 py-2 font-bold focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
          Saltar al contenido
        </a>
        <DoorTransition>
          <HotspotPanelProvider>
            <Header />
            <div id="contenido">{children}</div>
            <Footer />
            <DirectionsButton />
            <WhatsAppButton />
          </HotspotPanelProvider>
        </DoorTransition>
      </body>
    </html>
  );
}
