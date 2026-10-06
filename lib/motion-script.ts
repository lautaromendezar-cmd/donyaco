// Corre inline en el <head>, antes del primer pintado (no puede vivir en un módulo "use client").
import { CLAVES } from "./storage";

const QUERY = "(prefers-reduced-motion: reduce)";

export const SCRIPT_MOVIMIENTO = `(function(){try{var m=window.matchMedia('${QUERY}').matches;var s=false;try{s=JSON.parse(localStorage.getItem('${CLAVES.movimientoReducido}'))===true}catch(e){}document.documentElement.dataset.motion=(m||s)?'reduced':'full'}catch(e){}})();`;
