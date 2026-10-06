// El número real va en NEXT_PUBLIC_WHATSAPP (formato internacional sin +, ej. 5491112345678).
export const WHATSAPP_NUMERO = process.env.NEXT_PUBLIC_WHATSAPP || "5491100000000";
export const WHATSAPP_ES_PLACEHOLDER = !process.env.NEXT_PUBLIC_WHATSAPP;

export type Intencion = "cumple" | "regalo" | "mayorista" | "consulta";

export const INTENCIONES: { id: Intencion; texto: string; mensaje: string }[] = [
  {
    id: "cumple",
    texto: "Quiero cotizar un cumpleaños",
    mensaje: "¡Hola Don Yaco! Quiero cotizar una mesa dulce para un cumpleaños.",
  },
  {
    id: "regalo",
    texto: "Quiero una caja regalo",
    mensaje: "¡Hola Don Yaco! Quiero armar una caja regalo.",
  },
  {
    id: "mayorista",
    texto: "Soy kiosco y quiero precios mayoristas",
    mensaje: "¡Hola Don Yaco! Tengo un kiosco y quiero conocer los precios mayoristas.",
  },
  {
    id: "consulta",
    texto: "Tengo una consulta",
    mensaje: "¡Hola Don Yaco! Tengo una consulta.",
  },
];

export function linkWhatsApp(mensaje: string): string {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
}

export function linkIntencion(id: Intencion): string {
  const intencion = INTENCIONES.find((i) => i.id === id) ?? INTENCIONES[3];
  return linkWhatsApp(intencion.mensaje);
}
