import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Sin conexión", robots: { index: false } };

export default function Offline() {
  return (
    <section className="mx-auto flex min-h-[90svh] max-w-3xl flex-col items-start justify-center px-5 pt-28 sm:px-8">
      <p className="text-7xl">📡</p>
      <h1 className="display mt-4 text-[clamp(4rem,14vw,9rem)]">
        Sin <span className="text-hot">señal</span>
      </h1>
      <p className="mt-4 text-xl font-medium">Tu plan y las promos que ya abriste siguen aquí. Lo demás carga en cuanto vuelvas a tener internet.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/mi-cumple" className="btn btn-acid">
          Ver mi plan
        </Link>
        <Link href="/promos" className="btn btn-paper">
          Promos guardadas
        </Link>
      </div>
    </section>
  );
}
