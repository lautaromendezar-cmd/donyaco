"use client";
// Movimiento reducido = preferencia del sistema O toggle manual del footer.
// El script inline del <head> (ver SCRIPT_MOVIMIENTO) pone data-motion en <html> antes del primer
// pintado, así el CSS ya arranca quieto. Este módulo lo mantiene sincronizado después.
import { useSyncExternalStore } from "react";
import { CLAVES, guardar, leer } from "./storage";

const QUERY = "(prefers-reduced-motion: reduce)";
const EVENTO = "donyaco:movimiento";

export function sistemaReduce(): boolean {
  return typeof window !== "undefined" && window.matchMedia(QUERY).matches;
}

export function manualReduce(): boolean {
  return typeof window !== "undefined" && leer<boolean>(CLAVES.movimientoReducido, false);
}

function calcular(): boolean {
  return sistemaReduce() || manualReduce();
}

function aplicar() {
  document.documentElement.dataset.motion = calcular() ? "reduced" : "full";
}

export function setManualReduce(valor: boolean) {
  guardar(CLAVES.movimientoReducido, valor);
  aplicar();
  window.dispatchEvent(new Event(EVENTO));
}

function suscribir(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  const alCambiar = () => {
    aplicar();
    cb();
  };
  mq.addEventListener("change", alCambiar);
  window.addEventListener(EVENTO, cb);
  window.addEventListener("storage", alCambiar);
  return () => {
    mq.removeEventListener("change", alCambiar);
    window.removeEventListener(EVENTO, cb);
    window.removeEventListener("storage", alCambiar);
  };
}

/** true si hay que mostrar todo quieto. En el servidor devuelve true: lo seguro es no animar. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(suscribir, calcular, () => true);
}

export function useManualReduce(): boolean {
  return useSyncExternalStore(suscribir, manualReduce, () => false);
}

export function useSistemaReduce(): boolean {
  return useSyncExternalStore(suscribir, sistemaReduce, () => false);
}

/** Ahorro de datos activo: no se cargan videos. */
export function ahorroDeDatos(): boolean {
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(conn?.saveData);
}
