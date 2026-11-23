import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { CONFIDENCE } from "@/lib/promo-meta";
import { stats } from "@/lib/promos";
import { LEGAL, SITE, STUDIO, clip, jsonLd, pageUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cómo verificamos cada promo",
  description: clip(`De dónde sale cada una de las ${stats.total} promos de cumpleaños de ${SITE.name}, qué significa cada nivel de confianza, cada cuánto las revisamos y cómo reportar un cambio.`),
  alternates: { canonical: "/como-verificamos" },
};

export default function VerifyPage() {
  return (
    <>
      <LegalPage
        kicker="Transparencia"
        title="Cómo verificamos cada promo"
        intro={
          <p>
            Una promo de cumpleaños que ya no existe te hace perder el tiempo. Por eso cada una de las {stats.total} que publicamos trae sus fuentes, un nivel de confianza y la fecha de la última revisión del sitio ({SITE.lastReview}).
          </p>
        }
        sections={[
          {
            id: "fuentes",
            title: "De dónde sale cada promo",
            body: (
              <>
                <p>Buscamos en este orden y nos quedamos con lo más confiable que encontremos:</p>
                <ul className="list-disc space-y-1 pl-6">
                  <li>El sitio oficial de la marca y sus términos y condiciones.</li>
                  <li>Publicaciones oficiales: redes sociales, correos del programa de lealtad y apps de la marca.</li>
                  <li>Prensa reciente que describe la promo cuando la marca no la detalla.</li>
                </ul>
                <p>Las fuentes de cada promo aparecen en su ficha, en la tarjeta «¿Qué tan segura es?».</p>
              </>
            ),
          },
          {
            id: "confianza",
            title: "Qué significa cada nivel de confianza",
            body: (
              <ul className="list-disc space-y-1 pl-6">
                {(Object.keys(CONFIDENCE) as (keyof typeof CONFIDENCE)[]).map((k) => (
                  <li key={k}>
                    <b>{CONFIDENCE[k].label}:</b> {CONFIDENCE[k].hint}
                  </li>
                ))}
              </ul>
            ),
          },
          {
            id: "revision",
            title: "Cada cuánto revisamos",
            body: (
              <>
                <p>Revisamos cada mes las promos más vistas. Las que publican fecha de fin desaparecen solas al vencer, sin esperar a que alguien lo note.</p>
                <p>Una revisión confirma que la promo sigue vigente, que el beneficio y los requisitos coinciden con la fuente y que la marca sigue operando en las ciudades que anunciamos.</p>
              </>
            ),
          },
          {
            id: "cambios",
            title: "Qué hacemos si algo cambia",
            body: <p>Si detectamos que un negocio cerró o que la marca ya no tiene la promo, la quitamos. Si cambió el beneficio, los requisitos o las ciudades, la corregimos y actualizamos su fuente.</p>,
          },
          {
            id: "reportar",
            title: "Cómo reportar un error",
            body: (
              <p>
                En cada ficha hay un botón «¿Cambió esta promo?» que nos avisa por WhatsApp. Para sugerir una promo nueva usa el <Link href="/promos#sugerir">formulario de sugerencias</Link>. También puedes escribir a <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> o visitar la página de <Link href="/contacto">contacto</Link>.
              </p>
            ),
          },
          {
            id: "independencia",
            title: "No estamos afiliados a las marcas",
            body: (
              <p>
                {SITE.name} es un producto de <a href={STUDIO.url}>{STUDIO.name}</a> y es independiente y no está afiliado a las marcas. Sus nombres se usan solo para identificar cada promoción. Más en <Link href="/acerca">Acerca de</Link>.
              </p>
            ),
          },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": ["AboutPage", "WebPage"],
          name: "Cómo verificamos cada promo",
          url: pageUrl("/como-verificamos"),
          inLanguage: "es-MX",
          isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
          publisher: { "@type": "Organization", name: STUDIO.name, url: STUDIO.url },
        })}
      />
    </>
  );
}
