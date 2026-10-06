"use client";
// Polvo de hada: puntitos dorados y celestes que siguen el cursor o aparecen al tocar.
// Canvas 2D, como mucho MAX partículas, sprite pre-dibujado (sin shadowBlur por cuadro),
// y el loop se detiene cuando no hay nada que dibujar, la escena no se ve o la pestaña está oculta.
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/motion";

const MAX = 90;
const AMBIENTE = 14;
const COLORES = ["#FFC861", "#FFE3A3", "#4FD6FF", "#BDF1FF"];

type P = { x: number; y: number; vx: number; vy: number; vida: number; max: number; t: number; c: number; amb: boolean };

function sprite(color: string) {
  const s = document.createElement("canvas");
  s.width = s.height = 32;
  const g = s.getContext("2d")!;
  const r = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  r.addColorStop(0, "#ffffff");
  r.addColorStop(0.25, color);
  r.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 32, 32);
  return s;
}

export function FairyDust({ escenaRef }: { escenaRef: React.RefObject<HTMLElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducido = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const escena = escenaRef.current;
    if (!canvas || !escena || reducido) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sprites = COLORES.map(sprite);
    const ps: P[] = [];
    let w = 0,
      h = 0,
      raf = 0,
      visible = true,
      ultimo = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const medir = () => {
      const r = escena.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const nueva = (x: number, y: number, amb: boolean): P => ({
      x,
      y,
      vx: (Math.random() - 0.5) * (amb ? 0.15 : 0.9),
      vy: amb ? -0.1 - Math.random() * 0.25 : -0.3 - Math.random() * 0.9,
      vida: 0,
      max: amb ? 300 + Math.random() * 300 : 50 + Math.random() * 50,
      t: amb ? 3 + Math.random() * 5 : 4 + Math.random() * 9,
      c: Math.floor(Math.random() * COLORES.length),
      amb,
    });

    const sembrar = (x: number, y: number, n: number) => {
      for (let i = 0; i < n && ps.length < MAX; i++) ps.push(nueva(x + (Math.random() - 0.5) * 14, y + (Math.random() - 0.5) * 14, false));
      arrancar();
    };

    const cuadro = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      let ambientes = 0;
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.vida++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= p.amb ? 1 : 0.985;
        if (p.vida >= p.max) {
          ps.splice(i, 1);
          continue;
        }
        if (p.amb) ambientes++;
        const k = p.vida / p.max;
        ctx.globalAlpha = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85;
        ctx.drawImage(sprites[p.c], p.x - p.t, p.y - p.t, p.t * 2, p.t * 2);
      }
      ctx.globalAlpha = 1;
      // Unas pocas motas siempre flotando, para que en el celular haya vida sin tocar.
      for (let i = ambientes; i < AMBIENTE; i++) ps.push(nueva(Math.random() * w, h * (0.35 + Math.random() * 0.65), true));
      raf = visible && !document.hidden ? requestAnimationFrame(cuadro) : 0;
    };

    function arrancar() {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(cuadro);
    }

    const alMover = (e: PointerEvent) => {
      const ahora = performance.now();
      if (ahora - ultimo < 24) return;
      ultimo = ahora;
      const r = escena.getBoundingClientRect();
      sembrar(e.clientX - r.left, e.clientY - r.top, e.pointerType === "mouse" ? 2 : 3);
    };
    const alTocar = (e: PointerEvent) => {
      const r = escena.getBoundingClientRect();
      sembrar(e.clientX - r.left, e.clientY - r.top, 16);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) arrancar();
    });
    const alVisibilidad = () => {
      if (!document.hidden) arrancar();
    };
    const ro = new ResizeObserver(medir);

    // Se inicializa después del primer render, cuando el navegador está libre.
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300));
    const idle = ric(() => {
      medir();
      ro.observe(escena);
      io.observe(escena);
      escena.addEventListener("pointermove", alMover, { passive: true });
      escena.addEventListener("pointerdown", alTocar, { passive: true });
      document.addEventListener("visibilitychange", alVisibilidad);
      arrancar();
    });

    return () => {
      (window.cancelIdleCallback ?? window.clearTimeout)(idle as number);
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      escena.removeEventListener("pointermove", alMover);
      escena.removeEventListener("pointerdown", alTocar);
      document.removeEventListener("visibilitychange", alVisibilidad);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [escenaRef, reducido]);

  if (reducido) return null;
  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-[5] h-full w-full" aria-hidden="true" />;
}
