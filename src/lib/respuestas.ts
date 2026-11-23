import { MONTHS } from "./site";
import { byProminence, days, promos, type CategoryId, type Promo } from "./promos";

export type Answer = { q: string; a: string; links: { label: string; href: string }[] };

const ok = promos.filter((p) => p.confidence === "alta").sort(byProminence);
const inCats = (...cats: CategoryId[]) => ok.filter((p) => cats.includes(p.category));
const free = (list: Promo[]) => list.filter((p) => p.benefitType === "gratis");
const list = (ps: Promo[], n: number) => ps.slice(0, n).map((p) => `${p.brand} (${p.benefit.replace(/\.$/, "")})`).join("; ");
const links = (ps: Promo[], n: number) => ps.slice(0, n).map((p) => ({ label: p.brand, href: `/promos/${p.slug}` }));
const make = (q: string, a: string, ps: Promo[], n = 5, extra: Answer["links"] = []): Answer => ({ q, a, links: [...links(ps, n), ...extra] });

export function answers(today = new Date()): Answer[] {
  const m = today.getMonth();
  const [m1, m2] = [MONTHS[m], MONTHS[(m + 1) % 12]];
  const mesLista = ok.filter((p) => p.window === "mes");
  const mesFree = free(mesLista);
  const eat = free(inCats("restaurantes", "comida-rapida"));
  const cafe = inCats("cafe");
  const cafeFree = free(cafe);
  const sweet = inCats("postres");
  const ine = ok.filter((p) => p.needsId && !p.program);
  const cine = inCats("cine");
  const belleza = inCats("belleza");
  const ropa = inCats("ropa", "departamentales");
  const parques = inCats("parques", "experiencias");
  const noBuy = free(ok.filter((p) => !p.minPurchase && !p.companions));
  const noSignup = ok.filter((p) => !p.program);
  const adv = ok.filter((p) => p.program && p.registerDaysBefore);
  const counts = new Map<number, number>();
  adv.forEach((p) => counts.set(p.registerDaysBefore!, (counts.get(p.registerDaysBefore!) ?? 0) + 1));
  const common = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0];
  const longest = [...adv].sort((a, b) => b.registerDaysBefore! - a.registerDaysBefore! || byProminence(a, b));
  const win = (w: Promo["window"]) => ok.filter((p) => p.window === w).length;
  const monthLinks = [m1, m2].map((x) => ({ label: `Promos de ${x}`, href: `/cumpleanos/${x}` }));
  const withProg = (ps: Promo[]) => ps.filter((p) => p.program);

  return [
    make(
      "¿Qué te regalan en tu cumpleaños en México?",
      `Café, postres, comida, boletos de cine, productos de belleza y descuentos: hoy hay ${ok.length} promociones de cumpleaños verificadas en México y ${free(ok).length} son gratis. Por ejemplo: ${list(ok, 5)}.`,
      ok,
      5,
      [{ label: "Todas las promos", href: "/promos" }],
    ),
    make(
      "¿Dónde comer gratis en tu cumpleaños?",
      `Hay ${eat.length} restaurantes y cadenas de comida rápida verificados que regalan comida o bebida el día de tu cumpleaños; ${eat.filter((p) => p.companions).length} piden ir con acompañantes que paguen. Por ejemplo: ${list(eat, 5)}.`,
      eat,
    ),
    make(
      "¿Qué cafeterías regalan bebida en tu cumpleaños?",
      `${cafeFree.length} cafeterías verificadas regalan una bebida o antojo; ${withProg(cafeFree).length} piden registro previo en su app o programa. Por ejemplo: ${list(cafeFree, 4)}.`,
      cafeFree,
      4,
    ),
    make(
      "¿Qué pastelerías y postres regalan algo en tu cumpleaños?",
      `${sweet.length} marcas de postres verificadas tienen promo de cumpleaños, desde helado y dona gratis hasta rebanada de pastel. Por ejemplo: ${list(sweet, 4)}.`,
      sweet,
      4,
    ),
    make(
      "¿Qué te dan en tu cumpleaños solo con tu INE?",
      `${ine.length} promociones verificadas no piden registro previo: llegas con tu INE u otra identificación oficial el día de tu cumpleaños y la cobras. Por ejemplo: ${list(ine, 5)}.`,
      ine,
    ),
    make(
      "¿Con cuánta anticipación me registro para las promos de cumpleaños?",
      `${common ? `Lo más común es registrarte ${days(common[0])} antes de tu cumpleaños (${common[1]} marcas)` : "Depende de cada marca"}, pero cada programa tiene su plazo y algunos piden hasta ${longest[0] ? days(longest[0].registerDaysBefore!) : "30 días"}. ${noSignup.length} promos no piden registro. Mayor anticipación: ${list(longest, 3)}.`,
      longest,
      3,
      [{ label: "Mi plan de cumpleaños", href: "/mi-cumple" }],
    ),
    make(
      "¿Qué cine da regalo de cumpleaños?",
      `${cine.length === 1 ? "Un cine verificado da" : `${cine.length} cines verificados dan`} promo de cumpleaños: ${list(cine, 4)}.`,
      cine,
      4,
    ),
    make(
      "¿Qué tiendas de belleza regalan algo en tu cumpleaños?",
      `${belleza.length} marcas de belleza y spas verificadas tienen regalo o descuento de cumpleaños; ${withProg(belleza).length} piden registro en su programa de lealtad. Por ejemplo: ${list(withProg(belleza), 4)}.`,
      withProg(belleza),
      4,
    ),
    make(
      "¿Qué tiendas de ropa y departamentales dan algo en tu cumpleaños?",
      `${ropa.length} marcas de ropa y tiendas departamentales verificadas dan cupón, descuento o regalo de cumpleaños; ${withProg(ropa).length} piden registro en su programa. Por ejemplo: ${list(ropa, 4)}.`,
      ropa,
      4,
    ),
    make(
      "¿Qué parques y experiencias dan entrada gratis en tu cumpleaños?",
      `${parques.length} parques, atracciones y experiencias verificados tienen promo de cumpleaños, ${free(parques).length} con entrada o regalo gratis para el festejado. Por ejemplo: ${list(free(parques).length ? free(parques) : parques, 4)}.`,
      free(parques).length ? free(parques) : parques,
      4,
    ),
    make(
      `¿Qué regalan si cumples en ${m1} o ${m2}?`,
      `Si cumples en ${m1} o ${m2}, ${mesLista.length} promos verificadas se pueden cobrar durante todo tu mes de cumpleaños y ${mesFree.length} son gratis. Por ejemplo: ${list(mesLista, 5)}.`,
      mesLista,
      5,
      monthLinks,
    ),
    make(
      "¿Cuáles promos de cumpleaños son gratis sin comprar nada?",
      `${noBuy.length} promociones verificadas son gratis sin compra mínima y sin necesidad de acompañantes que paguen. Por ejemplo: ${list(noBuy, 5)}.`,
      noBuy,
    ),
    make(
      "¿Cuánto tiempo tengo para cobrar mi regalo de cumpleaños?",
      `Depende de la marca: ${win("mes")} promos verificadas valen todo tu mes de cumpleaños, ${win("semana")} solo tu semana, ${win("dia")} únicamente el día exacto y ${win("otro")} tienen fechas especiales. Para ver cuál te conviene y cuándo registrarte, arma tu plan con tu fecha de nacimiento.`,
      [],
      0,
      [{ label: "Mi plan de cumpleaños", href: "/mi-cumple" }],
    ),
  ];
}
