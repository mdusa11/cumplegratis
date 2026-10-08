import type { IconName } from "@/components/Icon";
import { GROUPS, byProminence, coverageLabel, groupOf, money, promos, type GroupId, type Promo } from "./promos";

export type Guide = {
  slug: string;
  title: string;
  short: string;
  description: string;
  icon: IconName;
  intro: string;
  sections: { title: string; icon?: IconName; text?: string; promos?: Promo[]; tips?: string[] }[];
  faq: { q: string; a: string }[];
};

const year = new Date().getFullYear();
const verified = promos.filter((p) => p.confidence !== "baja").sort(byProminence);
const isFood = (p: Promo) => groupOf(p) === "comida";
const top = (list: Promo[], n: number) => list.slice(0, n);

export const promoLine = (p: Promo) => {
  const extras = [
    p.companions ? `con ${p.companions} acompañante${p.companions === 1 ? "" : "s"}` : null,
    p.minPurchase ? `compra mínima ${money(p.minPurchase)}` : null,
    p.program ? `registro en ${p.program}` : "sin registro",
    coverageLabel(p),
  ].filter(Boolean);
  return extras.join(" · ");
};

const byGroup = (g: GroupId) => verified.filter((p) => groupOf(p) === g);
const freeFood = verified.filter((p) => isFood(p) && p.benefitType === "gratis");
const walkIn = verified.filter((p) => !p.program);
const advance = verified.filter((p) => p.program && p.registerDaysBefore);
// "El cumpleañero no paga": comida gratis yendo con acompañantes que sí pagan.
const withFriends = verified.filter((p) => isFood(p) && p.benefitType === "gratis" && p.companions);
const soloFree = verified.filter((p) => isFood(p) && p.benefitType === "gratis" && !p.companions);
const programs = verified.filter((p) => p.program);

