# Don Yaco · El Bosque Encantado

Web demo de Don Yaco Golosinería (Bosque Urbano en Belgrano y Villa Urquiza). Complementa la Tienda Nube de
`donyacogolosineria.com.ar`: todas las compras terminan ahí o en WhatsApp.

Next.js 16 (App Router) · Tailwind v4 · GSAP + ScrollTrigger · todo estático, sin backend.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
```

## Estado

**Fase 1 (el momento wow): hecha.**
- Header y footer, con el toggle "Reducir animaciones"
- Escena de la home:
  - poster y luego video, luces del árbol, polvo de hada, hotspots con panel y sonido ambiente
  - recorrido por scroll en canvas
  - tarjetas con parallax de recortes
  - transición puerta
- Botón flotante de WhatsApp con intenciones y "Cómo llegar" fijo en mobile.

Las rutas de las fases 2 y 3 (`/sucursales/*`, `/arma-tu-caja`, `/cumpleanos`, `/empresas`, `/atracciones`,
`/visita`, `/pasaporte`) existen como páginas "en armado" para que ningún hotspot dé 404.

El sitio tiene `noindex` mientras sea demo (en `app/layout.tsx`).

## Reemplazar los placeholders

Todo lo de `public/scene/` es placeholder: cada archivo lleva su nombre escrito. Para reemplazarlos alcanza con
pisar los archivos con el mismo nombre. Los clips de Seedance se procesan así:

```bash
bash scripts/procesar-videos.sh <carpeta-con-los-clips>
```

El script espera `A-arbol.mp4`, `B-mural.mp4`, `C-recorrido.mp4`, `C-recorrido-9x16.mp4` y `D-puerta.mp4`. Con eso
genera los WebM y MP4 sin audio, los posters WebP y las secuencias de frames del recorrido (120 en desktop y 60 en
mobile).

| Archivo | Qué es |
|---|---|
| `scene/hero-mobile.webm/.mp4` + `hero-mobile-poster.webp` | Loop 9:16 del árbol (1080×1920) |
| `scene/hero-desktop.webm/.mp4` + `hero-desktop-poster.webp` | Loop 16:9 del mural y la puerta (1920×1080) |
| `scene/recorrido/frame-0001…0120.webp` | Recorrido por scroll, desktop |
| `scene/recorrido-mobile/frame-0001…0060.webp` | Recorrido por scroll, mobile (la mitad de frames, 720×1280) |
| `scene/puerta.webm/.mp4` | La puerta se abre y termina en crema `#FFF6E8` |
| `scene/recortes/tronco.webp`, `hongo-1.webp`, `hongo-2.webp` | Recortes PNG/WebP con fondo transparente |
| `brand/logo-don-yaco.svg` | Logo (placeholder tipográfico) |
| `audio/bosque.mp3` | Sonido ambiente (hoy es ruido de viento sintético) |
| `og.jpg` | Imagen para compartir por WhatsApp (1200×630) |

Con los videos reales hay que ajustar a mano tres cosas:
- `data/hotspots.json`: posición de cada hotspot, en % del cuadro del video y separada para vertical y horizontal.
- `data/escena.json`: posición de las luces del árbol.
- `data/escena.json`: cantidad de frames, si cambia.

`node scripts/placeholders.mjs` regenera los placeholders.

## Datos

- `data/sucursales.json`: horarios con `confirmado: false`, que se muestran como "Horario a confirmar".
- `data/hotspots.json`: textos de cada panel.
- `lib/catalogo.ts`: capa de datos. Hoy lee los JSON; está pensada para leer la API de Tienda Nube más adelante.

## Variables de entorno

Ver `.env.example`.

| Variable | Qué es |
|---|---|
| `NEXT_PUBLIC_WHATSAPP` | Número sin `+`. Si falta, se usa un placeholder |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio, para Open Graph |
