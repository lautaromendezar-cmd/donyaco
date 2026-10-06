import type { Metadata } from "next";
import { Proximamente } from "@/components/ui/Proximamente";

export const metadata: Metadata = { title: "Atracciones del Bosque" };

export default function Page() {
  return (
    <Proximamente
      bajada="Las estanterías"
      titulo="Atracciones del Bosque"
      texto="El sector Kinder más grande de Capital, más de 200 variedades de alfajores, alfajores sin TACC, chocolates importados, latas coleccionables y gomitas a granel."
    />
  );
}
