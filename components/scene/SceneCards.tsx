"use client";
// Para quien no explora la escena: accesos directos a las mismas secciones.
// Los recortes reales (tronco, hongos) flotan con parallax según el scroll y, en desktop, el mouse.
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { HOTSPOTS, type Hotspot } from "@/lib/catalogo";
import { useReducedMotion } from "@/lib/motion";
import { usePanel } from "./HotspotPanel";
import { usePuerta } from "./DoorTransition";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Cada tarjeta con su fondo; el árbol ocupa el lugar grande.
const ESTILO: Record<string, { fondo: string; texto: string; span: string }> = {
  arbol: { fondo: "bg-musgo", texto: "text-crema", span: "md:col-span-2 md:row-span-2" },
  cartel: { fondo: "bg-madera", texto: "text-corteza-oscura", span: "" },
  caramelera: { fondo: "bg-yaco-rojo", texto: "text-white", span: "" },
  hongos: { fondo: "bg-[#7A1F3D]", texto: "text-crema", span: "md:col-span-2" },
  puertas: { fondo: "bg-cielo", texto: "text-musgo-noche", span: "" },
  estanterias: { fondo: "bg-hoja-oscura", texto: "text-white", span: "md:row-span-2" },
  "puerta-pequena": { fondo: "bg-corteza", texto: "text-crema", span: "" },
};

export function SceneCards() {
  const ref = useRef<HTMLElement>(null);
  const reducido = useReducedMotion();

  useGSAP(
    () => {
      if (reducido) return;
      const mm = gsap.matchMedia();
      mm.add(
        { movimiento: "(prefers-reduced-motion: no-preference)", puntero: "(hover: hover) and (pointer: fine)" },
        (ctx) => {
          const { movimiento, puntero } = ctx.conditions as { movimiento: boolean; puntero: boolean };
          if (!movimiento) return;
          const recortes = gsap.utils.toArray<HTMLElement>("[data-profundidad]");
          recortes.forEach((el) => {
            const p = Number(el.dataset.profundidad);
            gsap.fromTo(
              el,
              { yPercent: 25 * p },
              { yPercent: -25 * p, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true } },
            );
          });
          gsap.from("[data-tarjeta]", {
            y: 40,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.06,
            scrollTrigger: { trigger: "[data-grilla]", start: "top 85%", once: true },
          });
          if (puntero) {
            const movs = recortes.map((el) => ({
              x: gsap.quickTo(el, "x", { duration: 1.4, ease: "power3.out" }),
              p: Number(el.dataset.profundidad),
            }));
            const mover = (e: PointerEvent) => {
              const dx = e.clientX / window.innerWidth - 0.5;
              movs.forEach((m) => m.x(dx * -40 * m.p));
            };
            window.addEventListener("pointermove", mover, { passive: true });
            return () => window.removeEventListener("pointermove", mover);
          }
        },
      );
      return () => mm.revert();
    },
    { scope: ref, dependencies: [reducido], revertOnUpdate: true },
  );

  return (
    <section ref={ref} className="relative overflow-hidden bg-crema px-5 py-20 md:px-10 md:py-28" aria-labelledby="mapa-titulo">
      {/* Recortes reales con profundidad */}
      {/* eslint-disable @next/next/no-img-element */}
      <img data-profundidad="1.4" src="/scene/recortes/tronco.webp" alt="" aria-hidden="true" loading="lazy" width={600} height={1400} className="pointer-events-none absolute -top-10 -right-24 w-44 opacity-90 md:-right-10 md:w-72" />
      <img data-profundidad="0.8" src="/scene/recortes/hongo-1.webp" alt="" aria-hidden="true" loading="lazy" width={700} height={700} className="pointer-events-none absolute bottom-10 -left-16 w-40 md:left-0 md:w-60" />
      <img data-profundidad="2" src="/scene/recortes/hongo-2.webp" alt="" aria-hidden="true" loading="lazy" width={500} height={600} className="pointer-events-none absolute top-1/2 right-4 hidden w-28 md:block" />
      {/* eslint-enable @next/next/no-img-element */}

      <div className="relative mx-auto max-w-6xl">
        <p className="text-sm font-bold tracking-[0.18em] text-hoja-oscura uppercase">El mapa del bosque</p>
        <h2 id="mapa-titulo" className="font-display mt-2 max-w-2xl text-[clamp(2.2rem,7vw,4rem)] leading-[1] font-semibold text-musgo">
          ¿A qué rincón querés ir?
        </h2>
        <ul data-grilla className="mt-10 grid auto-rows-[minmax(11rem,auto)] grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
          {HOTSPOTS.map((h) => (
            <Tarjeta key={h.id} h={h} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function Tarjeta({ h }: { h: Hotspot }) {
  const { abrir } = usePanel();
  const { ir, precalentar } = usePuerta();
  const e = ESTILO[h.id] ?? ESTILO.cartel;
  const grande = h.id === "arbol";
  const esComoLlegar = h.tipo === "como-llegar";
  return (
    <li data-tarjeta className={`${e.span}`}>
      <button
        type="button"
        onPointerEnter={esComoLlegar ? undefined : precalentar}
        onClick={() => (esComoLlegar ? abrir(h.id) : ir(h.cta.href))}
        className={`group relative flex h-full w-full flex-col justify-end overflow-hidden rounded-[1.75rem] p-6 text-left ${e.fondo} ${e.texto} transition-transform duration-300 hover:-translate-y-1 md:p-7`}
      >
        <span className="absolute top-5 right-5 grid size-11 place-items-center rounded-full bg-black/10 transition-transform duration-300 group-hover:rotate-[-35deg]" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
        <span className="text-xs font-bold tracking-[0.16em] uppercase opacity-80">{h.etiqueta}</span>
        <span className={`font-display mt-1 leading-[1.02] font-semibold ${grande ? "text-[clamp(2rem,5vw,3.4rem)]" : "text-2xl md:text-[1.7rem]"}`}>
          {h.titulo}
        </span>
        <span className={`mt-2 leading-snug opacity-90 ${grande ? "max-w-sm text-lg" : "text-[0.95rem]"}`}>{h.tarjeta}</span>
      </button>
    </li>
  );
}
