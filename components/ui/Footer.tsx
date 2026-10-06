import { REDES, SUCURSALES, TIENDA_ONLINE } from "@/lib/catalogo";
import { Horarios } from "@/components/scene/HotspotPanel";
import { MotionToggle } from "./MotionToggle";

export function Footer() {
  return (
    <footer className="bg-musgo-noche px-5 pt-16 pb-28 text-crema md:px-10 md:pb-14">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-don-yaco.svg" alt="Don Yaco Golosinería" width={160} height={60} className="h-14 w-auto rounded-2xl bg-crema px-3 py-1" loading="lazy" />
          <p className="font-display mt-5 text-3xl font-semibold">Endulzando tus días</p>
          <p className="mt-2 max-w-xs text-crema/75">Golosinería en Belgrano y Villa Urquiza.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <a href={REDES.instagram} target="_blank" rel="noopener noreferrer" className="rounded-full bg-crema/10 px-4 py-2 font-bold hover:bg-crema/20">
              Instagram
            </a>
            <a href={REDES.tiktok} target="_blank" rel="noopener noreferrer" className="rounded-full bg-crema/10 px-4 py-2 font-bold hover:bg-crema/20">
              TikTok
            </a>
            <a href={TIENDA_ONLINE} target="_blank" rel="noopener noreferrer" className="rounded-full bg-yaco-rojo px-4 py-2 font-bold text-white">
              Tienda online
            </a>
          </div>
          <p className="mt-3 text-sm text-crema/60">@donyacogolosineria</p>
        </div>

        {SUCURSALES.map((s) => (
          <div key={s.slug}>
            <p className="text-sm font-bold tracking-[0.16em] text-dorado uppercase">{s.barrio}</p>
            <h2 className="font-display mt-1 text-2xl font-semibold">{s.nombreCorto}</h2>
            <p className="mt-2">
              {s.direccion}, {s.localidad}
            </p>
            <div className="text-crema/85">
              <Horarios horarios={s.horarios} claro />
            </div>
            <a href={s.googleMaps} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block font-bold text-dorado underline decoration-2 underline-offset-4">
              Cómo llegar
            </a>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-14 flex max-w-6xl flex-col gap-6 border-t border-crema/15 pt-8 md:flex-row md:items-center md:justify-between">
        <MotionToggle />
        <p className="text-sm text-crema/60">© {new Date().getFullYear()} Don Yaco Golosinería</p>
      </div>
    </footer>
  );
}
