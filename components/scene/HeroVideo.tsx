"use client";
// El poster es lo primero que se ve (está en el HTML con fetchpriority alta).
// El video arranca después del primer render, sólo la fuente del encuadre que corresponde,
// y nunca con movimiento reducido o ahorro de datos.
import { useEffect, useRef, useState } from "react";
import { ESCENA } from "@/lib/catalogo";
import { ahorroDeDatos, useReducedMotion } from "@/lib/motion";

const HORIZONTAL = "(min-aspect-ratio: 1/1)";

export function HeroPoster() {
  const { mobile, desktop } = ESCENA.hero;
  return (
    <picture>
      <source media={HORIZONTAL} srcSet={desktop.poster} width={desktop.ancho} height={desktop.alto} />
      <img
        src={mobile.poster}
        width={mobile.ancho}
        height={mobile.alto}
        alt="El árbol gigante del Bosque Urbano de Don Yaco, con lucecitas azules entre las ramas y el techo celeste con nubes"
        fetchPriority="high"
        decoding="async"
        className="h-full w-full object-cover"
      />
    </picture>
  );
}

export function HeroVideo({ escenaRef }: { escenaRef: React.RefObject<HTMLElement | null> }) {
  const reducido = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fuente, setFuente] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  // Elegir la fuente después de la carga de la página, según el encuadre actual.
  useEffect(() => {
    if (reducido || ahorroDeDatos()) return;
    const mq = window.matchMedia(HORIZONTAL);
    const elegir = () => setFuente(mq.matches ? ESCENA.hero.desktop.video : ESCENA.hero.mobile.video);
    let idle = 0;
    const arrancar = () => {
      const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
      idle = ric(elegir) as number;
    };
    if (document.readyState === "complete") arrancar();
    else window.addEventListener("load", arrancar, { once: true });
    mq.addEventListener("change", elegir);
    return () => {
      window.removeEventListener("load", arrancar);
      mq.removeEventListener("change", elegir);
      (window.cancelIdleCallback ?? window.clearTimeout)(idle);
    };
  }, [reducido]);

  // Al cambiar de fuente, recargar el elemento.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !fuente) return;
    setListo(false);
    v.load();
  }, [fuente]);

  // Pausar fuera de pantalla o con la pestaña oculta.
  useEffect(() => {
    const v = videoRef.current;
    const escena = escenaRef.current;
    if (!v || !escena || !fuente) return;
    let visible = true;
    const sincronizar = () => {
      if (visible && !document.hidden) v.play().catch(() => {});
      else v.pause();
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      sincronizar();
    });
    io.observe(escena);
    document.addEventListener("visibilitychange", sincronizar);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sincronizar);
    };
  }, [fuente, escenaRef]);

  if (!fuente || reducido) return null;
  return (
    <video
      ref={videoRef}
      className="h-full w-full object-cover transition-opacity duration-700"
      style={{ opacity: listo ? 1 : 0 }}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      onPlaying={() => setListo(true)}
    >
      <source src={`${fuente}.webm`} type="video/webm" />
      <source src={`${fuente}.mp4`} type="video/mp4" />
    </video>
  );
}
