import type { Metadata } from "next";
import { Historia } from "@/components/historia/Historia";

export const metadata: Metadata = {
  title: "Nuestra historia · Desde 1938",
  description:
    "Un almacén en Villa Pueyrredón en 1938, una golosinería en Villa Urquiza y un bosque en Belgrano. Tres generaciones de la misma familia detrás del mostrador.",
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
