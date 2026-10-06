"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TIENDA_ONLINE } from "@/lib/catalogo";
import { usePanel } from "@/components/scene/HotspotPanel";
import { usePuerta } from "@/components/scene/DoorTransition";

export const NAV = [
  { href: "/sucursales/bosque-urbano", texto: "Sucursales" },
  { href: "/arma-tu-caja", texto: "Armá tu caja" },
  { href: "/cumpleanos", texto: "Cumpleaños" },
  { href: "/empresas", texto: "Empresas" },
  { href: "/atracciones", texto: "Atracciones" },
];

export function Header() {
  const pathname = usePathname();
  const enEscena = pathname === "/";
  const [pasado, setPasado] = useState(false);
  const solido = !enEscena || pasado;
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDialogElement>(null);
  const { abrir } = usePanel();
  const { ir } = usePuerta();

  useEffect(() => {
    if (!enEscena) return;
    const alScroll = () => setPasado(window.scrollY > window.innerHeight * 0.6);
    alScroll();
    window.addEventListener("scroll", alScroll, { passive: true });
    return () => window.removeEventListener("scroll", alScroll);
  }, [enEscena]);

  useEffect(() => {
    const d = menuRef.current;
    if (!d) return;
    if (menu && !d.open) d.showModal();
    if (!menu && d.open) d.close();
  }, [menu]);

  const navegar = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setMenu(false);
    ir(href);
  };

  const claro = !solido;
  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        solido ? "bg-crema/92 shadow-[0_1px_0_rgb(107_66_38/0.12)] backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[var(--header-alto)] max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <Link href="/" className="shrink-0 rounded-2xl bg-crema px-3 py-1 shadow-md" aria-label="Don Yaco Golosinería, inicio">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-don-yaco.svg" alt="" width={120} height={45} className="h-9 w-auto" />
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={(e) => navegar(e, n.href)}
                  aria-current={pathname === n.href ? "page" : undefined}
                  className={`rounded-full px-3.5 py-2 font-bold transition-colors ${
                    claro ? "text-crema hover:bg-crema/15" : "text-musgo hover:bg-musgo/10"
                  }`}
                >
                  {n.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => abrir("cartel")}
            className={`hidden rounded-full px-4 py-2 font-bold md:inline-flex ${claro ? "bg-crema/15 text-crema ring-1 ring-crema/40" : "bg-musgo/10 text-musgo"}`}
          >
            Cómo llegar
          </button>
          <a
            href={TIENDA_ONLINE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-yaco-rojo px-4 py-2 text-sm font-bold text-white shadow-md md:text-base"
          >
            Tienda online
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
            <span className="sr-only">(abre en otra pestaña)</span>
          </a>
          <button
            type="button"
            onClick={() => setMenu(true)}
            aria-label="Abrir menú"
            aria-expanded={menu}
            className={`grid size-11 place-items-center rounded-full lg:hidden ${claro ? "bg-crema/15 text-crema" : "bg-musgo/10 text-musgo"}`}
          >
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h10" />
            </svg>
          </button>
        </div>
      </div>

      <dialog
        ref={menuRef}
        onClose={() => setMenu(false)}
        onClick={(e) => e.target === menuRef.current && setMenu(false)}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-musgo-noche/96 p-0 text-crema backdrop:bg-transparent"
        aria-label="Menú"
      >
        <div className="flex h-full flex-col px-6 pt-4 pb-10">
          <div className="flex justify-end">
            <button type="button" onClick={() => setMenu(false)} aria-label="Cerrar menú" className="grid size-11 place-items-center rounded-full bg-crema/10">
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <nav aria-label="Menú móvil" className="mt-6">
            <ul className="grid gap-1">
              <li>
                <Link href="/" onClick={(e) => navegar(e, "/")} className="font-display block py-2 text-4xl font-semibold">
                  El bosque
                </Link>
              </li>
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} onClick={(e) => navegar(e, n.href)} className="font-display block py-2 text-4xl font-semibold">
                    {n.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto grid gap-3">
            <button
              type="button"
              onClick={() => {
                setMenu(false);
                abrir("cartel");
              }}
              className="rounded-full bg-crema px-6 py-3.5 font-bold text-musgo"
            >
              Cómo llegar
            </button>
            <a href={TIENDA_ONLINE} target="_blank" rel="noopener noreferrer" className="rounded-full bg-yaco-rojo px-6 py-3.5 text-center font-bold text-white">
              Tienda online
            </a>
          </div>
        </div>
      </dialog>
    </header>
  );
}
