"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { usePanel } from "@/components/scene/HotspotPanel";

// "Cómo llegar" siempre a un toque en mobile (en desktop vive en el header).
// En la home se esconde mientras se ve el hero, que ya tiene su propio botón.
export function DirectionsButton() {
  const { abrir } = usePanel();
  const enHome = usePathname() === "/";
  const [pasoElHero, setPasoElHero] = useState(false);

  useEffect(() => {
    if (!enHome) return;
    const alScroll = () => setPasoElHero(window.scrollY > window.innerHeight * 0.6);
    alScroll();
    window.addEventListener("scroll", alScroll, { passive: true });
    return () => window.removeEventListener("scroll", alScroll);
  }, [enHome]);

  const oculto = enHome && !pasoElHero;
  return (
    <button
      type="button"
      onClick={() => abrir("cartel")}
      tabIndex={oculto ? -1 : undefined}
      aria-hidden={oculto || undefined}
      className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-50 inline-flex h-14 items-center gap-2 rounded-full bg-musgo px-5 font-bold text-crema shadow-xl shadow-black/25 transition-[opacity,translate] duration-300 md:hidden ${
        oculto ? "pointer-events-none translate-y-4 opacity-0" : ""
      }`}
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 21s-7-6.1-7-11.5A7 7 0 0112 2.5a7 7 0 017 7C19 14.9 12 21 12 21z" />
        <circle cx="12" cy="9.5" r="2.5" />
      </svg>
      Cómo llegar
    </button>
  );
}
