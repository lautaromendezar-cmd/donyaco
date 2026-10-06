import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalogo } from "@/lib/catalogo";
import { Proximamente } from "@/components/ui/Proximamente";

export async function generateStaticParams() {
  return (await catalogo.sucursales()).map((s) => ({ slug: s.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/sucursales/[slug]">): Promise<Metadata> {
  const s = await catalogo.sucursal((await params).slug);
  return { title: s ? `${s.nombre} · ${s.barrio}` : "Sucursal" };
}

export default async function Page({ params }: PageProps<"/sucursales/[slug]">) {
  const s = await catalogo.sucursal((await params).slug);
  if (!s) notFound();
  return <Proximamente bajada={`${s.barrio} · ${s.direccion}`} titulo={s.nombre} texto={s.descripcion} />;
}
