import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { stats } from "@/lib/promos";
import { LEGAL, SITE, STUDIO, jsonLd, pageUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Acerca de Cumplegratis",
  description: `Quiénes somos, cómo encontramos y verificamos las ${stats.total} promociones de cumpleaños de México y cómo se mantiene gratis Cumplegratis.`,
  alternates: { canonical: "/acerca" },
};

export default function AboutPage() {
  return (
    <>
      <LegalPage
        kicker="Acerca de"
        title="Quiénes somos"
        intro={
          <p>
            {SITE.name} junta en un solo lugar las promociones de cumpleaños de México: qué te regala cada marca, en qué ciudades aplica, qué piden y hasta cuándo registrarte. Hoy reúne {stats.total} promociones de los 32 estados, {stats.free} de ellas totalmente gratis.
          </p>
        }
        sections={[
          {
            id: "quien",
            title: "Quién está detrás",
            body: (
              <>
                <p>
                  {SITE.name} es un producto de <a href={STUDIO.url}>{STUDIO.name}</a>, un estudio mexicano que hace apps y sitios web. Lo creamos porque cada año se nos pasaban regalos de cumpleaños por no registrarnos a tiempo, y la información estaba regada en notas viejas, videos y letras chiquitas.
                </p>
                <p>No estamos afiliados a ninguna de las marcas que aparecen; sus nombres se usan solo para identificar cada promoción.</p>
              </>
            ),
          },
          {
            id: "como",
            title: "Cómo verificamos las promos",
            body: (
              <>
                <p>Cada promoción trae sus fuentes y un nivel de confianza:</p>
                <ul className="list-disc space-y-1 pl-6">
                  <li>
                    <b>Verificada:</b> la confirmamos en el sitio, los términos o las redes oficiales de la marca.
                  </li>
                  <li>
                    <b>Reportada:</b> la publicó un medio reciente, pero la marca no la detalla.
                  </li>
                  <li>
                    <b>Sin confirmar:</b> solo la vimos en redes o blogs; la mostramos marcada así y no la promocionamos.
                  </li>
                </ul>
                <p>
                  Si una promoción tiene fecha de fin, desaparece sola cuando vence. Revisamos periódicamente las existentes y quitamos las de negocios que cerraron o que ya no la tienen. Los negocios pueden pedirnos agregar o corregir su promo.
                </p>
              </>
            ),
          },
          {
            id: "gratis",
            title: "Cómo se mantiene gratis",
            body: (
              <>
                <p>{SITE.name} es gratis para quien lo usa. Para sostenerlo mostramos anuncios, siempre señalados como publicidad y separados de las promociones.</p>
                <p>
                  No vendemos datos personales. Lo que guardas (tu fecha y tu ciudad) se queda en tu dispositivo. Los detalles están en el <Link href="/privacidad">aviso de privacidad</Link>.
                </p>
              </>
            ),
          },
          {
            id: "contacto",
            title: "Contacto",
            body: (
              <p>
                ¿Una promo cambió, falta o tienes un negocio? Escríbenos a <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> o visita la página de <Link href="/contacto">contacto</Link>.
              </p>
            ),
          },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({ "@context": "https://schema.org", "@type": "AboutPage", name: `Acerca de ${SITE.name}`, url: pageUrl("/acerca"), publisher: { "@type": "Organization", name: STUDIO.name, url: STUDIO.url } })}
      />
    </>
  );
}
