import type { Metadata } from "next";
import { Proximamente } from "@/components/ui/Proximamente";

export const metadata: Metadata = { title: "Armá tu caja" };

export default function Page() {
  return (
    <Proximamente
      bajada="La caramelera"
      titulo="Armá tu caja"
      texto="Elegí bolsa, lata, caja regalo o frasco, llenalo con chocolates, alfajores y gomitas, y pedilo por WhatsApp para retirar en la sucursal que te quede cerca."
      intencion="regalo"
    />
  );
}
