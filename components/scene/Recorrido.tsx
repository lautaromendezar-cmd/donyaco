"use client";
// "Entrá al bosque": sección pinneada que dibuja la secuencia de frames en un canvas según el scroll.
// No se usa video.currentTime con scroll porque en iOS se traba.
// Los frames se precargan de forma progresiva: primero el 1, después uno cada 16, cada 8, cada 4...
// así siempre hay un frame cercano para mostrar aunque la carga no haya terminado.
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ESCENA, HOTSPOTS } from "@/lib/catalogo";
import { useReducedMotion } from "@/lib/motion";
import { usePanel } from "./HotspotPanel";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HORIZONTAL = "(min-aspect-ratio: 1/1)";
type Secuencia = (typeof ESCENA.recorrido)["desktop"];

const urlFrame = (s: Secuencia, i: number) => `${s.carpeta}/frame-${String(i + 1).padStart(4, "0")}.webp`;

function ordenDeCarga(n: number): number[] {
  const orden: number[] = [0, n - 1];
  const vistos = new Set(orden);
  for (let paso = 16; paso >= 1; paso = paso / 2) {
    for (let i = 0; i < n; i += paso) {
      if (!vistos.has(i)) {
        vistos.add(i);
        orden.push(i);
      }
    }
    if (paso === 1) break;
  }
  return orden;
}

export function Recorrido() {
  const seccionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const finalRef = useRef<HTMLDivElement>(null);
  const reducido = useReducedMotion();
  const { abrir } = usePanel();
  const [seq, setSeq] = useState<Secuencia | null>(null);

  // Secuencia según encuadre: en vertical, la mitad de frames y menor resolución.
  useEffect(() => {
    const mq = window.matchMedia(HORIZONTAL);
    const elegir = () => setSeq(mq.matches ? ESCENA.recorrido.desktop : ESCENA.recorrido.mobile);
    elegir();
    mq.addEventListener("change", elegir);
    return () => mq.removeEventListener("change", elegir);
  }, []);

  useGSAP(
    () => {
      const seccion = seccionRef.current;
      const canvas = canvasRef.current;
      if (!seq || reducido || !seccion || !canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const n = seq.cantidad;
      const imgs: (HTMLImageElement | null)[] = new Array(n).fill(null);
      const estado = { frame: 0 };
      let dibujado = -1;
      let cancelado = false;

      const medir = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(canvas.clientWidth * dpr);
        canvas.height = Math.round(canvas.clientHeight * dpr);
        dibujado = -1;
        dibujar();
      };

      const cercano = (i: number) => {
        for (let d = 0; d < n; d++) {
          if (imgs[i - d]) return imgs[i - d];
          if (imgs[i + d]) return imgs[i + d];
        }
        return null;
      };

      function dibujar() {
        const i = Math.round(estado.frame);
        const img = imgs[i] ?? cercano(i);
        if (!img) return;
        const clave = imgs[i] ? i : -2 - i;
        if (clave === dibujado) return;
        dibujado = clave;
        // object-fit: cover dentro del canvas
        const cw = canvas!.width,
          ch = canvas!.height;
        const k = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
        const w = img.naturalWidth * k,
          h = img.naturalHeight * k;
        ctx!.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      }

      // Carga progresiva con pocas descargas en paralelo, sólo cuando la sección se acerca.
      const cola = ordenDeCarga(n);
      let activas = 0;
      const siguiente = () => {
        while (!cancelado && activas < 4 && cola.length) {
          const i = cola.shift()!;
          const img = new Image();
          img.decoding = "async";
          activas++;
          img.onload = () => {
            activas--;
            imgs[i] = img;
            if (Math.abs(i - estado.frame) < 20 || dibujado < 0) {
              dibujado = -1;
              dibujar();
            }
            siguiente();
          };
          img.onerror = () => {
            activas--;
            siguiente();
          };
          img.src = urlFrame(seq, i);
        }
      };
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            io.disconnect();
            siguiente();
          }
        },
        { rootMargin: "150% 0px" },
      );
      io.observe(seccion);

      const ro = new ResizeObserver(medir);
      ro.observe(canvas);

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: seccion,
            start: "top top",
            end: () => `+=${window.innerHeight * 2.6}`,
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        tl.to(estado, { frame: n - 1, ease: "none", duration: 0.82, onUpdate: dibujar });
        tl.fromTo(
          finalRef.current,
          { autoAlpha: 0, y: 40 },
          { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.18 },
          ">-0.04",
        );
        return () => gsap.set(finalRef.current, { clearProps: "all" });
      });

      return () => {
        cancelado = true;
        io.disconnect();
        ro.disconnect();
        mm.revert();
      };
    },
    { scope: seccionRef, dependencies: [seq, reducido], revertOnUpdate: true },
  );

  const accesos = HOTSPOTS;
  const ultimo = seq ? urlFrame(seq, seq.cantidad - 1) : urlFrame(ESCENA.recorrido.mobile, ESCENA.recorrido.mobile.cantidad - 1);

  return (
    <section
      ref={seccionRef}
      id="recorrido"
      className="relative h-[100svh] min-h-[34rem] overflow-hidden bg-musgo-noche"
      aria-labelledby="recorrido-titulo"
    >
      {reducido ? (
        // Con animaciones reducidas: sólo el último frame, quieto.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ultimo} alt="El pasillo de estanterías termina en el árbol gigante del Bosque Urbano" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      ) : (
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" role="img" aria-label="Recorrido por el pasillo de estanterías de madera hasta el árbol gigante" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgb(26_42_23/0.9)_0%,rgb(26_42_23/0.2)_55%,rgb(26_42_23/0.35)_100%)]" aria-hidden="true" />

      <div ref={finalRef} className="absolute inset-x-0 bottom-0 z-10 px-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:px-10 md:pb-14">
        <p className="text-sm font-bold tracking-[0.18em] text-dorado uppercase">Llegaste al corazón del bosque</p>
        <h2 id="recorrido-titulo" className="font-display mt-2 max-w-3xl text-[clamp(2.2rem,8.5vw,4.6rem)] leading-[0.98] font-semibold text-crema">
          Bienvenido al Bosque Urbano
        </h2>
        <ul className="mt-6 flex max-w-4xl flex-wrap gap-2">
          {accesos.map((h) => (
            <li key={h.id}>
              <button
                type="button"
                onClick={() => abrir(h.id)}
                className="rounded-full bg-crema/12 px-4 py-2.5 text-sm font-bold text-crema ring-1 ring-crema/30 backdrop-blur-sm transition-colors hover:bg-crema hover:text-musgo"
              >
                {h.id === "cartel" ? "El cartel de entrada · Cómo llegar" : h.titulo}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
