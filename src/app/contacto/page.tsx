import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { LEGAL, SITE, WHATSAPP, jsonLd, pageUrl, whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos para agregar o corregir una promoción de cumpleaños, registrar tu negocio o resolver dudas sobre Cumplegratis.",
  alternates: { canonical: "/contacto" },
};

const phone = `+52 ${WHATSAPP.slice(2, 5)} ${WHATSAPP.slice(5, 8)} ${WHATSAPP.slice(8)}`;

export default function ContactPage() {
  return (
    <>
      <LegalPage
        kicker="Contacto"
        title="Escríbenos"
        intro={<p>Leemos todos los mensajes. Normalmente respondemos en uno o dos días hábiles.</p>}
        sections={[
          {
            id: "negocios",
            title: "Tengo un negocio",
            body: (
              <p>
                Si regalas algo a tus clientes en su cumpleaños, lo publicamos sin costo. Mándanos por{" "}
                <a href={whatsappUrl("Hola, tengo un negocio y quiero registrar mi promo de cumpleaños en Cumplegratis.")}>WhatsApp ({phone})</a> qué regalas, las condiciones y tu dirección.
              </p>
            ),
          },
          {
            id: "correcciones",
            title: "Una promo está mal o ya no existe",
            body: (
              <p>
                Escríbenos a <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> o por <a href={whatsappUrl("Hola, una promo de Cumplegratis está mal o ya no existe: ")}>WhatsApp</a> con el nombre de la marca y lo que cambió. La revisamos y la corregimos.
              </p>
            ),
          },
          {
            id: "privacidad",
            title: "Privacidad y datos personales",
            body: (
              <p>
                Para ejercer tus derechos ARCO o cualquier duda sobre tus datos, escribe a <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>. Detalles en el <Link href="/privacidad">aviso de privacidad</Link>.
              </p>
            ),
          },
          {
            id: "otros",
            title: "Prensa, alianzas y todo lo demás",
            body: (
              <p>
                <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> · {SITE.name} es un producto de {LEGAL.responsible}.
              </p>
            ),
          },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: `Contacto · ${SITE.name}`,
          url: pageUrl("/contacto"),
          mainEntity: { "@type": "Organization", name: SITE.name, email: LEGAL.email, telephone: `+${WHATSAPP}` },
        })}
      />
    </>
  );
}
