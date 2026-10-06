// Capa de datos. Hoy lee los JSON de data/; mañana puede leer la API de Tienda Nube
// (Products, Coupons, Locations) desde una API route con el token en variables de entorno,
// sin que cambien los componentes que la usan.
import sucursalesJson from "@/data/sucursales.json";
import hotspotsJson from "@/data/hotspots.json";
import escenaJson from "@/data/escena.json";

export type Horario = { dias: string; abre: string; cierra: string };

export type Sucursal = {
  slug: string;
  nombre: string;
  nombreCorto: string;
  barrio: string;
  direccion: string;
  localidad: string;
  coordenadas: { lat: number; lng: number; aproximadas: boolean };
  googleMaps: string;
  mapaEmbed: string;
  horarios: { confirmado: boolean; detalle: Horario[] };
  descripcion: string;
  destacado: string;
};

export type Punto = { x: number; y: number };

export type Hotspot = {
  id: string;
  etiqueta: string;
  titulo: string;
  bajada: string;
  texto: string[];
  lista?: string[];
  tipo?: "como-llegar";
  cta: { texto: string; href: string };
  whatsapp?: "cumple" | "regalo" | "mayorista" | "consulta";
  escondido?: boolean;
  tarjeta: string;
  posicion: { mobile: Punto | null; desktop: Punto | null };
};

export type Escena = typeof escenaJson;

export interface Catalogo {
  sucursales(): Promise<Sucursal[]>;
  sucursal(slug: string): Promise<Sucursal | undefined>;
}

const catalogoLocal: Catalogo = {
  async sucursales() {
    return sucursalesJson as Sucursal[];
  },
  async sucursal(slug) {
    return (sucursalesJson as Sucursal[]).find((s) => s.slug === slug);
  },
};

export const catalogo: Catalogo = catalogoLocal;

// Datos de la escena: son del sitio, no de la tienda, así que se leen directo.
export const SUCURSALES = sucursalesJson as Sucursal[];
export const HOTSPOTS = hotspotsJson.hotspots as Hotspot[];
export const ESCENA = escenaJson;

export const TIENDA_ONLINE = "https://donyacogolosineria.com.ar";
export const REDES = {
  instagram: "https://www.instagram.com/donyacogolosineria/",
  tiktok: "https://www.tiktok.com/@donyacogolosineria",
};
