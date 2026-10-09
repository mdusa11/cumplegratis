import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { LEGAL, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Términos y condiciones de uso de Cumplegratis.",
  alternates: { canonical: "/terminos" },
};

export default function Terminos() {
  return (
    <LegalPage
      kicker="Legal"
      title="Términos y condiciones"
      intro={
        <p>
          Al usar {SITE.name} aceptas estos términos. Son cortos y en español claro: somos una guía informativa de promociones de cumpleaños, no
          vendemos nada ni representamos a ninguna marca.
        </p>
      }
      sections={[
        {
          id: "servicio",
          title: "Qué es Cumplegratis",
          body: (
            <>
              <p>
                {SITE.name} es un directorio gratuito e informativo que reúne promociones, regalos y descuentos que distintas marcas y negocios en México
                ofrecen a las personas en su cumpleaños. También te ayuda a planear con qué anticipación registrarte en cada programa.
              </p>
              <p>No necesitas cuenta para usarlo y no cobramos por ningún servicio.</p>
            </>
          ),
        },
        {
          id: "marcas",
          title: "No estamos afiliados a las marcas",
          body: (
            <>
              <p>
                {SITE.name} no está afiliado, patrocinado ni respaldado por ninguna de las marcas o negocios que aparecen en el sitio, salvo que se indique
                expresamente lo contrario.
              </p>
              <p>
                Los nombres comerciales y marcas mencionados pertenecen a sus respectivos titulares y se usan únicamente para identificar al negocio que
                ofrece cada promoción. No usamos sus logotipos.
              </p>
              <p>
                Si eres titular de una marca y quieres corregir o retirar información sobre tu negocio, escríbenos a{" "}
                <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> y lo atenderemos a la brevedad.
              </p>
            </>
          ),
        },
        {
          id: "exactitud",
          title: "Las promociones las decide cada marca",
          body: (
            <>
              <p>
                Cada promoción es responsabilidad exclusiva de la marca que la ofrece. Las marcas pueden cambiar, suspender o cancelar sus promociones,
                requisitos, sucursales participantes y vigencias en cualquier momento y sin avisarnos.
              </p>
              <p>
                Hacemos un esfuerzo razonable por verificar cada promoción con fuentes oficiales y mostramos qué tan confiable es cada una (Verificada,
                Reportada o Sin confirmar), pero no garantizamos que la información esté completa, vigente o libre de errores.
              </p>
              <p>
                <b>Antes de ir, confirma las condiciones directamente con la marca.</b> {SITE.name} no puede obligar a ningún negocio a respetar una
                promoción.
              </p>
            </>
          ),
        },
        {
          id: "plan",
          title: "Fechas y recordatorios",
          body: (
            <p>
              Las fechas de registro que muestra el plan son estimaciones. Cuando una marca no publica con cuánta anticipación hay que registrarse,
              sugerimos 30 días antes por seguridad. Los recordatorios por correo son un servicio de cortesía: no garantizamos su entrega ni que lleguen a
              tiempo.
            </p>
          ),
        },
        {
          id: "usuarios",
          title: "Lo que nos envías",
          body: (
            <>
              <p>
                Si nos sugieres una promoción o reportas si funcionó, nos autorizas a usar esa información para revisar, corregir y publicar el contenido
                del sitio. No envíes datos personales de terceros ni información falsa.
              </p>
              <p>Podemos moderar, editar o no publicar cualquier sugerencia.</p>
            </>
          ),
        },
        {
          id: "uso",
          title: "Uso permitido",
          body: (
            <>
              <p>
                Puedes usar el sitio para fines personales y no comerciales, y compartir o citar promociones sueltas siempre que enlaces a la página
                de {SITE.name} de donde salieron.
              </p>
              <p>
                No está permitido extraer de forma masiva o automatizada su contenido (scraping), copiar o republicar la base de promociones total o
                parcialmente en otro sitio, app, directorio o publicación, intentar vulnerar su seguridad o usarlo para fines ilícitos. Los buscadores y
                asistentes que solo enlazan o citan el sitio pueden indexarlo.
              </p>
            </>
          ),
        },
        {
          id: "propiedad",
          title: "Propiedad intelectual",
          body: (
            <>
              <p>
                El diseño, los textos, el código y la marca {SITE.name} pertenecen a su titular y están protegidos por la Ley Federal del Derecho de
                Autor y la Ley Federal de Protección a la Propiedad Industrial.
              </p>
              <p>
                La base de promociones es una compilación propia: la selección, verificación, clasificación por ciudad y estado, fechas de registro y
                redacción de cada ficha son obra de {SITE.name} y están protegidas como base de datos conforme a los artículos 13 y 107 de la Ley Federal
                del Derecho de Autor. Los nombres y marcas de cada negocio pertenecen a sus titulares. Si detectamos una copia, podemos pedir su retiro a
                quien la publique y a los buscadores, y ejercer las acciones legales que correspondan.
              </p>
            </>
          ),
        },
        {
          id: "terceros",
          title: "Sitios de terceros",
          body: (
            <p>
              El sitio tiene enlaces a páginas de las marcas (por ejemplo, para registrarte en su programa). No controlamos esos sitios ni somos
              responsables de su contenido, sus condiciones o el uso que hagan de tus datos; revisa sus propios términos y avisos de privacidad.
            </p>
          ),
        },
        {
          id: "responsabilidad",
          title: "Limitación de responsabilidad",
          body: (
            <p>
              El sitio se ofrece “tal cual”. En la medida que lo permita la ley, {SITE.name} no será responsable por daños derivados del uso de la
              información publicada, de promociones no respetadas por las marcas, de gastos realizados para cumplir requisitos de una promoción ni de
              interrupciones del servicio.
            </p>
          ),
        },
        {
          id: "privacidad",
          title: "Privacidad",
          body: (
            <p>
              El tratamiento de tus datos personales se rige por nuestro <Link href="/privacidad">Aviso de privacidad</Link>.
            </p>
          ),
        },
        {
          id: "cambios",
          title: "Cambios y ley aplicable",
          body: (
            <>
              <p>Podemos actualizar estos términos; la fecha de arriba indica la última versión. Si sigues usando el sitio, aceptas la versión vigente.</p>
              <p>
                Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Para cualquier controversia, las partes se someten a los
                tribunales competentes de México.
              </p>
              <p>
                Contacto: <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
