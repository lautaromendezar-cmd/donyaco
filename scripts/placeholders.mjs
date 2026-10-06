// Genera los placeholders de public/scene/ con los nombres exactos de la tabla de assets.
// Cada archivo lleva su propio nombre escrito, para saber cuál falta reemplazar.
// Uso: node scripts/placeholders.mjs   (necesita ffmpeg en el PATH)
// Para reemplazarlos alcanza con pisar los archivos (ver scripts/procesar-videos.sh).

import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const SCENE = join(ROOT, "public", "scene");
const TMP = join(tmpdir(), "donyaco-placeholders");
mkdirSync(TMP, { recursive: true });
for (const d of ["", "recorrido", "recorrido-mobile", "recortes"]) mkdirSync(join(SCENE, d), { recursive: true });
mkdirSync(join(ROOT, "public", "audio"), { recursive: true });

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function labelSvg(w, h, { bg = "none", title, sub = "", color = "#FFF6E8", extra = "" }) {
  const size = Math.round(Math.min(w, h) * 0.06);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  ${bg === "none" ? "" : `<rect width="100%" height="100%" fill="${bg}"/>`}
  ${extra}
  <text x="50%" y="48%" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${size}" fill="${color}">${esc(title)}</text>
  <text x="50%" y="${48 + 7}%" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.round(size * 0.55)}" fill="${color}" opacity="0.75">${esc(sub)}</text>
</svg>`);
}

async function poster(name, w, h, bg) {
  await sharp(labelSvg(w, h, { bg, title: name, sub: `PLACEHOLDER · ${w}×${h}` }))
    .webp({ quality: 80 })
    .toFile(join(SCENE, name));
  console.log("poster", name);
}

function ff(args) {
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });
}

// Video de prueba: fondo plano + nombre del archivo + un punto que se mueve (para ver que reproduce).
async function video(base, w, h, dur, bg, { toCream = false } = {}) {
  const label = join(TMP, `${base}.png`);
  await sharp(labelSvg(w, h, { title: `${base}.webm / .mp4`, sub: `PLACEHOLDER · ${w}×${h} · ${dur} s` })).png().toFile(label);
  const dot = Math.round(Math.min(w, h) * 0.05);
  let filter =
    `[0:v][1:v]overlay=0:0[a];` +
    `color=c=0x4FD6FF:s=${dot}x${dot}:d=${dur}[d];` +
    `[a][d]overlay=x='(W-w)/2+(W*0.3)*sin(2*PI*t/${dur})':y='H*0.7'`;
  if (toCream) {
    // La puerta termina en crema #FFF6E8 y lo sostiene el último medio segundo.
    filter += `[b];color=c=0xFFF6E8:s=${w}x${h}:d=${dur},format=rgba,fade=in:st=2.2:d=2.3:alpha=1[c];[b][c]overlay=0:0`;
  }
  const inputs = ["-f", "lavfi", "-i", `color=c=${bg}:s=${w}x${h}:d=${dur}:r=24`, "-loop", "1", "-t", String(dur), "-i", label];
  ff([...inputs, "-filter_complex", filter, "-an", "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "40", "-deadline", "realtime", "-cpu-used", "8", "-row-mt", "1", join(SCENE, `${base}.webm`)]);
  ff([...inputs, "-filter_complex", filter, "-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "30", "-pix_fmt", "yuv420p", "-movflags", "+faststart", join(SCENE, `${base}.mp4`)]);
  console.log("video", base);
}

// Secuencia del recorrido: el color avanza del pasillo (madera) al árbol (musgo), con barra de progreso.
async function frames(dir, count, w, h) {
  const from = [0xd9, 0xa8, 0x6c];
  const to = [0x2f, 0x4a, 0x2a];
  for (let i = 1; i <= count; i++) {
    const t = (i - 1) / (count - 1);
    const c = from.map((v, k) => Math.round(v + (to[k] - v) * t));
    const bg = `rgb(${c.join(",")})`;
    const name = `frame-${String(i).padStart(4, "0")}.webp`;
    const bar = `<rect x="${w * 0.1}" y="${h * 0.8}" width="${w * 0.8}" height="${h * 0.012}" fill="#FFF6E8" opacity="0.3"/>
      <rect x="${w * 0.1}" y="${h * 0.8}" width="${w * 0.8 * t}" height="${h * 0.012}" fill="#FFC861"/>`;
    await sharp(labelSvg(w, h, { bg, title: `${dir}/${name}`, sub: `PLACEHOLDER · ${i}/${count}`, extra: bar }))
      .webp({ quality: 60 })
      .toFile(join(SCENE, dir, name));
  }
  console.log("frames", dir, count);
}

async function recorte(name, w, h, shape) {
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${shape}
    <text x="50%" y="62%" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${Math.round(w * 0.07)}" fill="#FFF6E8">${esc(name)}</text></svg>`);
  await sharp(svg).webp({ quality: 85, alphaQuality: 90 }).toFile(join(SCENE, "recortes", name));
  console.log("recorte", name);
}

const only = process.argv[2];

if (!only || only === "posters") {
  await poster("hero-mobile-poster.webp", 1080, 1920, "#2F4A2A");
  await poster("hero-desktop-poster.webp", 1920, 1080, "#2F4A2A");
}
if (!only || only === "videos") {
  await video("hero-mobile", 1080, 1920, 8, "0x2F4A2A");
  await video("hero-desktop", 1920, 1080, 8, "0x2F4A2A");
  await video("puerta", 1920, 1080, 5, "0x6B4226", { toCream: true });
}
if (!only || only === "frames") {
  await frames("recorrido", 120, 1920, 1080);
  await frames("recorrido-mobile", 60, 720, 1280);
}
if (!only || only === "recortes") {
  await recorte("tronco.webp", 600, 1400,
    `<path d="M220 0 C200 400 160 900 60 1400 L540 1400 C440 900 400 400 380 0 Z" fill="#6B4226"/>`);
  await recorte("hongo-1.webp", 700, 700,
    `<rect x="290" y="330" width="120" height="370" rx="40" fill="#FFF6E8"/>
     <path d="M30 380 C30 120 670 120 670 380 Z" fill="#7A1F3D"/>
     <circle cx="230" cy="250" r="34" fill="#FFF6E8"/><circle cx="420" cy="220" r="26" fill="#FFF6E8"/><circle cx="540" cy="310" r="22" fill="#FFF6E8"/>`);
  await recorte("hongo-2.webp", 500, 600,
    `<rect x="200" y="280" width="100" height="320" rx="34" fill="#FFF6E8"/>
     <path d="M20 320 C20 90 480 90 480 320 Z" fill="#C8202A"/>
     <circle cx="150" cy="210" r="18" fill="#fff"/><circle cx="280" cy="170" r="14" fill="#fff"/><circle cx="380" cy="250" r="16" fill="#fff"/><circle cx="220" cy="280" r="12" fill="#fff"/>`);
}
if (!only || only === "audio") {
  // Viento suave (ruido marrón filtrado). Reemplazar por una grabación real de bosque.
  ff(["-f", "lavfi", "-i", "anoisesrc=color=brown:amplitude=0.5:d=24", "-af",
    "lowpass=f=700,highpass=f=80,volume=0.6,afade=in:d=2,afade=out:st=22:d=2",
    "-ac", "1", "-b:a", "64k", join(ROOT, "public", "audio", "bosque.mp3")]);
  console.log("audio bosque.mp3");
}

rmSync(TMP, { recursive: true, force: true });
