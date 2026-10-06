import { ForestScene } from "@/components/scene/ForestScene";
import { Recorrido } from "@/components/scene/Recorrido";
import { SceneCards } from "@/components/scene/SceneCards";
import { ESCENA } from "@/lib/catalogo";

export default function Home() {
  return (
    <main>
      {/* El poster del hero es el primer pintado: se precarga el del encuadre que corresponde. */}
      <link rel="preload" as="image" href={ESCENA.hero.mobile.poster} media="not all and (min-aspect-ratio: 1/1)" fetchPriority="high" />
      <link rel="preload" as="image" href={ESCENA.hero.desktop.poster} media="(min-aspect-ratio: 1/1)" fetchPriority="high" />
      <ForestScene />
      <Recorrido />
      <SceneCards />
    </main>
  );
}
