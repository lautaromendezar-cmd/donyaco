import type { Metadata } from "next";
import { Proximamente } from "@/components/ui/Proximamente";

export const metadata: Metadata = { title: "Visitá el Bosque" };

export default function Page() {
  return (
    <Proximamente
      bajada="El árbol de la dulzura"
      titulo="Visitá el Bosque"
      texto="Todo lo que necesitás para venir con chicos o de paseo: los mejores horarios, cómo llegar y qué llevarte de recuerdo."
    />
  );
}
