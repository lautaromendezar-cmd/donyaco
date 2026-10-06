import type { Metadata } from "next";
import { Proximamente } from "@/components/ui/Proximamente";

export const metadata: Metadata = { title: "Pasaporte del Bosque" };

export default function Page() {
  return (
    <Proximamente
      bajada="El juego del bosque"
      titulo="Pasaporte del Bosque"
      texto="Hay cinco hadas escondidas por el sitio. Encontralas todas y desbloqueás un cupón para usar en cualquiera de las sucursales."
    />
  );
}
