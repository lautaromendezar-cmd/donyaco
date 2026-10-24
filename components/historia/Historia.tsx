"use client";
// "Nuestra historia": de un almacén de 1938 al Bosque Urbano.
// La página toma color a medida que se baja: cada foto entra más gris de lo que termina, y el gris
// final de cada capítulo es menor que el del anterior. 1938 queda en blanco y negro; 2026, a todo color.
// Todas las fotos son públicas (redes oficiales, Street View, prensa) y quedan a la espera de las
// originales de la familia. Lo que no está confirmado lleva <AConfirmar />.
import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const VEREDA = [
  { fecha: "2013-10", texto: "Octubre de 2013" },
  { fecha: "2014-03", texto: "Marzo de 2014" },
  { fecha: "2014-07", texto: "Julio de 2014" },
  { fecha: "2015-06", texto: "Junio de 2015" },
  { fecha: "2017-08", texto: "Agosto de 2017" },
  { fecha: "2019-05", texto: "Mayo de 2019" },
  { fecha: "2021-11", texto: "Noviembre de 2021" },
  { fecha: "2022-10", texto: "Octubre de 2022" },
  { fecha: "2023-03", texto: "Marzo de 2023" },
  { fecha: "2024-06", texto: "Junio de 2024" },
];

const LOCALES = [
  { anio: "1938", nombre: "Artigas", barrio: "Villa Pueyrredón", direccion: "Artigas 4721", foto: "/historia/artigas-hoy.webp", href: "/sucursales/artigas", w: 1080, h: 1267 },
  { anio: "2011", nombre: "Olazábal", barrio: "Villa Urquiza", direccion: "Av. Olazábal 5334", foto: "/historia/olazabal-fachada.webp", href: "/sucursales/villa-urquiza", w: 1200, h: 1600 },
  { anio: "2026", nombre: "Bosque Urbano", barrio: "Belgrano", direccion: "Av. Luis María Campos 1461", foto: "/historia/bosque-fachada.webp", href: "/sucursales/bosque-urbano", w: 1200, h: 1600 },
];

/** Marca discreta para los datos que todavía tiene que confirmar la familia. */
function AConfirmar({ nota }: { nota?: string }) {
  return (
    <span title={nota} className="ml-1.5 inline-flex translate-y-[-0.15em] items-center gap-1 rounded-full bg-dorado px-2 py-0.5 align-middle font-sans text-[0.7rem] font-bold tracking-wide text-tinta not-italic">
      <span className="size-1.5 rounded-full bg-yaco-rojo" aria-hidden="true" />a confirmar
    </span>
  );
}

/** Foto que entra en gris y se colorea hasta su valor final (`gris`, de 0 a 1). */
function Foto({
  src,
  alt,
  w,
  h,
  gris,
  className = "",
  pos,
  prioridad,
}: {
  src: string;
  alt: string;
  w: number;
  h: number;
  gris: number;
  className?: string;
  pos?: string;
  prioridad?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={w}
      height={h}
      loading={prioridad ? "eager" : "lazy"}
      fetchPriority={prioridad ? "high" : undefined}
      decoding="async"
      data-gris={gris}
      style={{ "--g": gris, objectPosition: pos } as React.CSSProperties}
      className={`foto-tiempo h-full w-full object-cover ${className}`}
    />
  );
}

function Epigrafe({ children, claro }: { children: React.ReactNode; claro?: boolean }) {
  return <figcaption className={`mt-3 max-w-md text-sm leading-snug ${claro ? "text-crema/70" : "text-corteza/80"}`}>{children}</figcaption>;
}

function Recuerdo({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="font-display text-[clamp(1.5rem,4.2vw,2.4rem)] leading-[1.15] font-medium text-tinta italic">
      «{children}»
    </blockquote>
  );
}

