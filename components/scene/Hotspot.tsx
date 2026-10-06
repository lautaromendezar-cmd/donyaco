"use client";
import type { CSSProperties } from "react";
import type { Hotspot as HotspotData } from "@/lib/catalogo";
import { usePanel } from "./HotspotPanel";

// Coordenadas separadas por encuadre: si en uno no se ve el elemento, el botón no aparece en ese.
export function Hotspot({ h, indice }: { h: HotspotData; indice: number }) {
  const { abrir } = usePanel();
  const { mobile, desktop } = h.posicion;
  if (!mobile && !desktop) return null;
  const visibilidad = !mobile ? "solo-horizontal" : !desktop ? "solo-vertical" : "";
  const estilo = {
    "--xm": mobile?.x ?? 50,
    "--ym": mobile?.y ?? 50,
    "--xd": desktop?.x ?? 50,
    "--yd": desktop?.y ?? 50,
    "--d": `${indice * 0.37}s`,
  } as CSSProperties;

  return (
    <button
      type="button"
      onClick={() => abrir(h.id)}
      aria-label={h.escondido ? `${h.etiqueta}: ${h.titulo}` : h.titulo}
      aria-haspopup="dialog"
      className={`hotspot group z-10 ${h.escondido ? "hotspot-escondido" : ""} ${visibilidad}`}
      style={estilo}
    >
      <span className="hotspot-orbe" aria-hidden="true" />
      <span
        className={`hotspot-etiqueta absolute top-full left-1/2 mt-0.5 rounded-full bg-musgo-noche/70 px-3 py-1 text-[0.8rem] leading-tight font-bold whitespace-nowrap text-crema shadow-lg backdrop-blur-sm transition-opacity ${
          h.escondido ? "pointer-events-none opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" : ""
        }`}
      >
        {h.etiqueta}
      </span>
    </button>
  );
}
