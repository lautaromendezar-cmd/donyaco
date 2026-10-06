// localStorage puede no existir o tirar (modo privado, datos bloqueados): todo pasa por acá.

export function leer<T>(clave: string, porDefecto: T): T {
  try {
    const crudo = window.localStorage.getItem(clave);
    return crudo === null ? porDefecto : (JSON.parse(crudo) as T);
  } catch {
    return porDefecto;
  }
}

export function guardar<T>(clave: string, valor: T): void {
  try {
    window.localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // Sin almacenamiento la página sigue funcionando; sólo no recuerda.
  }
}

export const CLAVES = {
  movimientoReducido: "donyaco:movimiento-reducido",
  sonido: "donyaco:sonido",
} as const;
