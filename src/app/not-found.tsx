import type { Metadata } from "next";
import Link from "next/link";
import { SearchButton } from "@/components/SearchButton";

// Next ya emite robots noindex en el 404; repetirlo aquí duplicaba la etiqueta.
export const metadata: Metadata = { title: "Página no encontrada" };

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[90svh] max-w-5xl flex-col items-start justify-center px-5 pt-28 sm:px-8">
      <p className="mono-tag">Error 404</p>
      <h1 className="display mt-3 text-[clamp(4.5rem,16vw,13rem)]">
        Este regalo <span className="text-hot">no existe</span>
      </h1>
      <p className="mt-6 text-xl font-medium">Pero hay muchos otros esperándote.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <SearchButton />
        <Link href="/promos" className="btn btn-acid">
          Ver todas las promos →
        </Link>
      </div>
      <p className="mt-6 flex flex-wrap gap-x-6 text-lg font-bold">
        <Link href="/cumpleanos/" className="inline-block py-2 underline underline-offset-4 hover:text-hot">
          Promos por mes
        </Link>
        <Link href="/ciudades/" className="inline-block py-2 underline underline-offset-4 hover:text-hot">
          Promos por ciudad
        </Link>
      </p>
    </section>
  );
}
