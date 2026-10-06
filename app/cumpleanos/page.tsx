import type { Metadata } from "next";
import { Proximamente } from "@/components/ui/Proximamente";

export const metadata: Metadata = { title: "Cumpleaños y mesas dulces" };

export default function Page() {
  return (
    <Proximamente
      bajada="Los hongos gigantes"
      titulo="Cumpleaños y mesas dulces"
      texto="Mesas dulces y bolsitas para cumpleaños con la temática que quieras. Contanos invitados, fecha y sucursal, y te pasamos un presupuesto."
      intencion="cumple"
    />
  );
}
