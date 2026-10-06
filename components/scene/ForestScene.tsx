"use client";
// La escena principal: poster → video, luces del árbol, polvo de hada, hotspots y el hero.
// Capas, de abajo hacia arriba: cuadro (poster, video, luces, hotspots) · velo · partículas · texto y CTA.
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { HOTSPOTS } from "@/lib/catalogo";
import { useReducedMotion } from "@/lib/motion";
import { HeroPoster, HeroVideo } from "./HeroVideo";
import { TreeLights } from "./TreeLights";
import { Hotspot } from "./Hotspot";
import { FairyDust } from "./FairyDust";
import { AmbientSound } from "./AmbientSound";
import { usePanel } from "./HotspotPanel";
import { usePuerta } from "./DoorTransition";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function ForestScene() {
  const escenaRef = useRef<HTMLElement>(null);
  const capaRef = useRef<HTMLDivElement>(null);
  const textoRef = useRef<HTMLDivElement>(null);
  const reducido = useReducedMotion();
  const { abrir } = usePanel();
  const { ir, precalentar } = usePuerta();

  useGSAP(
    () => {
      if (reducido) return;
      const mm = gsap.matchMedia();
      mm.add(
        { movimiento: "(prefers-reduced-motion: no-preference)", puntero: "(hover: hover) and (pointer: fine)" },
        (ctx) => {
          const { movimiento, puntero } = ctx.conditions as { movimiento: boolean; puntero: boolean };
          if (!movimiento) return;
          const capa = capaRef.current!;
          const texto = textoRef.current!;

          // Al bajar, el bosque se acerca y el texto se va: la cámara entra.
          gsap.fromTo(
            capa,
            { scale: 1, yPercent: 0 },
            {
              scale: 1.12,
              yPercent: 6,
              ease: "none",
              immediateRender: false,
              scrollTrigger: { trigger: escenaRef.current, start: "top top", end: "bottom top", scrub: true },
            },
          );
          gsap.fromTo(
            texto,
            { y: 0, autoAlpha: 1 },
            {
              y: -60,
              autoAlpha: 0,
              ease: "none",
              immediateRender: false,
              scrollTrigger: { trigger: escenaRef.current, start: "top top", end: "60% top", scrub: true },
            },
          );

          // En desktop, el cuadro sigue al mouse apenas: parallax leve.
          if (puntero) {
            const x = gsap.quickTo(capa, "xPercent", { duration: 1.2, ease: "power3.out" });
            const y = gsap.quickTo(capa, "y", { duration: 1.2, ease: "power3.out" });
            const mover = (e: PointerEvent) => {
              x((e.clientX / window.innerWidth - 0.5) * -1.6);
              y((e.clientY / window.innerHeight - 0.5) * -14);
            };
            window.addEventListener("pointermove", mover, { passive: true });
            return () => window.removeEventListener("pointermove", mover);
          }
        },
      );
      return () => mm.revert();
    },
    { scope: escenaRef, dependencies: [reducido], revertOnUpdate: true },
  );

  const visibles = HOTSPOTS.filter((h) => h.posicion.mobile || h.posicion.desktop);

  return (
    <section ref={escenaRef} className="escena" aria-label="El bosque encantado de Don Yaco">
      <div ref={capaRef} className="absolute inset-0 will-change-transform">
        <div className="escena-cuadro">
          <HeroPoster />
          <HeroVideo escenaRef={escenaRef} />
          <TreeLights />
          <div className="escena-velo pointer-events-none" aria-hidden="true" />
          <div>
            {visibles.map((h, i) => (
              <Hotspot key={h.id} h={h} indice={i} />
            ))}
          </div>
        </div>
      </div>

      <FairyDust escenaRef={escenaRef} />

      <div
        ref={textoRef}
        className="pointer-events-none absolute inset-x-0 top-0 z-20 px-5 pt-[calc(var(--header-alto)+1.25rem)] md:px-10 md:pt-[calc(var(--header-alto)+3rem)] [@media(min-aspect-ratio:1/1)]:max-w-xl"
      >
        <p className="entra text-sm font-bold tracking-[0.18em] text-dorado uppercase drop-shadow" style={{ "--d": "0.05s" } as React.CSSProperties}>
          Golosinería · Bosque Urbano
        </p>
        <h1
          className="entra font-display mt-2 text-[clamp(2.6rem,11vw,5.2rem)] leading-[0.95] font-semibold text-crema [text-shadow:0_2px_24px_rgb(26_42_23/0.6)]"
          style={{ "--d": "0.12s" } as React.CSSProperties}
        >
          <span className="sr-only">Don Yaco: </span>
          Endulzando tus días
        </h1>
        <p className="entra mt-3 max-w-sm text-base leading-snug font-semibold text-crema/90 drop-shadow md:text-lg" style={{ "--d": "0.2s" } as React.CSSProperties}>
          Entrá al bosque y tocá las luces doradas para descubrir qué hay en cada rincón.
        </p>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-4 px-5 pb-[calc(5.25rem+env(safe-area-inset-bottom))] md:items-start md:px-10 md:pb-10">
        <div className="entra pointer-events-auto flex w-full max-w-md gap-3" style={{ "--d": "0.28s" } as React.CSSProperties}>
          <button
            type="button"
            onClick={() => abrir("cartel")}
            className="flex-1 rounded-full bg-crema px-5 py-3.5 font-bold text-musgo shadow-xl transition-transform active:scale-[0.97]"
          >
            Cómo llegar
          </button>
          <button
            type="button"
            onPointerEnter={precalentar}
            onFocus={precalentar}
            onClick={() => ir("/arma-tu-caja")}
            className="flex-1 rounded-full bg-yaco-rojo px-5 py-3.5 font-bold text-white shadow-xl shadow-yaco-rojo/30 transition-transform active:scale-[0.97]"
          >
            Armá tu caja
          </button>
        </div>
        <div className="pointer-events-auto flex w-full max-w-md items-center justify-between gap-3">
          <a href="#recorrido" className="inline-flex items-center gap-2 text-sm font-bold text-crema/90">
            <svg viewBox="0 0 24 24" className="indicador-scroll size-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
            Explorá el bosque
          </a>
          <AmbientSound />
        </div>
      </div>
    </section>
  );
}
