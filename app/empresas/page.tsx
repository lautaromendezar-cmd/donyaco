import type { Metadata } from "next";
import { Proximamente } from "@/components/ui/Proximamente";

export const metadata: Metadata = { title: "Empresas y mayoristas" };

export default function Page() {
  return (
    <Proximamente
      bajada="La puerta pequeña"
      titulo="Empresas y mayoristas"
      texto="Regalos corporativos, cajas de fin de año y precios mayoristas para kioscos."
      intencion="mayorista"
    />
  );
}
