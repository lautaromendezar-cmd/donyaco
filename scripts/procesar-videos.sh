#!/usr/bin/env bash
# Convierte los clips finales de Seedance en los archivos que usa la web (pisa los placeholders).
# Uso: bash scripts/procesar-videos.sh <carpeta-con-los-clips>
# Nombres esperados en esa carpeta (los que falten se saltean):
#   A-arbol.mp4          9:16, loop 8 s  -> hero-mobile.webm/.mp4 + hero-mobile-poster.webp
#   B-mural.mp4          16:9, loop 8 s  -> hero-desktop.webm/.mp4 + hero-desktop-poster.webp
#   C-recorrido.mp4      16:9, 6 s       -> recorrido/frame-0001..0120.webp
#   C-recorrido-9x16.mp4 9:16, 6 s       -> recorrido-mobile/frame-0001..0060.webp
#   D-puerta.mp4         5 s, termina en crema -> puerta.webm/.mp4
# Objetivo de peso: 2-3 MB por video, sin audio. Si un WebM sale más pesado, subir el -crf.
set -euo pipefail
IN="${1:?Pasá la carpeta con los clips}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/scene"

webm() { ffmpeg -y -loglevel error -i "$1" -an -vf "scale=$3" -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -deadline good -cpu-used 2 "$2"; }
mp4()  { ffmpeg -y -loglevel error -i "$1" -an -vf "scale=$3" -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart "$2"; }
poster() { ffmpeg -y -loglevel error -i "$1" -vf "scale=$3" -frames:v 1 -c:v libwebp -quality 72 "$2"; }

if [ -f "$IN/A-arbol.mp4" ]; then
  webm "$IN/A-arbol.mp4" "$OUT/hero-mobile.webm" 720:-2
  mp4  "$IN/A-arbol.mp4" "$OUT/hero-mobile.mp4"  720:-2
  poster "$IN/A-arbol.mp4" "$OUT/hero-mobile-poster.webp" 1080:-2
  echo "hero mobile listo"
fi
if [ -f "$IN/B-mural.mp4" ]; then
  webm "$IN/B-mural.mp4" "$OUT/hero-desktop.webm" 1600:-2
  mp4  "$IN/B-mural.mp4" "$OUT/hero-desktop.mp4"  1600:-2
  poster "$IN/B-mural.mp4" "$OUT/hero-desktop-poster.webp" 1920:-2
  echo "hero desktop listo"
fi
if [ -f "$IN/C-recorrido.mp4" ]; then
  rm -f "$OUT"/recorrido/frame-*.webp
  # 6 s a 20 fps = 120 frames con velocidad constante.
  ffmpeg -y -loglevel error -i "$IN/C-recorrido.mp4" -vf "fps=20,scale=1600:-2" -frames:v 120 -c:v libwebp -quality 68 "$OUT/recorrido/frame-%04d.webp"
  echo "recorrido desktop: $(ls "$OUT"/recorrido | wc -l) frames"
fi
if [ -f "$IN/C-recorrido-9x16.mp4" ]; then
  rm -f "$OUT"/recorrido-mobile/frame-*.webp
  # Mobile: la mitad de frames y menor resolución.
  ffmpeg -y -loglevel error -i "$IN/C-recorrido-9x16.mp4" -vf "fps=10,scale=720:-2" -frames:v 60 -c:v libwebp -quality 62 "$OUT/recorrido-mobile/frame-%04d.webp"
  echo "recorrido mobile: $(ls "$OUT"/recorrido-mobile | wc -l) frames"
fi
if [ -f "$IN/D-puerta.mp4" ]; then
  webm "$IN/D-puerta.mp4" "$OUT/puerta.webm" 1280:-2
  mp4  "$IN/D-puerta.mp4" "$OUT/puerta.mp4"  1280:-2
  echo "puerta lista"
fi
ls -la "$OUT"
