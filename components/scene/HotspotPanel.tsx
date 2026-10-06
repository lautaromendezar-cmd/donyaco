"use client";
// Panel de cada hotspot: drawer desde abajo en mobile, panel lateral en desktop.
// Es un <dialog> nativo: atrapa el foco, cierra con Escape y devuelve el foco al botón que lo abrió.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { HOTSPOTS, SUCURSALES, type Hotspot } from "@/lib/catalogo";
import { linkIntencion, INTENCIONES } from "@/lib/whatsapp";
import { useReducedMotion } from "@/lib/motion";
import { usePuerta } from "./DoorTransition";

type Panel = { abrir: (id: string) => void };
const PanelContext = createContext<Panel>({ abrir: () => {} });
export const usePanel = () => useContext(PanelContext);

export function HotspotPanelProvider({ children }: { children: React.ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [actual, setActual] = useState<Hotspot | null>(null);
  const { ir, precalentar } = usePuerta();
  const reducido = useReducedMotion();

  const abrir = useCallback(
    (id: string) => {
      const h = HOTSPOTS.find((x) => x.id === id);
      if (!h) return;
      setActual(h);
      precalentar();
      const d = dialogRef.current;
      if (d && !d.open) {
        delete d.dataset.cerrando;
        d.showModal();
      }
    },
    [precalentar],
  );

  const cerrar = useCallback(() => {
    const d = dialogRef.current;
    if (!d?.open) return;
    if (reducido) return d.close();
    d.dataset.cerrando = "";
    window.setTimeout(() => {
      d.close();
      delete d.dataset.cerrando;
    }, 320);
  }, [reducido]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const alCancelar = (e: Event) => {
      e.preventDefault();
      cerrar();
    };
    // Tocar el fondo (fuera del contenido) cierra.
    const alClic = (e: MouseEvent) => {
      if (e.target === d) cerrar();
    };
    d.addEventListener("cancel", alCancelar);
    d.addEventListener("click", alClic);
    return () => {
      d.removeEventListener("cancel", alCancelar);
      d.removeEventListener("click", alClic);
    };
  }, [cerrar]);

  const irA = (href: string) => {
    dialogRef.current?.close();
    ir(href);
  };

  return (
    <PanelContext.Provider value={{ abrir }}>
      {children}
      <dialog ref={dialogRef} className="panel" aria-labelledby="panel-titulo">
        {actual && <ContenidoPanel h={actual} cerrar={cerrar} irA={irA} />}
      </dialog>
    </PanelContext.Provider>
  );
}

function ContenidoPanel({ h, cerrar, irA }: { h: Hotspot; cerrar: () => void; irA: (href: string) => void }) {
  const intencion = h.whatsapp ? INTENCIONES.find((i) => i.id === h.whatsapp) : null;
  return (
    <div className="flex max-h-[inherit] flex-col md:h-full">
      <div className="flex justify-center pt-3 md:hidden" aria-hidden="true">
        <span className="h-1.5 w-12 rounded-full bg-corteza/25" />
      </div>
      <div className="flex items-start justify-between gap-4 px-6 pt-4 md:px-8 md:pt-8">
        <div>
          <p className="text-sm font-bold tracking-wide text-hoja-oscura uppercase">{h.bajada}</p>
          <h2 id="panel-titulo" className="font-display mt-1 text-3xl leading-tight text-musgo md:text-4xl">
            {h.titulo}
          </h2>
        </div>
        <button
          type="button"
          onClick={cerrar}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-corteza/10 text-corteza transition-colors hover:bg-corteza/20"
          aria-label="Cerrar"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div className="overflow-y-auto overscroll-contain px-6 pt-4 pb-6 md:flex-1 md:px-8">
        {h.texto.map((p) => (
          <p key={p.slice(0, 24)} className="mb-3 text-[1.05rem] leading-relaxed text-corteza-oscura/90">
            {p}
          </p>
        ))}
        {h.lista && (
          <ul className="mt-2 grid gap-2">
            {h.lista.map((item) => (
              <li key={item} className="flex items-center gap-3 rounded-2xl bg-madera/20 px-4 py-3 font-semibold text-corteza-oscura">
                <span className="size-2 shrink-0 rounded-full bg-yaco-rojo" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        )}
        {h.tipo === "como-llegar" && <ComoLlegar />}
      </div>

      <div className="grid gap-2 border-t border-corteza/10 px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-8 md:pb-8">
        <button
          type="button"
          onClick={() => irA(h.cta.href)}
          className="rounded-full bg-yaco-rojo px-6 py-3.5 text-center font-bold text-white shadow-lg shadow-yaco-rojo/25 transition-colors hover:bg-yaco-rojo-oscuro"
        >
          {h.cta.texto}
        </button>
        {intencion && (
          <a
            href={linkIntencion(intencion.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border-2 border-musgo/20 px-6 py-3 text-center font-bold text-musgo transition-colors hover:border-musgo/50"
          >
            Escribinos por WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}

export function ComoLlegar() {
  const [mapa, setMapa] = useState<string | null>(null);
  return (
    <div className="mt-2 grid gap-4">
      {SUCURSALES.map((s) => (
        <article key={s.slug} className="rounded-3xl bg-white/70 p-5 ring-1 ring-corteza/10">
          <p className="text-sm font-bold text-hoja-oscura uppercase">{s.barrio}</p>
          <h3 className="font-display text-2xl text-musgo">{s.nombreCorto}</h3>
          <p className="mt-1 font-semibold">
            {s.direccion}, {s.localidad}
          </p>
          <Horarios horarios={s.horarios} />
          {mapa === s.slug ? (
            <iframe
              src={s.mapaEmbed}
              title={`Mapa de ${s.nombre}`}
              loading="lazy"
              className="mt-3 aspect-[4/3] w-full rounded-2xl border-0"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={s.googleMaps}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-musgo px-5 py-2.5 font-bold text-crema transition-colors hover:bg-musgo-noche"
            >
              Cómo llegar
            </a>
            {mapa !== s.slug && (
              <button
                type="button"
                onClick={() => setMapa(s.slug)}
                className="rounded-full px-4 py-2.5 font-bold text-musgo underline decoration-2 underline-offset-4"
              >
                Ver mapa
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

export function Horarios({ horarios, claro = false }: { horarios: (typeof SUCURSALES)[number]["horarios"]; claro?: boolean }) {
  return (
    <div className="mt-3 text-sm">
      <ul className="grid gap-0.5">
        {horarios.detalle.map((h) => (
          <li key={h.dias} className="flex justify-between gap-4">
            <span>{h.dias}</span>
            <span className="font-semibold tabular-nums">
              {h.abre} a {h.cierra}
            </span>
          </li>
        ))}
      </ul>
      {!horarios.confirmado && (
        <p className={`mt-1.5 inline-flex items-center gap-1.5 text-xs ${claro ? "text-crema/80" : "text-corteza"}`}>
          <span className="size-1.5 rounded-full bg-dorado" aria-hidden="true" />
          Horario a confirmar
        </p>
      )}
    </div>
  );
}
