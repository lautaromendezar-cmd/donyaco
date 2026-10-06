"use client";
// Sonido ambiente del bosque: apagado por defecto; el archivo se pide recién cuando se activa.
import { useEffect, useRef, useState } from "react";

const ARCHIVO = "/audio/bosque.mp3";
const VOLUMEN = 0.35;

export function AmbientSound({ className = "" }: { className?: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fade = useRef(0);
  const [activo, setActivo] = useState(false);

  useEffect(() => {
    const alOcultar = () => {
      const a = audioRef.current;
      if (!a) return;
      if (document.hidden) a.pause();
      else if (activo) a.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", alOcultar);
    return () => document.removeEventListener("visibilitychange", alOcultar);
  }, [activo]);

  useEffect(() => () => audioRef.current?.pause(), []);

  const llevarA = (a: HTMLAudioElement, destino: number, alTerminar?: () => void) => {
    window.clearInterval(fade.current);
    fade.current = window.setInterval(() => {
      const paso = destino > a.volume ? 0.03 : -0.05;
      const v = Math.min(1, Math.max(0, a.volume + paso));
      a.volume = v;
      if ((paso > 0 && v >= destino) || (paso < 0 && v <= destino)) {
        window.clearInterval(fade.current);
        alTerminar?.();
      }
    }, 50);
  };

  const alternar = () => {
    if (!audioRef.current) {
      const a = new Audio(ARCHIVO);
      a.loop = true;
      a.volume = 0;
      audioRef.current = a;
    }
    const a = audioRef.current;
    if (activo) {
      llevarA(a, 0, () => a.pause());
      setActivo(false);
    } else {
      a.play()
        .then(() => llevarA(a, VOLUMEN))
        .catch(() => setActivo(false));
      setActivo(true);
    }
  };

  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={activo}
      className={`inline-flex items-center gap-2 rounded-full bg-musgo-noche/55 px-4 py-2.5 text-sm font-bold text-crema backdrop-blur-sm transition-colors hover:bg-musgo-noche/75 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
        {activo ? (
          <>
            <path d="M16.5 8.5a5 5 0 010 7" />
            <path d="M19 6a8.5 8.5 0 010 12" />
          </>
        ) : (
          <path d="M17 9l5 5M22 9l-5 5" />
        )}
      </svg>
      <span>{activo ? "Silenciar el bosque" : "Escuchar el bosque"}</span>
    </button>
  );
}
