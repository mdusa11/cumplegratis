import { jsonLd } from "@/lib/site";

export type QA = { q: string; a: string };

/** Preguntas frecuentes plegables con <details>: las respuestas siempre están en el HTML (Google las lee) y llevan su FAQPage. */
export function FaqList({ items, title = "Preguntas frecuentes", className }: { items: QA[]; title?: string; className?: string }) {
  if (!items.length) return null;
  return (
    <section className={className}>
      <h2 className="display text-4xl sm:text-5xl">{title}</h2>
      <div className="mt-6 space-y-3">
        {items.map((f) => (
          <details key={f.q} className="card group bg-paper p-5 open:bg-paper-2">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-lg font-bold">
              {f.q}
              <span aria-hidden className="mt-0.5 shrink-0 text-2xl leading-none transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-lg leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        })}
      />
    </section>
  );
}