export function Historia() {
  const raiz = useRef<HTMLElement>(null);
  const vereda = useRef<HTMLDivElement>(null);
  const reducido = useReducedMotion();

  useGSAP(
    () => {
      if (reducido) return;

      // Cada foto entra más gris de lo que termina: el color "llega" mientras sube.
      gsap.utils.toArray<HTMLElement>(".foto-tiempo").forEach((el) => {
        const final = Number(el.dataset.gris ?? 0);
        if (el.closest("[data-vereda]")) return;
        gsap.fromTo(
          el,
          { "--g": Math.min(1, final + 0.6) },
          { "--g": final, ease: "none", immediateRender: false, scrollTrigger: { trigger: el, start: "top 95%", end: "center 55%", scrub: true } },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-sube]").forEach((el) => {
        gsap.from(el, { y: 36, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
      });

      // La vereda de Artigas: el scroll pasa las fotos de Street View de 2013 a 2024.
      const v = vereda.current;
      if (v) {
        const fotos = v.querySelectorAll<HTMLElement>("[data-cuadro]");
        const fecha = v.querySelector<HTMLElement>("[data-fecha]");
        const marcas = v.querySelectorAll<HTMLElement>("[data-marca]");
        let actual = -1;
        const mostrar = (i: number) => {
          if (i === actual) return;
          actual = i;
          fotos.forEach((f, j) => (f.dataset.activa = String(j === i)));
          marcas.forEach((m, j) => (m.dataset.activa = String(j <= i)));
          if (fecha) fecha.textContent = VEREDA[i].texto;
        };
        mostrar(0);
        ScrollTrigger.create({
          trigger: v,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (st) => mostrar(Math.min(VEREDA.length - 1, Math.floor(st.progress * VEREDA.length))),
        });
      }
    },
    { scope: raiz, dependencies: [reducido], revertOnUpdate: true },
  );

  return (
    <main ref={raiz} className="historia">
      {/* ---------- Portada: 1938 ---------- */}
      <section className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-tinta-noche text-crema">
        <div className="absolute inset-0 -z-10">
          <Foto
            src="/historia/don-yaco-mostrador.webp"
            alt="Foto en blanco y negro: Don Yaco con guardapolvo, detrás del mostrador de su almacén, con una balanza y una caja registradora."
            w={1080}
            h={508}
            gris={1}
            pos="64% 30%"
            prioridad
            className="opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-tinta-noche via-tinta-noche/55 to-tinta-noche/10" />
        </div>
        <div className="mx-auto w-full max-w-6xl px-5 pt-[calc(var(--header-alto)+2rem)] pb-28 md:px-10 md:pb-20">
          <p className="entra text-sm font-bold tracking-[0.2em] text-dorado uppercase">Nuestra historia</p>
          <h1 className="entra font-display mt-3 text-[clamp(4.6rem,19vw,13rem)] leading-[0.82] font-semibold tracking-[-0.02em]" style={{ animationDelay: "120ms" }}>
            Desde
            <br />
            1938
          </h1>
          <p className="entra mt-6 max-w-xl text-lg leading-relaxed text-crema/85 md:text-xl" style={{ animationDelay: "240ms" }}>
            Un almacén en Villa Pueyrredón, una golosinería en Villa Urquiza y un bosque en Belgrano. Tres generaciones de la misma familia detrás del mostrador.
          </p>
        </div>
      </section>

      {/* ---------- Primera generación ---------- */}
      <section className="bg-papel px-5 py-24 md:px-10 md:py-36">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-[1fr_1.1fr] md:items-end md:gap-16">
            <div data-sube>
              <p className="text-sm font-bold tracking-[0.2em] text-hoja-oscura uppercase">Primera generación</p>
              <h2 className="font-display mt-3 text-[clamp(2.6rem,7vw,5rem)] leading-[0.95] font-semibold text-tinta">
                El almacén de la calle Artigas
              </h2>
              <div className="mt-7 grid max-w-lg gap-4 text-lg leading-relaxed">
                <p>
                  En 1938, Don Yaco abrió un almacén en la calle Artigas, en Villa Pueyrredón. Atendía él, con su mujer, detrás de un mostrador con balanza, caja registradora y estantes hasta el techo.
                </p>
                <p>
                  El barrio le puso nombre propio: durante décadas fue, simplemente, «el almacén del barrio desde 1938».
                </p>
              </div>
            </div>
            <figure data-sube>
              <div className="aspect-[1400/1040] overflow-hidden rounded-[1.25rem]">
                <Foto src="/historia/almacen-2007.webp" alt="La fachada del almacén con persianas y rejas, en la calle Artigas." w={1400} h={1040} gris={0.85} />
              </div>
              <Epigrafe>El almacén de Artigas en 2007, en el blog del centenario de Villa Pueyrredón.</Epigrafe>
            </figure>
          </div>

          <div className="mt-24 md:mt-32">
            <p className="text-sm font-bold tracking-[0.2em] text-corteza uppercase" data-sube>
              Lo que se acuerda el barrio
            </p>
            <div className="mt-8 grid gap-12 md:grid-cols-2 md:gap-x-16">
              <figure data-sube>
                <Recuerdo>Don Yaco y su mujer atendían, siempre repleto de gente y ese olor a chocolate que había en el negocio</Recuerdo>
              </figure>
              <figure data-sube className="md:mt-24">
                <Recuerdo>Me acuerdo de DonYaco original ...fumaba en pipa.....yo era muuuuy chiquitaaa</Recuerdo>
              </figure>
            </div>
            <p className="mt-10 text-sm text-corteza/80" data-sube>
              Comentarios de vecinos en el Instagram de Don Yaco Artigas, octubre de 2026.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Segunda generación: la vereda ---------- */}
      <section className="bg-papel px-5 pb-10 md:px-10">
        <div className="mx-auto max-w-6xl" data-sube>
          <p className="text-sm font-bold tracking-[0.2em] text-hoja-oscura uppercase">Segunda generación</p>
          <h2 className="font-display mt-3 max-w-3xl text-[clamp(2.6rem,7vw,5rem)] leading-[0.95] font-semibold text-tinta">
            Dany y la misma vereda
          </h2>
          <p className="mt-7 max-w-xl text-lg leading-relaxed">
            Con Dany, el hijo<AConfirmar nota="Parentesco con Don Yaco y año en que tomó el local." />, el almacén se volvió autoservicio y después golosinería<AConfirmar nota="¿En qué año pasó a autoservicio y a golosinería?" />. Siempre en el mismo lugar. Bajá despacio: son diez fotos de la misma vereda.
          </p>
        </div>
      </section>

      {reducido ? (
        <section className="bg-papel pb-24" aria-label="La vereda de Artigas, de 2013 a 2024">
          <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:px-10">
            {VEREDA.map((v, i) => (
              <li key={v.fecha} className="w-[80vw] max-w-xl shrink-0 snap-start">
                <figure>
                  <div className="aspect-[1024/640] overflow-hidden rounded-[1.25rem]">
                    <Foto src={`/historia/artigas/${v.fecha}.webp`} alt={`La fachada de Don Yaco en Artigas, ${v.texto.toLowerCase()}.`} w={1024} h={640} gris={0.55 - (0.55 * i) / (VEREDA.length - 1)} />
                  </div>
                  <Epigrafe>{v.texto}</Epigrafe>
                </figure>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section ref={vereda} data-vereda className="relative h-[340svh] bg-papel" aria-label="La vereda de Artigas, de 2013 a 2024">
          <div className="sticky top-0 flex h-[100svh] flex-col justify-center px-5 pt-[var(--header-alto)] md:px-10">
            <div className="mx-auto w-full max-w-6xl">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-tinta/10 md:aspect-[1024/640]">
                {VEREDA.map((v, i) => (
                  <div key={v.fecha} data-cuadro data-activa={i === 0} className="vereda-cuadro absolute inset-0">
                    <Foto src={`/historia/artigas/${v.fecha}.webp`} alt={i === 0 ? "La fachada de Don Yaco en Artigas, vista desde la calle a lo largo de los años." : ""} w={1024} h={640} gris={0.55 - (0.55 * i) / (VEREDA.length - 1)} />
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-4">
                <p data-fecha className="font-display text-[clamp(1.6rem,5vw,3rem)] leading-none font-semibold text-tinta" aria-live="off">
                  {VEREDA[0].texto}
                </p>
                <p className="hidden text-right text-sm text-corteza/80 sm:block">Artigas 4721 · Street View</p>
              </div>
              <ol className="mt-4 flex gap-1.5" aria-hidden="true">
                {VEREDA.map((v, i) => (
                  <li key={v.fecha} data-marca data-activa={i === 0} className="vereda-marca h-1.5 flex-1 rounded-full" />
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

      <section className="bg-papel px-5 pt-10 pb-24 md:px-10 md:pb-36">
        <figure className="mx-auto max-w-6xl" data-sube>
          <div className="aspect-[1080/556] overflow-hidden rounded-[1.25rem]">
            <Foto src="/historia/familia-hoy.webp" alt="Cinco hombres sonríen a cámara entre las góndolas del local de Artigas; uno toma mate." w={1080} h={556} gris={0.25} />
          </div>
          <Epigrafe>
            El local de Artigas en octubre de 2026. Ochenta y ocho años después, el mismo lugar y la misma familia.
            <AConfirmar nota="¿Quiénes son los de la foto?" />
          </Epigrafe>
        </figure>
      </section>

      {/* ---------- Tercera generación ---------- */}
      <section className="bg-crema px-5 py-24 md:px-10 md:py-36">
        <div className="mx-auto max-w-6xl">
          <div data-sube>
            <p className="text-sm font-bold tracking-[0.2em] text-yaco-rojo uppercase">Tercera generación</p>
            <h2 className="font-display mt-3 max-w-3xl text-[clamp(2.6rem,7vw,5rem)] leading-[0.95] font-semibold text-tinta">
              Allen y Olazábal
            </h2>
          </div>

          <div className="mt-12 grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
            <figure className="md:row-span-2" data-sube>
              <div className="aspect-[3/4] overflow-hidden rounded-[1.25rem]">
                <Foto src="/historia/olazabal-fachada.webp" alt="La fachada de Olazábal: toldo rayado rojo y blanco, cartel rojo de Don Yaco y columnas de bastón de caramelo." w={1200} h={1600} gris={0.12} />
              </div>
              <Epigrafe>Av. Olazábal 5334, Villa Urquiza.</Epigrafe>
            </figure>

            <div className="grid content-start gap-5 text-lg leading-relaxed" data-sube>
              <p>
                Allen, el nieto de Don Yaco, tenía 18 años cuando abrió Olazábal, cerca de 2011<AConfirmar nota="Año exacto de apertura de Olazábal." />. Al principio estaba prácticamente solo. Sus padres iban a darle una mano.
              </p>
              <blockquote className="font-display my-4 text-[clamp(1.6rem,4vw,2.5rem)] leading-[1.12] font-medium text-tinta italic">
                «Empezó como un proyecto familiar con mis padres. No teníamos empleados: éramos una pequeña familia.»
              </blockquote>
              <p>
                Olazábal se hizo conocido en el barrio y después en todo el país: los videos del local pasaron los tres millones de reproducciones.
              </p>
            </div>

            <div className="grid grid-cols-[1.4fr_1fr] gap-4" data-sube>
              <figure>
                <div className="aspect-[1536/972] overflow-hidden rounded-[1.25rem]">
                  <Foto src="/historia/olazabal-cartel-2021.webp" alt="El cartel de Don Yaco con el monograma DY y un conejo de Pascua." w={1536} h={972} gris={0.12} />
                </div>
                <Epigrafe>El cartel, en 2021.</Epigrafe>
              </figure>
              <figure>
                <div className="aspect-[9/14] overflow-hidden rounded-[1.25rem]">
                  <Foto src="/historia/olazabal-interior.webp" alt="El interior de Olazábal, con el techo cubierto de huevos de Pascua." w={1080} h={1920} gris={0.12} />
                </div>
                <Epigrafe>Pascua de 2023.</Epigrafe>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- 2026: el Bosque Urbano ---------- */}
      <section className="bg-musgo-noche px-5 py-24 text-crema md:px-10 md:py-36">
        <div className="mx-auto max-w-6xl">
          <div data-sube>
            <p className="text-sm font-bold tracking-[0.2em] text-dorado uppercase">2026</p>
            <h2 className="font-display mt-3 max-w-3xl text-[clamp(2.6rem,7vw,5rem)] leading-[0.95] font-semibold">El Bosque Urbano</h2>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-crema/85">
              Después de quince años en Olazábal, Allen fue por algo más grande: un local entero convertido en bosque, en Belgrano. El árbol empezó en un taller, en blanco, y llegó al local en agosto.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-4 md:gap-8">
            <figure data-sube>
              <div className="aspect-[4/5] overflow-hidden rounded-[1.25rem]">
                <Foto src="/historia/bosque-obra.webp" alt="El esqueleto blanco del árbol, todavía sin pintar, en el taller de escenografía." w={1080} h={1344} gris={0} />
              </div>
              <Epigrafe claro>En el taller.</Epigrafe>
            </figure>
            <figure data-sube className="mt-16 md:mt-28">
              <div className="aspect-[4/5] overflow-hidden rounded-[1.25rem]">
                <Foto src="/historia/bosque-arbol.webp" alt="El árbol terminado en el centro del local, con tronco trenzado, base de piedras y hongos." w={1080} h={1920} gris={0} pos="50% 60%" />
              </div>
              <Epigrafe claro>Agosto, en el local.</Epigrafe>
            </figure>
          </div>

          <blockquote className="font-display mx-auto mt-24 max-w-4xl text-center text-[clamp(1.9rem,5.4vw,3.6rem)] leading-[1.08] font-medium italic md:mt-32" data-sube>
            «Esto no es solo un nuevo local. Es todo el camino recorrido hecho realidad.»
          </blockquote>
          <p className="mt-5 text-center text-sm text-crema/70" data-sube>
            Del anuncio del Bosque Urbano, abril de 2026.
          </p>

          <figure className="mx-auto mt-20 max-w-md md:mt-28" data-sube>
            <div className="aspect-[4/5] overflow-hidden rounded-[1.25rem]">
              <Foto src="/historia/bosque-inauguracion.webp" alt="Allen, con los brazos abiertos, en la puerta del Bosque Urbano el día de la inauguración." w={1080} h={1920} gris={0} pos="50% 35%" />
            </div>
            <Epigrafe claro>
              Sábado 19 de septiembre de 2026, el día que abrió. Escenografía de Pitu<AConfirmar nota="Grafía del nombre y del estudio, para los créditos." />, mural de Noelia Fernández.
            </Epigrafe>
          </figure>
        </div>
      </section>

      {/* ---------- Cierre: tres locales ---------- */}
      <section className="bg-musgo-noche px-5 pb-28 text-crema md:px-10 md:pb-40">
        <div className="mx-auto max-w-6xl border-t border-crema/15 pt-20 md:pt-28">
          <h2 className="font-display max-w-3xl text-[clamp(2.4rem,6.5vw,4.6rem)] leading-[0.95] font-semibold" data-sube>
            Tres locales,
            <br />
            una familia
          </h2>
          <ul className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-5">
            {LOCALES.map((l) => (
              <li key={l.nombre} data-sube>
                <Link href={l.href} className="group block">
                  <div className="aspect-[3/4] overflow-hidden rounded-[1.25rem]">
                    <Foto src={l.foto} alt={`La fachada de Don Yaco ${l.nombre}.`} w={l.w} h={l.h} gris={0} className="transition-transform duration-700 ease-[var(--ease-cuento)] group-hover:scale-[1.04]" />
                  </div>
                  <p className="font-display mt-4 text-5xl leading-none font-semibold text-dorado">{l.anio}</p>
                  <p className="mt-2 text-xl font-bold">{l.nombre}</p>
                  <p className="text-crema/75">
                    {l.direccion} · {l.barrio}
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-24 grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end" data-sube>
            <blockquote className="font-display text-[clamp(1.8rem,4.6vw,3rem)] leading-[1.1] font-medium italic">
              «Este no va a ser mi último local.»
              <footer className="mt-3 font-sans text-base font-normal text-crema/70 not-italic">Allen, octubre de 2026.</footer>
            </blockquote>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link href="/" className="rounded-full bg-crema px-6 py-3.5 font-bold text-musgo">
                Entrá al bosque
              </Link>
              <Link href="/sucursales/bosque-urbano" className="rounded-full bg-yaco-rojo px-6 py-3.5 font-bold text-white">
                Cómo llegar
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
