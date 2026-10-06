import Link from "next/link";
import { linkIntencion, type Intencion } from "@/lib/whatsapp";

// Página puente para las secciones que se construyen en las próximas fases.
export function Proximamente({
  bajada,
  titulo,
  texto,
  intencion = "consulta",
}: {
  bajada: string;
  titulo: string;
  texto: string;
  intencion?: Intencion;
}) {
  return (
    <main className="relative flex min-h-[100svh] items-center overflow-hidden bg-crema px-5 pt-[calc(var(--header-alto)+3rem)] pb-28 md:px-10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/scene/recortes/hongo-2.webp" alt="" aria-hidden="true" width={500} height={600} className="pointer-events-none absolute -right-10 bottom-0 w-48 opacity-90 md:right-10 md:w-72" />
      <div className="relative mx-auto w-full max-w-3xl">
        <p className="text-sm font-bold tracking-[0.18em] text-hoja-oscura uppercase">{bajada}</p>
        <h1 className="font-display mt-2 text-[clamp(2.4rem,8vw,4.5rem)] leading-[0.98] font-semibold text-musgo">{titulo}</h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed">{texto}</p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-madera/25 px-4 py-2 text-sm font-bold text-corteza">
          <span className="size-2 rounded-full bg-dorado" aria-hidden="true" />
          Esta sección se está terminando de armar
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="rounded-full bg-musgo px-6 py-3.5 font-bold text-crema">
            Volver al bosque
          </Link>
          <a href={linkIntencion(intencion)} target="_blank" rel="noopener noreferrer" className="rounded-full bg-yaco-rojo px-6 py-3.5 font-bold text-white">
            Escribinos por WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
