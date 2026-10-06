import type { CSSProperties } from "react";
import { ESCENA } from "@/lib/catalogo";

// Las luces del árbol se encienden por CSS desde el primer cuadro: no esperan a ningún JS.
// Con el video final van a coincidir con las luces reales; ajustar en data/escena.json.
function Luces({ puntos, clase }: { puntos: { x: number; y: number; r: number }[]; clase: string }) {
  return (
    <div className={`pointer-events-none ${clase}`} aria-hidden="true">
      {puntos.map((p, i) => (
        <span
          key={i}
          className="luz"
          style={
            {
              "--x": p.x,
              "--y": p.y,
              "--r": p.r,
              "--d": `${0.35 + i * 0.11}s`,
              "--t": `${2.2 + ((i * 7) % 5) * 0.35}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function TreeLights() {
  return (
    <>
      <Luces puntos={ESCENA.lucesArbol.mobile} clase="solo-vertical" />
      <Luces puntos={ESCENA.lucesArbol.desktop} clase="solo-horizontal" />
    </>
  );
}
