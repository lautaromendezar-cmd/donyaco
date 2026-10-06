"use client";
// Transición "puerta": se reproduce puerta.webm a pantalla completa y se navega cuando el video
// llega al cuadro crema. Si el video no está listo o hay movimiento reducido: fundido a crema.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ESCENA } from "@/lib/catalogo";
import { useReducedMotion } from "@/lib/motion";

type Estado = "quieto" | "video" | "fundido" | "crema";
type Puerta = {
  /** Navega a href pasando por la puerta. */
  ir: (href: string) => void;
  /** Empieza a bajar el video de la puerta (al abrir un panel o pasar por una tarjeta). */
  precalentar: () => void;
};

const PuertaContext = createContext<Puerta>({ ir: () => {}, precalentar: () => {} });
export const usePuerta = () => useContext(PuertaContext);

// El video termina con medio segundo de crema sostenido: se navega apenas entra en ese tramo.
const CREMA_ANTES_DEL_FINAL = 0.45;

export function DoorTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reducido = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [estado, setEstado] = useState<Estado>("quieto");
  const [cargar, setCargar] = useState(false);
  const destino = useRef<string | null>(null);
  const rutaAlSalir = useRef(pathname);

  const precalentar = useCallback(() => {
    if (!reducido) setCargar(true);
  }, [reducido]);

  const navegar = useCallback(() => {
    const href = destino.current;
    if (!href) return;
    destino.current = null;
    setEstado("crema");
    router.push(href);
    // Red de seguridad: si la navegación no cambia la ruta, la capa no queda tapando todo.
    window.setTimeout(() => setEstado((e) => (e === "crema" ? "quieto" : e)), 5000);
  }, [router]);

  const ir = useCallback(
    (href: string) => {
      if (destino.current) return;
      if (href === pathname) return;
      destino.current = href;
      rutaAlSalir.current = pathname;
      const v = videoRef.current;
      const fundido = () => {
        setEstado("fundido");
        window.setTimeout(navegar, 380);
      };
      if (reducido || !v) return fundido();
      setCargar(true);
      // Si en 300 ms el video no arrancó, no se hace esperar a nadie: fundido simple.
      const plan = window.setTimeout(() => {
        if (v.paused || v.readyState < 3) {
          v.pause();
          fundido();
        }
      }, 300);
      v.currentTime = 0;
      setEstado("video");
      v.play().catch(() => {
        window.clearTimeout(plan);
        fundido();
      });
    },
    [navegar, pathname, reducido],
  );

  // Al llegar a la página nueva, la capa crema se desvanece.
  useEffect(() => {
    if (pathname !== rutaAlSalir.current && estado === "crema") {
      const t = window.setTimeout(() => {
        videoRef.current?.pause();
        setEstado("quieto");
      }, 60);
      return () => window.clearTimeout(t);
    }
  }, [pathname, estado]);

  const alAvanzar = () => {
    const v = videoRef.current;
    if (!v || !destino.current || !Number.isFinite(v.duration)) return;
    if (v.currentTime >= v.duration - CREMA_ANTES_DEL_FINAL) navegar();
  };

  return (
    <PuertaContext.Provider value={{ ir, precalentar }}>
      {children}
      <div className="puerta-capa" data-estado={estado} aria-hidden="true">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          style={{ opacity: estado === "video" ? 1 : 0 }}
          muted
          playsInline
          preload={cargar ? "auto" : "none"}
          onTimeUpdate={alAvanzar}
          onEnded={navegar}
        >
          {cargar && <source src={`${ESCENA.puerta}.webm`} type="video/webm" />}
          {cargar && <source src={`${ESCENA.puerta}.mp4`} type="video/mp4" />}
        </video>
      </div>
    </PuertaContext.Provider>
  );
}
