import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { LEGAL, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description: "Aviso de privacidad integral de Cumplegratis conforme a la LFPDPPP.",
  alternates: { canonical: "/privacidad" },
};

export default function Privacidad() {
  return (
    <LegalPage
      kicker="Legal · LFPDPPP"
      title="Aviso de privacidad"
      intro={
        <p>
          Recabamos lo mínimo. Puedes usar todo {SITE.name} sin darnos ningún dato personal: tu fecha de cumpleaños, tu zona y tu checklist se guardan
          solo en tu navegador. Únicamente si pides recordatorios por correo guardamos tu correo y tu día y mes de cumpleaños.
        </p>
      }
      sections={[
        {
          id: "responsable",
          title: "Responsable",
          body: (
            <p>
              {LEGAL.responsible}, con domicilio en {LEGAL.address}, es responsable del tratamiento de tus datos personales conforme a la Ley Federal de
              Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), su reglamento y demás normativa aplicable. Contacto:{" "}
              <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>.
            </p>
          ),
        },
        {
          id: "datos",
          title: "Datos que recabamos",
          body: (
            <>
              <p>
                <b>Si te suscribes a recordatorios:</b> correo electrónico y día y mes de cumpleaños (no pedimos el año, así que no conocemos tu edad).
              </p>
              <p>
                <b>Si sugieres o reportas una promoción:</b> el texto que escribas. Te pedimos no incluir datos personales.
              </p>
              <p>
                <b>Tu ubicación:</b> si usas “Usar mi ubicación”, tu navegador te pide permiso y calculamos la ciudad más cercana <b>dentro de tu
                dispositivo</b>. Tus coordenadas no se envían ni se guardan en nuestros servidores.
              </p>
              <p>No recabamos datos personales sensibles ni datos financieros.</p>
            </>
          ),
        },
        {
          id: "finalidades",
          title: "Para qué los usamos",
          body: (
            <>
              <p>
                <b>Finalidad principal (necesaria):</b> enviarte recordatorios para registrarte a tiempo en los programas de cumpleaños y avisarte cuando
                empiece tu mes.
              </p>
              <p>
                <b>Finalidad secundaria:</b> mejorar el catálogo con las sugerencias y reportes que envías. No usamos tus datos para publicidad ni
                perfilamiento, y no los vendemos.
              </p>
            </>
          ),
        },
        {
          id: "local",
          title: "Lo que se queda en tu dispositivo",
          body: (
            <>
              <p>
                Usamos el almacenamiento local de tu navegador (no cookies de rastreo) para recordar tu fecha de cumpleaños, tu zona, qué programas ya
                marcaste y si cerraste el aviso para instalar la app. Esa información no sale de tu dispositivo y puedes borrarla limpiando los datos del
                sitio en tu navegador.
              </p>
              <p>
                Si instalas la app, se guarda una copia de las páginas que visitas para que funcionen sin conexión. No usamos herramientas de analítica ni
                cookies de terceros.
              </p>
            </>
          ),
        },
        {
          id: "encargados",
          title: "Con quién se comparten",
          body: (
            <>
              <p>
                No transferimos tus datos a terceros. Para operar el servicio nos apoyamos en proveedores que actúan como encargados y solo tratan los
                datos por nuestra cuenta: alojamiento del sitio, base de datos (Supabase) y envío de correos. Algunos de estos proveedores pueden almacenar
                información fuera de México, con medidas de seguridad equivalentes.
              </p>
              <p>Solo compartiríamos datos si una autoridad competente lo requiere conforme a la ley.</p>
            </>
          ),
        },
        {
          id: "arco",
          title: "Tus derechos ARCO",
          body: (
            <>
              <p>
                Puedes <b>Acceder</b> a tus datos, <b>Rectificarlos</b>, <b>Cancelarlos</b> u <b>Oponerte</b> a su uso, así como revocar tu
                consentimiento o limitar su uso. Para hacerlo, escribe a <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> desde el correo registrado
                indicando tu solicitud.
              </p>
              <p>
                Te responderemos en un máximo de 20 días hábiles y, si procede, la haremos efectiva dentro de los 15 días hábiles siguientes. Cada
                recordatorio incluye además un enlace para darte de baja al instante.
              </p>
            </>
          ),
        },
        {
          id: "conservacion",
          title: "Cuánto tiempo los guardamos",
          body: (
            <p>
              Conservamos tu correo mientras sigas suscrito a los recordatorios. Si te das de baja, lo eliminamos en un plazo razonable, salvo que la ley
              nos obligue a conservarlo.
            </p>
          ),
        },
        {
          id: "seguridad",
          title: "Seguridad",
          body: (
            <p>
              Aplicamos medidas administrativas, técnicas y físicas razonables para proteger tus datos: conexión cifrada (HTTPS), acceso restringido a la
              base de datos y permisos de solo escritura desde el sitio.
            </p>
          ),
        },
        {
          id: "menores",
          title: "Menores de edad",
          body: (
            <p>
              El servicio de recordatorios está dirigido a mayores de 18 años. Si eres menor, pide a tu madre, padre o tutor que se suscriba por ti.
            </p>
          ),
        },
        {
          id: "cambios",
          title: "Cambios a este aviso",
          body: (
            <p>
              Cualquier cambio a este aviso se publicará en esta página con su nueva fecha de actualización. Si el cambio afecta las finalidades para las
              que usamos tus datos, te lo avisaremos por correo.
            </p>
          ),
        },
      ]}
    />
  );
}
