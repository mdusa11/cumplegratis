import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[90svh] max-w-5xl flex-col items-start justify-center px-5 pt-28 sm:px-8">
      <p className="mono-tag">Error 404</p>
      <h1 className="display mt-3 text-[clamp(4.5rem,16vw,13rem)]">
        Este regalo <span className="text-hot">no existe</span>
      </h1>
      <p className="mt-6 text-xl font-medium">Pero hay muchos otros esperándote.</p>
      <Link href="/promos" className="btn btn-acid mt-8">
        Ver todas las promos →
      </Link>
    </section>
  );
}