export const GUIDES: Guide[] = [
  {
    slug: "que-te-regalan-en-tu-cumpleanos",
    title: `Qué te regalan en tu cumpleaños en México (${year})`,
    short: "Qué te regalan en tu cumpleaños",
    icon: "gift",
    description: `Lista actualizada de marcas que te regalan algo en tu cumpleaños en México: ${verified.length} promociones verificadas de comida, tiendas, cine y más, con requisitos y cómo cobrarlas.`,
    intro: `Cada año cientos de marcas en México regalan algo a quien cumple: un café, un postre, una comida completa, boletos de cine o cupones de descuento. Revisamos ${promos.length} promociones y aquí están las ${verified.length} que pudimos confirmar con la marca o con medios recientes, empezando por las más conocidas.`,
    sections: [
      { icon: GROUPS.comida.icon, title: `Comida y bebida gratis`, promos: top(byGroup("comida"), 12) },
      { icon: GROUPS.tiendas.icon, title: `Tiendas, belleza y ropa`, promos: top(byGroup("tiendas"), 12) },
      { icon: GROUPS.diversion.icon, title: `Cine, parques y planes`, promos: top(byGroup("diversion"), 10) },
      { icon: GROUPS.servicios.icon, title: `Hoteles, tarjetas y servicios`, promos: top(byGroup("servicios"), 8) },
      {
        title: "Cómo aprovecharlas",
        tips: [
          "Regístrate con anticipación: muchas marcas piden estar en su programa de lealtad semanas antes.",
          "Lleva tu INE: casi todas piden identificación con tu fecha de nacimiento.",
          "Revisa si es el día, la semana o todo el mes: cambia mucho entre marcas.",
          "Arma tu plan en Cumplegratis para ver qué hay en tu ciudad y hasta cuándo registrarte.",
        ],
      },
    ],
    faq: [
      { q: "¿Qué marcas regalan algo en tu cumpleaños en México?", a: `Entre las más conocidas: ${top(verified, 8).map((p) => p.brand).join(", ")}. En total tenemos ${verified.length} promociones verificadas.` },
      { q: "¿Hay que registrarse para recibir regalos de cumpleaños?", a: `En muchas sí: ${advance.length} de las verificadas piden registrarte en su programa con días o semanas de anticipación. Otras ${walkIn.length} solo piden tu INE.` },
      { q: "¿Las promociones aplican en todo México?", a: "No todas. Las cadenas nacionales sí, pero muchos negocios locales solo aplican en ciertas ciudades. En Cumplegratis puedes filtrar por tu zona." },
    ],
  },
  {
    slug: "comida-gratis-en-tu-cumpleanos",
    title: `Dónde comer gratis en tu cumpleaños en México (${year})`,
    short: "Comida gratis en tu cumpleaños",
    icon: "plate",
    description: `${freeFood.length} restaurantes, cafeterías y postres que te regalan comida en tu cumpleaños: con cuántos acompañantes, qué días aplica y dónde hay sucursales.`,
    intro: `"El cumpleañero no paga" es la promoción más buscada. Casi siempre tiene letra chiquita: ir con cierto número de acompañantes que consuman, presentar INE o ir solo ciertos días. Aquí están las ${freeFood.length} que verificamos, con sus condiciones claras.`,
    sections: [
      { icon: "coffee", title: "Cafés y postres", promos: freeFood.filter((p) => ["cafe", "postres"].includes(p.category)) },
      { icon: "plate", title: "Restaurantes y buffets", promos: freeFood.filter((p) => ["restaurantes", "comida-rapida"].includes(p.category)) },
      {
        title: "Antes de ir",
        tips: [
          "Pregunta si la promo aplica en esa sucursal: muchos restaurantes son franquicias con reglas propias.",
          "Cuenta a tus acompañantes: las promos de 'come gratis' suelen pedir entre 2 y 5 personas que consuman.",
          "Evita días festivos y diciembre: varias promos no aplican en esas fechas.",
        ],
      },
    ],
    faq: [
      { q: "¿Dónde puedo comer gratis en mi cumpleaños?", a: `Algunas opciones verificadas: ${top(freeFood, 8).map((p) => p.brand).join(", ")}.` },
      { q: "¿Cuántos acompañantes necesito?", a: "Depende del lugar: en cafeterías y postres normalmente nadie; en restaurantes y buffets suelen pedir de 2 a 5 personas que consuman." },
    ],
  },
  {
    slug: "regalos-de-cumpleanos-sin-registro",
    title: `Regalos de cumpleaños sin registrarte: solo con tu INE (${year})`,
    short: "Regalos sin registro, solo con INE",
    icon: "id",
    description: `${walkIn.length} lugares donde te dan algo en tu cumpleaños sin registrarte en ninguna app: solo llegas con tu INE.`,
    intro: `Si se te olvidó registrarte con tiempo, no todo está perdido. Estas ${walkIn.length} promociones verificadas no piden cuenta, app ni tarjeta: basta con presentar tu identificación oficial en tu fecha.`,
    sections: [
      { title: "Solo llega con tu INE", promos: walkIn },
      {
        title: "Tips",
        tips: [
          "Lleva identificación oficial vigente con fecha de nacimiento (INE o pasaporte).",
          "Revisa si aplica solo el día exacto o toda la semana o el mes.",
        ],
      },
    ],
    faq: [{ q: "¿Qué promociones de cumpleaños no piden registro?", a: `Por ejemplo: ${top(walkIn, 8).map((p) => p.brand).join(", ")}.` }],
  },
  {
    slug: "como-cobrar-regalos-de-cumpleanos",
    title: "Cómo cobrar todos tus regalos de cumpleaños: guía paso a paso",
    short: "Cómo cobrar todos tus regalos",
    icon: "register",
    description: "La guía para no perder ningún regalo de cumpleaños: qué programas registrar, con cuánta anticipación, qué llevar y cómo organizar tu mes.",
    intro: "La mayoría de los regalos de cumpleaños se pierden por una razón: registrarse tarde. El sistema de la marca necesita conocer tu fecha antes de que empiece tu mes. Así se organiza todo para no perder ninguno.",
    sections: [
      {
        title: "1. Un mes antes: registra tus programas",
        text: `Estos programas verificados piden registro previo con una anticipación conocida. Si la marca no la publica, regístrate 30 días antes por seguridad.`,
        promos: top(advance, 12),
      },
      {
        title: "2. Al empezar tu mes: revisa tus apps y correo",
        tips: [
          "Muchos cupones llegan por correo o aparecen en la app los primeros días del mes.",
          "Activa notificaciones de las apps donde te registraste.",
          "Anota qué promos son solo del día exacto para no dejarlas al final.",
        ],
      },
      {
        title: "3. Tu semana: organiza las salidas",
        tips: [
          "Agrupa por zona: las promos de una misma plaza comercial se cobran en una tarde.",
          "Las comidas con acompañantes rinden más en grupo: arma tu plan con amigos.",
          "Lleva siempre tu INE.",
        ],
      },
    ],
    faq: [
      { q: "¿Con cuánta anticipación debo registrarme?", a: "Entre 1 y 45 días según la marca; si no lo dice, 30 días antes es lo más seguro." },
      { q: "¿Qué necesito para cobrar un regalo de cumpleaños?", a: "Normalmente una identificación oficial con tu fecha de nacimiento y, si aplica, estar registrado en el programa de la marca." },
    ],
  },
  {
    slug: "cumpleanero-come-gratis",
    title: `Cumpleañero come gratis en México: restaurantes (${year})`,
    short: "Cumpleañero come gratis",
    icon: "plate",
    description: `${withFriends.length + soloFree.length} restaurantes y cafés en México donde el cumpleañero come gratis: cuántos acompañantes piden, qué incluye y cómo cobrarlo.`,
    intro: `"El cumpleañero no paga" es la promo más buscada: vas con amigos o familia, ellos pagan su consumo y a ti te regalan el platillo. Aquí están las ${withFriends.length} que piden acompañantes y otras ${soloFree.length} donde te regalan algo aunque vayas solo, todas verificadas.`,
    sections: [
      { icon: "people", title: "Con acompañantes: el cumpleañero no paga", promos: withFriends },
      { icon: "plate", title: "Aunque vayas solo", promos: top(soloFree, 16) },
      {
        title: "Antes de ir",
        tips: [
          "Reserva y avisa que es tu cumpleaños: varios restaurantes lo piden por adelantado.",
          "Cuenta bien a los acompañantes: si piden 3 o 4, tienen que consumir.",
          "Lleva tu INE: la fecha de nacimiento debe coincidir con el día, semana o mes de la promo.",
          "Pregunta si aplica en tu sucursal: muchos negocios locales solo la dan en una.",
        ],
      },
    ],
    faq: [
      { q: "¿Dónde come gratis el cumpleañero en México?", a: `Por ejemplo en ${top(withFriends, 6).map((p) => p.brand).join(", ")}. Revisa cada uno: cambian los acompañantes y los días.` },
      { q: "¿Cuántos acompañantes tengo que llevar?", a: "Depende del lugar: lo más común es entre 2 y 4 personas que consuman normalmente." },
      { q: "¿Tengo que llevar identificación?", a: "Sí, casi siempre piden INE o pasaporte con tu fecha de nacimiento." },
    ],
  },
  {
    slug: "programas-de-lealtad-con-regalo-de-cumpleanos",
    title: `Programas de lealtad con regalo de cumpleaños (${year})`,
    short: "Programas con regalo de cumpleaños",
    icon: "register",
    description: `${programs.length} programas de lealtad en México que te dan un regalo de cumpleaños: Starbucks Rewards, Club Cinépolis y más, con cuánto antes registrarte.`,
    intro: `La mayoría de los regalos de cumpleaños vienen de un programa de lealtad: te registras con tu fecha de nacimiento y la marca te manda el regalo en tu fecha. Estos son los ${programs.length} programas verificados, con la anticipación que piden.`,
    sections: [
      { icon: GROUPS.comida.icon, title: "Comida y café", promos: programs.filter((p) => groupOf(p) === "comida") },
      { icon: GROUPS.tiendas.icon, title: "Tiendas", promos: programs.filter((p) => groupOf(p) === "tiendas") },
      { icon: GROUPS.diversion.icon, title: "Cine y entretenimiento", promos: programs.filter((p) => groupOf(p) === "diversion") },
      { icon: GROUPS.servicios.icon, title: "Tarjetas, apps y viajes", promos: programs.filter((p) => groupOf(p) === "servicios") },
    ],
    faq: [
      { q: "¿Qué programas de lealtad dan regalo de cumpleaños?", a: `Entre los más conocidos: ${top(programs, 8).map((p) => p.program).join(", ")}.` },
      { q: "¿Con cuánta anticipación me registro?", a: "Depende del programa, de 1 a 45 días. Si la marca no lo publica, regístrate 30 días antes de tu cumpleaños." },
    ],
  },
];

export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);

