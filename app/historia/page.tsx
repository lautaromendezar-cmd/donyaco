import type { Metadata } from "next";
import { Historia } from "@/components/historia/Historia";

export const metadata: Metadata = {
  title: "Nuestra historia · Desde 1938",
  description:
    "Un almacén en Villa Pueyrredón en 1938, una golosinería en Villa Urquiza y un bosque en Belgrano. Tres generaciones de la misma familia detrás del mostrador.",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Don Yaco Golosinería",
    title: "Don Yaco · Desde 1938",
    description: "Tres generaciones de la misma familia detrás del mostrador: de un almacén en Villa Pueyrredón al Bosque Urbano de Belgrano.",
    images: [{ url: "/historia/og.jpg", width: 1200, height: 630, alt: "Don Yaco detrás del mostrador de su almacén, en blanco y negro." }],
  },
};

export default function Page() {
  return (
    <>
      {/* La foto de 1938 es el primer pintado. */}
      <link rel="preload" as="image" href="/historia/don-yaco-mostrador.webp" fetchPriority="high" />
      <Historia />
    </>
  );
}
